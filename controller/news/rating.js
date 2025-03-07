import NewsRatings from "../../model/news/rating.js";
import News from "../../model/news/news.js";
////Add Rating
export const addNewsRating = async (req, res) => {
    const { newsId, ratingValue } = req.body;
    const userId = req.user.id;

    try {
        if (!newsId || !ratingValue) {
            return res.status(400).json({ message: "NewsId and ratingValue are required." });
        }

        // 1. Check if the news exists
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: "News not found." });
        }

        // 2. Create a new rating
        const rate = new NewsRatings({
            userId: userId, 
            newsId: news._id,
            ratingValue,
        });

        // 3. Save the rating
        const savedRating = await rate.save();

        // 4. Push the rating reference into the News document
        news.rating.push(savedRating._id);

        // **Increment score based on ratingValue**
        news.score += ratingValue;

        await news.save();

        console.log('Updated Score:', news.score);

        return res.status(201).json({ 
            message: "Rating posted successfully on news", 
            rating: savedRating,
            updatedScore: news.score
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({ 
            message: "An error occurred while posting the rating.", 
            error: e.message 
        });
    }
};


///UPDate Rating
export const updateNewsRating = async (req, res) => {
    const { newsId, ratingValue } = req.body;
    const userId = req.user.id;  // Extract userId from token

    try {
        if (!newsId || !ratingValue) {
            return res.status(400).json({ message: "NewsId and ratingValue are required." });
        }

        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: "News not found." });
        }

        // Find the existing rating for this user
        const existingRating = await NewsRatings.findOne({ newsId, userId });
        if (!existingRating) {
            return res.status(404).json({ message: "Rating not found for this user." });
        }

        // Update the rating
        existingRating.ratingValue = ratingValue;
        const updatedRating = await existingRating.save();

        // Return success response
        return res.status(200).json({ message: "Rating updated successfully", rating: updatedRating });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "An error occurred while updating the rating.", error: e.message });
    }
};

///Delete Rating
export const deleteNewsRating = async (req, res) => {
    const { newsId } = req.body;
    const userId = req.user.id;  // Extract userId from token

    try {
        if (!newsId) {
            return res.status(400).json({ message: "NewsId is required." });
        }

        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: "News not found." });
        }

        // Find and delete the rating for the user and newsId
        const rating = await NewsRatings.findOneAndDelete({ newsId, userId });
        if (!rating) {
            return res.status(404).json({ message: "Rating not found for this user." });
        }

        // Remove the rating reference from the News collection
        await News.updateOne(
            { _id: newsId },
            { $pull: { rating: rating._id } }  // Remove rating ID from the News document
        );

        return res.status(200).json({ message: "Rating deleted successfully." });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "An error occurred while deleting the rating.", error: e.message });
    }
};
///Get Average Rating
export const getAverageNewsRating = async (req, res) => {
    const { newsId } = req.params;  // Get newsId from URL parameters

    try {
        if (!newsId) {
            return res.status(400).json({ message: "NewsId is required." });
        }

        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: "News not found." });
        }

        // Get all ratings for this news
        const ratings = await NewsRatings.find({ newsId });

        if (ratings.length === 0) {
            return res.status(200).json({ message: "No ratings available for this news." });
        }

        // Calculate average rating
        const totalRating = ratings.reduce((acc, rating) => acc + rating.ratingValue, 0);
        const averageRating = totalRating / ratings.length;

        return res.status(200).json({
            message: "Average rating fetched successfully",
            averageRating: averageRating.toFixed(2) // Rounding to 2 decimal places
        });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ message: "An error occurred while fetching the average rating.", error: e.message });
    }
};
