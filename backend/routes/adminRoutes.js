import express from "express";
import {
  getAllUsers,
  getUserById,
  lockUser,
  unlockUser,
  deleteUser,
  getAllStaff,
  createStaff,
  updateStaff,
  updateStaffRole,
  lockStaff,
  unlockStaff,
  deleteStaff,
} from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// User management routes (admin only)
router.route("/users").get(protect, admin, getAllUsers);
router
  .route("/users/:id")
  .get(protect, admin, getUserById)
  .delete(protect, admin, deleteUser);
router.route("/users/:id/lock").put(protect, admin, lockUser);
router.route("/users/:id/unlock").put(protect, admin, unlockUser);

// Staff management routes (admin only)
router
  .route("/staff")
  .get(protect, admin, getAllStaff)
  .post(protect, admin, createStaff);
router
  .route("/staff/:id")
  .put(protect, admin, updateStaff)
  .delete(protect, admin, deleteStaff);
router.route("/staff/:id/role").put(protect, admin, updateStaffRole);
router.route("/staff/:id/lock").put(protect, admin, lockStaff);
router.route("/staff/:id/unlock").put(protect, admin, unlockStaff);

export default router;
