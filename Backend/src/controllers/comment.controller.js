import mongoose,{ isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import  ApiResponse  from "../utils/ApiResponse.js"
import  asyncHandler  from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit) // Calculate the number of documents to skip based on page and limit

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id or missing video id")
    }


    const comments = await Comment.find({ video: videoId })
        .skip(skip)                                                 // Skip the specified number of documents
        .limit(parseInt(limit))                                     // Limit the number of documents
        .sort({ createdAt: -1 })                                      // Sort by createdAt field in descending order
        .populate("owner", "username avatar")


    const totalComments = await Comment.countDocuments({ video: videoId })

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {
                    skip: parseInt(skip),
                    limit: parseInt(limit),
                    totalComments: totalComments,
                    comments,
                },
                "Comments fetched successfully")
        )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    const { content } = req.body

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const { videoId } = req.params

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id or missing video id")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    })

    if (!comment) {
        throw new ApiError(500, "Failed to create comment")
    }

    await comment.populate("owner", "username avatar")

    return res.status(200)
        .json(
            new ApiResponse(200, comment, "Comment created successfully")
        )

})

const updateComment = asyncHandler(async (req, res) => {

    // TODO: update a comment
    const { content } = req.body
    const { commentId } = req.params

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id or missing comment id")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            owner: req.user._id
        },
        {
            content: content.trim()
        },
        {
            new: true
        }
    ).populate("owner", "username avatar")

    if(!updatedComment) {
        throw new ApiError(404, "Comment not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        )

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!commentId || !isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id or missing comment id")
    }

    const deletedComment = await Comment.findOneAndDelete(
        {
            _id: commentId,
            owner: req.user._id
        }
    )

    if (!deletedComment) {
        throw new ApiError(404, "Comment not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, deletedComment, "Comment deleted successfully")
        )
})


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}