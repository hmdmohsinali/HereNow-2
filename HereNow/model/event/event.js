import mongoose, { mongo } from "mongoose";

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        default: null
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: String,
        default: null
    },
    video: { // Fixed typo ('vide' -> 'video')
        type: String,
        default: null
    },
    lat: {
        type: Number,
        required: true,
    },
    long: {
        type: Number,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    price: {
        type: Number, // Changed to Number if it's intended to store numeric value
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    startDate: { // Added start date field
        type: Date,
        required: true,
    },
    endDate: { // Added end date field
        type: Date,
        required: true,
    },
    rating: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventRating' }],
    ratedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" // Tracks all users who rated this event
    }],
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "EventComment"
    }],
    score: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Replace "Institue" with "Event"
const Event = mongoose.model("Event", eventSchema);

export default Event;
