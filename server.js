require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./database");

const productRoutes = require("./productRoutes");
const authRoutes = require("./authRoutes");
const categoryRoutes = require("./categoryRoutes");
const saleRoutes = require("./saleRoutes");

const app = express();

const PORT = process.env.PORT || 4000;


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());


// ========================================
// ROUTES
// ========================================

app.use("/auth", authRoutes);

app.use("/products", productRoutes);

app.use("/categories", categoryRoutes);

app.use("/sales", saleRoutes);


// ========================================
// HOME ROUTE
// ========================================

app.get("/", (req, res) => {

    res.json({

        message: "Keep Running, Spidey! 🕷️",

        endpoints: {

            // Authentication
            register: "POST /auth/register",
            login: "POST /auth/login",

            // Products
            getAllProducts: "GET /products",
            getProduct: "GET /products/:id",
            createProduct: "POST /products",
            updateProduct: "PUT /products/:id",
            deleteProduct: "DELETE /products/:id",

            // Categories
            getAllCategories: "GET /categories",
            getCategory: "GET /categories/:id",
            createCategory: "POST /categories (Admin only)",
            updateCategory: "PUT /categories/:id (Admin only)",
            deleteCategory: "DELETE /categories/:id (Admin only)",

            // Sales
            createSale: "POST /sales",
            getAllSales: "GET /sales",
            getSale: "GET /sales/:id",
            dashboard: "GET /sales/dashboard/stats"

        }

    });

});


// ========================================
// START SERVER
// ========================================

async function startServer() {

    try {

        const connection =
            await pool.getConnection();

        console.log("Connected to MySQL!");

        connection.release();


        app.listen(PORT, () => {

            console.log(
                `Server running on http://localhost:${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "Database Connection Error:",
            error
        );

        process.exit(1);

    }

}

startServer();