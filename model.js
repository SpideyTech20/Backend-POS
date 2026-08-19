const pool = require("../database");

exports.getAllProducts = async () => {

    const [rows] = await pool.query(
        "SELECT * FROM products"
    );

    return rows;

};

exports.getProductById = async (id) => {

    const [rows] = await pool.query(
        "SELECT * FROM products WHERE id=?",
        [id]
    );

    return rows[0];

};

exports.createProduct = async (name, price, stock) => {

    const [result] = await pool.query(
        "INSERT INTO products(name,price,stock) VALUES(?,?,?)",
        [name, price, stock]
    );

    return result;

};

exports.updateProduct = async (id, name, price, stock) => {

    const [result] = await pool.query(
        "UPDATE products SET name=?, price=?, stock=? WHERE id=?",
        [name, price, stock, id]
    );

    return result;

};

exports.deleteProduct = async (id) => {

    const [result] = await pool.query(
        "DELETE FROM products WHERE id=?",
        [id]
    );

    return result;

};