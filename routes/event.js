import express from 'express';
import { authenticate } from '../utlise/middleware.js';
import { addEvents, deleteEvent, getEventById, getEvents, updateEvent } from '../controller/event/add.js';
import { addEventComment, deleteEventComment, getEventComments, updateEventComment } from '../controller/event/comment.js';
import { addEventRating, deleteEventRating, getEventRatings, updateEventRating } from '../controller/event/rating.js';
const route=express.Router()
//--------------------------------------------------ADD RATING ON EVENTS-----------------------------//
// Route to add a new rating
route.post("/rating", authenticate, addEventRating);

// Route to get all ratings for a specific event
route.get("/:eventId/ratings", authenticate, getEventRatings);

// Route to update an existing rating
route.put("/rating/:ratingId", authenticate, updateEventRating);

// Route to delete an existing rating
route.delete("/rating/:ratingId", authenticate, deleteEventRating);
//-----------------------------------------------------ADD COMMENTS ON EVENTS---------------------------//
route.post("/addComments", authenticate, addEventComment); // Add a comment
route.get("/getComments/:eventId", authenticate, getEventComments); // Get all comments for an event
route.put("/updateComments/:commentId", authenticate, updateEventComment); // Update a comment
route.delete("/deleteComments/:commentId", authenticate, deleteEventComment); // Delete a comment

//----------------------------------_Events handler----------------------------//
// Add a new event
route.post("/add", authenticate, addEvents);

// Get all events
route.get("/allEvent",authenticate,getEvents );

// Get a specific event by ID
route.get("/signleEvent/:eventId",authenticate,getEventById);

// Update an event by ID
route.put("/updateEvent/:eventId", authenticate, updateEvent);

// Delete an event by ID
route.delete("/deleteEvent/:eventId", authenticate, deleteEvent);

export default route;