import News from "../../model/news/news.js";
import calculatePopularityScore from "../../utlise/news_score.js";


export const addNews = async (req, res) => {
    const {title, description, image, video, typeNews, category, lat, long, location, city, state, country } = req.body;
    const userId = req.user.id; // Extract the user ID from the JWT token (middleware should set this)
    try {
        // Validate required fields
        if (!description || !image || !typeNews ||! category || !lat || !long || !location || !city || !state || !country) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create a new news document with the user ID reference
        const news = new News({
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
};




// export const getAllNews = async (req, res) => {
//     const { typeNews } = req.query;

//     try {
//         let qury = {};
//         let sortBy = {}; // Sort criteria

//         // If no 'typeNews' query is provided, fetch all news sorted by score by default
//         if (!typeNews) {
//             sortBy = { createdAt: -1 }; // Default to sorting by creation date (latest first)
//         }

//         // If 'typeNews' is provided, apply filtering
//         if (typeNews === 'recent') {
//             // Filtering for recent news
//             const twoDaysAgo = new Date();
//             twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
//             qury.createdAt = { $gte: twoDaysAgo }; // Only news created within the last 2 days
//             sortBy = { createdAt: -1 }; // Sort by creation date in descending order (latest first)
//         } else if (typeNews) {
//             // If 'typeNews' is not 'recent', apply it as a filter (e.g., "Sports", "Environment")
//             qury.typeNews = typeNews; // Assuming `type` is the field for category (adjust this field if needed)
//         }

//         const news = await News.find(qury)
//             .populate("rating", "ratingValue") // Populating rating with only the ratingValue field
//             .populate("user", "firstName lastName image") // Populating user with firstName, lastName, and image only
//             .sort(sortBy) // Apply the sort here directly in the query
//             .lean(); // .lean() will return a plain JavaScript object, not a Mongoose document

//         // Manually calculate the length of the newsComments array
//         const newsWithScores = news.map((newsItem) => {
//             return {
//                 ...newsItem,
//                 commentsCount: newsItem.newsComments ? newsItem.newsComments.length : 0, // Calculate the length of comments
//                 score: calculatePopularityScore(newsItem) // Assuming this is a function to calculate score
//             };
//         });
//         if (!news || news.length === 0) {
//             return res.status(404).json({ message: "No News found for the given filter request" });
//         }



//         // If no filter (other than typeNews) is applied, sort by score as the default behavior
//         if (!typeNews) {
//             newsWithScores.sort((a, b) => b.score - a.score); // Sort by score if no filter is applied
//         }

//         return res.status(200).json({ message: "All data is fetched successfully", newsWithScores });
//     } catch (e) {
//         console.error(e);
//         return res.status(500).json({ message: "An error occurred while fetching the news.", error: e });
//     }
// };


export const getAllNews = async (req, res) => {
    const { typeNews, category } = req.query;

    try {
        // Ensure the category is provided
        if (!category) {
            return res.status(400).json({ message: "Category is required." });
        }

        let qury = { category }; // Start with category filter
        let sortBy = {}; // Sort criteria

        // If no 'typeNews' query is provided, fetch all news sorted by score by default
        if (!typeNews) {
            sortBy = { createdAt: -1 }; // Default to sorting by creation date (latest first)
        }

        // If 'typeNews' is provided, apply filtering
        if (typeNews === 'recent') {
            // Filtering for recent news
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            qury.createdAt = { $gte: twoDaysAgo }; // Only news created within the last 2 days
            sortBy = { createdAt: -1 }; // Sort by creation date in descending order (latest first)
        } else if (typeNews) {
            // If 'typeNews' is not 'recent', apply it as a filter (e.g., "Sports", "Environment")
            qury.typeNews = typeNews; // Assuming `typeNews` is the field for category (adjust if needed)
        }

        // Fetch the news based on the constructed query and sorting criteria
        const news = await News.find(qury)
            .populate("rating", "ratingValue") // Populating rating with only the ratingValue field
            .populate("user", "firstName lastName image") // Populating user with firstName, lastName, and image only
            .sort(sortBy) // Apply the sort here directly in the query
            .lean(); // .lean() will return a plain JavaScript object, not a Mongoose document

        // Manually calculate the length of the newsComments array and score
        const newsWithScores = news.map((newsItem) => {
            return {
                ...newsItem,
                commentsCount: newsItem.newsComments ? newsItem.newsComments.length : 0, // Calculate the length of comments
                score: calculatePopularityScore(newsItem), // Assuming this is a function to calculate score
            };
        });

        if (!news || news.length === 0) {
            return res.status(404).json({ message: "No News found for the given filter request." });
        }

        // If no filter (other than typeNews) is applied, sort by score as the default behavior
        if (!typeNews) {
            newsWithScores.sort((a, b) => b.score - a.score); // Sort by score if no filter is applied
        }

        return res.status(200).json({ message: "All data is fetched successfully", newsWithScores });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "An error occurred while fetching the news.", error: e });
    }
};


// Update News
export const updateNews = async (req, res) => {
    const { newsId } = req.params;
    const { description, image, video, typeNews, category, lat, long, location } = req.body;
    const userId = req.user.id; // Extract the user ID from the JWT token (middleware should set this)

    try {
        // Find the news by its ID
        const news = await News.findById(newsId);

        // Check if news exists
        if (!news) {
            return res.status(404).json({ message: "News not found." });
        }

        // Ensure the user is the creator of the news
        if (news.user.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to update this news." });
        }

        // Update the fields
        news.description = description || news.description;
        news.image = image || news.image;
        news.video = video || news.video;
        news.typeNews = typeNews || news.typeNews;
        news.category = category || news.category;
        news.lat = lat || news.lat;
        news.long = long || news.long;
        news.location = location || news.location;

        // Save the updated news
        await news.save();

        return res.status(200).json({ message: "News updated successfully", news });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// Delete News
export const deleteNews = async (req, res) => {
    const { newsId } = req.params;
    const userId = req.user.id; // Extract the user ID from the JWT token (middleware should set this)

    try {
        // Find the news by its ID
        const news = await News.findById(newsId);

        // Check if news exists
        if (!news) {
            return res.status(404).json({ message: "News not found." });
        }

        // Ensure the user is the creator of the news
        if (news.user.toString() !== userId) {
            return res.status(403).json({ message: "You are not authorized to delete this news." });
        }

        // Use findByIdAndDelete instead of .remove()
        await News.findByIdAndDelete(newsId);

        return res.status(200).json({ message: "News deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get Single News
export const getSingleNews = async (req, res) => {
    const { newsId } = req.params;

    try {
        // Find the news by its ID
        const news = await News.findById(newsId)
            .populate("rating", "ratingValue") // Populate rating with ratingValue field
            .populate("user", "firstName lastName image"); // Populate user with firstName, lastName, and image

        // Check if news exists
        if (!news) {
            return res.status(404).json({ message: "News not found." });
        }

        // Return the single news item
        return res.status(200).json({ message: "News fetched successfully", news });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
