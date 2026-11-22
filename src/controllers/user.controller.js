import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const {fullName,username,email,password}=req.body
    console.log("email: ",email);

    // one way is to check for each and every field one by one but better appraoch is using array.some()
    // if(fullName===""){
    //     throw new ApiError(400,"Fullname is Required")
    // }

    if([fullName,username,email,password].some((feild)=> feild?.trim()==="")){
        throw new ApiError(400,"All Feilds are Required.")
    }

    // checking wether the user is already registered or not?
    // we will use User model to ask /find user in mongoDb using userName or Email
    // the findOne() function returns the first matching document from the mongoDb
    const existedUser=User.findOne({
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
    console.log(req.files);

    const avatarLocalPath=req.files?.avatat[0]?.path // this will return us the path where the file will be stored on server.
    const coverImageLocalPath=req.files?.coverImge[0]?.path

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

export {registerUser}