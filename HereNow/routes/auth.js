import express from 'express';
import { deleteSingleUser, getAllUser, getUserDetail, updateUserProfile, userLogin,userRegistration } from '../controller/auth/auth.js';
import { authenticate } from '../utlise/middleware.js';
const route =express.Router()///
route.post("/register",userRegistration)
route.post("/login",userLogin)
route.get("/user",authenticate,getUserDetail)
route.get("/all",authenticate,getAllUser)
route.put("/update",authenticate,updateUserProfile)
route.delete('/delete',authenticate,deleteSingleUser);
export default route;

