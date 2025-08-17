
// import { useCurrentUser } from "@/src/hooks/useCurrentUser";
// import { StyleSheet, FlatList } from "react-native";

// import {
//     View,
//     ActivityIndicator,

// } from "react-native";

// import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
// import { useCallback, useMemo, useState } from "react";
// import { PostItem } from "../../home/home-screen/types";
// import { usePosts } from "@/src/hooks/usePosts";
// import { PostCard } from "@/src/component/PostCard";
// import { useAllPosts } from "../../home/home-screen/hooks/useAllPosts";
// import { CommentsModal } from "@/src/component/CommentsModel";
// import { MainUserPostscard } from "../ui/MainUserPostsCard";
// import { useMainUserAllPost } from "../hooks/useMainUserAllPosts";
// import { useMainUserPosts } from "../hooks/useMainUserPosts";
// import { MainUserProfile } from "@/src/component/MainUserProfile";

// const ProfileScreens = () => {
//     const { currentUser } = useCurrentUser();
//     const { error, refetch, toggleLike, deletePost, checkIsLiked, isDeletingPost, deletingPostId } =
//         usePosts();
//     const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
//     const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading
//     } = useMainUserAllPost();



//     console.log(data, 'dasaraag')
//     const posts = useMemo(() => {
//         const postData = data?.pages?.flatMap(page => page?.posts) ?? []
//         const seenIds = new Set();
//         return postData?.filter((posts) => {
//             if (seenIds?.has(posts?._id)) {
//                 return false
//             }
//             seenIds.add(posts?._id);
//             return true;
//         })
//     }, [data]);
//     console.log(posts, 'post')
//     const selectedPost = selectedPostId
//         ? posts?.find((p: PostItem) => p?._id === selectedPostId) || null
//         : null;

//     const handleFetchNextPage = useCallback(() => {
//         if (hasNextPage) {
//             // console.log(hasNextPage, "jhd")
//             fetchNextPage();
//         }
//     }, [hasNextPage, fetchNextPage]);


//     // const renderHeader = useCallback(() => {
//     //     return (
//     //         // <View>
//     //         <>
//     //             <MainUserProfile />
//     //         </>

//     //     );
//     // }, []);
//     const headerComponent = useMemo(
//         () => <MainUserProfile currentUsers={currentUser}/>,
//         [currentUser,posts,isDeletingPost] // Only recreate when currentUser changes
//     );

//     const renderItem = useCallback(({ item }: { item: PostItem }) => {
//         const isLiked = checkIsLiked(item?.likes, currentUser?._id); // Pass user ID instead of full object c
//         console.log("renderItem")
//         return (
//             <MainUserPostscard
//                 post={item}
//                 onLike={toggleLike}
//                 onDelete={deletePost}
//                 onComment={() => setSelectedPostId(item?._id)}
//                 currentUser={currentUser} // Pass only needed ID
//                 isLiked={isLiked}
//                 isDeletingPost={isDeletingPost}
//                 deletingPostId={deletingPostId}
//             />
//         );
//     }, [toggleLike, deletePost, currentUser, checkIsLiked]);

//     return (
//         <SafeAreaView className="flex-1 bg-white" edges={["top"]}>

//             <FlatList data={posts}
//                 renderItem={renderItem}
//                 keyExtractor={item => item?._id?.toString()}
//                 onEndReachedThreshold={0.1}
//                 onEndReached={handleFetchNextPage}

//                 ListHeaderComponent={
//                     headerComponent
//                 }
//                 ListFooterComponent={
//                     isLoading || isFetchingNextPage ? (
//                         <View className="py-4">
//                             <ActivityIndicator />
//                         </View>
//                     ) : null
//                 }
//             />

//             <CommentsModal selectedPost={selectedPost} onClose={() => setSelectedPostId(null)} />
//         </SafeAreaView>
//     );
// };

// export default ProfileScreens;











































































import { useCurrentUser } from "@/src/hooks/useCurrentUser";
import { StyleSheet, FlatList, RefreshControl, Image, TouchableOpacity, Text } from "react-native";
import { View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useMemo, useState, useEffect } from "react";
import { PostItem } from "../../home/home-screen/types";
import { usePosts } from "@/src/hooks/usePosts";
import { useMainUserAllPost } from "../hooks/useMainUserAllPosts";
import { CommentsModal } from "@/src/component/CommentsModel";
import { MainUserPostscard } from "../ui/MainUserPostsCard";
import { Feather } from "@expo/vector-icons";

import { format } from "date-fns";
import { useLocation } from "@/src/hooks/useLocation";
import { useProfile } from "@/src/hooks/useProfile";
import { SignOutButton } from "@/src/component/SignOutButton";
import { EditProfileModal } from "@/src/component/EditProfileModal";


const ProfileScreens = () => {
    const { currentUser, isLoading: isUserLoading } = useCurrentUser();
    const { error, refetch, toggleLike, deletePost, checkIsLiked, isDeletingPost, deletingPostId } = usePosts();
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: isPostsLoading } = useMainUserAllPost();
    
    // Profile hooks integration
    const { getLocation, address } = useLocation();
    const {
        isEditModalVisible,
        openEditModal,
        closeEditModal,
        formData,
        saveProfile,
        updateFormField,
        isUpdating,
    } = useProfile();

    // Get location if user doesn't have one
    useEffect(() => {
        if (!currentUser?.location) {
            getLocation();
        }
    }, [currentUser?.location]);

    // Deduplicate posts
    const posts = useMemo(() => {
        const postData = data?.pages?.flatMap(page => page?.posts) ?? [];
        const seenIds = new Set();
        return postData.filter(post => {
            if (seenIds.has(post?._id)) return false;
            seenIds.add(post?._id);
            return true;
        });
    }, [data]);

    const selectedPost = selectedPostId
        ? posts?.find((p: PostItem) => p?._id === selectedPostId) || null
        : null;

    const handleFetchNextPage = useCallback(() => {
        hasNextPage && fetchNextPage();
    }, [hasNextPage, fetchNextPage]);

    const renderItem = useCallback(({ item }: { item: PostItem }) => {
        const isLiked = checkIsLiked(item?.likes, currentUser?._id);
        return (
            <MainUserPostscard
                post={item}
                onLike={toggleLike}
                onDelete={deletePost}
                onComment={() => setSelectedPostId(item?._id)}
                currentUser={currentUser}
                isLiked={isLiked}
                isDeletingPost={isDeletingPost}
                deletingPostId={deletingPostId}
            />
        );
    }, [toggleLike, deletePost, currentUser, checkIsLiked]);

    // Memoized profile header
    const renderHeader = useMemo(() => {
        if (isUserLoading) return <ActivityIndicator size="large" />;

        return (
            <View>
                {/* Header */}
                <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                    <View>
                        <Text className="text-xl font-bold text-gray-900">
                            {currentUser?.firstName} {currentUser?.lastName}
                        </Text>
                        <Text className="text-gray-500 text-sm">{posts.length} Posts</Text>
                    </View>
                    <SignOutButton />
                </View>

                {/* Profile Content */}
                <Image
                    source={{
                        uri: currentUser?.bannerImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
                    }}
                    className="w-full h-48"
                    resizeMode="cover"
                />

                <View className="px-4 pb-4 border-b border-gray-100">
                    <View className="flex-row justify-between items-end -mt-16 mb-4">
                        <Image
                            source={{ uri: currentUser?.profilePicture }}
                            className="w-32 h-32 rounded-full border-4 border-white"
                        />
                        <TouchableOpacity
                            className="border border-gray-300 px-6 py-2 rounded-full"
                            onPress={openEditModal}
                        >
                            <Text className="font-semibold text-gray-900">Edit profile</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="mb-4">
                        <View className="flex-row items-center mb-1">
                            <Text className="text-xl font-bold text-gray-900 mr-1">
                                {currentUser?.firstName} {currentUser?.lastName}
                            </Text>
                            <Feather name="check-circle" size={20} color="#1DA1F2" />
                        </View>
                        <Text className="text-gray-500 mb-2">@{currentUser?.username}</Text>
                        <Text className="text-gray-900 mb-3">{currentUser?.bio}</Text>

                        <View className="flex-row items-center mb-2">
                            <Feather name="map-pin" size={16} color="#657786" />
                            <Text className="text-gray-500 ml-2">
                                {address || currentUser?.location || "No location"}
                            </Text>
                        </View>

                        <View className="flex-row items-center mb-3">
                            <Feather name="calendar" size={16} color="#657786" />
                            <Text className="text-gray-500 ml-2">
                                {currentUser?.createdAt ? format(new Date(currentUser.createdAt), "MMMM yyyy") : "Unknown"}
                            </Text>
                        </View>

                        <View className="flex-row">
                            <TouchableOpacity className="mr-6">
                                <Text className="text-gray-900">
                                    <Text className="font-bold">{currentUser?.following?.length || 0}</Text>
                                    <Text className="text-gray-500"> Following</Text>
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text className="text-gray-900">
                                    <Text className="font-bold">{currentUser?.followers?.length || 0}</Text>
                                    <Text className="text-gray-500"> Followers</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }, [currentUser, isUserLoading, posts.length, address]);

    if (isUserLoading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
            <FlatList
                data={posts}
                renderItem={renderItem}
                keyExtractor={item => item?._id?.toString()}
                onEndReachedThreshold={0.1}
                onEndReached={handleFetchNextPage}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={
                    isPostsLoading || isFetchingNextPage ? (
                        <View className="py-4">
                            <ActivityIndicator />
                        </View>
                    ) : null
                }
                refreshControl={
                    <RefreshControl
                        refreshing={isPostsLoading}
                        onRefresh={() => {
                            // Add refresh logic if needed
                        }}
                    />
                }
            />

            <CommentsModal selectedPost={selectedPost} onClose={() => setSelectedPostId(null)} />
            
            <EditProfileModal
                isVisible={isEditModalVisible}
                onClose={closeEditModal}
                formData={formData}
                saveProfile={saveProfile}
                updateFormField={updateFormField}
                isUpdating={isUpdating}
            />
        </SafeAreaView>
    );
};

export default ProfileScreens;