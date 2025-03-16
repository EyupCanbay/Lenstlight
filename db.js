import mongoose from "mongoose" ;


const conn = async () => {
    try{
        await mongoose.connect(process.env.DB_URI, {
            dbName: "lenslight",
        });
        console.log("Connected to DB succesfuly");
    } catch(err){
        console.log(`DB connection err: ${err}`);
    }
};

export default conn;