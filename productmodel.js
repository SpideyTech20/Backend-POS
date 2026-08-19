const pool = require("./database");

class ProductModel {

    // GET ALL PRODUCTS
    static async getAllProducts() {
        const [rows] = await pool.execute("SELECT * FROM products");
        return rows;
    }

    // GET PRODUCT BY ID
    static async getProductById(id) {
        const [rows] = await pool.execute(
            "SELECT * FROM products WHERE id = ?",
            [id]
        );

        return rows[0];
    }

    // CREATE PRODUCT
    static async createProduct(name, price, stock) {
        const [result] = await pool.execute(
            "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
            [name, price, stock]
        );

        return result;
    }

    // UPDATE PRODUCT
    static async updateProduct(id, name, price, stock) {
        const [result] = await pool.execute(
            "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
            [name, price, stock, id]
        );

        return result;
    }

    // DELETE PRODUCT
    static async deleteProduct(id) {
        const [result] = await pool.execute(
            "DELETE FROM products WHERE id = ?",
            [id]
        );

        return result;
    }

}

module.exports = ProductModel;