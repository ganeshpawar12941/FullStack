import assyncHandler from '../utils/asyncHandler.js';


const registerUser = assyncHandler( async (req,res)=>{
    res.status(200).json({
        message:"ok",
    })
}) 

export {registerUser};