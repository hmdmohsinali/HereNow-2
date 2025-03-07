import EventRating from "../../model/event/rating.js";
import Event from "../../model/event/event.js"; // Make sure to import Event model



export const addEventRating = async (req, res) => {
    const { eventId, ratingValue } = req.body;
    const userId = req.user.id;

    // Validation
    if (!eventId || !ratingValue) {
        return res.status(400).json({ message: "Event ID and rating value are required." });
    }

    if (typeof ratingValue !== 'number' || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ message: "Rating value must be a number between 1 and 5." });
    }

    try {
        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Create a new rating
        const newRating = new EventRating({
            user: userId,
            event: eventId,
            ratingValue,
        });

        // Save the new rating
        const savedRating = await newRating.save();

        // Add rating reference and increment the score based on rating value
        event.rating.push(savedRating._id);
        event.score += ratingValue; // **Increment score based on ratingValue**

        await event.save();

        console.log('Updated Score:', event.score);

        return res.status(200).json({
            message: "Rating added successfully",
            updatedScore: event.score,
            rating: savedRating,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};


// **Read (Get All Ratings for an Event)**
export const getEventRatings = async (req, res) => {
    const { eventId } = req.params;

    try {
        const eventRatings = await EventRating.find({ event: eventId }).populate("user", "name email");

        if (!eventRatings || eventRatings.length === 0) {
            return res.status(404).json({ message: "No ratings found for this event." });
        }

        return res.status(200).json(eventRatings);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};

// **Update (Edit a Rating)**
export const updateEventRating = async (req, res) => {
    const { ratingId } = req.params;
    const { ratingValue } = req.body;
    const userId = req.user.id;

    if (!ratingValue || typeof ratingValue !== 'number' || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ message: "Rating value must be a number between 1 and 5." });
    }

    try {
        // Check if the rating exists and belongs to the user
        const rating = await EventRating.findOne({ _id: ratingId, user: userId });

        if (!rating) {
            return res.status(404).json({ message: "Rating not found or unauthorized access." });
        }

        // Update the rating value
        rating.ratingValue = ratingValue;
        const updatedRating = await rating.save();

        return res.status(200).json({
            message: "Rating updated successfully",
            rating: updatedRating,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};

// **Delete (Remove a Rating)**
export const deleteEventRating = async (req, res) => {
    const { ratingId } = req.params;
    const userId = req.user.id;

    try {
        // Check if the rating exists and belongs to the user
        const rating = await EventRating.findOneAndDelete({ _id: ratingId, user: userId });

        if (!rating) {
            return res.status(404).json({ message: "Rating not found or unauthorized access." });
        }

        // Remove the rating reference from the event
        await Event.updateOne(
            { _id: rating.event },
            { $pull: { rating: ratingId } }
        );

        return res.status(200).json({ message: "Rating deleted successfully" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};