import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  updateProductReview,
  deleteProductReview,
  approveProductReview,
  getAllReviews,
} from "../controllers/productController.js";
import { protect, admin, staff } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getProducts).post(protect, staff, createProduct);
router
  .route("/:id")
  .get(getProductById)
  .put(protect, staff, updateProduct)
  .delete(protect, staff, deleteProduct);

router.route("/:id/reviews").post(protect, createProductReview);
router
  .route("/:id/reviews/:reviewId")
  .put(protect, updateProductReview)
  .delete(protect, deleteProductReview);
router
  .route("/:id/reviews/:reviewId/approve")
  .put(protect, staff, approveProductReview);

router.route("/reviews/all").get(protect, staff, getAllReviews);

export default router;
