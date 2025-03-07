import EventComment from "../../model/event/comments.js";
import Event from "../../model/event/event.js"; // Ensure you're importing the Event model

export const addEventComment = async (req, res) => {
    try {
        const userId = req.user.id;
        const { eventId, content } = req.body;

        // Validate inputs
        if (!eventId || !content) {
            return res.status(400).json({ message: "EventId and Comment are required" });
        }

        // Check if the event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Create a new comment
        const eventcomment = new EventComment({
            eventId: eventId,
            user: userId,
            content: content,
        });

        // Save the comment
        const savedComment = await eventcomment.save();

        // Add comment reference and increment the score
        event.comment.push(savedComment._id);
        event.score += 1;  // **Increment the score by 1**

        await event.save();

        console.log('Updated Score:', event.score);
        console.log('Saved Comment ID:', savedComment._id);

        return res.status(200).json({ 
            message: "Comment posted successfully",
            updatedScore: event.score
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ 
            message: "Internal server error", 
            error: e.message 
        });
    }
};


///Get Event comments
export const getEventComments = async (req, res) => {
    try {
        const { eventId } = req.params;

        // Validate input
        if (!eventId) {
            return res.status(400).json({ message: "EventId is required" });
        }

        // Fetch comments for the event

        if (!comments || comments.length === 0) {
            return res.status(404).json({ message: "No comments found for this event" });
        }

        return res.status(200).json({ message: "Comments fetched successfully", comments });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};

///Update Comments on Events

export const updateEventComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const comment = await EventComment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Ensure only the creator can update the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this comment" });
        }

        comment.content = content;
        await comment.save();

        return res.status(200).json({ message: "Comment updated successfully", comment });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};

///Delete Comments
export const deleteEventComment = async (req, res) => {
    try {
        const { commentId } = req.params;

        const comment = await EventComment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        // Ensure only the creator can delete the comment
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }

        await EventComment.deleteOne({ _id: commentId });

        // Optionally, remove the comment reference from the Event model
        await Event.updateOne(
            { _id: comment.eventId },
            { $pull: { comment: commentId } }
        );

        return res.status(200).json({ message: "Comment deleted successfully" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Internal server error", error: e.message });
    }
};
