import mongoose, { SchemaType } from "mongoose";

const { Schema } = mongoose;

const photoSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true    // başta ve sonda girilen boşluklardan kurtulmamızı sağlar.
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
    user:{
        type: Schema.Types.ObjectId,
        ref:"User",
    },
    linkPhoto: {
        type: String,
    },
    publicId:{
        type: String,
    }
});


const Photo = mongoose.model('Photo', photoSchema);
export default Photo