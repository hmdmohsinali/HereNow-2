import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import newRoutes from "./routes/news.js"
import eventRoute from "./routes/event.js"
import adminRoutes from './routes/admin.js'
import cors from "cors";
import cron from 'node-cron';
const app = express();
dotenv.config(); 

// Connect to MongoDB
app.use(cors());
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Mongoose connected successfully...");
  })
  .catch((e) => {
    console.error(`Error connecting mongoose: ${e}`);
  });

app.use(express.json());

const resetScores = async () => {
  try {
    console.log('Resetting scores...');
    const eventResult = await Event.updateMany({}, { score: "0" });
    console.log(`Reset score for ${eventResult.modifiedCount} event(s).`);

    const newsResult = await News.updateMany({}, { score: 0 });
    console.log(`Reset score for ${newsResult.modifiedCount} news item(s).`);
  } catch (error) {
    console.error('Error resetting scores:', error);
  }
};

cron.schedule('0 0 * * *', () => {
  console.log('Running scheduled resetScores job.');
  resetScores();
});

app.use("/api/user/auth", authRoutes);
app.use("/api/news",newRoutes)
app.use("/api/events",eventRoute);
app.use('/admin', adminRoutes)
app.get("/", (req, res) => {
  res.status(200).json({ 
      message: "Welcome to the API! Is Running Sucessfully----->>>>",
  });
});
const PORT = process.env.PORT || 5000; // Use the PORT from .env, or default to 1000
app.listen(PORT, () => {
  console.log(`Server Running At http://localhost:${PORT}`);
});
