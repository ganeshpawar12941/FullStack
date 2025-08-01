import { Router } from "express";
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").post(createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:id").patch(updateTweet).delete(deleteTweet);

export default router;

