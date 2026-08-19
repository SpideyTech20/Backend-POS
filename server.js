require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./database");

const productRoutes = require("./productRoutes");
const authRoutes = require("./authRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares

app.use(cors());
app.use(express.json());


// Routes

app.use("/auth", authRoutes);
app.use("/products", productRoutes);


// Home Route

app.get("/", (req, res) => {
    res.json({
        message: "Keep Running, Spidey!",
        endpoints: {
            register: "POST /auth/register",
            login: "POST /auth/login",
            getAllProducts: "GET /products",
            getProduct: "GET /products/:id",
            createProduct: "POST /products",
            updateProduct: "PUT /products/:id",
            deleteProduct: "DELETE /products/:id"
        }
    });
});


// Start Server

async function startServer() {
    try {
        const connection = await pool.getConnection();

        console.log("Connected to MySQL!");

        connection.release();

        app.listen(PORT, () => {
            console.log(` Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error(" Database Connection Error:", error);
    }
}

startServer();