import express from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

const router = express.Router();

// Public routes (no authentication required)
router.route("/public/video/:videoId").get(getVideoComments);

// Protected routes (authentication required)
router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;

