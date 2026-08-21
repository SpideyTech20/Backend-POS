const db = require('./database');  // ← FIXED

// Get all categories
const getAllCategories = async () => {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
    return rows;
};

// Get category by ID
const getCategoryById = async (id) => {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ?', [id]);
    return rows[0];
};

// Create a new category
const createCategory = async (name, description) => {
    const [result] = await db.query(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description]
    );
    return result.insertId;
};

// Update a category
const updateCategory = async (id, name, description) => {
    await db.query(
        'UPDATE categories SET name = ?, description = ? WHERE id = ?',
        [name, description, id]
    );
};

// Delete a category
const deleteCategory = async (id) => {
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
};

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};