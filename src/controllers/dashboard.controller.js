import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {Comment} from "../models/comment.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelId = req.user._id

    const totalVideos = await Video.countDocuments({owner:channelId})
    const totalSubscribers = await Subscription.countDocuments({subscriber:channelId})
    const totalVideosViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ])
    const totalViewsCount = totalVideosViews[0]?.totalViews || 0
    
    const totalLikes = await Like.aggregate([
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videodata"
            }
        },
        {
            $unwind:"$videodata"
        },
        {
            $match:{
                "videodata.owner": new mongoose.Types.ObjedctId(channelId)
            }

        },
        {
            $count:"totalLikes"
        }
    ])

    const totalLikesCount = totalLikes[0]?.totalLikes || 0

        const totalComments = await Comment.aggregate([
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as:"videodata"
            }
        },
        {
            $unwind:"$videodata"
        },
        {
            $match:{
                "videodata.owner": new mongoose.Types.ObjedctId(channelId)
            }

        },
        {
            $count:"totalComments"
        }
    ])

    const totalCommentsCount = totalComments[0]?.totalLikes || 0
    
   

    return res.status(200).json(
        new ApiResponse(200,{},{
            totalVideos,
            totalLikesCount,
            totalSubscribers,
            totalViewsCount,
            totalCommentsCount
        })
    )


})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const channelId = req.user._id

    const videos = await Video.find({owner:channelId}).sort({createdAt:-1}).populate("owner", "username avatar")

    return res.status(200).json(
        new ApiResponse(200,videos,"Videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
}