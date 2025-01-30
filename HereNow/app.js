import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import newRoutes from "./routes/news.js"
import eventRoute from "./routes/event.js"
dotenv.config(); // Load environment variables from .env file

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Mongoose connected successfully...");
  })
  .catch((e) => {
    console.error(`Error connecting mongoose: ${e}`);
  });

const app = express();
app.use(express.json());
////ROUTES
app.use("/api/user/auth", authRoutes);
app.use("/api/news",newRoutes)
app.use("/api/events",eventRoute);
app.get("/", (req, res) => {
  res.status(200).json({ 
      message: "Welcome to the API! Is Running Sucessfully----->>>>",
  });
});
const PORT = process.env.PORT || 10000; // Use the PORT from .env, or default to 1000
app.listen(PORT, () => {
  console.log(`Server Running At http://localhost:${PORT}`);
});
