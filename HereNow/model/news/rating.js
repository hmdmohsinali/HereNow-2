import mongoose from 'mongoose';

const ratingsSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true
    },
    ratingValue: {
        type: Number, // Assuming a rating system from 1 to 5 or any scale you use
        required: true
    },
    newsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "News", // Reference to the News model
        required: true
    }
}, { timestamps: true });

const NewsRatings = mongoose.model("NewsRating", ratingsSchema);
export default NewsRatings;
