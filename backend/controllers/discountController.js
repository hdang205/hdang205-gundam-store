import DiscountCode from "../models/DiscountCode.js";

export const getDiscountCodes = async (req, res) => {
  const codes = await DiscountCode.find({});
  res.json(codes);
};

export const createDiscountCode = async (req, res) => {
  const code = new DiscountCode(req.body);
  const created = await code.save();
  res.status(201).json(created);
};

export const validateDiscountCode = async (req, res) => {
  const { code, orderValue } = req.body;
  const discount = await DiscountCode.findOne({ code, isActive: true });

  if (!discount) {
    return res
      .status(404)
      .json({ message: "Invalid or inactive discount code" });
  }

  const now = new Date();
  if (now < discount.startDate || now > discount.endDate) {
    return res
      .status(400)
      .json({ message: "Discount code is expired or not yet active" });
  }

  if (orderValue < discount.minOrderValue) {
    return res
      .status(400)
      .json({
        message: `Minimum order value of ${discount.minOrderValue} required`,
      });
  }

  if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
    return res
      .status(400)
      .json({ message: "Discount code usage limit reached" });
  }

  res.json(discount);
};
