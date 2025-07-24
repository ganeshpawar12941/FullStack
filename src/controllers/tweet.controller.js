import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import ApiResponse  from "../utils/ApiResponse.js"
import  asyncHandler  from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required")
    }
    const user = await User.findById(req.user?._id).select("-password -refreshToken")
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    const tweet = await Tweet.create({
        content,
        owner: user._id
    })

    if (!tweet) {
        throw new ApiError(500, "Failed to create tweet")
    }

    const populatedTweet = await tweet.populate("owner", "username avatar");


    return res.status(200)
        .json(
            new ApiResponse(200, populatedTweet, "Tweet created successfully")
        )

})

const getUserTweets = asyncHandler(async (req, res) => {
    //TODO: get user tweets
    const {userId} = req.params

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id or missing user id")
    }

    const tweets = await Tweet.find({ owner: userId }).populate("owner", "username avatar")
    if (!tweets) {
        throw new ApiError(500, "Failed to get tweets")
    }
    return res.status(200)
        .json(
            new ApiResponse(200, tweets, "Tweets fetched successfully")
        )



})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { content } = req.body
    
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    //check owner of tweet is the same as the user

    if (!isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id: req.params.id,
            owner: req.user?._id
        },
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )

    return res.status(200)
        .json(
            new ApiResponse(200, tweet, "Tweet updated successfully")
        )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    if (!isValidObjectId(req.params.id)) {
        throw new ApiError(400, "Invalid tweet id")
    }


    const deleteTweet = await Tweet.findOneAndDelete(
        {
            _id: req.params.id,
            owner: req.user?._id
        }
    )

    if (!deleteTweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, deleteTweet, "Tweet deleted successfully")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}