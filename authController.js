const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./userModel");

const BCRYPT_ROUNDS = 12;

class AuthController {

    // ==========================
    // REGISTER
    // ==========================
    static async register(req, res) {

        try {

            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({
                    message: "Name, email, and password are required"
                });
            }

            const normalizedName = name.trim();
            const normalizedEmail = email.trim().toLowerCase();

            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must contain at least 8 characters"
                });
            }

            const existingUser = await User.findByEmail(normalizedEmail);

            if (existingUser) {
                return res.status(409).json({
                    message: "Email is already registered"
                });
            }

            const passwordHash = await bcrypt.hash(
                password,
                BCRYPT_ROUNDS
            );

            const user = await User.create({
                name: normalizedName,
                email: normalizedEmail,
                passwordHash
            });

            return res.status(201).json({
                message: "User registered successfully",
                user
            });

        } catch (error) {

            console.error("Register Error:", error);

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "Email is already registered"
                });
            }

            return res.status(500).json({
                message: error.message
            });

        }

    }

    // ==========================
    // LOGIN
    // ==========================
    static async login(req, res) {

        try {

            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: "Email and password are required"
                });
            }

            const normalizedEmail = email.trim().toLowerCase();

            // FIXED HERE
            const user = await User.findByEmail(normalizedEmail);

            if (!user) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const passwordMatches = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!passwordMatches) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const accessToken = jwt.sign(
                {
                    name: user.name,
                    email: user.email
                },
                process.env.JWT_SECRET,
                {
                    subject: String(user.id),
                    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
                }
            );

            return res.status(200).json({
                message: "Login successful",
                accessToken
            });

        } catch (error) {

            console.error("Login Error:", error);

            return res.status(500).json({
                message: error.message
            });

        }

    }

}

module.exports = AuthController;