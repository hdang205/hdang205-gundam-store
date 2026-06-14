import express from "express";
import {
  createContact,
  getContacts,
  replyToContact,
  resolveContact,
  getContactById,
} from "../controllers/contactController.js";
import { protect, staff } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(createContact).get(protect, staff, getContacts);
router.route("/:id").get(protect, staff, getContactById);
router.route("/:id/reply").put(protect, staff, replyToContact);
router.route("/:id/resolve").put(protect, staff, resolveContact);

export default router;
