import User from "../../model/auth/auth.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// User registration
export const userRegistration = async (req, res) => {
  try {
    const { firstName, lastName, email, password, lat, long, locationName } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !lat || !long || !locationName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: `User with email ${email} is already registered` });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword, // Save the hashed password
      lat,
      long,
      locationName,
    });

    // Save the user to the database
    await user.save();

    // Send a success response
    res.status(201).json({ message: "User registered successfully", user: { firstName, lastName, email, locationName } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

// User Login
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare entered password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token (HS256 - Symmetric)
    const payload = { userId: user._id }; // Add necessary data (e.g., user ID)
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '30d' }); // Token will expire in 30 days

    // Send the token in the response along with user details (excluding password)
    res.status(200).json({
      message: "Login successful",
      token,
      user: { firstName: user.firstName, lastName: user.lastName, email: user.email, locationName: user.locationName }
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
};
///Get user profile

export const getUserDetail = async (req, res) => {
  try {
    const userId = req.user.id;

    // Log for debugging (use sparingly in production)
    console.log(`Fetching details for user ID: ${userId}`);

    // Find the user by ID
    const user = await User.findById(userId);

    // Handle case where user is not found
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user
    });

  } catch (e) {
    // Log error for debugging
    console.error("Error fetching user details:", e);

    // Internal server error response
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: e.message // Optional: Remove this in production to avoid exposing details
    });
  }
};

export const updateUserProfile = async (req, res) => {
  const { firstName, lastName, contact, image } = req.body;

  try {
    // Get the logged-in user's ID from the request
    const userId = req.user.id;

    // Find the user by ID
    const user = await User.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    // Update only the fields provided in the request body
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (contact) user.contact = contact;
    if (image) user.image = image;

    // Save the updated user document
    const updatedUser = await user.save();

    // Respond with success and updated data
    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      data: updatedUser,
    });
  } catch (e) {
    // Handle unexpected errors
    console.error("Error updating user profile:", e);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: e.message // Optional: avoid exposing too much detail in production
    });
  }
};

///Get All users
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find();

    // Check if users exist
    if (!users || users.length === 0) {
      return res.status(404).json({
        message: "No users found",
        success: false
      });
    }

    // Return users if found
    return res.status(200).json({
      message: "Users fetched successfully",
      success: true,
      data: users
    });

  } catch (e) {
    console.error("Error fetching users:", e.message); // Log with more context
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: e.message
    });
  }
};
//#####Delete user
export const deleteSingleUser = async (req, res) => {
  try {
    const userId = req.user.id;

    // Ensure userId is provided
    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
        success: false,
      });
    }

    // Attempt to delete user
    const user = await User.findByIdAndDelete(userId);

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Return success response
    return res.status(200).json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (e) {
    console.error("Error deleting user:", e.message);

    // Return error response
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: e.message,
    });
  }
};
