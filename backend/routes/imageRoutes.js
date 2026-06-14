import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import {
  getProductImages,
  uploadProductImage,
  deleteProductImage,
} from "../controllers/imageController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imagesDir = path.join(__dirname, "..", "..", "images", "products");
    fs.mkdir(imagesDir, { recursive: true })
      .then(() => cb(null, imagesDir))
      .catch(err => cb(err));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${timestamp}-${name}${ext}`);
  }
});

const router = express.Router();
const upload = multer({ storage });

// GET /api/images/products - list available product images
router.get("/images/products", getProductImages);

// POST /api/images/upload - upload new product image
router.post("/images/upload", upload.single("image"), uploadProductImage);

// DELETE /api/images/products/:filename - delete product image
router.delete("/images/products/:filename", deleteProductImage);

export default router;
