import mongoose from "mongoose";

const eventCommentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    eventId: { // Changed 'event' to 'eventId' for clarity
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true,   // Trimming spaces from the content
        minlength: 5, // Minimum length for the content to avoid spammy or empty comments
    },
   
}, {
    timestamps: true,
});


// Define model
const EventComment = mongoose.model("EventComment", eventCommentSchema);

export default EventComment;
