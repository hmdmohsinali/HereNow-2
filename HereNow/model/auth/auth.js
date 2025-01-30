
import mongoose from "mongoose";

// Define the user schema
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    default: null,
    trim: true, // Removes leading and trailing spaces
  },
  lastName: {
    type: String,
    required: true,
    trim: true, // Removes leading and trailing spaces
  },
  contact:{
    type:String,
    default:null
  },
  image:{
    type:String,
    default:null
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Removes leading and trailing spaces
    lowercase: true, // Converts to lowercase to avoid case-sensitivity issues
  },
  password: {
    type: String,
    required: true,
  },
  lat: {
    type: Number, // Latitude should be a number
  },
  long: {
    type: Number, // Longitude should be a number
  },
  locationName: {
    type: String, // Changed from Number to String
    trim: true,   // Removes leading and trailing spaces
  },
}, {
  timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
});

// Create the model
const User = mongoose.model("User", userSchema);

// Export the model
export default User;
