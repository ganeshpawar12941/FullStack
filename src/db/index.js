import mongoose from "mongoose";
import  {DB_NAME}  from "../constants.js";




const database = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    // console.log("Connected at", connectionInstance.connection)
    console.log(`Connected to MongoDB at ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};



export default database;


