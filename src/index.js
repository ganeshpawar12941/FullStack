import dotenv from "dotenv";
dotenv.config({
    path:"./.env"
});
import database from "./db/index.js"
import { app } from "./app.js";


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


database()
