import {Like} from '../models/like.model.js'
import ApiResponse from '../utils/ApiResponse.js'
import  {ApiError} from '../utils/ApiError.js'
import asyncHandler from '../utils/asyncHandler.js'
import mongooseimport ,{ isValidObjectId } from 'mongoose'
import {Comment} from '../models/comment.model.js'
import { Video } from '../models/video.model.js'
import { Tweet } from '../models/tweet.model.js'


const toggleCommentLike = asyncHandler(async (req,res) => {
    const {commentId} = req.params
    if(!commentId || !isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id or missing comment id")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404,"Comment not found")
    }

    const user = req.user
    if(!user){
        throw new ApiError(401,"User not authenticated")
    }

    const existedlike = await Like.findOneAndDelete({
        comment:commentId,
        likedBy:user._id
    })

    // console.log(" existedlike",existedlike)
    if(existedlike){
        return res.status(200).json(
            new ApiResponse(200,{},"comment like removed successfully")
        )
    }
    const newlike = await Like.create({
        comment:commentId,
        likedBy:user._id
    })
    // console.log(" newlike",newlike)

    await newlike.populate("likedBy","username avatar")

    return res.status(200).json(
        new ApiResponse(200,newlike,"comment like created successfully")
    )

})

const toggleVideoLike = asyncHandler(async (req,res) => {
    const {videoId} = req.params

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid tweet id or missing   tweet id")
    }

    const video = await Video.findById(videoId)
    if( !video){
        throw new ApiError(404,"Video not found")
    }

    // const user = req.user
    // if(!user){
    //     throw new ApiError(401,"User not authenticated")
    // }

    const existedlike = await Like.findOneAndDelete({
        tweet:videoId,
        likedBy:req.user?._id
    })

     if(existedlike){
        return res.status(200).json(
            new ApiResponse(200,{},"video like removed successfully")
        )
     }
    
     const newlike = await Like.create({
        tweet:videoId,
        likedBy:req.user?._id
     })

     await newlike.populate("likedBy","username avatar")

     return res.status(200).json(
        new ApiResponse(200,newlike,"video like created successfully")
     )
     
})

const toggleTweetLike = asyncHandler(async (req,res) => {
    const {tweetId} = req.params
    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet id or missing tweet id")
    }
    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(404,"Tweet not found")
    }

    const existedlike = await Like.findOneAndDelete({
        tweet:tweetId,
        likedBy:req.user?._id
    })

     if(existedlike){
        return res.status(200).json(
            new ApiResponse(200,{},"tweet like removed successfully")
        )
     }
    
     const newlike = await Like.create({
        tweet:tweetId,
        likedBy:req.user?._id
     })

     await newlike.populate("likedBy","username avatar")

     return res.status(200).json(
        new ApiResponse(200,newlike,"video like created successfully")
     )
    
})

const getAllLikedVideos = asyncHandler(async (req,res) => {
    const {likeId} = req.params

    if(!likeId || !isValidObjectId(likeId)){
        throw new ApiError(400,"Invalid like id or missing like id")
    }

    const allvideos = await Like.find({likedBy:likeId})
    if(!allvideos.length){
        throw new ApiError(404,"No videos found")
    }
    return res.status(200).json(
        new ApiResponse(200,allvideos,"Videos fetched successfully")
    )
    
})

export {
    getAllLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
}

