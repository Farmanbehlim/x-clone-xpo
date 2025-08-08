import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import { getAuth } from "@clerk/express";
import { clerkClient } from "@clerk/express";
import { error } from "console";

export const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});


export const updateProfile = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const user = await User.findOneAndUpdate({ clerkId: userId }, req.body, { new: true });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.status(200).json({ user });
});


export const syncUser = asyncHandler(async (req, res) => {
  console.log("userData")
  const { userId } = getAuth(req);
  console.log(userId)
  // check if user already exists in mongodb
  const existingUser = await User.findOne({ clerkId: userId });
  if (existingUser) {
    return res.status(200).json({ user: existingUser, message: "User already exists" });
  }

  // create new user from Clerk data
  const clerkUser = await clerkClient.users.getUser(userId);

  const userData = {
    clerkId: userId,
    email: clerkUser.emailAddresses[0].emailAddress,
    firstName: clerkUser.firstName || "dydgyg",
    lastName: clerkUser.lastName || "uydggd",
    username: clerkUser.emailAddresses[0].emailAddress.split("@")[0],
    profilePicture: clerkUser.imageUrl || "",
  };

  const user = await User.create(userData);
  res.status(201).json({ user, message: "User created successfully" });
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  // console.log(userId, "ygydgtytve")

  const user = await User.findOne({ clerkId: userId });

  if (!user) return res.status(404).json({ error: "User not found" });
 
  return res.status(200).json({ user });
});

export const getAllUser = asyncHandler(async (req, res) => {
  console.log("searcbhjn")
  const { search, page = 1 } = req.query;
  const USERS_PER_PAGE = 10;
  const pageNumber = page || 1;

  console.log(search,'n')
  //calculate documents to skip
  const skip = (pageNumber - 1) * USERS_PER_PAGE;
  const searchQuery = search ? {
    $or: [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ] 
  } : {} 

  //Get the total counts of matching users
  const totalUsers = await User.countDocuments(searchQuery)
  const users = await User.find(searchQuery).select('-pushTokens').skip(skip).limit(USERS_PER_PAGE);
  console.log(users,'hbyb');
  if (!users || users.length === 0) {
    return res.status(404).json({ error: "All user details not found" });
  }
  //calculate total Page
  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
  return res.status(200).json({
    users,
    pagination: {
      totalUsers,
      totalPages,
      currentPage: pageNumber,
      usersPerPage: USERS_PER_PAGE,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1
    }
  })
})


export const followUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { targetUserId } = req.params;

  if (userId === targetUserId) return res.status(400).json({ error: "You cannot follow yourself" });

  const currentUser = await User.findOne({ clerkId: userId });
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser) return res.status(404).json({ error: "User not found" });

  const isFollowing = currentUser.following.includes(targetUserId);

  if (isFollowing) {
    // unfollow
    await User.findByIdAndUpdate(currentUser._id, {
      $pull: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $pull: { followers: currentUser._id },
    });
  } else {
    // follow
    await User.findByIdAndUpdate(currentUser._id, {
      $push: { following: targetUserId },
    });
    await User.findByIdAndUpdate(targetUserId, {
      $push: { followers: currentUser._id },
    });

    // create notification
    await Notification.create({
      from: currentUser._id,
      to: targetUserId,
      type: "follow",
    });
  }

  res.status(200).json({
    message: isFollowing ? "User unfollowed successfully" : "User followed successfully",
  });
});

export const updatePushToken = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // Prevent duplicate tokens
  if (!user.pushTokens.some(t => t.token === token)) {
    user.pushTokens.push({
      token,
      platform: req.body.platform || 'mobile'
    });
    await user.save();
  }

  res.status(200).json({ message: "Token updated" });
});




export const removePushToken = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  console.log("pushToken")
  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    return res.status(404).json({
      error: "User not found"
    });
  }
  user.pushTokens = [];
  await user.save();
  return res.status(200).json({ message: "All push token removed" })
})