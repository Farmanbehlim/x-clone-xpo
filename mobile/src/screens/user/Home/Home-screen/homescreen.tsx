import { View, Text, ScrollView, FlatList, ActivityIndicator, Platform } from 'react-native'
import React, { memo, useCallback, useMemo, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Ionicons } from '@expo/vector-icons'
import PostComposer from '@/src/component/PostComposer'
import { useUserSync } from '@/src/hooks/useUserSync'
// import SignOutButton from '@/src/component/SignOutButton'

import { useCurrentUser } from '@/src/hooks/useCurrentUser'

import { usePosts } from '@/src/hooks/usePosts'

// import CommentsModal from '@/src/component/CommentsModel'
import { useAllPosts } from './hooks/useAllPosts'
import { PostItem, PostsResponse } from './types'
import { CommentsModal } from '@/src/component/CommentsModel'
import { PostCard } from '@/src/component/PostCard'
import { SignOutButton } from '@/src/component/SignOutButton'

// const MemoizedPostCard = memo(PostCard);
export const HomeScreen = () => {

    useUserSync()
    const { currentUser } = useCurrentUser();
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    
    
    const { error, refetch, toggleLike, deletePost, checkIsLiked, isDeletingPost } =
        usePosts();
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading
    } = useAllPosts();
    
    
    const posts = useMemo(() => {
        const postData = data?.pages.flatMap(page => page.posts) ?? []
        const seenIds = new Set();
        return postData?.filter((posts) => {
            if (seenIds?.has(posts?._id)) {
                return false
            }
            seenIds.add(posts?._id);
            return true;
        })
    }, [data])
    
    console.log(posts, 'p')
    //     const id = posts?.map((id) => id?._id)
    //   console.log(id)
    // console.log(data, 'hcbud')
    // console.log(posts, "hdbbdgsbygscyd")
    // const selectedPost = selectedPostId ? posts?.find((p: PostItem) => p?._id === selectedPostId) : null;
    // console.log(posts, 'jnndh')
    const selectedPost = selectedPostId
    ? posts.find((p: PostItem) => p._id === selectedPostId) || null
    : null;
    console.log(selectedPost,'selectedPostlll')

    // const handleComment = useCallback((postId: string) => {
    //     setSelectedPostId(postId);
    // }, []);
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
            <PostCard
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
        <SafeAreaView className="flex-1 bg-white">

            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
                <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                <Text >Home</Text>
                <SignOutButton />
            </View>

            <PostComposer />
            {/* <PostsList /> */}
            <FlatList data={posts}
                keyExtractor={(item) => item?._id?.toString()}
                onEndReachedThreshold={0.1}
                onEndReached={handleFetchNextPage}
                renderItem={renderItem}
                // initialNumToRender={10}          // Load only 10 items initially
                // maxToRenderPerBatch={5}          // Add 5 items per render batch
                // updateCellsBatchingPeriod={50}   // Batch updates every 50ms
                // windowSize={11}                  // Render 5 screens ahead/behind (5+1+5)
                removeClippedSubviews={Platform.OS === 'android'} // Clip offscreen view
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


    )
}

