import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../model/auth/Admin.js"; // Adjust the path as needed
import User from "../model/auth/auth.js";

const router = express.Router();

const checkAdmin = async (req, res, next) => {
  const { userId } = req.query; // Admin ID
  const admin = await Admin.findById(userId);
  if (!admin) {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    res
      .status(201)
      .json({
        message: "Admin registered successfully",
        adminId: newAdmin._id,
      });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({ message: "Login successful", adminId: admin._id });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/getUsers", checkAdmin, async (req, res) => {
  try {
    const users = await User.find(
      {},
      "firstName lastName email status createdAt"
    );

    const formattedUsers = users.map((user) => ({
      userId: user._id,
      name: `${user.firstName || ""} ${user.lastName}`.trim(),
      email: user.email,
      status: user.status,
      registeredAt: user.createdAt,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/singleUsers/:id", checkAdmin, async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id,
      "firstName lastName email status createdAt contact image locationName"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      userId: user._id,
      name: `${user.firstName || ""} ${user.lastName}`.trim(),
      email: user.email,
      status: user.status,
      registeredAt: user.createdAt,
      contact: user.contact,
      image: user.image,
      locationName: user.locationName,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.delete("/delUser/:id", checkAdmin, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.patch("/changeStatus/:id", checkAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!["active", "suspended"].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Use 'active' or 'suspended'." });
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, { status }, { new: true, select: "firstName lastName email status" });
        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.status(200).json({ message: `User status updated to ${status}`, updatedUser });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});




export default router;
