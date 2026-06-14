import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: { type: String, enum: ["in", "out"], required: true },
    quantity: { type: Number, required: true },
    reason: { type: String },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema);
export default InventoryLog;
