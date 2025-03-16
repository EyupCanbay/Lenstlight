import express from "express";
import dotenv  from "dotenv";
import conn from "./db.js";
import cookieParser from "cookie-parser";
import methodOvirride from "method-override"
import pageRoute from "./routes/pageRoute.js";
import photoRoute from "./routes/photoRoute.js";
import userRoute from "./routes/userRoute.js";
import { checkUser } from "./middlewares/authMiddleware.js";
import fileUpload from "express-fileupload";
import { v2 as cloudinary } from "cloudinary";



dotenv.config();
cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_SECRET,
})

//connect to db function

conn();

const app = express();
const port = process.env.PORT;

//ejs tamplate engine
app.set("view engine", "ejs");

//static files midilware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({useTempFiles:true}));
app.use(methodOvirride("_method",{
    methods: ['POST','GET'],
}))
//routes
app.use("*", checkUser);    // it will check every get function when it works from checkUser
app.use("/", pageRoute);
app.use("/photos", photoRoute);
app.use("/users", userRoute);



app.listen(port, async ()=>{
    console.log(`${port} is listening`);
})