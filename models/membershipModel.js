import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: false },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  type: { type: String, default: 'membership' },
  consent: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

const membershipModel = mongoose.model("memberships", membershipSchema, "messages"); // Ensure "messages" is intentional

export default membershipModel;
