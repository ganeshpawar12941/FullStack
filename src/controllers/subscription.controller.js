import asyncHandler from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import mongoose ,{isValidObjectId} from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// Toggle subscription for a channel (subscribe/unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const subscriberId = req.user._id;

    if (!isValidObjectId(channelId)) {
        new ApiError(400, "Invalid channel ID");
    }

    if (subscriberId.toString() === channelId.toString()) {
        new ApiError(400, "You cannot subscribe to your own channel");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId,
    });

    if (existingSubscription) {
        // Unsubscribe
        await existingSubscription.deleteOne();
        return res.status(200).json(
            new ApiResponse(200, null, "Unsubscribed successfully")
        )
    } else {
        // Subscribe
        const newSubscription = await Subscription.create({
            subscriber: subscriberId,
            channel: channelId,
        });
        return res.status(201).json(
            new ApiResponse(201, newSubscription, "Subscribed successfully")
        )
    }
});

// Get list of subscribers for a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subscription.find({ channel: subscriberId })
        .populate("subscriber", "username avatar email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    )
});

// Get list of channels to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params; // this is actually subscriberId

    if (!isValidObjectId(channelId)) {
        new ApiError(400, "Invalid user ID");
    }

    const channels = await Subscription.find({ subscriber: channelId })
        .populate("channel", "username avatar email")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, {
            count: channels.length,
            channels,
        }, "Subscribed channels fetched successfully")
    );
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}