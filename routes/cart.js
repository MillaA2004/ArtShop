const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// user's cart
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'cart.product',
        select: 'name price image stock category'
      });

    let subtotal = 0;
    const cartItems = user.cart.map(item => {
      if (item.product && item.product.stock > 0) {
        const itemTotal = item.product.price * item.quantity;
        subtotal += itemTotal;
        return {
          product: item.product,
          quantity: item.quantity,
          subtotal: itemTotal
        };
      }
      return null;
    }).filter(item => item !== null);

    res.json({
      success: true,
      cart: cartItems,
      subtotal,
      itemCount: cartItems.length
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart'
    });
  }
});

// Add item
router.post('/add', authenticate, [
  body('productId').isMongoId(),
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  console.log('[POST /api/cart/add] Received request');
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[POST /api/cart/add] Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { productId, quantity } = req.body;
    console.log(`[POST /api/cart/add] User ID: ${req.user._id}, Product ID: ${productId}, Quantity: ${quantity}`);

    //product exists and has stock?
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      console.log('[POST /api/cart/add] Product not found or inactive. Product:', product);
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    console.log('[POST /api/cart/add] Product found:', product.name, 'Stock:', product.stock);

    if (product.stock < quantity) {
      console.log('[POST /api/cart/add] Insufficient stock.');
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Find user and update cart
    const user = await User.findById(req.user._id);
    if (!user) {
        console.error('[POST /api/cart/add] User not found with ID:', req.user._id);
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('[POST /api/cart/add] User found. Cart BEFORE modification:', JSON.stringify(user.cart));
    
    const existingItemIndex = user.cart.findIndex(
      item => item.product && item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      console.log('[POST /api/cart/add] Product exists in cart, updating quantity.');
      user.cart[existingItemIndex].quantity += quantity;
    } else {
      console.log('[POST /api/cart/add] Product not in cart, adding new item.');
      user.cart.push({
        product: productId,
        quantity
      });
    }
    console.log('[POST /api/cart/add] Cart AFTER modification, BEFORE save:', JSON.stringify(user.cart));

    try {
      await user.save();
      console.log('[POST /api/cart/add] user.save() successful.');
    } catch (saveError) {
      console.error('[POST /api/cart/add] Error during user.save():', saveError);
      return res.status(500).json({
        success: false,
        message: 'Error saving cart to database.',
        error: saveError.message
      });
    }

    await user.populate({
      path: 'cart.product',
      select: 'name price image stock'
    });
    console.log('[POST /api/cart/add] Cart AFTER population, sending response:', JSON.stringify(user.cart));

    res.json({
      success: true,
      message: 'Item added to cart',
      cart: user.cart
    });
  } catch (error) {
    console.error('[POST /api/cart/add] General error in route:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart'
    });
  }
});

// Update item quantity
router.put('/update', authenticate, [
  body('productId').isMongoId(),
  body('quantity').isInt({ min: 0 })
], async (req, res) => {
  console.log('[PUT /api/cart/update] Received request');
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[PUT /api/cart/update] Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { productId, quantity } = req.body;
    console.log(`[PUT /api/cart/update] User ID: ${req.user._id}, Product ID: ${productId}, Requested Quantity: ${quantity}`);

    // Check product stock if quantity > 0
    if (quantity > 0) {
      const product = await Product.findById(productId);
      if (!product) {
        console.log(`[PUT /api/cart/update] Product not found with ID: ${productId}`);
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      console.log(`[PUT /api/cart/update] Product: ${product.name}, Available Stock: ${product.stock}`);
      if (product.stock < quantity) {
        console.log('[PUT /api/cart/update] Insufficient stock available.');
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available'
        });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        console.error('[PUT /api/cart/update] User not found with ID:', req.user._id);
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    console.log('[PUT /api/cart/update] User found. Cart BEFORE modification:', JSON.stringify(user.cart));
    
    if (quantity === 0) {
      console.log(`[PUT /api/cart/update] Quantity is 0, removing item: ${productId}`);
      user.cart = user.cart.filter(
        item => item.product && item.product.toString() !== productId
      );
    } else {
      const itemIndex = user.cart.findIndex(
        item => item.product && item.product.toString() === productId
      );
      
      if (itemIndex === -1) {
        console.log(`[PUT /api/cart/update] Item not found in cart to update: ${productId}`);
        return res.status(404).json({
          success: false,
          message: 'Item not found in cart to update. If adding new, use add to cart.'
        });
      }
      console.log(`[PUT /api/cart/update] Updating quantity for item: ${productId} to ${quantity}`);
      user.cart[itemIndex].quantity = quantity;
    }
    console.log('[PUT /api/cart/update] Cart AFTER modification, BEFORE save:', JSON.stringify(user.cart));

    try {
        await user.save();
        console.log('[PUT /api/cart/update] user.save() successful.');
    } catch (saveError) {
        console.error('[PUT /api/cart/update] Error during user.save():', saveError);
        return res.status(500).json({ success: false, message: 'Error saving updated cart.', error: saveError.message });
    }
    
    await user.populate({
      path: 'cart.product',
      select: 'name price image stock'
    });
    console.log('[PUT /api/cart/update] Cart AFTER population, sending response:', JSON.stringify(user.cart));

    res.json({
      success: true,
      message: quantity === 0 ? 'Item removed from cart' : 'Cart updated',
      cart: user.cart
    });
  } catch (error) {
    console.error('[PUT /api/cart/update] General error in route:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart'
    });
  }
});

// Remove item
router.delete('/remove/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user._id);
    user.cart = user.cart.filter(
      item => item.product.toString() !== productId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Item removed from cart'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart'
    });
  }
});

// Clear entire cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error clearing cart'
    });
  }
});

// Sync cart
router.post('/sync', authenticate, [
  body('cart').isArray(),
  body('cart.*.productId').isMongoId(),
  body('cart.*.quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { cart: guestCart } = req.body;
    const user = await User.findById(req.user._id);

    for (const item of guestCart) {
      const existingIndex = user.cart.findIndex(
        cartItem => cartItem.product.toString() === item.productId
      );

      if (existingIndex > -1) {
        user.cart[existingIndex].quantity += item.quantity;
      } else {
        // Add new item
        user.cart.push({
          product: item.productId,
          quantity: item.quantity
        });
      }
    }

    await user.save();
    await user.populate({
      path: 'cart.product',
      select: 'name price image stock'
    });

    res.json({
      success: true,
      message: 'Cart synced successfully',
      cart: user.cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error syncing cart'
    });
  }
});

module.exports = router; 