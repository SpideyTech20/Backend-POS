const Product = require("../models/productModel");

exports.getProducts = async (req, res) => {

    try {

        const products = await Product.getAllProducts();

        res.json(products);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.getProduct = async (req, res) => {

    try {

        const product = await Product.getProductById(req.params.id);

        res.json(product);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.createProduct = async (req, res) => {

    try {

        const { name, price, stock } = req.body;

        await Product.createProduct(name, price, stock);

        res.json({
            message: "Product added successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.updateProduct = async (req, res) => {

    try {

        const { name, price, stock } = req.body;

        await Product.updateProduct(
            req.params.id,
            name,
            price,
            stock
        );

        res.json({
            message: "Product updated successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

exports.deleteProduct = async (req, res) => {

    try {

        await Product.deleteProduct(req.params.id);

        res.json({
            message: "Product deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};