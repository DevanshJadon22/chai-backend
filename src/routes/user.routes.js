// yaha par hum user ke sare routes rakhenge
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
// hume agar files ko handle karna h toh hume upload (multer vala) middleware use karna padega before registerUser method
import { upload } from "../middlewares/multer.middleware.js";

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

export default router