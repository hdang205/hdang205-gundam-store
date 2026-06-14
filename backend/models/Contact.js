import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["new", "replied", "resolved"],
      default: "new",
    },
    reply: { type: String },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const Contact = mongoose.model("Contact", contactSchema);
export default Contact;
