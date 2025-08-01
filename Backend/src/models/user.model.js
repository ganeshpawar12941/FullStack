import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)

// userSchema.index({ username: 1 });

userSchema.pre("save", async function(next){
    if (!this.isModified("password")) {
        return next();
    }
    this.password=await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function (password) {
    if (!password || !this.password) {
    console.warn("Password or enteredPassword missing during compare");
    return false; // Prevents crash
  }
    return await bcrypt.compare(password, this.password);
};


userSchema.methods.createAccessToken = function() {
        return jwt.sign(
         {                                  
            _id: this._id,                      
            email: this.email,                //payload
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,      //secret key
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY //expiry time
        }
    )
    
}

userSchema.methods.createRefreshToken = function() {
     return jwt.sign(
         {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);