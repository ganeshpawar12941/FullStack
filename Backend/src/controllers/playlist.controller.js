import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new ApiError(400,"Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    if(!playlist){
        throw new ApiError(500,"Failed to create playlist")
    }

    await playlist.populate("owner","username avatar")

    return res.status(200)
        .json(
            new ApiResponse(200,playlist,"Playlist created successfully")
        )

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id or missing user id")
    }

    const playlists = await Playlist.find({ owner: userId }).populate("owner", "username avatar")
    if (!playlists) {
        throw new ApiError(500, "Failed to get playlists")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, playlists, "Playlists fetched successfully")
        )
    //TODO: get user playlists
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id or missing playlist id")
    }

    const playlist = await Playlist.findById(playlistId).populate("owner", "username avatar")
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, playlist, "Playlist fetched successfully")
        )
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if ((!playlistId || !isValidObjectId(playlistId)) && (!videoId || !isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid playlist id or missing playlist id or invalid video id or missing video id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true
        }
    ).populate("owner", "username avatar").populate("videos")

    if (!updatedPlaylist) {
        throw new ApiError(500, "Failed to add video to playlist")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully")
        )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if ((!playlistId || !isValidObjectId(playlistId)) && (!videoId || !isValidObjectId(videoId))) {
        throw new ApiError(400, "Invalid playlist id or missing playlist id or invalid video id or missing video id")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const videoRemoved = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    return res.status(200)
        .json(
            new ApiResponse(200, videoRemoved, "Video removed from playlist successfully")
    )
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id or missing playlist id")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user._id
    })

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found or you're not authorized to delete it")
    }
    // TODO: delete playlist

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Playlist deleted successfully")
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id or missing playlist id")
    }

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }
    //TODO: update playlist

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {
            new: true
        }
    ).populate("owner", "username avatar")

    return res.status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
        )
})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist,
   
}