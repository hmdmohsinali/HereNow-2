import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from './model/event/event.js';
import News from './model/news/news.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const resetScores = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const eventResult = await Event.updateMany({}, { score: "0" });
    console.log(`Reset score for ${eventResult.modifiedCount} event(s).`);

    const newsResult = await News.updateMany({}, { score: 0 });
    console.log(`Reset score for ${newsResult.modifiedCount} news item(s).`);

  } catch (error) {
    console.error('Error resetting scores:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed.');
    process.exit(0);
  }
};

resetScores();

