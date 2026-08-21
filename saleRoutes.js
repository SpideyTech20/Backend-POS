const express = require('express');
const router = express.Router();
const saleModel = require('./saleModel');

// Create a new sale
router.post('/', async (req, res) => {
    try {
        const { items, paymentMethod, discount } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }
        // For now, we use a hardcoded user_id = 1 (you can change later)
        const userId = 1; // Replace with req.user.id when authentication is added
        const saleId = await saleModel.createSale(userId, items, paymentMethod, discount || 0);
        res.status(201).json({ saleId, message: 'Sale recorded successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all sales
router.get('/', async (req, res) => {
    try {
        const sales = await saleModel.getSales();
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a specific sale with items
router.get('/:id', async (req, res) => {
    try {
        const sale = await saleModel.getSaleById(req.params.id);
        if (!sale) return res.status(404).json({ error: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dashboard stats
router.get('/dashboard/stats', async (req, res) => {
    try {
        const stats = await saleModel.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;