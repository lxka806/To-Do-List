const Auth = require("../models/auth.model");

// SIGNUP
const signup = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const normalizedEmail = email.toLowerCase();

        const existingUser = await Auth.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const user = await Auth.create({
            fullname,
            email: normalizedEmail,
            password,
        });

        const token = user.signToken();

        return res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                avatar: user.avatar,
            },
        });

    } catch (err) {
        if (err.code === 11000) {
            const duplicateField = Object.keys(err.keyValue)[0] || "field";
            return res.status(400).json({ message: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists` });
        }

        return res.status(500).json({ message: err.message });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const normalizedEmail = email.toLowerCase();

        const user = await Auth.findOne({ email: normalizedEmail }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isValid = await user.comparePassword(password);

        if (!isValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = user.signToken();

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                avatar: user.avatar,
                totalTasks: user.totalTasks,
            },
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await Auth.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                avatar: user.avatar,
                totalTasks: user.totalTasks,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await Auth.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }

        await user.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            user: {
                id: user._id,
                fullname: user.fullname,
                email: user.email,
                avatar: user.avatar,
                totalTasks: user.totalTasks,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

// LOGOUT
const logout = async (req, res) => {
    try {
        res.clearCookie("token");

        return res.status(200).json({
            message: "Logged out successfully",
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = {
    signup,
    login,
    logout,
    getProfile,
    updateProfile,
};