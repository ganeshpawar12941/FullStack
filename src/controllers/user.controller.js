import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import uplaoadToCloudinary from '../models/cloudinary.js';
import ApiResponse from '../utils/ApiResponse.js';



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
        throw new ApiError(500, "Failed to create user" ,["User creation failed, please try again later"],"User creation failed");
    }

    //return response

    return res.status(201).json(
       new ApiResponse(
        201,userCreated, "User registered successfully"
       )
    )

})

export { registerUser };