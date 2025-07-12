import dotenv from "dotenv";
dotenv.config({
    path:"./env"
});
import database from "./db/index.js"

database()
