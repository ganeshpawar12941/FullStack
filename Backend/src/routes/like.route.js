import express from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";

import {
    getAllLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
} from "../controllers/like.controller.js";

const router = express.Router();

// Public routes (no authentication required)
router.route("/public/video/:videoId").get(getAllLikedVideos);

// Protected routes (authentication required)
router.use(verifyJWT);

router.route("/").get(getAllLikedVideos);
router.route("/video/:videoId").post(toggleVideoLike);
router.route("/tweet/:tweetId").post(toggleTweetLike);
router.route("/comment/:commentId").post(toggleCommentLike);

export default router;