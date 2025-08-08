import asyncHandler from "express-async-handler";
import { getAuth } from "@clerk/express";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import { sendPushNotification } from "../utils/notification.js";

// export const getComments = asyncHandler(async (req, res) => {
//   const { postId } = req.params;

//   const comments = await Comment.find({ post: postId })
//     .sort({ createdAt: -1 })
//     .populate("user", "username firstName lastName profilePicture");

//   res.status(200).json({ comments });
// });

export const createComment = asyncHandler(async (req, res) => {
  console.log("comments created")
  const { userId } = getAuth(req);
  const { postId } = req.params;
  const { content } = req.body;

  if (!content || content.trim() === "") {
    return res.status(400).json({ error: "Comment content is required" });
  }

  const user = await User.findOne({ clerkId: userId }).select("user username firstName lastName profilePicture")
  const post = await Post.findById(postId);

  if (!user || !post) return res.status(404).json({ error: "User or post not found" });

  const comments = await Comment.create({
    user: user._id,
    post: postId,
    content,
    user
  });

  // link the comment to the post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comments._id },
  });

  // create notification if not commenting on own post
  if (post.user.toString() !== user._id.toString()) {
    await Notification.create({
      from: user._id,
      to: post.user,
      type: "comment",
      post: postId,
      comment: comments._id,
    });

    // Fetch recipient with push tokens
    const recipient = await User.findById(post.user).select('pushTokens username');

    if (recipient) {
      await sendPushNotification(
        recipient,
        "New Comment",
        `${user.username} commented: ${content.substring(0, 30)}${content.length > 30 ? '...' : ''}`,
        {
          type: "comment",
          postId,
          commentId: comments._id,
          userId: user._id
        }
      );
    }
  }
  console.log("comment created")

  res.status(201).json({ comments });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { commentId } = req.params;

  const user = await User.findOne({ clerkId: userId });
  const comment = await Comment.findById(commentId);

  if (!user || !comment) {
    return res.status(404).json({ error: "User or comment not found" });
  }

  if (comment.user.toString() !== user._id.toString()) {
    return res.status(403).json({ error: "You can only delete your own comments" });
  }

  // remove comment from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });

  // delete the comment
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({ message: "Comment deleted successfully" });
});






export const getComments = asyncHandler(async (req, res) => {
  const { postId, page = 1 } = req.query;
  console.log(postId, page)
  const COMMENT_PER_PAGE = 5;
  const pageNumber = page;
  // const page = parseInt(req.query.page) || 1;
  const limit = COMMENT_PER_PAGE;
  const skip = (pageNumber - 1) * COMMENT_PER_PAGE;

  // Validate post existence
  const post = await Post.find({ postId });
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  // Fetch comments with pagination and user population
  const comments = await Comment.find({ post: postId })
    .sort({ createdAt: -1 }) // Newest first

    .populate({
      path: "user",
      select: "username profilePicture firstName lastName" // Adjust fields as needed
    }).skip(skip)
    .limit(limit);

  // Count total comments for pagination info
  const totalComments = await Comment.countDocuments({ post: postId });
  const totalPages = Math.ceil(totalComments / limit);

  res.status(200).json({
    comments,
    pagination: {

      currentPage: pageNumber,
      totalPages: totalPages,
      totalComments,
      hasNextPage: pageNumber < totalPages,
      hasPreviousPage: pageNumber > 1
    }
  });
});