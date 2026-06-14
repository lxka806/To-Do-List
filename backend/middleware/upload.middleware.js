const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "..", "uploads"));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const timestamp = Date.now();
        cb(null, `avatar-${req.user.id}-${timestamp}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB max
    },
    fileFilter: (req, file, cb) => {
        const allowed = [".png", ".jpg", ".jpeg", ".webp", ".gif"];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed."));
        }
    },
});

module.exports = upload;