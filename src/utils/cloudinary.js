import { v2 as cloudinary } from "cloudinary";
import { error, log } from "console";
// we use fs from nodejs fs by importing it to mange files give permission ,modify permission and to open a file etc
import fs from "fs"

// this configuration of cloudinary provides us the acess to upload file and video,images to cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET,// Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary=async (localFilePath)=>{
    try {
        if(!localFilePath) {
            console.error("Local File Path not found");
            return null;
        }
        // upload the file on cloudinary
        const response= await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        // file has been uploaded successfully
        // console.log("File is uploaded on cloudinary. ",response.url);
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // this line removes the locally saved temporary file from the server as the upload operation got failed.
        return null;
    }
}

export {uploadOnCloudinary}