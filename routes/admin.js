const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const Order = require('../models/Order');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

router.get('/products', [adminAuth], async (req, res) => {
    try {
        const { category, sort, order = 'asc', page = 1, limit = 20 } = req.query;
        const query = {};
        
        if (category) {
            query.category = category;
        }

        const sortOptions = {};
        if (sort) {
            sortOptions[sort] = order === 'desc' ? -1 : 1;
        }

        const products = await Product.find(query)
            .sort(sortOptions)
            .limit(parseInt(limit))
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            products,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
});

// Add
router.post('/products', [adminAuth, 
    body('name').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('category').trim().notEmpty(),
    body('image').trim().notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const product = new Product(req.body);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product added successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding product'
        });
    }
});

// Update
router.put('/products/:id', [adminAuth], async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product'
        });
    }
});

// Delete
router.delete('/products/:id', [adminAuth], async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product'
        });
    }
});

// All users
router.get('/users', [adminAuth], async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// All orders
router.get('/orders', [adminAuth], async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'fullName email')
            .populate('items.product')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
});

// Update order status
router.put('/orders/:id/status', [adminAuth], async (req, res) => {
    try {
        const { status } = req.body;
        
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
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
            message: 'Order status updated successfully',
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