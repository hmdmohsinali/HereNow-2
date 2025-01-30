import Event from "../../model/event/event.js";
import eventScoreCalculation from "../../utlise/event_score.js";

export const addEvents = async (req, res) => {
    try {
        const { title,description, image, video, lat, long, location, contact, price, startDate, endDate, city, state, country } = req.body;

        // Validate required fields
        if (!description || !lat || !long || !location || !contact || !price || !startDate || !endDate || !city || !state || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userId = req.user.id; // Declare and assign userId
        console.log(userId);

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

        return res.status(200).json({ message: "Event added successfully", event });
    } catch (e) {
        console.error(e); // Log the error for debugging
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getEvents = async (req, res) => {
    const userId = req.user?.id; // Get the user ID from authentication middleware

    try {
        // Fetch all events with populated fields
        const events = await Event.find()
            .populate("rating", "user ratingValue") // Populate user and ratingValue fields from rating schema
            .populate("comment", "_id") // Populate comments
            .populate("user") // Populate event creator
            .lean(); // Convert to plain JS object for easier manipulation

        if (!events || events.length === 0) {
            return res.status(404).json({ message: "No events found" });
        }

        // Process events to calculate average ratings and userRated
        const scoredEvents = events
            .map((event) => {
                const totalRatings = event.rating.length; // Count the number of ratings
                const averageRating = totalRatings
                    ? event.rating.reduce((sum, r) => sum + r.ratingValue, 0) / totalRatings
                    : 0; // Calculate the average rating

                const userRated = event.rating.some((r) => r.user.toString() === userId); // Check if user has rated

                return {
                    ...event, // Spread the event object
                    averageRating: averageRating.toFixed(2), // Add average rating, rounded to 2 decimals
                    userRated, // Add the userRated boolean
                    score: eventScoreCalculation(event), // Calculate the event's score (custom logic)
                };
            })
            .sort((a, b) => b.score - a.score); // Sort by score in descending order

        console.log("Scored Events:", scoredEvents);

        return res.status(200).json({
            message: "All events fetched successfully",
            events: scoredEvents,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};


// export const getEvents = async (req, res) => {
//     try {
//         // Populate the comments and ratings fields
//         const events = await Event.find()
//             .populate("rating", "ratingValue") // Populating only the ratingValue field
//             .populate("comment", "_id") // Populating only the _id field of comments
//             .populate("user")
//             .lean();

//         if (!events || events.length === 0) {
//             return res.status(404).json({ message: "No events found" });
//         }

//         // Calculate scores and sort events
//         const scoredEvents = events
//             .map(event => ({
//                 ...event, // Plain object from Mongoose's lean() method
//                 score: eventScoreCalculation(event) // Calculate score
//             }))
//             .sort((a, b) => b.score - a.score); // Sort by score in descending order

//         console.log("Scored Events:", scoredEvents);

//         return res.status(200).json({
//             message: "All events fetched successfully",
//             events: scoredEvents
//         });
//     } catch (e) {
//         console.error(e);
//         return res.status(500).json({ message: "Internal server error", error: e.message });
//     }
// };

///Get Events by ID
export const getEventById = async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findById(eventId)
            .populate("rating", "ratingValue")
            .populate("comment", "_id")
            .lean();

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        return res.status(200).json({
            message: "Event fetched successfully",
            event
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};

///Update Events
export const updateEvent = async (req, res) => {
    const { eventId } = req.params;
    const { description, image, video, lat, long, location, contact, price, startDate, endDate } = req.body;

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Update fields
        event.description = description || event.description;
        event.image = image || event.image;
        event.video = video || event.video;
        event.lat = lat || event.lat;
        event.long = long || event.long;
        event.location = location || event.location;
        event.contact = contact || event.contact;
        event.price = price || event.price;
        event.startDate = startDate || event.startDate;
        event.endDate = endDate || event.endDate;

        await event.save();

        return res.status(200).json({ message: "Event updated successfully", event });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};

////Delete Evetns
export const deleteEvent = async (req, res) => {
    try {
      const {eventId } = req.params;
  console.log(eventId);
      const event = await Event.findByIdAndDelete(eventId);
  
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
      res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };
  
