const express = require('express');
const router = express.Router();
const categoryModel = require('./categoryModel');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await categoryModel.getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get one category
router.get('/:id', async (req, res) => {
    try {
        const category = await categoryModel.getCategoryById(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });
        res.json(category);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create category
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        const id = await categoryModel.createCategory(name, description);
        res.status(201).json({ id, name, description });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update category
router.put('/:id', async (req, res) => {
    try {
        const { name, description } = req.body;
        await categoryModel.updateCategory(req.params.id, name, description);
        res.json({ message: 'Category updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete category
router.delete('/:id', async (req, res) => {
    try {
        await categoryModel.deleteCategory(req.params.id);
        res.json({ message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;