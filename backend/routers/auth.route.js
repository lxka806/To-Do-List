const express = require("express");
const router = express.Router();

const {
    signup,
    login,
    logout,
    getProfile,
    updateProfile,
} = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", protect, getProfile);
router.patch("/profile", protect, updateProfile);

module.exports = router;