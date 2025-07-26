import express from "express";
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    togglePublishStatus,
    deleteVideo,
    incrementvideoviews
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { videoUpload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/").get(getAllVideos).post(
    videoUpload.fields([{
        name: "videoFile",
        maxCount: 1,
    },
    {
        name: "thumbnail",
        maxCount: 1,
    }]), publishAVideo);
router
.route("/:videoId")
.get(getVideoById)
.patch(videoUpload.single("thumbnail"), updateVideo)
.delete(deleteVideo)
.put(togglePublishStatus);

router.route("/views/:videoId").put(incrementvideoviews)

export default router;


