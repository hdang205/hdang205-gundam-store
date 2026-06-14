import express from "express";
import Order from "../models/Order.js";
import { protect, staff } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/revenue", protect, staff, async (req, res) => {
  const { period } = req.query; // daily, monthly, yearly
  let groupBy;

  if (period === "monthly") {
    groupBy = { $month: "$createdAt" };
  } else if (period === "yearly") {
    groupBy = { $year: "$createdAt" };
  } else {
    groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }

  const stats = await Order.aggregate([
    { $match: { status: "delivered" } },
    {
      $group: {
        _id: groupBy,
        totalRevenue: { $sum: "$totalPrice" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json(stats);
});

export default router;
