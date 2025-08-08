import express from "express";
import {
  followUser,
  getAllUser,
  getCurrentUser,
  getUserProfile,
  removePushToken,
  syncUser,
  updateProfile,
  updatePushToken,
} from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js"

const router = express.Router();

// public route
router.get("/profile/:username", getUserProfile);

// protected routes
router.post("/sync", protectRoute, syncUser);
router.get("/me", protectRoute, getCurrentUser);
router.get("/all-user-details", protectRoute, getAllUser);
router.put("/profile", protectRoute, updateProfile);
router.post("/follow/:targetUserId", protectRoute, followUser);
router.put('/push-token', protectRoute,updatePushToken);
router.post('/remove-push-token', protectRoute,removePushToken);
export default router; 