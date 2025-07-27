import cookieParser from "cookie-parser";
import cors from "cors"
import express from "express";


const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN ,
    credentials:true,
}))

app.use(express.json({
    limit:"16kb",
}))

app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())


//import routers

import userRouter from "./routes/user.route.js"

app.use("/api/v1/users",userRouter)

import tweetRouter from "./routes/tweet.route.js"

app.use("/api/v1/tweets",tweetRouter)

import commentRouter from "./routes/comment.route.js"

app.use("/api/v1/comments",commentRouter)

import videoRouter from "./routes/video.route.js"

app.use("/api/v1/videos",videoRouter)

import likeRouter from "./routes/like.route.js"

app.use("/api/v1/likes",likeRouter)


import playlistrouter from "./routes/playlist.route.js"

app.use("/api/v1/playlists",playlistrouter)

import dashboardRouter from "./routes/dashboard.route.js"

app.use("/api/v1/dashboard",dashboardRouter)


import healthcheckRouter from "./routes/healthcheck.route.js"

app.use("/api/v1/healthcheck",healthcheckRouter)

//https://localhost:8000/api/v1/users/register


export {app}