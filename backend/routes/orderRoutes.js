import express from "express";
import {
  createOrder,
  getOrderById,
  updateOrderStatus,
  getMyOrders,
  getAllOrders,
  cancelOrder,
  getOrderInvoice,
} from "../controllers/orderController.js";
import { protect, staff } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createOrder).get(protect, staff, getAllOrders);
router.route("/myorders").get(protect, getMyOrders);
router
  .route("/:id")
  .get(protect, getOrderById)
  .put(protect, staff, updateOrderStatus);
router.route("/:id/cancel").put(protect, cancelOrder);
router.route("/:id/invoice").get(protect, getOrderInvoice);

export default router;
