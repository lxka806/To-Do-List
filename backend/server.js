const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

const authRoute = require("./routers/auth.route");
const listRoute = require("./routers/todo.route");
const leaderboardRoute = require("./routers/leaderboard.route");

const PORT = process.env.PORT || 3000;

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/auth", authRoute);
app.use("/api/list", listRoute);
app.use("/api/leaderboard", leaderboardRoute);

// db connect
mongoose.connect(process.env.MONGOODB_URL)
    .then(async () => {
        const db = mongoose.connection.db;

        try {
            const authCollection = db.collection("auths");
            const indexes = await authCollection.indexes();

            if (indexes.some((index) => index.name === "usernam_1")) {
                await authCollection.dropIndex("usernam_1");
                console.log("Dropped stale usernam_1 index from auths collection.");
            }
        } catch (indexError) {
            console.warn("Index cleanup skipped:", indexError.message);
        }

        console.log("MONGODB is connected");
        app.listen(PORT, () => {
            console.log("server is running on port", PORT);
        });
    })