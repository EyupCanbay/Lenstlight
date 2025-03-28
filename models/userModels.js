import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";


const { Schema } = mongoose;

const userSchema = new Schema({
    nameSurname: {
        type: String,
        required: [true, "Username area id required"],
        lowercase: true,
        validate: [validator.isAlphanumeric, "Only alphanumeric characters"]
    },
    email: {
        type: String,
        required: [true, "Email area id required"],
        unique: true,
        validate: [validator.isEmail, "Valid email is required"],
    },
    password: {
        type: String,
        required: [true, "Password area id required"],
        minLength: [4, "At least 4 characters"],
    },
    followers: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }],
    followings: [{
        type: Schema.Types.ObjectId,
        ref: "User",
    }]
},{ timestamps: true });


userSchema.pre('save', function(next){
    const user = this;
    bcrypt.hash(user.password, 10, (err, hash) =>{
        user.password = hash;
        next();
    });
})



const User = mongoose.model('User', userSchema);

export default User;