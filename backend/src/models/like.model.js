// models/Like.js
import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    post: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Post", 
      required: true 
    },
  },
  { timestamps: true }
);

// Ensure unique like per user-post combination
LikeSchema.index({ user: 1, post: 1 }, { unique: true });

export default mongoose.models?.Like || mongoose.model("Like", LikeSchema);