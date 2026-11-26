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

// 2. NEW HELPER: Extracts Cloudinary `public_id` from a full Cloudinary URL
const extractPublicIdFromUrl = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;

  try {
    // Split on "/upload/" to discard domain, cloud name, and resource type
    const parts = cloudinaryUrl.split("/upload/");
    if (parts.length < 2) return null;

    // Strip optional version prefix (e.g., "v1712345678/")
    const pathWithoutVersion = parts[1].replace(/^v\d+\//, "");

    // Strip the final file extension (e.g., ".jpg", ".png", ".webp")
    const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    return null;
  }
};

// 3. NEW DELETE UTILITY: Deletes a single asset from Cloudinary & clears CDN cache
const deleteFromCloudinary = async (cloudinaryUrl, resourceType = "image") => {
  try {
    if (!cloudinaryUrl) return null;

    const publicId = extractPublicIdFromUrl(cloudinaryUrl);
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType, // Must be "image", "video", or "raw" (NEVER "auto")
      invalidate: true,            // Clears cached copies from CDN edge servers
    });

    return response; // Returns { result: "ok" } when deleted successfully
  } catch (error) {
    console.error("Cloudinary delete failed:", error.message);
    return null;
  }
};

export {uploadOnCloudinary ,deleteFromCloudinary}