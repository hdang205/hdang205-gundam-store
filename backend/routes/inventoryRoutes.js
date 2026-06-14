import express from "express";
import InventoryLog from "../models/InventoryLog.js";
import Product from "../models/Product.js";
import { protect, staff } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get inventory status
router.get("/status", protect, staff, async (req, res) => {
  const products = await Product.find({}, "name stock category");
  res.json(products);
});

// Stock in/out
router.post("/log", protect, staff, async (req, res) => {
  const { productId, type, quantity, reason } = req.body;
  const product = await Product.findById(productId);

  if (product) {
    const log = new InventoryLog({
      product: productId,
      type,
      quantity,
      reason,
      performedBy: req.user._id,
    });

    if (type === "in") {
      product.stock += Number(quantity);
    } else {
      product.stock -= Number(quantity);
    }

    await log.save();
    await product.save();
    res.status(201).json(log);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// Get logs
router.get("/logs", protect, staff, async (req, res) => {
  const logs = await InventoryLog.find({})
    .populate("product", "name")
    .populate("performedBy", "name")
    .sort("-createdAt");
  res.json(logs);
});

export default router;
