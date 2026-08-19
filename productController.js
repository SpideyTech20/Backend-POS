const ProductModel = require("./productModel");

class ProductController {

    // GET /products
    static async getAllProducts(req, res) {
        try {
            const products = await ProductModel.getAllProducts();
            res.json(products);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // GET /products/:id
    static async getProductById(req, res) {
        try {
            const product = await ProductModel.getProductById(req.params.id);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            res.json(product);

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

    // POST /products
    static async createProduct(req, res) {
        try {
            const { name, price, stock } = req.body;

            await ProductModel.createProduct(name, price, stock);

            res.status(201).json({
                message: "Product created successfully"
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

    // PUT /products/:id
    static async updateProduct(req, res) {
        try {
            const { name, price, stock } = req.body;

            await ProductModel.updateProduct(
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
    }

    // DELETE /products/:id
    static async deleteProduct(req, res) {
        try {
            await ProductModel.deleteProduct(req.params.id);

            res.json({
                message: "Product deleted successfully"
            });

        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
    }

}

module.exports = ProductController;