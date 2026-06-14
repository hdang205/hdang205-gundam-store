import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    badge: { type: String },
    oldPrice: { type: Number },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    brand: { type: String, default: "Bandai" },
    scale: { type: String },
    image: { type: String, required: true },
    gallery: [{ type: String }],
    specs: { type: Map, of: String },
    description: { type: String },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: { type: String },
        rating: { type: Number, required: true },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now },
        isApproved: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
