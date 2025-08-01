import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User"
    }
}, {timestamps: true})



subscriptionSchema.index({ channel: 1 });   
subscriptionSchema.index({ subscriber: 1 });




export const Subscription = mongoose.model("Subscription", subscriptionSchema)