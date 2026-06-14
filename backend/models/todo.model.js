const mongoose = require("mongoose")

const toDoList = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        color: {
            type: String,
            default: "#3b82f6"
        },
        completed: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            enum: ["daily", "weekly", "once"],
            default: "once",
        },
        dueDate: {
            type: Date,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Auth",
        },
    },
    { timestamps: true }
)

module.exports = mongoose.model("List", toDoList);