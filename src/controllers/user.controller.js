import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshTokens=async (userId)=>{
    try {
        const user=await User.findById(userId) // isline sai mere pas user ka document aa gaya h database sai
        // these 2 below lines generate acess token and refresh token
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()
        // adding refreshtoken to the database for further future use
        user.refreshToken=refreshToken
        // saving after adding refresh token to the user document
        await user.save({validateBeforeSave:false})

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
    }
}

const registerUser=asyncHandler(async (req,res)=>{
    // get user detail from frontend
    // validation - not empty
    // check if user already exits: using username or email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entity in db
    // remove password and refresh token feild from response
    // check for user creation
    // return response

    // agar data directly form sai aa raha h ya json sai aa raha h toh hum data ko acess/get kar sakte h req.body ke trough
    // const {fullName,username,email,password}=req.body
    const {fullName,username,email,password}=req.body||{}
    // console.log(req.body)
    // console.log("email: ",email);

    // one way is to check for each and every field one by one but better appraoch is using array.some()
    // if(fullName===""){
    //     throw new ApiError(400,"Fullname is Required")
    // }

    if([fullName,username,email,password].some((feild)=> !feild || feild?.trim()==="")){
        throw new ApiError(400,"All Feilds are Required.")
    }

    // checking wether the user is already registered or not?
    // we will use User model to ask /find user in mongoDb using userName or Email
    // the findOne() function returns the first matching document from the mongoDb
    const existedUser=await User.findOne({
        // the below line makes us use the or operator here we pass an array of objects as parameters for the or operator
        // if either the document with the given userNmae or given email is found in mongoDb we will return true
        $or:[{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists.")
    }

    // in most of the cases the middleware does nothing but add some extra feilds to the req object that is provides some extra functionalities
    // here multer (middleware) provides us the .files() functionality that helps us to deal with the files 
    // here we will be able to acess the files that multer will upload to our server when files are submitted in our frontend
    // console.log(req.files);

    const avatarLocalPath=req.files?.avatar?.[0]?.path // this will return us the path where the file will be stored on server.
    // const coverImageLocalPath=req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar File is Required.")
    }

    // uploading the avatar file on cloudinary
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400,"Avatar File is Required.")
    }

    // creating a user document in mongoDb after creating an object
    const user=await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // to check wether thre user is created actually or not we will use findbyid() method to communicate with databse
    // as the next step is to remove password and refreshtoken field from the user when send as response to the client 
    // so we chain the User.findbyId() with select() and pass a srtring of items that we don't want as parameters
    const createdUser=await User.findById(user._id).select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user.")
    }

    // sending response when the user is successfully registered in a predefined manner from apiResponse class
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered succesfully.")
    )
})

const loginUser=asyncHandler(async(req,res)=>{
    // req-body -> data (req.body sai data le aao)
    // decide wether we want username or email based login
    //find the user
    // password check
    // generate acess and refresh token
    // send both acesstoken and refreshtoken to the user as cookies

    const {username,email,password}=req.body

    if(!(username || email)){
        throw new ApiError(400,"Username or email is required.")
    }

    const user=await User.findOne({
        // here $ or means or operator in mongodb 
        // we will find the first document that appears with either the given username or email
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(404,"User does not exists.")
    }

    // "User" is the model that mongoose has provided me with this "User" i can access the methods which mongoose provide me
    // but for accessing the methods that i defined in the models and controller can be accessed using "user" the instance of the user which we have drived from database
    // the below mentioned code will return true ya false in isPasswordValid variable
    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"Invalid user credentials")
    }

    const {accessToken,refreshToken}=await generateAccessAndRefreshTokens(user._id)

    // getting the refrence of user document (updated ) user in which we have added the refresh token and acess token
    // for sending the data to user we will send this loggedInUser but after removing some of the feilds using .select method
    const loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    // jabh bhi app ko cookies bhejna ho toh app ko optons define karne padte h jo ki kuch nahi actually mai bas ek object hi hota h
    // options object is used to make cookies more secure that is to diable modification of cookies from the frontend , the cookies can only be now modified from the server 
    const options={
        httpOnly:true,
        secure:true
    }

    res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,
        // ye jo pink {} mai object h vo hi data h jo ApiResponse mai define kiya tha
        {
        user: loggedInUser,accessToken,refreshToken
        },"User logged in succesfully."))
})

// code for logging out user
const logOutUser=asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        // we have to pass the feildname that we want to update
        {
            refreshToken: undefined
        },
        {
            new: true
        }
    )
    // now we have to remove acesstoken and refreshtoken from cookies
    const options={
        httpOnly:true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,{},"User Logged Out"))
})

// we can write an additional code for cases when the Access Token expires and we get 401 error, the code for such cases will make a new endpoint and controller for refreshing the access token
// as well as refresh token

const refreshAccessToken=asyncHandler(async()=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(incomingRefreshToken){
        throw new ApiError(401,"Unauthorised request")
    }

    try {
        // below line of code is decoding the refreshToken which the user's browser's cokkie is sending , we verify the decode token with env.REFRESH_TOKEN_SECRET
        // after decoding it we will use that refresh token for user's authorization
        const decodedToken=jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)    
        const user=await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken!== user?.refreshToken){
            throw new ApiError(401,"Refresh Token is expired or used.")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
        // generating new refresh and access token if the user id found 
        const {accessToken,newRefreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",newRefreshToken,options).json(
            ApiResponse(200,
            {
                accessToken,refreshToken: newRefreshToken
            },
            "Access Token refreshed "
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token.")
    }
})

export {registerUser,loginUser,logOutUser,refreshAccessToken}