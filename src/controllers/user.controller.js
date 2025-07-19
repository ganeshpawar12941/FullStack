import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import uplaoadToCloudinary from '../models/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';

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


export {
    registerUser,
    loginUser,
    logoutUser,
};