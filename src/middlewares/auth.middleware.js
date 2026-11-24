// in this file we will write our custom middleware 
// ye middleware sirf verify karega ki user h ya nahi h

import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken'
import { User } from "../models/user.model.js";

// hum pehle verify karenge user ko using accessToken and refreshToken , we can acess the tokens using req.cookies
// fhir hum log out karenge user ko
export const verifyJWT=asyncHandler(async(req,_,next)=>{
    try {
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(401,"Unauthorised Request.")
        }
    
        // agar token milgaya h toh fhir verify karo ki token sahi h ki nahi
        // token ko decode krne ya verify karne ke liye hume ACESS-TOKEN_SECRET key cahiye hoti h.
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user=await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            // NEXT_VIDEO : Discuss About ForntEnd
            throw new ApiError(401,"Invalid Access Token")
        }
        // adding a new object into req object 
        req.user=user;
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access Token")
    }
})