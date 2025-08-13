import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApiClient, postApi } from "../api/api";
import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { interval } from "date-fns";
import { useCurrentUser } from "./useCurrentUser";

export const usePosts = (username?: string) => {
  // console.log(postId,'haha')
  const api = useApiClient();
  const queryClient = useQueryClient();
  const { currentUser } = useCurrentUser();
  const userId = currentUser?._id
  interface LikeButtonProps {
    postId: string;
    initialLiked: boolean;
    initialLikes: number;
    likesCount: number
  }
  const initialLiked = false;
  const initialLikes = 0;
  const [liked, setLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState<number>(initialLikes);

  const {
    data: postsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: username ? ["userPosts", username] : ["posts"],
    queryFn: () => (username ? postApi.getUserPosts(api, username) : postApi.getPosts(api)),
    select: (response) => response?.data?.posts,
  });

  

const likePostMutation = useMutation({
  mutationFn: (postId: string) => postApi.likePost(api, postId),
  onSuccess: (newlike: any, postId: string) => {
    queryClient.setQueryData(["AllUserPost"], (oldData: any) => {
      // if (!oldData) return oldData; // safety check

      const isLiked = newlike?.data?.like; // true if user just liked the post

      const updatedPages = oldData.pages?.map((page: any) => {
        const updatedPosts = page.posts?.map((post: any) => {
          if (post?._id === postId) {
            if (isLiked) {
              // ✅ Add like
              return {
                ...post,
                likes: [...(post.likes || []), userId]
              };
            } else {
              // ✅ Remove like
              const updatedLikes = (post.likes || []).filter(
                (id: string) => id !== userId
              );
              return {
                ...post,
                likes: updatedLikes
              };
            }
          }
          return post;
        });
        return { ...page, posts: updatedPosts };
      });

      return { ...oldData, pages: updatedPages };
    });


     queryClient.setQueryData(["AllMainUserPost",userId], (oldData: any) => {
      // if (!oldData) return oldData; // safety check

      const isLiked = newlike?.data?.like; // true if user just liked the post

      const updatedPages = oldData.pages?.map((page: any) => {
        const updatedPosts = page.posts?.map((post: any) => {
          if (post?._id === postId) {
            if (isLiked) {
              // ✅ Add like
              return {
                ...post,
                likes: [...(post.likes || []), userId]
              };
            } else {
              // ✅ Remove like
              const updatedLikes = (post.likes || []).filter(
                (id: string) => id !== userId
              );
              return {
                ...post,
                likes: updatedLikes
              };
            }
          }
          return post;
        });
        return { ...page, posts: updatedPosts };
      });

      return { ...oldData, pages: updatedPages };
    });
  },
});









  // const deletePostMutation = useMutation({
  //   mutationFn: (postId: string) => postApi.deletePost(api, postId),
  //   onSuccess: (_data, postId, _context) => {
  //     console.log(postId, 'dleted')
  //     queryClient.setQueryData(["AllUserPost"], (oldata: any) => {
  //       const postData = oldata?.pages?.map((page: any) => page?.posts)?.flat()

  //       console.log(oldata.pages.map((page: any) => page.posts).flat(), 'flat')
  //     })
  //     // queryClient.invalidateQueries({ queryKey: ["posts"] });
  //     // if (username) {
  //     //   queryClient.invalidateQueries({ queryKey: ["userPosts", username] });
  //     // }
  //   },
  // });
  const deletePostMutation = useMutation({
    mutationFn: (postId: string) => postApi.deletePost(api, postId),
    onSuccess: (_data, postId, _context) => {
      console.log(postId, 'deleted');

      queryClient.setQueryData(["AllUserPost"], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPages = oldData.pages.map((page: any) => {
          const filteredPosts = page.posts.filter((post: any) => post?._id !== postId);
          return {
            ...page,
            posts: filteredPosts,
          };
        });

        return {
          ...oldData,
          pages: updatedPages,
        };

      });
      queryClient.setQueryData(["AllMainUserPost", userId], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPages = oldData.pages.map((page: any) => {
          const filteredPosts = page.posts.filter((post: any) => post?._id !== postId);
          return {
            ...page,
            posts: filteredPosts,
          };
        });

        return {
          ...oldData,
          pages: updatedPages,
        };

      });

      
    },
  });

  const checkIsLiked = (postLikes: string[], currentUser: any) => {
    // console.log(currentUser,"hbcygv")
    // console.log(postLikes,'p')
    const isLiked = currentUser && postLikes.includes(currentUser);
    // console.log(isLiked)
    return isLiked;
  };

  return {
    posts: postsData || [],
    isLoading,
    error,
    refetch,
    toggleLike: (postId: string) => likePostMutation.mutate(postId),
    deletePost: (postId: string) => deletePostMutation.mutate(postId),
    isDeletingPost: deletePostMutation?.isPending,
    checkIsLiked,

  };
};