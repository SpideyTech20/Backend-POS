const db = require("./database");


// ========================================
// CREATE NEW SALE
// ========================================

const createSale = async (
    userId,
    items,
    paymentMethod,
    discount = 0
) => {

    const connection =
        await db.getConnection();


    try {

        // ========================================
        // START TRANSACTION
        // ========================================

        await connection.beginTransaction();


        // ========================================
        // CALCULATE TOTAL
        // ========================================

        let total = 0;


        for (const item of items) {

            const quantity =
                Number(item.quantity);

            const price =
                Number(item.price);


            if (
                !item.productId ||
                quantity <= 0 ||
                price < 0
            ) {

                throw new Error(
                    "Invalid product information"
                );

            }


            total += quantity * price;

        }


        // ========================================
        // CALCULATE DISCOUNT
        // ========================================

        const discountAmount =
            Number(discount) || 0;


        if (discountAmount < 0) {

            throw new Error(
                "Discount cannot be negative"
            );

        }


        if (discountAmount > total) {

            throw new Error(
                "Discount cannot be greater than total"
            );

        }


        const finalTotal =
            total - discountAmount;


        // ========================================
        // INSERT SALE
        // ========================================

        const [saleResult] =
            await connection.query(

                `
                INSERT INTO sales
                (
                    user_id,
                    total_amount,
                    payment_method
                )
                VALUES (?, ?, ?)
                `,

                [
                    userId,
                    finalTotal,
                    paymentMethod || "cash"
                ]

            );


        const saleId =
            saleResult.insertId;


        // ========================================
        // INSERT SALE ITEMS
        // ========================================

        for (const item of items) {

            const productId =
                Number(item.productId);

            const quantity =
                Number(item.quantity);

            const price =
                Number(item.price);

            const subtotal =
                quantity * price;


            // ========================================
            // CHECK PRODUCT STOCK
            // ========================================

            const [productRows] =
                await connection.query(

                    `
                    SELECT id, name, stock
                    FROM products
                    WHERE id = ?
                    FOR UPDATE
                    `,

                    [productId]

                );


            if (productRows.length === 0) {

                throw new Error(
                    `Product ${productId} not found`
                );

            }


            const product =
                productRows[0];


            if (
                Number(product.stock) < quantity
            ) {

                throw new Error(
                    `Not enough stock for ${product.name}`
                );

            }


            // ========================================
            // INSERT SALE ITEM
            // ========================================

            await connection.query(

                `
                INSERT INTO sale_items
                (
                    sale_id,
                    product_id,
                    quantity,
                    price,
                    subtotal
                )
                VALUES (?, ?, ?, ?, ?)
                `,

                [
                    saleId,
                    productId,
                    quantity,
                    price,
                    subtotal
                ]

            );


            // ========================================
            // DECREASE PRODUCT STOCK
            // ========================================

            await connection.query(

                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,

                [
                    quantity,
                    productId
                ]

            );


            // ========================================
            // INVENTORY TRANSACTION
            // ========================================

            await connection.query(

                `
                INSERT INTO inventory_transactions
                (
                    product_id,
                    type,
                    quantity,
                    reference
                )
                VALUES (?, 'OUT', ?, ?)
                `,

                [
                    productId,
                    quantity,
                    `sale_${saleId}`
                ]

            );

        }


        // ========================================
        // COMMIT TRANSACTION
        // ========================================

        await connection.commit();


        console.log(
            `Sale ${saleId} created successfully`
        );


        return saleId;


    } catch (error) {

        // ========================================
        // ROLLBACK IF ERROR
        // ========================================

        await connection.rollback();

        throw error;


    } finally {

        // ========================================
        // RELEASE CONNECTION
        // ========================================

        connection.release();

    }

};


// ========================================
// GET ALL SALES
// ========================================

const getSales = async () => {

    const [rows] = await db.query(

        `
        SELECT
            s.*,
            u.name AS cashier_name
        FROM sales s
        JOIN users u
            ON s.user_id = u.id
        ORDER BY s.created_at DESC
        `

    );


    return rows;

};


// ========================================
// GET SALE BY ID
// ========================================

const getSaleById = async (id) => {

    const [saleRows] =
        await db.query(

            `
            SELECT *
            FROM sales
            WHERE id = ?
            `,

            [id]

        );


    if (saleRows.length === 0) {

        return null;

    }


    const sale =
        saleRows[0];


    // ========================================
    // GET SALE ITEMS
    // ========================================

    const [items] =
        await db.query(

            `
            SELECT
                si.*,
                p.name AS product_name
            FROM sale_items si
            JOIN products p
                ON si.product_id = p.id
            WHERE si.sale_id = ?
            `,

            [id]

        );


    sale.items = items;


    return sale;

};


// ========================================
// GET DASHBOARD STATISTICS
// ========================================

const getDashboardStats = async () => {

    // ========================================
    // TODAY'S SALES
    // ========================================

    const [[todaySales]] =
        await db.query(

            `
            SELECT
                COALESCE(
                    SUM(total_amount),
                    0
                ) AS totalSales,

                COUNT(*) AS transactionCount

            FROM sales

            WHERE DATE(created_at) = CURDATE()
            `

        );


    // ========================================
    // TOTAL PRODUCTS
    // ========================================

    const [[productCount]] =
        await db.query(

            `
            SELECT
                COUNT(*) AS count
            FROM products
            `

        );


    // ========================================
    // LOW STOCK PRODUCTS
    // ========================================

    const [lowStock] =
        await db.query(

            `
            SELECT *
            FROM products
            WHERE stock < 5
            ORDER BY stock ASC
            `

        );


    // ========================================
    // BEST SELLING PRODUCT
    // ========================================

    const [bestSeller] =
        await db.query(

            `
            SELECT
                p.id,
                p.name,
                SUM(si.quantity) AS totalSold

            FROM sale_items si

            JOIN products p
                ON si.product_id = p.id

            GROUP BY
                p.id,
                p.name

            ORDER BY
                totalSold DESC

            LIMIT 1
            `

        );


    // ========================================
    // TOTAL INVENTORY VALUE
    // ========================================

    const [[inventoryValue]] =
        await db.query(

            `
            SELECT
                COALESCE(
                    SUM(price * stock),
                    0
                ) AS value

            FROM products
            `

        );


    // ========================================
    // RECENT TRANSACTIONS
    // ========================================

    const [recentTransactions] =
        await db.query(

            `
            SELECT
                s.*,
                u.name AS cashier_name

            FROM sales s

            JOIN users u
                ON s.user_id = u.id

            ORDER BY
                s.created_at DESC

            LIMIT 5
            `

        );


    // ========================================
    // RETURN DASHBOARD DATA
    // ========================================

    return {

        todaySales:
            Number(todaySales.totalSales),

        transactions:
            Number(todaySales.transactionCount),

        totalProducts:
            Number(productCount.count),

        lowStock,

        bestSeller:
            bestSeller.length > 0
                ? bestSeller[0]
                : null,

        inventoryValue:
            Number(inventoryValue.value),

        recentTransactions

    };

};


// ========================================
// EXPORT FUNCTIONS
// ========================================

module.exports = {

    createSale,

    getSales,

    getSaleById,

    getDashboardStats

};