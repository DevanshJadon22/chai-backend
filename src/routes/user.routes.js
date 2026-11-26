// yaha par hum user ke sare routes rakhenge
import { Router } from "express";
import { loginUser, logOutUser, registerUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory } from "../controllers/user.controller.js";
// hume agar files ko handle karna h toh hume upload (multer vala) middleware use karna padega before registerUser method
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

// jabh jo url match ho jayegi uska controller invoke ho jayega.
router.route("/register").post(
    // using the upload middleware to handle the uploading of files 
    // here upload has many functionalities due to multer so we use upload.feilds([])
    //here the .feilds([]) takes multiple files as input to upload as an array
    // we have to define the files to be taken as input in the array as an object.
    upload.fields([
        {
            name: "avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
// router.route("/login",login)
router.route("/login").post(loginUser)

// secured routes( routes to be accessed by loggedin user inly)
// here we are injecting "verifyJWT" middleware before "logOutUser"
router.route("/logout").post(verifyJWT,logOutUser)
router.route("/refresh-token").post(refreshAccessToken)

// adding route for changing password
router.route("/change-passwpord").post(verifyJWT,changeCurrentPassword)

//adding route for getting details of current user
router.route("/current-user").get(verifyJWT,getCurrentUser)

// adding a router for updation of account details
router.route("/update-account").patch(verifyJWT,updateAccountDetails)
 
// adding a route for updation of user avatar
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

// adding a route for updation for coverImage
router.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

// jabh humare pass jo data h route pe url ke through aa raha h toh hume jo data ki feild h (name ) h vo same rakhni padti h backend k naam sai
router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)

// adding route for watch history
router.route("/history").get(verifyJWT,getWatchHistory)

export default router