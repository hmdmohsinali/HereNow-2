import express from "express";
import bcrypt from "bcryptjs";
import Admin from "../model/auth/Admin.js"; // Adjust the path as needed
import User from "../model/auth/auth.js";
import News from "../model/news/news.js";
import NewsRatings from "../model/news/rating.js";
import EventRating from "../model/event/rating.js";
import Event from "../model/event/event.js";

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
    res.status(201).json({
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
      return res
        .status(400)
        .json({ message: "Invalid status. Use 'active' or 'suspended'." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, select: "firstName lastName email status" }
    );
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res
      .status(200)
      .json({ message: `User status updated to ${status}`, updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/getNews", checkAdmin, async (req, res) => {
  try {
    const newsList = await News.find(
      {},
    );

    // Calculate total ratings & average rating for each news item
    const newsWithRatings = await Promise.all(
      newsList.map(async (news) => {
        const ratings = await NewsRatings.find({ newsId: news._id });
        const totalRatings = ratings.length;
        const averageRating =
          totalRatings > 0
            ? ratings.reduce((sum, rate) => sum + rate.ratingValue, 0) /
              totalRatings
            : 0;

        return {
          ...news.toObject(),
          totalRatings,
          averageRating: parseFloat(averageRating.toFixed(2)),
        };
      })
    );

    res.status(200).json(newsWithRatings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.get("/singleNews/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate(
      "user",
      "firstName lastName email"
    );

    if (!news) return res.status(404).json({ message: "News not found" });

    // Fetch total ratings & average rating
    const ratings = await NewsRatings.find({ newsId: news._id });
    const totalRatings = ratings.length;
    const averageRating =
      totalRatings > 0
        ? ratings.reduce((sum, rate) => sum + rate.ratingValue, 0) /
          totalRatings
        : 0;

    // Fetch comments separately with user details
    const comments = await NewsComments.find({ newsId: news._id })
      .populate("user", "firstName lastName email image") // Populate user details
      .sort({ createdAt: -1 }); // Sort comments by latest

    res.status(200).json({
      ...news.toObject(),
      totalRatings,
      averageRating: parseFloat(averageRating.toFixed(2)),
      comments, // Include properly structured comments
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/addNews", checkAdmin, async (req, res) => {
  const {
    title,
    description,
    image,
    video,
    typeNews,
    lat,
    long,
    category,
    location,
    city,
    state,
    country,
  } = req.body;
  const userId = req.query.id; // Extract the user ID from the JWT token (middleware should set this)
  try {
    if (
      !description ||
      !image ||
      !typeNews ||
      !category ||
      !location ||
      !lat ||
      !long ||
      !city ||
      !state ||
      !country
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new news document with the user ID reference
    const news = new News({
      title,
      description,
      image,
      video,
      lat,
      long,
      typeNews,
      category,
      location,
      city,
      state,
      country,
      user: userId, // Link the user who is creating the news
    });

    // Save the news document to the database
    await news.save();

    // Return a success response with a 201 status code (resource created)
    return res.status(201).json({ message: "News posted successfully", news });
  } catch (e) {
    console.error(e); // Log the error for debugging purposes
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.put("/editNews/:newsId", checkAdmin, async (req, res) => {
  const { newsId } = req.params;
  const {
    title,
    description,
    image,
    video,
    typeNews,
    category,
    lat,
    long,
    location,
    city,
    state,
    country,
  } = req.body;

  try {
    // Find and update the news article
    const updatedNews = await News.findByIdAndUpdate(
      newsId,
      {
        title,
        description,
        image,
        video,
        typeNews,
        category,
        lat,
        long,
        location,
        city,
        state,
        country,
      },
      { new: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ message: "News not found" });
    }

    return res
      .status(200)
      .json({ message: "News updated successfully", updatedNews });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/deleteNews/:newsId", checkAdmin, async (req, res) => {
  const { newsId } = req.params;

  try {
    const deletedNews = await News.findByIdAndDelete(newsId);

    if (!deletedNews) {
      return res.status(404).json({ message: "News not found" });
    }

    return res.status(200).json({ message: "News deleted successfully" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/addEvent", checkAdmin, async (req, res) => {
    try {
        const { title, description, image,lat, long, video,  location, contact, price, startDate, endDate, city, state, country } = req.body;

        // Validate required fields
        if (!description || !lat || !long || !location || !contact || !price || !startDate || !endDate || !city || !state || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userId = req.query.id; // Extract admin user ID from query (middleware should set this)

        // Create a new event
        const event = new Event({
            title,
            description,
            image,
            video,
            lat,
            long,
            location,
            contact,
            price,
            user: userId,
            startDate,
            endDate,
            city,
            state,
            country,
        });

        await event.save();

        return res.status(201).json({ message: "Event added successfully", event });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.get("/getEvents", checkAdmin, async (req, res) => {
    try {
        const eventList = await Event.find(
            {},
        );

        const eventsWithRatings = await Promise.all(
            eventList.map(async (event) => {
                const ratings = await EventRating.find({ eventId: event._id });
                const totalRatings = ratings.length;
                const averageRating =
                    totalRatings > 0
                        ? ratings.reduce((sum, rate) => sum + rate.ratingValue, 0) / totalRatings
                        : 0;

                return {
                    ...event.toObject(),
                    totalRatings,
                    averageRating: parseFloat(averageRating.toFixed(2)),
                };
            })
        );

        res.status(200).json(eventsWithRatings);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.get("/singleEvent/:id",checkAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate("user", "firstName lastName email");

        if (!event) return res.status(404).json({ message: "Event not found" });

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.delete("/deleteEvent/:eventId", checkAdmin, async (req, res) => {
    const { eventId } = req.params;

    try {
        const deletedEvent = await Event.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json({ message: "Event deleted successfully" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

router.put("/editEvent/:eventId", checkAdmin, async (req, res) => {
    const { eventId } = req.params;
    const { title, description, image, video, lat, long, location, contact, price, startDate, endDate, city, state, country } = req.body;

    try {
        // Find and update the event
        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            {
                title,
                description,
                image,
                video,
                lat,
                long,
                location,
                contact,
                price,
                startDate,
                endDate,
                city,
                state,
                country,
            },
            { new: true } // Return the updated document
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json({ message: "Event updated successfully", updatedEvent });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});




export default router;
