import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  addToFavorites,
  getFavorites,
  removeFromFavorites,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const avatarsDir = path.join(__dirname, "..", "..", "images", "avatars");
    fs.mkdir(avatarsDir, { recursive: true })
      .then(() => cb(null, avatarsDir))
      .catch((err) => cb(err));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `avatar-${timestamp}-${name}${ext}`);
  },
});

const upload = multer({ storage });
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post("/upload-avatar", protect, upload.single("avatar"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const relativePath = `images/avatars/${req.file.filename}`;
    res.json({ path: relativePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Favorites routes
router.route("/favorites").get(protect, getFavorites);
router
  .route("/favorites/:productId")
  .post(protect, addToFavorites)
  .delete(protect, removeFromFavorites);

export default router;
