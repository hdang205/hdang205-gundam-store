import Order from "../models/Order.js";

export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      discountAmount,
      totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    } else {
      const order = new Order({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        discountAmount,
        totalPrice,
      });

      const createdOrder = await order.save();
      res.status(201).json(createdOrder);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (order) {
    // Staff/admin can see any order, users can only see their own
    if (
      req.user.role !== "staff" &&
      req.user.role !== "admin" &&
      order.user?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    res.json(order);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404).json({ message: "Order not found" });
  }
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
};

export const getAllOrders = async (req, res) => {
  const orders = await Order.find({}).populate("user", "id name");
  res.json(orders);
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if user owns the order or is staff/admin
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to cancel this order" });
    }

    // Only allow cancellation for pending orders
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot cancel order. Order is already processed." });
    }

    order.status = "cancelled";
    const updatedOrder = await order.save();

    res.json({ message: "Order cancelled successfully", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phoneNumber address",
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Staff can access any invoice, users can only access their own
    if (
      req.user.role !== "staff" &&
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this invoice" });
    }

    // Return invoice data
    const invoiceData = {
      orderId: order._id,
      orderDate: order.createdAt,
      customer: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phoneNumber || order.shippingAddress.phone,
        address: order.shippingAddress,
      },
      items: order.items,
      paymentMethod: order.paymentMethod,
      discountAmount: order.discountAmount,
      totalPrice: order.totalPrice,
      status: order.status,
      paymentStatus: order.paymentStatus,
    };

    res.json(invoiceData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
