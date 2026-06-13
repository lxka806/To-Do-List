const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
            select: false,
        },

        avatar: {
            type: String,
            default: "https://static.thenounproject.com/png/4530368-200.png",
        },

        totalTasks: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// hash password
authSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

// compare password
authSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// generate token
authSchema.methods.signToken = function () {
    return jwt.sign(
        { id: this._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_SECRET_EXPIRES_IN || "7d" }
    );
};

module.exports = mongoose.model("Auth", authSchema);