import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, "..", "..", "images", "products");

// Get list of product images
export async function getProductImages(req, res) {
  try {
    await fs.mkdir(IMAGES_DIR, { recursive: true });
    const files = await fs.readdir(IMAGES_DIR);
    const images = files.filter((f) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
    );
    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Handle image upload
export async function uploadProductImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filename = req.file.filename;
    const relativePath = `images/products/${filename}`;
    res.json({ filename, path: relativePath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Delete product image
export async function deleteProductImage(req, res) {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({ error: "Filename is required" });
    }

    const filepath = path.join(IMAGES_DIR, filename);

    // Verify file is in the correct directory (security check)
    if (!filepath.startsWith(IMAGES_DIR)) {
      return res.status(400).json({ error: "Invalid file path" });
    }

    await fs.unlink(filepath);
    res.json({ message: "Image deleted successfully", filename });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "File not found" });
    }
    res.status(500).json({ error: error.message });
  }
}
