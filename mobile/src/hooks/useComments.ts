import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";
import { useApiClient, commentApi } from "../api/api";
import { useCurrentUser } from "./useCurrentUser";

export const useComments = (postId: string) => {

  const [commentText, setCommentText] = useState("");
  // console.log(commentText, 'yugtyd')
  const api = useApiClient();
  const { currentUser } = useCurrentUser();
  const userId = currentUser?._id;
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const response = await commentApi.createComment(api, postId, content);
      // console.log(response,'gvygvcygdvcygvdscfv')
      return response.data;
    },
    onSuccess: (newcomment) => {
      console.log(newcomment, 'newcomment')
      queryClient.setQueryData(["GetPostComments", postId], (oldData: any) => {
        if (!oldData) {
          return {
            pageParams: [1],
            pages: [{
              comments: [{
                ...newcomment?.comments
              }],
              pagination: [undefined]
            }]
          }
        }


        const firstPage = oldData?.pages[0];

        // console.log(firstPage, "firstPage")
        const updatedFirstPage = {
          ...firstPage,
          comments: [newcomment?.comments, ...firstPage?.comments]
        }

        console.log(updatedFirstPage, 'nunuuuu')
        return {
          ...oldData,
          pages: [updatedFirstPage, ...oldData.pages.slice(1)],
        };

      })



      queryClient.setQueryData(["AllUserPost"], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPages = oldData?.pages?.map((page: any) => {
          // Update posts within each page
          const updatedPosts = page?.posts?.map((post: any) => {
            if (post?._id === postId) {
              // Found the target post - update its comments
              return {
                ...post,
                comments: [
                  ...(post?.comments || []), // Existing comments
                  newcomment              // Add new comment
                ]
              };
            }
            return post; // Return unchanged posts
          });

          return { ...page, posts: updatedPosts };
        });

        return { ...oldData, pages: updatedPages };
      });

 

      queryClient.setQueryData(["AllMainUserPost", userId], (oldData: any) => {
        if (!oldData) return oldData;

        const updatedPages = oldData?.pages?.map((page: any) => {
          // Update posts within each page
          const updatedPosts = page?.posts?.map((post: any) => {
            if (post?._id === postId) {
              // Found the target post - update its comments
              return {
                ...post,
                comments: [
                  ...(post?.comments || []), // Existing comments
                  newcomment              // Add new comment
                ]
              };
            }
            return post; // Return unchanged posts
          });

          return { ...page, posts: updatedPosts };
        });

        return { ...oldData, pages: updatedPages };
      });
      setCommentText("");
      console.log("success");


    },
    onError: () => {
      Alert.alert("Error", "Failed to post comment. Try again.");
    },
  });

  const createComment = (postId: string) => {
    console.log(postId, "its graet")
    if (!commentText.trim()) {
      Alert.alert("Empty Comment", "Please write something before posting!");
      return;
    }

    createCommentMutation.mutate({ postId, content: commentText.trim() });
  };

  return {
    commentText,
    setCommentText,
    createComment,
    isCreatingComment: createCommentMutation.isPending,
  };
};