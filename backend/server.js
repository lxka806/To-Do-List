const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

const authRoute = require("./routers/auth.route");
const listRoute = require("./routers/todo.route")

const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());

// routes
app.use("/api/auth", authRoute);
app.use("/api/list", listRoute)

// db connect
mongoose.connect(process.env.MONGOODB_URL)
    .then(() => {
        console.log("MONGODB is connected")
        app.listen(PORT, () => {
            console.log("server is running on port", PORT)
        })
    })