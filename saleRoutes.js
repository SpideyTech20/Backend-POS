const express = require("express");

const router = express.Router();

const saleModel = require("./saleModel");


// ========================================
// CREATE NEW SALE
// ========================================

router.post("/", async (req, res) => {

    try {

        const {
            items,
            paymentMethod,
            discount
        } = req.body;


        // Check cart

        if (
            !items ||
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({
                error: "Cart is empty"
            });

        }


        // ========================================
        // VALIDATE SALE ITEMS
        // ========================================

        for (const item of items) {

            if (
                !item.productId ||
                !item.quantity ||
                item.quantity <= 0 ||
                item.price === undefined ||
                item.price === null
            ) {

                return res.status(400).json({
                    error: "Invalid sale item data"
                });

            }

        }


        // ========================================
        // TEMPORARY USER ID
        // ========================================

        const userId = 1;


        // ========================================
        // CREATE SALE
        // ========================================

        const saleId = await saleModel.createSale(

            userId,

            items,

            paymentMethod || "cash",

            Number(discount) || 0

        );


        // ========================================
        // SUCCESS RESPONSE
        // ========================================

        res.status(201).json({

            saleId,

            message: "Sale recorded successfully"

        });


    } catch (error) {

        console.error(
            "Create sale error:",
            error
        );


        res.status(500).json({

            error: error.message

        });

    }

});


// ========================================
// GET ALL SALES
// ========================================

router.get("/", async (req, res) => {

    try {

        const sales =
            await saleModel.getSales();


        res.json(sales);


    } catch (error) {

        console.error(
            "Get sales error:",
            error
        );


        res.status(500).json({

            error: error.message

        });

    }

});


// ========================================
// DASHBOARD STATISTICS
// IMPORTANT: THIS MUST COME BEFORE /:id
// ========================================

router.get("/dashboard/stats", async (req, res) => {

    try {

        const stats =
            await saleModel.getDashboardStats();


        res.json(stats);


    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );


        res.status(500).json({

            error: error.message

        });

    }

});


// ========================================
// GET SPECIFIC SALE
// ========================================

router.get("/:id", async (req, res) => {

    try {

        const sale =
            await saleModel.getSaleById(
                req.params.id
            );


        if (!sale) {

            return res.status(404).json({

                error: "Sale not found"

            });

        }


        res.json(sale);


    } catch (error) {

        console.error(
            "Get sale error:",
            error
        );


        res.status(500).json({

            error: error.message

        });

    }

});


module.exports = router;