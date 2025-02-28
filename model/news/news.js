import mongoose from 'mongoose';

// Define the News schema
const newsSchema = new mongoose.Schema({
    title:{
        type:String,
        default:null
    },
    description: {
        type: String,
        required: true,
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    country:{
        type:String,
        required:true
    },
    image: {
        type: String,
        required: true,
    },
    video: {
        type: String,// You can change this to Object if you store more info about video
        default: null,
    },
    typeNews: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    lat: {
        type: Number, // Latitude for location
        required: true,
    },
    long: {
        type: Number, // Longitude for location
        required: true,
    },
    location: {
        type: String, // Human-readable location name
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User', // Assuming you have a 'User' model to store user data
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    views: {
        type: Number,
        default: 0, // Tracks the number of views on the news
    },
    newsComments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NewsComments' }],

    rating: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "NewsRating",

    }],
    score: {
        type: Number,
        default: 0, // Score calculated based on the rating, comments, etc.
    },
});

const News = mongoose.model('News', newsSchema);

export default News;
