import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";



export const verifyJWT = asyncHandler( async (req,res,next) => {

    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log(token)
        if(!token){
            throw new ApiError(401, "Unauthorized access");
        }
        //Verify token
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if(!decodeToken){
            throw new ApiError(401, "Unauthorized access");
        }

       const user = await User.findById(decodeToken._id).select("-password -refreshToken");
       if(!user){
            throw new ApiError(404, "User not found");
        }

        //Attach user to request object
        req.user = user;
        next();

    }catch(error){
        console.log("internal error is" , error)
        throw new ApiError(401, "Unauthorized access" ,[error.message]);
    }

})