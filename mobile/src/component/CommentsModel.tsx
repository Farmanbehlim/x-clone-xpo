import React from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useComments } from "../hooks/useComments";

import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  FlatList,
  ListRenderItem
} from "react-native";
import { PostItem } from "../screens/user/Home/Home-screen/types";
import { useCallback, useMemo } from "react";
import { useGetComments } from "../screens/user/Home/Home-screen/hooks/useGetComments";
import { Comment } from "../screens/user/Home/Home-screen/types/getcomment-type";


interface CommentsModalProps {
  selectedPost: PostItem | null;
  onClose: () => void;
}

export const CommentsModal = React.memo(({ selectedPost, onClose }: CommentsModalProps) => {
  console.log("rendering")
  const { currentUser } = useCurrentUser();

  const selectedPostId = useMemo(() => selectedPost?._id, [selectedPost?._id]);
  const { commentText, setCommentText, createComment, isCreatingComment } = useComments(selectedPostId as string);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, isLoading } = useGetComments(selectedPostId as string);

  const handleClose = () => {
    onClose();
    setCommentText("");
  };

  


  const commentData = useMemo(() => {
    const allComments = data?.pages?.flatMap(page => page?.comments || []) || [];
    const seenIds = new Set();

    return allComments.filter(comment => {
      if (seenIds.has(comment?._id)) {
        return false; // Skip duplicate
      }
      seenIds.add(comment?._id);
      return true; // Keep first occurrence
    });
  }, [data]);

  // console.log(commentData, 'ybyby')
  // const id = commentData?.map((id) => id?._id)
  // console.log(id)



  const handleFetchNextPage = useCallback(() => {
    if (hasNextPage) {
      console.log(hasNextPage, "jhd")
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage]);



  //render comments====
  const renderComments = useCallback<ListRenderItem<Comment>>(({ item }) => {
    // console.log(item, "item");
    return (
      <View className="border-b border-gray-100 bg-white p-4">
        <View className="flex-row">
          <Image
            source={{ uri: item?.user?.profilePicture }}
            className="w-10 h-10 rounded-full mr-3"
          />

          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="font-bold text-gray-900 mr-1">
                {item?.user?.firstName} {item?.user?.lastName}
              </Text>
              <Text className="text-gray-500 text-sm ml-1">@{item?.user?.username}</Text>
            </View>

            <Text className="text-gray-900 text-base leading-5 mb-2">
              {item?.content}
            </Text>
          </View>
        </View>
      </View>
    );
  }, []);



  return (
    <Modal visible={!!selectedPost} animationType="slide" presentationStyle="pageSheet">
      {/* MODAL HEADER */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={handleClose}>
          <Text className="text-blue-500 text-lg">Close</Text>
        </TouchableOpacity>
        <Text className="text-lg font-semibold">Comments</Text>
        <View className="w-12" />
      </View>

      {selectedPost && (
        <View className="flex-1">
          {/* ORIGINAL POST */}
          <View className="border-b border-gray-100 bg-white p-4">
            <View className="flex-row">
              <Image
                source={{ uri: selectedPost.user.profilePicture }}
                className="size-12 rounded-full mr-3"
              />

              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="font-bold text-gray-900 mr-1">
                    {selectedPost.user.firstName} {selectedPost.user.lastName}
                  </Text>
                  <Text className="text-gray-500 ml-1">@{selectedPost.user.username}</Text>
                </View>

                {selectedPost.content && (
                  <Text className="text-gray-900 text-base leading-5 mb-3">
                    {selectedPost.content}
                  </Text>
                )}

                {selectedPost.image && (
                  <Image
                    source={{ uri: selectedPost.image }}
                    className="w-full h-48 rounded-2xl mb-3"
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
          </View>


          <FlatList
            data={commentData ?? []}
            renderItem={renderComments as ListRenderItem<Comment>}
            keyExtractor={(item) => item?._id}
            onEndReachedThreshold={0.1}
            onEndReached={handleFetchNextPage}
            ListFooterComponent={
              isLoading || isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator />
                </View>
              ) : null
            }
          />


          {/* ADD COMMENT INPUT */}
          <View className="p-4 border-t border-gray-100">
            <View className="flex-row">
              <Image
                source={{ uri: currentUser?.profilePicture }}
                className="size-10 rounded-full mr-3"
              />

              <View className="flex-1">
                <TextInput
                  className="border border-gray-200 rounded-lg p-3 text-base mb-3"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <TouchableOpacity
                  className={`px-4 py-2 rounded-lg self-start ${commentText.trim() ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  onPress={() => createComment(selectedPostId as string)}
                  disabled={isCreatingComment || !commentText.trim()}
                >
                  {isCreatingComment ? (
                    <ActivityIndicator size={"small"} color={"white"} />
                  ) : (
                    <Text
                      className={`font-semibold ${commentText.trim() ? "text-white" : "text-gray-500"
                        }`}
                    >
                      Reply
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </Modal>
  );
});

// export default memo(CommentsModal);