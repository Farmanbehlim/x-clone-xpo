
import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { StyleSheet, FlatList } from "react-native";
import { MainUserProfile } from "../../../../component/MainUserProfile"
import {
    View,
    ActivityIndicator,

} from "react-native";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useCallback, useMemo, useState } from "react";
import { PostItem } from "../../home/home-screen/types";
import { usePosts } from "@/src/hooks/usePosts";
import { PostCard } from "@/src/component/PostCard";
import { useAllPosts } from "../../home/home-screen/hooks/useAllPosts";
import { CommentsModal } from "@/src/component/CommentsModel";
import { MainUserPostscard } from "../ui/MainUserPostsCard";
import { useMainUserAllPost } from "../hooks/useMainUserAllPosts";
import { useMainUserPosts } from "../hooks/useMainUserPosts";

const ProfileScreens = () => {
    const { currentUser } = useCurrentUser();
    const { error, refetch, toggleLike, deletePost, checkIsLiked, isDeletingPost } =
        usePosts();
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading
    } = useMainUserAllPost();



    console.log(data, 'dasaraag')
    const posts = useMemo(() => {
        const postData = data?.pages?.flatMap(page => page?.posts) ?? []
        const seenIds = new Set();
        return postData?.filter((posts) => {
            if (seenIds?.has(posts?._id)) {
                return false
            }
            seenIds.add(posts?._id);
            return true;
        })
    }, [data]);
    console.log(posts, 'post')
    const selectedPost = selectedPostId
        ? posts?.find((p: PostItem) => p?._id === selectedPostId) || null
        : null;

    const handleFetchNextPage = useCallback(() => {
        if (hasNextPage) {
            // console.log(hasNextPage, "jhd")
            fetchNextPage();
        }
    }, [hasNextPage, fetchNextPage]);




    const renderItem = useCallback(({ item }: { item: PostItem }) => {
        const isLiked = checkIsLiked(item?.likes, currentUser?._id); // Pass user ID instead of full object c
        console.log("renderItem")
        return (
            <MainUserPostscard
                post={item} 
                onLike={toggleLike}
                onDelete={deletePost}
                onComment={() => setSelectedPostId(item?._id)}
                currentUser={currentUser} // Pass only needed ID
                isLiked={isLiked}
                isDeletingPost={isDeletingPost}
            />
        );
    }, [toggleLike, deletePost, currentUser, checkIsLiked]);

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>

            <FlatList data={posts}
                renderItem={renderItem}
                keyExtractor={item => item?._id?.toString()}
                onEndReachedThreshold={0.1}
                onEndReached={handleFetchNextPage}

                ListHeaderComponent={() => (
                    <View>
                        <MainUserProfile />
                    </View>
                )}
                ListFooterComponent={
                    isLoading || isFetchingNextPage ? (
                        <View className="py-4">
                            <ActivityIndicator />
                        </View>
                    ) : null
                }
            />

            <CommentsModal selectedPost={selectedPost} onClose={() => setSelectedPostId(null)} />
        </SafeAreaView>
    );
};

export default ProfileScreens;