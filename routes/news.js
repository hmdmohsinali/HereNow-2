import express from 'express';
import { addNews, deleteNews, getAllNews, getSingleNews, updateNews } from '../controller/news/news.js';
import { authenticate } from '../utlise/middleware.js';
import { addNewsComments, deleteNewsComment, getNewsComments, updateNewsComment } from '../controller/news/comments.js';
import { addNewsRating, deleteNewsRating, getAverageNewsRating, updateNewsRating } from '../controller/news/rating.js';
const route = express.Router();
route.post("/addRating",authenticate,addNewsRating);
route.put("/updateRating",authenticate,updateNewsRating)
route.delete("/delete",authenticate,deleteNewsRating)
route.get("averageRating/:newsId",getAverageNewsRating)

// Route for adding a comment
route.post("/addComment", authenticate, addNewsComments);

// Route for updating a comment
route.put("/updateComment", authenticate, updateNewsComment);

// Route for deleting a comment
route.delete("/deleteComment", authenticate, deleteNewsComment);

// Route for fetching comments of a news article
route.get("/getComments/:newsId", authenticate, getNewsComments);

//------------------------------------------------NEWS HANDLER ROUTES------------------------------------------//
// Add News (POST)
route.post("/addNews", authenticate, addNews);

// Get All News (GET)
route.get("/getAllNews", authenticate, getAllNews);

//Fetch All news
route.get("/fetchNews",authenticate,getAllNews)

// Update News (PUT)
route.put("/updateNews/:newsId", authenticate, updateNews);

// Delete News (DELETE)
route.delete("/deleteNews/:newsId", authenticate, deleteNews);

// Get Single News (GET)
route.get("/getSingleNews/:newsId", authenticate, getSingleNews);
export default route;