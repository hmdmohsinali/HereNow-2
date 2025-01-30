import mongoose from "mongoose";

const newsCommentsSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        newsId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "News",
            required: true,
        },
        content: {
            type: String, // Each comment is a single string
            required: true,
            trim: true,
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

const NewsComments = mongoose.model("NewsComments", newsCommentsSchema);
export default NewsComments;
