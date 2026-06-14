import express from "express";
import {
  getDiscountCodes,
  createDiscountCode,
  validateDiscountCode,
} from "../controllers/discountController.js";
import { protect, admin, staff } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, staff, getDiscountCodes)
  .post(protect, admin, createDiscountCode);
router.post("/validate", protect, validateDiscountCode);

export default router;
