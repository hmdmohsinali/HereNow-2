import mongoose from "mongoose";

const eventRatingSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,  // Changed to ObjectId
        ref: "User",                           // Correct reference to User model
        required: true,                        // Fixed typo from 'ture' to 'true'
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,  // Changed to ObjectId
        ref: "Event",                          // Correct reference to Event model
        required: true,                        // You can make this required if it's necessary
    },
    ratingValue: {
        type: Number,
        required: true,
    }
}, { timestamps: true }); // Optional: adds createdAt and updatedAt fields

const EventRating = mongoose.model("EventRating", eventRatingSchema); // Fixed model name
export default EventRating;
