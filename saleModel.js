const db = require('./database');  

// Create a new sale with its items (transaction)
const createSale = async (userId, items, paymentMethod, discount = 0) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Calculate total
        let total = 0;
        for (const item of items) {
            total += item.quantity * item.price;
        }
        const finalTotal = total - discount;

        // Insert sale
        const [saleResult] = await connection.query(
            'INSERT INTO sales (user_id, total_amount, payment_method) VALUES (?, ?, ?)',
            [userId, finalTotal, paymentMethod]
        );
        const saleId = saleResult.insertId;

        // Insert sale items
        for (const item of items) {
            await connection.query(
                `INSERT INTO sale_items (sale_id, product_id, quantity, price, subtotal)
                 VALUES (?, ?, ?, ?, ?)`,
                [saleId, item.productId, item.quantity, item.price, item.quantity * item.price]
            );
            // Decrease product stock
            await connection.query(
                'UPDATE products SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.productId]
            );
            // Log inventory transaction (OUT)
            await connection.query(
                `INSERT INTO inventory_transactions (product_id, type, quantity, reference)
                 VALUES (?, 'OUT', ?, ?)`,
                [item.productId, item.quantity, `sale_${saleId}`]
            );
        }

        await connection.commit();
        return saleId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Get all sales (with cashier name)
const getSales = async () => {
    const [rows] = await db.query(`
        SELECT s.*, u.name as cashier_name
        FROM sales s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.created_at DESC
    `);
    return rows;
};

// Get a single sale with its items
const getSaleById = async (id) => {
    const [saleRows] = await db.query('SELECT * FROM sales WHERE id = ?', [id]);
    if (saleRows.length === 0) return null;
    const sale = saleRows[0];
    const [items] = await db.query(`
        SELECT si.*, p.name as product_name
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = ?
    `, [id]);
    sale.items = items;
    return sale;
};

// Get dashboard statistics
const getDashboardStats = async () => {
    // Today's sales
    const [[todaySales]] = await db.query(
        `SELECT COALESCE(SUM(total_amount), 0) as totalSales, COUNT(*) as transactionCount
         FROM sales WHERE DATE(created_at) = CURDATE()`
    );
    // Total products
    const [[productCount]] = await db.query('SELECT COUNT(*) as count FROM products');
    // Low stock products (stock < 5)
    const [lowStock] = await db.query('SELECT * FROM products WHERE stock < 5');
    // Best selling product (by total quantity)
    const [bestSeller] = await db.query(`
        SELECT p.id, p.name, SUM(si.quantity) as totalSold
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        GROUP BY p.id
        ORDER BY totalSold DESC
        LIMIT 1
    `);
    // Total inventory value
    const [[inventoryValue]] = await db.query('SELECT COALESCE(SUM(price * stock), 0) as value FROM products');
    // Recent transactions (last 5)
    const [recentTransactions] = await db.query(`
        SELECT s.*, u.name as cashier_name
        FROM sales s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.created_at DESC
        LIMIT 5
    `);

    return {
        todaySales: todaySales.totalSales,
        transactions: todaySales.transactionCount,
        totalProducts: productCount.count,
        lowStock,
        bestSeller: bestSeller[0] || null,
        inventoryValue: inventoryValue.value,
        recentTransactions
    };
};

module.exports = {
    createSale,
    getSales,
    getSaleById,
    getDashboardStats
};