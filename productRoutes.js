const express = require("express");
const ProductController = require("./productController");
const authenticateToken = require("./middleware/authenticateToken");

const router = express.Router();

// Public Route
router.get("/", ProductController.getAllProducts);

// Protected Routes
router.get("/:id", authenticateToken, ProductController.getProductById);

router.post("/", authenticateToken, ProductController.createProduct);

router.put("/:id", authenticateToken, ProductController.updateProduct);

router.delete("/:id", authenticateToken, ProductController.deleteProduct);

module.exports = router;