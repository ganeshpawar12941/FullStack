import express from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";

import {
    getAllLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
} from "../controllers/like.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/").get(getAllLikedVideos);
router.route("/video/:videoId").post(toggleVideoLike);
router.route("/tweet/:tweetId").post(toggleTweetLike);
router.route("/comment/:commentId").post(toggleCommentLike);

export default router;