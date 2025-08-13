import asyncHandler from "express-async-handler";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Like from "../models/like.model.js";
import { getAuth } from "@clerk/express";
import cloudinary from "../config/cloudinary.js";
import likeCache from "../utils/nodecache.js";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";

import { sendPushNotification } from "../utils/notification.js";
import { redis, toggleLikeLua } from "../utils/redisClient.js";




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
    ).skip(skip).limit(POST_PER_PAGE);

  const totalPosts = await Post.countDocuments();
  if (!posts || posts.length === 0) {
    return res.status(404).json({
      error: "posts not found"
    })
  };
  const totalPages = Math.ceil(totalPosts / POST_PER_PAGE)
  console.log(totalPosts)

  if (!posts) return res.status(404).json({ error: "Post not found" });

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






// export const likePost = asyncHandler(async (req, res) => {
//   const { userId } = getAuth(req);
//   const { postId } = req.query;
//    console.log(postId,'kji') 
//   const user = await User.findOne({ clerkId: userId }).select("_id username").lean();
//   if (!user) return res.status(404).json({ error: "User not found" });

//   // 🔹 Check cache for current like state
//   const cacheKey = `${postId}:${user._id}`;
//   let cachedLikeState = likeCache.get(cacheKey);

//   if (cachedLikeState !== undefined) {
//     // User is toggling quickly → skip DB call, just toggle cache
//     cachedLikeState = !cachedLikeState;
//     likeCache.set(cacheKey, cachedLikeState);
//     res.status(200).json({ like: cachedLikeState });
//     return;
//   }

//   // 🔹 Query DB only if not cached
//   const likeResult = await Post.updateOne(
//     { _id: postId, likes: { $ne: user._id } }, // only add if not already liked
//     { $addToSet: { likes: user._id } }
//   );

//   let isLiked;
//   if (likeResult.modifiedCount > 0) {
//     isLiked = true; // Post was liked
//   } else {
//     await Post.updateOne(
//       { _id: postId },
//       { $pull: { likes: user._id } }
//     );
//     isLiked = false;
//   }

//   // 🔹 Store state in cache for faster subsequent toggles
//   likeCache.set(cacheKey, isLiked);

//   res.status(200).json({ like: isLiked });

//   // 🔹 Background notification if liked & not self-like
//   if (isLiked) { 
//     setImmediate(async () => {
//       try {
//         const post = await Post.findById(postId).select("user").lean();
//         if (post && post.user.toString() !== user._id.toString()) {
//           await Notification.create({
//             from: user._id,
//             to: post.user,
//             type: "like",
//             post: postId,
//           });

//           const recipient = await User.findById(post.user)
//             .select("pushTokens username")
//             .lean();

//           if (recipient) {
//             await sendPushNotification(
//               recipient,
//               "New Like",
//               `${user.username} liked your post`,
//               {
//                 type: "like",
//                 postId,
//                 userId: user._id,
//                 screen: "Notifications",
//               }
//             );
//           }
//         }
//       } catch (err) {
//         console.error("Notification error:", err);
//       }
//     });
//   }
// });




export const likePost = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { postId } = req.query; // ✅ Now from query instead of params

  if (!postId) {
    return res.status(400).json({ error: "postId query parameter is required" });
  }

  const user = await User.findOne({ clerkId: userId })
    .select("_id username")
    .lean();
  if (!user) return res.status(404).json({ error: "User not found" });

  const redisKey = `post:${postId}:likes`;

  // Run atomic toggle in Redis
  const isLiked = await redis.eval(toggleLikeLua, 1, redisKey, user._id.toString());

  res.status(200).json({ like: Boolean(isLiked) });

  // Background Mongo update + notification
  setImmediate(async () => {
    try {
      if (isLiked) {
        await Post.updateOne({ _id: postId }, { $addToSet: { likes: user._id } });
      } else {
        await Post.updateOne({ _id: postId }, { $pull: { likes: user._id } });
      }

      if (isLiked) {
        const post = await Post.findById(postId).select("user").lean();
        if (post && post.user.toString() !== user._id.toString()) {
          await Notification.create({
            from: user._id,
            to: post.user,
            type: "like",
            post: postId,
          });

          const recipient = await User.findById(post.user)
            .select("pushTokens username")
            .lean();

          if (recipient) {
            await sendPushNotification(
              recipient,
              "New Like",
              `${user.username} liked your post`,
              {
                type: "like",
                postId,
                userId: user._id,
                screen: "Notifications",
              }
            );
          }
        }
      }
    } catch (err) {
      console.error("Mongo write/notification error:", err);
    }
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




















// export const likePost = asyncHandler(async (req, res) => {
//   console.log("like")
//   const { userId } = getAuth(req);
//   const { postId } = req.params;

//   const user = await User.findOne({ clerkId: userId });
//   const post = await Post.findById(postId);

//   if (!user || !post) {
//     return res.status(404).json({ error: "User or post not found" });
//   }

//   // Check if like exists
//   const existingLike = await Like.findOne({
//     user: user._id,
//     post: postId
//   });
  

//   if (existingLike) {
//     // Unlike: Remove the like document
//     await Like.findByIdAndDelete(existingLike._id);

//   } else {
//     // Like: Create new like document
//     const newLike = await Like.create({
//       user: user._id,
//       post: postId
//     });

//     // Create notification if not liking own post
//     if (post.user.toString() !== user._id.toString()) {
//       await Notification.create({
//         from: user._id,
//         to: post.user,
//         type: "like",
//         post: postId,
//       });

//       const recipient = await User.findById(post.user).select('pushTokens username');
//       if (recipient) {
//         await sendPushNotification(
//           recipient,
//           "New Like",
//           `${user.username} liked your post`,
//           {
//             type: "like",
//             postId,
//             userId: user._id,
//             screen: "Notifications"
//           }
//         );
//       }
//     }
//   }
//   const likeCount = await Like.countDocuments({ post: postId });
//   await Post.findByIdAndUpdate(
//     postId,
//     { likeCount },
//     { new: true } // optional: returns the updated doc if needed
//   );

//   res.status(200).json({
//     like: !existingLike, // true if liked, false if unliked
//     likeCount
//   });
//   console.log(ex);
//   console.log(likeCount)
// });