import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import uplaoadToCloudinary from '../utils/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken'
import { deletefile } from '../utils/deletefIlefromcloudinary.js';
import mongoose from 'mongoose';

const getAccessTokenAndRefreshToken = async (userid) => {
    try {
        // Check if user exists
        const user = await User.findById(userid)
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // console.log("User found:", user);

        // Create access token and refresh token

        const accessToken = user.createAccessToken();
        const refreshToken = user.createRefreshToken();
        //save refresh token in user document

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }) // to avoid password hashing again

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Token creation error:", error);
        throw new ApiError(500, "Failed to create tokens", [error.message], "Token creation failed");
    }


}

const registerUser = asyncHandler(async (req, res) => {
    const { username, password, email, fullName } = req.body
    console.log(req.body);
    console.log("email = ", email);
    if (username === "" || password === "" || email === "" || fullName === "") {
        throw new ApiError(400, "All fields are required");
    }
    // if(
    //     [username, password, email, fullName, avatar].some((field) => field?.trim() === "")
    // ){
    //     throw new ApiError(400, "All fields are required");
    // }

    //Email validation

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }
    //Password validation
    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
        throw new ApiError(400, "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number");
    }

    //user existing check

    const existedUser = await User.findOne({
        $or: [{ username, email }]
    })

    console.log("existedUser = ", existedUser);

    if (existedUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    //upload avatar and cover image 

    const avatarLoaclpath = req.files?.avatar[0]?.path
    console.log(req.files);
    // console.log(req.files.path);
    const coverImageLocalPath = req.files?.coverImage[0]?.path

    if (!avatarLoaclpath) {
        throw new ApiError(400, "Avatar is required");
    }

    //uplod on clousinary

    const avatar = await uplaoadToCloudinary(avatarLoaclpath)
    const coverImage = await uplaoadToCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }

    //Store user in database

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password,
    })
    console.log("user created = ", user);

    //Exclude password and refreshToken from the response

    const userCreated = await User.findById(user._id).select("-password -refreshToken")

    if (!userCreated) {
        throw new ApiError(500, "Failed to create user", ["User creation failed, please try again later"], "User creation failed");
    }

    //return response

    return res.status(201).json(
        new ApiResponse(
            201, userCreated, "User registered successfully"
        )
    )

})

//user login

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required");
    // }

    const user = await User.findOne({
        $or: [{ username, email }]
    })

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const vaidatePassword = await user.isPasswordCorrect(password)
    if (!vaidatePassword) {
        throw new ApiError(401, "Invalid password");
    }

    //Get access token and refresh token
    const { accessToken, refreshToken } = await getAccessTokenAndRefreshToken(user._id);

    //exclude password and refreshToken from the response
    // const userResponse = await User.findById(user._id).select("-password -refreshToken");

    //update object to send in response
    const userResponse = {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
        coverImage: user.coverImage,
        watchHistory: user.watchHistory
    };
    //send cookies

    // console.log(userResponse)

    const options = {
        HttpOnly: true,
        Secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    userResponse,
                    accessToken,
                    refreshToken
                },
                "user logged in successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    //another way to save refresh token in user document
    await User.findByIdAndUpdate(
        req.user._id,
        {
            refreshToken: undefined
        },
        { new: true, runValidators: true }
    )

    const options = {
        httpOnly: true,
        secure: true
    };


    //clear cookies
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        )
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingrefreshToken) {
        throw new ApiError(400, "Unathourized Request")
    }
    try {
        const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }

        if (user?.refreshToken !== incomingrefreshToken) {
            throw new ApiError(400, "user not found")
        }

        const { accessToken, refreshToken: newRefreshToken } = await getAccessTokenAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            Secure: true
        }
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken: accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access token updated successfully"
                )
            )
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid refresh token")
    }
})

const changecurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, cnfmnewPassword } = req.body;

    if (!oldPassword || !newPassword || !cnfmnewPassword) {
        throw new ApiError(400, "All password fields are required");
    }

    if (newPassword !== cnfmnewPassword) {
        throw new ApiError(400, "password not matched")
    }

    const user = await User.findById(req.user?._id).select("+password");
    const ispassword = await user.isPasswordCorrect(oldPassword)
    if (!ispassword) {
        throw new ApiError(400, "oldpassword do not match")
    }

    user.password = newPassword;
    await user.save();
    console.log(`Password changed for user: ${user._id} at ${new Date()}`)

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user,
            "user fetched sucessfully"
        )
    )
})

const updatecoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalpath = req.file?.path;
    if (!coverImageLocalpath) {
        throw new ApiError(400, "coverImage file is missing")
    }

    const existingUser = await User.findById(req.user?._id);
    const oldcoverImageUrl = existingUser?.coverImage;
    console.log("oldcoverImageUrl is ", oldcoverImageUrl)
    if (!oldcoverImageUrl) {
        throw new ApiError(401, "Old image url doesnt exist")
    }

    const response = await deletefile(oldcoverImageUrl)
    if (response.response == "ok") {
        console.log("Old file deleted successfully")
    }

    const coverImage = await uplaoadToCloudinary(coverImageLocalpath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading coverImage file")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url,
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                user,
                "cover Image updated Successfully"
            )
        )


})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalpath = req.file?.path;
    if (!avatarLocalpath) {
        throw new ApiError(400, "avatar file is missing")
    }
    const avatar = await uplaoadToCloudinary(avatarLocalpath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading avatar file")
    }


    const existingUser = await User.findById(req.user?._id);
    const oldAvatarUrl = existingUser?.avatar;
    console.log("oldAvatarUrl is ", oldAvatarUrl)
    if (!oldAvatarUrl) {
        throw new ApiError(401, "Old image url doesnt exist")
    }

    const response = await deletefile(oldAvatarUrl)
    if (response.response == "ok") {
        console.log("Old file deleted successfully")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url,
            }
        },
        {
            new: true
        }
    ).select("-password")


    return res.status(200).json(
        new ApiResponse(200, user, "Avatar image updated successfully")
    );

})
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(200,
            user,
            "Account details updated sucessfully")
    )

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username) {
        throw new ApiError(400, "Username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: { username }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "channelSubscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: { $size: { $ifNull: ["$subscribers", []] } },
                channelsSubscribedToCount: { $size: { $ifNull: ["$channelSubscribedTo", []] } },
                isSubscribed: {
                    $in: [
                        { $toObjectId: req.user?._id?.toString() },
                        {
                            $map: {
                                input: "$subscribers",
                                as: "s",
                                in: "$$s.subscriber"
                            }
                        }
                    ]
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "Channel does not exist");
    }

    return res.status(200).json(
        new ApiResponse(200, channel[0], "User profile fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "vedios",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])


    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "Watch history fetched successfully"
            )
        )
})







export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updateAvatar,
    updatecoverImage,
    changecurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    getUserChannelProfile,
    getWatchHistory,
};