import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './ApiError.js';



export const deletefile = (async (oldAvatarUrl)=>{

    const publicId = oldAvatarUrl.split('/').pop().split('.')[0]; 
    try {
        if(!publicId){
            throw new ApiError(400,"Public id is required to delete a file")
        }
        const response = await cloudinary.uploader.destroy(publicId)
        return response
        } 
    catch (error) {
        throw new ApiError(400, error?.message || "Error deleting old avatar from Cloudinary")
    }
})