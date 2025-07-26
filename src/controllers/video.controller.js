import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadToS3} from "../utils/awsUploader.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId
    } = req.query;

    const skip = (page - 1) * limit;

    // Build filter condition
    const filter = {};
    if (query) {
        filter.title = { $regex: query, $options: "i" };                // Case-insensitive search on title
    }
    if (userId) {
        filter.owner = userId;                                          // if you want to filter by uploader
    }

    // Build sort condition
    const sortCondition = {};
    sortCondition[sortBy] = sortType === "asc" ? 1 : -1;

    // Fetch from DB
    const videos = await Video.find(filter)
        .sort(sortCondition)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("owner", "username avatar");

    const total = await Video.countDocuments(filter)


    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    skip,
                    limit,
                    total,
                    videos,
                },
                "Videos fetched successfully"
            )
        );

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description , duration} = req.body


    if (!title || !description || !duration) {
        throw new ApiError(400, "Title and description are required")
    }
    const videoFile = req.files?.videoFile?.[0];
    const thumbnail = req.files?.thumbnail?.[0];

    if (!videoFile || !thumbnail) {
        throw new ApiError(400, "video file and thumbnail are required")
    }

    const videoupload = await uploadToS3(videoFile.buffer, videoFile.originalname, videoFile.mimetype,"video")
    const thumbnailupload = await uploadToS3(thumbnail.buffer, thumbnail.originalname, thumbnail.mimetype,"thumbnail")

    const newvideo = await Video.create({
        videoFile: videoupload.Location,
        thumbnail: thumbnailupload.Location,
        title,
        description,
        duration,
        owner: req.user._id
    })
    return res.status(200)
        .json(
            new ApiResponse(200, newvideo, "Video uploaded successfully")
        )
})

const getVideoById = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id or missing video id")
    }
    //TODO: get video by id
    const video = await Video.findById(videoId).populate("owner", "username avatar")
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video fetched successfully")
        )
})

const updateVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id or missing video id")
    }
    const existingVideo = await Video.findById(videoId);
    if (!existingVideo) {
        throw new ApiError(404, "Video not found");
    }

    //Check if the logged-in user is the owner of the video
    if (existingVideo.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }

    const { title, description } = req.body;
    const thumbnail = req.file
    console.log("req.file",req.file)
    console.log("thumbnail",thumbnail)

    let updatedThumbnail = null;
    if (thumbnail) {
        updatedThumbnail = await uploadToS3(
            thumbnail.buffer,
            thumbnail.originalname,
            thumbnail.mimetype,
            "thumbnail"
        );
    }

    console.log("updatedThumbnail",updatedThumbnail)

    const updateData = { title, description };
    if (updatedThumbnail) {
        updateData.thumbnail = updatedThumbnail.Location;
    }

    console.log("updateddata",updateData)
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        updateData,
          {
        new: true,
    });

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, "Video updated successfully")
    );
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id or missing video id");
    }

    // Delete only if video exists AND the user is the owner
    const deletedVideo = await Video.findOneAndDelete({
        _id: videoId,
        owner: req.user._id
    });

    if (!deletedVideo) {
        throw new ApiError(404, "Video not found or you're not authorized to delete it");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Video deleted successfully")
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id or missing video id");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check if the logged-in user is the owner of the video
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            
            }
        },
        {
            new: true
        }
    )
  
    // console.log(updatedVideo)

    return res.status(200).json(
        new ApiResponse(200, updatedVideo, `Video ${updatedVideo.isPublished ? "published" : "unpublished"} successfully`)
    );
})

const incrementvideoviews = asyncHandler(async(req,res)=>{
    const {videoId} = req.params
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid video id or missing video id")
    }
    //user authentication
    const user = req.user
    if(!user){
        throw new ApiError(401,"User not authenticated")
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $inc:{
                views:1
            }
        },
        {
            new:true
        }
    )

    return res.status(200).json(
        new ApiResponse(200,video,"Video views incremented successfully")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    incrementvideoviews
}