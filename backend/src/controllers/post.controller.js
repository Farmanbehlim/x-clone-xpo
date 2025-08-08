import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";

import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";
import { sendPushNotification } from "../utils/notification.js";

export const getPosts = asyncHandler(async (req, res) => {

  const { page = 1 } = req.query;

  const POST_PER_PAGE = 5;
  const pageNumber = page;
  console.log(pageNumber, 'cjncj')
  //  const pageNumber = Math.max(1, parseInt(page)) || 1;
  const skip = (pageNumber - 1) * POST_PER_PAGE;
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    }).skip(skip).limit(POST_PER_PAGE);

  const totalPosts = await Post.countDocuments();
  if (!posts || posts.length === 0) {
    return res.status(404).json({
      error: "posts not found"
    })
  };
  const totalPages = Math.ceil(totalPosts / POST_PER_PAGE)
  console.log(totalPosts)
  res.status(200).json({
    posts,
    pagination: {
      totalPosts,
      totalPages: totalPages,
      currentPage: pageNumber,
      usersPerPage: POST_PER_PAGE,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1
    }
  });
});


export const getSingleUserAllPost = asyncHandler(async (req, res) => {
  console.log("single")
  const { user, page = 1 } = req.query;
  const POST_PER_PAGE = 5;
  const pageNumber = page;
  const skip = (pageNumber - 1) * POST_PER_PAGE;
  // console.log(user)
  const posts = await Post.find({ user })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    }
    ).skip(skip).limit(POST_PER_PAGE)
  const totalPosts = await Post.countDocuments();
  if (!posts || posts.length === 0) {
    return res.status(404).json({
      error: "posts not found"
    })
  };
  const totalPages = Math.ceil(totalPosts / POST_PER_PAGE)
  console.log(totalPosts)

  if (!posts) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ posts ,
     pagination: {
      totalPosts,
      totalPages: totalPages,
      currentPage: pageNumber,
      usersPerPage: POST_PER_PAGE,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1
    }});
// console.log(post)
}) 

export const getPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  if (!post) return res.status(404).json({ error: "Post not found" });

  res.status(200).json({ post });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const posts = await Post.find({ user: user._id })
    .sort({ createdAt: -1 })
    .populate("user", "username firstName lastName profilePicture")
    .populate({
      path: "comments",
      populate: {
        path: "user",
        select: "username firstName lastName profilePicture",
      },
    });

  res.status(200).json({ posts });
});

export const createPost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { content } = req.body;
  const imageFile = req.file;

  if (!content && !imageFile) {
    return res.status(400).json({ error: "Post must contain either text or image" });
  }

  const user = await User.findOne({ clerkId: userId }).select('user username firstName lastName profilePicture');
  if (!user) return res.status(404).json({ error: "User not found" });

  let imageUrl = "";

  // upload image to Cloudinary if provided
  if (imageFile) {
    try {
      // convert buffer to base64 for cloudinary
      const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString(
        "base64"
      )}`;

      const uploadResponse = await cloudinary.uploader.upload(base64Image, {
        folder: "social_media_posts",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" },
          { format: "auto" },
        ],
      });
      imageUrl = uploadResponse.secure_url;
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return res.status(400).json({ error: "Failed to upload image" });
    }
  }

  const post = await Post.create({
    user: user,
    content: content || "",
    image: imageUrl,
  });

  res.status(201).json({ post });
});

export const likePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post) return res.status(404).json({ error: "User or post not found" });

  const isLiked = post.likes.includes(user._id);
  console.log(isLiked, 'islike')
  if (isLiked) {
    // unlike
    await Post.findByIdAndUpdate(postId, {
      $pull: { likes: user._id },
    });
  } else if (!isLiked) {
    // like
    await Post.findByIdAndUpdate(postId, {
      $push: { likes: user._id },
    });

    // create notification if not liking own post
    if (post.user.toString() !== user._id.toString()) {
      await Notification.create({
        from: user._id,
        to: post.user,
        type: "like",
        post: postId,
      });
      // Fetch recipient with push tokens
      const recipient = await User.findById(post.user).select('pushTokens username');

      if (recipient) {
        await sendPushNotification(
          recipient,
          "New Like",
          `${user.username} liked your post`,
          {
            type: "like",
            postId,
            userId: user._id,
            screen: "Notifications"
          }
        );
      }
    }

  }

  console.log(isLiked)
  res.status(200).json({
    like: isLiked,
    // message: isLiked ? "Post unliked successfully" : "Post liked successfully",
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const post = await Post.findById(postId);

  if (!user || !post) return res.status(404).json({ error: "User or post not found" });

  if (post.user.toString() !== user._id.toString()) {
    return res.status(403).json({ error: "You can only delete your own posts" });
  }

  // delete all comments on this post
  await Comment.deleteMany({ post: postId });

  // delete the post
  await Post.findByIdAndDelete(postId);

  res.status(200).json({ message: "Post deleted successfully" });
});