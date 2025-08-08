import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useApiClient, postApi } from "../api/api";
import { useUser } from "@clerk/clerk-expo";
import { useState } from "react";
import { interval } from "date-fns";
import { useApiClient, postApi } from "@/src/api/api";

export const useMainUserPosts = (username?: string) => {
  const api = useApiClient();
  const queryClient = useQueryClient();
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
    onSuccess: (newlike: any) => {
      console.log(newlike?.data, 'newlike')
      // queryClient.invalidateQueries({ queryKey: ["posts"] });
      // if (username) {
      // queryClient.invalidateQueries({ queryKey: ["AllUserPost"] });
      // }
    },
  });



  //   const likePostMutation = useMutation({
  //   mutationFn: (postId: string) => postApi.likePost(api, postId),
  //   onSuccess: (updatedPost, postId) => {
  //     queryClient.setQueryData(["AllUserPost"], (oldData: any) => {
  //       // Handle non-paginated data (simple array)
  //       if (Array.isArray(oldData)) {
  //         return oldData.map(post => 
  //           post.id === updatedPost.id ? { ...post, ...updatedPost } : post
  //         );
  //       }

  //       // Handle paginated/infinite query data
  //       if (oldData?.pages) {
  //         return {
  //           ...oldData,
  //           pages: oldData.pages.map((page: any[]) =>
  //             page.map(post => 
  //               post.id === updatedPost?.id ? { ...post, ...updatedPost } : post
  //             )
  //           )
  //         };
  //       }

  //       return oldData; // Return unchanged if structure unrecognized
  //     });
  //   },
  // });





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

      queryClient.setQueryData(['AllMainUserPost'], (oldData: any) => {
        console.log(oldData,"oldadata")
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

      // Optionally still invalidate other queries
      // queryClient.invalidateQueries({ queryKey: ["posts"] });
      // if (username) {
      //   queryClient.invalidateQueries({ queryKey: ["userPosts", username] });
      // }
    },
  });

  const checkIsLiked = (postLikes: string[], currentUser: any) => {
    // console.log(currentUser,"hbcygv")
    const isLiked = currentUser && postLikes.includes(currentUser[0]?._id);
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
    isDeletingPost:deletePostMutation?.isPending,
    checkIsLiked,

  };
};