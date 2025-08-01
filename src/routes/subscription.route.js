import { Router } from 'express';
import { verifyJWT } from "../middlewares/authentication.middleware.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

router.use(verifyJWT);

// Subscribe to a channel
router.post("/", asyncHandler(async (req, res) => {
    const { channelId } = req.body;
    const subscriberId = req.user._id;

    if (!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }

    if (channelId === subscriberId.toString()) {
        throw new ApiError(400, "Cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId
    });

    if (existingSubscription) {
        throw new ApiError(400, "Already subscribed to this channel");
    }

    const subscription = await Subscription.create({
        channel: channelId,
        subscriber: subscriberId
    });

    return res.status(200).json(
        new ApiResponse(200, subscription, "Subscribed successfully")
    );
}));

// Unsubscribe from a channel
router.delete("/:channelId", asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    const subscription = await Subscription.findOneAndDelete({
        channel: channelId,
        subscriber: subscriberId
    });

    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Unsubscribed successfully")
    );
}));

// Get subscriptions for a channel
router.get("/:channelId", asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    const subscription = await Subscription.findOne({
        channel: channelId,
        subscriber: subscriberId
    });

    return res.status(200).json(
        new ApiResponse(200, subscription ? [subscription] : [], "Subscriptions fetched successfully")
    );
}));

export default router; 