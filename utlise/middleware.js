import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authenticate = (req, res, next) => {
  // Extract the token from the Authorization header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Log the token to check if it’s being received (remove in production)
  console.log("Received Token:", token);
  console.log(dotenv.JWT_SECRET)
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify and decode the token

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Your secret key
    console.log("Decoded Token:", decoded); // Log the decoded information (remove in production)

    // Attach the decoded user info to the request object
    req.user = decoded;
    req.user = { id: decoded.userId }; // Attach userId to the request object

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification error:", error); // Log any error during verification

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token has expired." });
    }

    return res.status(401).json({ message: "Invalid token." });
  }
};
