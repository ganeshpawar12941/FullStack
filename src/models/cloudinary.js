import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret: process.env.CLOUDINARY_API_SECRET 
    });

const uplaoadToCloudinary = async (localpath)=>{
    try {
        if(!localpath){
            return null;
        }
        const reponse = await cloudinary.uplaoder.upload(localpath,{
            resources: 'auto',
        })
        console.log("Cloudinary response:", reponse.url);
        fs.unlinkSync(localpath); // Delete the local file after upload
        console.log("Local file deleted:", localpath);
        return reponse;
    } catch (error) {
        fs.unlinkSync(localpath); // Ensure local file is deleted on error
    }
   
}
export default uplaoadToCloudinary;