import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
const uploadOnCloudinary = async (filePath) =>{
    cloudinary.config({ 
        cloud_name: process.env.CLOUNDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUNDINARY_API_KEY, 
        api_secret:  process.env.CLOUNDINARY_API_SECRET 
    });
    try {
        const uploadResult = await cloudinary.uploader
       .upload(filePath)
       fs.unlinkSync(filePath)
        return uploadResult.secure_url
    } catch (error) {
        fs.unlinkSync(filePath)
        return res.status(500).json({message:"cloudinary error"})
    }
}
export default uploadOnCloudinary;