const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticate, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Create new order (checkout)
router.post('/checkout', authenticate, [
  body('billingAddress.fullName').trim().notEmpty(),
  body('billingAddress.email').isEmail(),
  body('billingAddress.street').trim().notEmpty(),
  body('billingAddress.city').trim().notEmpty(),
  body('billingAddress.state').trim().notEmpty(),
  body('billingAddress.zip').trim().notEmpty(),
  body('payment.method').isIn(['credit_card', 'debit_card', 'paypal']),
  body('payment.cardLast4').optional().isLength({ min: 4, max: 4 })
], async (req, res) => {
  console.log('[POST /api/orders/checkout] Received request');
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('[POST /api/orders/checkout] Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { billingAddress, shippingAddress, sameAsShipping, payment } = req.body;
    console.log('[POST /api/orders/checkout] Payment details received:', payment);

    // Get user with cart
    const user = await User.findById(req.user._id).populate('cart.product');

    if (!user || !user.cart || user.cart.length === 0) {
      console.log('[POST /api/orders/checkout] Cart is empty or user not found.');
      return res.status(400).json({
        success: false,
        message: 'Cart is empty or user not found'
      });
    }

    // Prepare order items and check stock
    const orderItems = [];
    let subtotal = 0;

    for (const cartItem of user.cart) {
      const product = cartItem.product;
      
      if (!product || !product.isActive) {
        console.log(`[POST /api/orders/checkout] Product ${product ? product.name : 'Unknown'} is no longer available`);
        return res.status(400).json({
          success: false,
          message: `Product ${product ? product.name : 'Unknown'} is no longer available`
        });
      }

      if (product.stock < cartItem.quantity) {
        console.log(`[POST /api/orders/checkout] Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${cartItem.quantity}`);
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemSubtotal = product.price * cartItem.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        subtotal: itemSubtotal
      });
    }
    console.log('[POST /api/orders/checkout] Order items prepared:', orderItems);

    // Generate a unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    console.log(`[POST /api/orders/checkout] Generated OrderNumber: ${orderNumber}`);

    // Create order instance (but don't save yet for payment failure case)
    const order = new Order({
      orderNumber, // Assign the generated order number
      user: user._id,
      items: orderItems,
      billingAddress,
      shippingAddress: sameAsShipping ? billingAddress : shippingAddress,
      sameAsShipping,
      payment: {
        ...payment,
        status: 'pending' // Initial status
      },
      subtotal
    });

    // Calculate totals
    order.calculateTotals(); // This should exist on your Order model
    console.log('[POST /api/orders/checkout] Order totals calculated.');

    // Mock Payment Processing based on cardLast4
    const cardLast4 = payment.cardLast4;
    console.log(`[POST /api/orders/checkout] Mock Payment - CardLast4: ${cardLast4}`);

    if (cardLast4 === '0000') {
      console.log('[POST /api/orders/checkout] Mock Payment FAILED (0000 card).');
      order.payment.status = 'failed';
      return res.status(400).json({
        success: false,
        message: 'Payment failed (Test Card). Order not placed.',
        orderId: order._id, 
        paymentStatus: 'failed'
      });
    } else if (cardLast4 === '4242') {
      console.log('[POST /api/orders/checkout] Mock Payment SUCCESSFUL (4242 card).');
      order.payment.status = 'completed';
      order.payment.transactionId = `TRX-MOCK-${Date.now()}`;
    } else {
      console.log('[POST /api/orders/checkout] Mock Payment - Defaulting to SUCCESSFUL for other cards.');
      order.payment.status = 'completed';
      order.payment.transactionId = `TRX-MOCK-DEFAULT-${Date.now()}`;
    }

    await order.save();
    console.log('[POST /api/orders/checkout] Order saved successfully.');

    console.log('[POST /api/orders/checkout] Updating product stock...');
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }
    console.log('[POST /api/orders/checkout] Product stock updated.');

    user.cart = [];
    user.orders.push(order._id);
    await user.save();
    console.log('[POST /api/orders/checkout] User cart cleared and order added to user orders.');

    await order.populate('items.product', 'name image');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order
    });

  } catch (error) {
    console.error('[POST /api/orders/checkout] Error during checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing order'
    });
  }
});

router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name image')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product', 'name image price')
      .populate('user', 'fullName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to order'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// Cancel order
router.put('/:orderId/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check ownership
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Cancel order
    order.status = 'cancelled';
    order.updatedAt = Date.now();
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
});

// Admin routes
// Get all orders (Admin only)
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.user = userId;

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'fullName email')
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// Update order status (Admin only)
router.put('/admin/:orderId/status', authenticate, isAdmin, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('trackingNumber').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, trackingNumber } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        status,
        trackingNumber: trackingNumber || undefined,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

module.exports = router; 