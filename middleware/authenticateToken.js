const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {

    const authorizationHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (
        !authorizationHeader ||
        !authorizationHeader.startsWith("Bearer ")
    ) {
        return res.status(401).json({
            message: "Access token is required"
        });
    }

    // Extract the token
    const token = authorizationHeader.split(" ")[1];

    try {

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Save user information for later use
        req.user = decodedToken;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired access token"
        });

    }

}

module.exports = authenticateToken;