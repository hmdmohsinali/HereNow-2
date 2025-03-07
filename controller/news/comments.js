import News from "../../model/news/news.js";
import NewsComments from "../../model/news/comments.js";

export const addNewsComments = async (req, res) => {
    try {
        const { content, newsId } = req.body;
        const userId = req.user.id; // Ensure consistent user ID retrieval

        console.log('User ID:', userId);
        console.log('News ID:', newsId);
        console.log('Content:', content);

        // Validate input
        if (!content) {
            return res.status(400).json({ message: "Content is required for the comment." });
        }

        if (!newsId || !userId) {
            return res.status(400).json({ message: "News ID and User ID are required." });
        }

        // Check if the news exists
        const news = await News.findById(newsId);
        if (!news) {
            return res.status(404).json({ message: "News not found for the provided ID." });
        }

        // Create and save the comment
        const newComment = new NewsComments({
            user: userId,
            newsId: newsId,
            content: content,
        });
        const savedComment = await newComment.save();

        // Add comment reference to news
        news.newsComments.push(savedComment._id);
        
        // **Increment the score by 1**
        news.score += 1;

        await news.save();

        console.log('Updated Score:', news.score);
        console.log('Saved Comment ID:', savedComment._id);

        // Fetch the updated list of comments for this news item
        const updatedComments = await NewsComments.find({ newsId: newsId })
            .populate('user', 'firstName lastName image') // Populate user details
            .sort({ createdAt: -1 }) // Optional: Sort comments (e.g., latest first)
            .lean(); // Return plain JavaScript objects

        return res.status(201).json({ 
            message: "Comment added successfully.", 
            comment: savedComment,
            updatedComments: updatedComments, // Include the updated comments list
            updatedScore: news.score // Include the updated score
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ 
            message: "An error occurred while adding the comment.", 
            error: error.message 
        });
    }
};

///GetNews Comment
export const getNewsComments = async (req, res) => {
    const { newsId } = req.params;

    try {
        if (!newsId) {
            return res.status(400).json({ message: "News ID is required." });
        }

        console.log("newsId from request:", newsId);
        const comments = await NewsComments.find({ newsId })
        .populate("user", "firstName lastName email image").sort({createdAt:-1}); // Populate the user field
    console.log("Populated comments:", comments);
    

        if (!comments || comments.length === 0) {
            return res.status(404).json({ message: "No comments found for this news." });
        }

        return res.status(200).json({
            message: "Comments fetched successfully.",
            comments,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "An error occurred while fetching the comments.",
        });
    }
};


///Update Comment

export const updateNewsComment = async (req, res) => {
    const { commentId, content } = req.body;
    const userId = req.user.id; // Extract userId from the token

    try {
        if (!commentId || !content) {
            return res.status(400).json({ message: "Comment ID and new content are required." });
        }

        // Find the comment by ID
        const comment = await NewsComments.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Ensure the user is the one who posted the comment
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only update your own comments." });
        }

        // Update the comment
        comment.content = content;
        const updatedComment = await comment.save();

        return res.status(200).json({ message: "Comment updated successfully.", comment: updatedComment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while updating the comment." });
    }
};

///Delete News Comment

export const deleteNewsComment = async (req, res) => {
    try {
        const { commentId } = req.body;
        const userId = req.user.id;  // Get the userId from the verified token (added by middleware)

        if (!commentId) {
            return res.status(400).json({ message: "Comment ID is required." });
        }

        // Check if the comment exists
        const comment = await NewsComments.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Check if the logged-in user is the author of the comment
        if (comment.userId.toString() !== userId) {
            return res.status(403).json({ message: "You can only delete your own comments." });
        }

        // Delete the comment using deleteOne
        await NewsComments.deleteOne({ _id: commentId });

        // Optionally, remove the reference to the comment from the news article
        await News.updateOne(
            { _id: comment.newsId },
            { $pull: { newsComments: commentId } } // Remove the comment ID from the newsComments array
        );

        return res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "An error occurred while deleting the comment." });
    }
};


