import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'

import { useProfile } from "../hooks/useProfile"
import { usePosts } from "../hooks/usePosts"
import { useLocation } from "../hooks/useLocation"
import { useCurrentUser } from "../hooks/useCurrentUser"
import { format } from "date-fns";
import { SignOutButton } from "./SignOutButton"
import { Feather } from "@expo/vector-icons";
import { EditProfileModal } from './EditProfileModal'
import { Post, User } from '../types'

interface Props {
  currentUsers: User; // Passed from parent
  post:Post
} 
export const MainUserProfile = React.memo(({currentUsers,post}:Props) => {
    const { currentUser, isLoading } = useCurrentUser();
    console.log("th")
    const { getLocation, address, errorMsg } = useLocation()
    const {
        posts: userPosts,
        refetch: refetchPosts,
        // isLoading: isRefetching,
    } = usePosts(currentUser?.username);

    const {
        isEditModalVisible,
        openEditModal,
        closeEditModal,
        formData,
        saveProfile,
        updateFormField,
        isUpdating,
        refetch: refetchProfile,
    } = useProfile();

    if (isLoading) {
        return (
            <View></View>
        );
    }

    
    return (
        <View >

            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                <View>
                    <Text className="text-xl font-bold text-gray-900">
                        {currentUser?.firstName} {currentUser?.lastName}
                    </Text>
                    <Text className="text-gray-500 text-sm">{userPosts.length} Posts</Text>
                </View>
                <SignOutButton />
            </View>

            <View
                className="flex-1"


            // refreshControl={
            //     <RefreshControl
            //         refreshing={isRefetching}
            //         onRefresh={() => {
            //             refetchProfile();
            //             refetchPosts();
            //         }}
            //         tintColor="#1DA1F2"
            //     />
            // }
            >
                <Image
                    source={{
                        uri:
                            currentUser?.bannerImage ||
                            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
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
                                {currentUser.firstName} {currentUser.lastName}
                            </Text>
                            <Feather name="check-circle" size={20} color="#1DA1F2" />
                        </View>
                        <Text className="text-gray-500 mb-2">@{currentUser.username}</Text>
                        <Text className="text-gray-900 mb-3">{currentUser.bio}</Text>

                        <View className="flex-row items-center mb-2">
                            <TouchableOpacity onPress={getLocation}>

                                <Feather name="map-pin" size={16} color="#657786" />
                            </TouchableOpacity>
                            <Text className="text-gray-500 ml-2">{address ? address : currentUser?.location ? currentUser?.location : ""}</Text>
                        </View>

                        <View className="flex-row items-center mb-3">
                            <Feather name="calendar" size={16} color="#657786" />
                            <Text className="text-gray-500 ml-2">

                                {currentUser?.createdAt ? format(new Date(currentUser?.createdAt), "MMMM yyyy") : "Unknown"}
                            </Text>
                        </View>

                        <View className="flex-row">
                            <TouchableOpacity className="mr-6">
                                <Text className="text-gray-900">
                                    <Text className="font-bold">{currentUser.following?.length}</Text>
                                    <Text className="text-gray-500"> Following</Text>
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Text className="text-gray-900">
                                    <Text className="font-bold">{currentUser.followers?.length}</Text>
                                    <Text className="text-gray-500"> Followers</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* <PostsList username={currentUser?.username} /> */}
            </View>

            <EditProfileModal
                isVisible={isEditModalVisible}
                onClose={closeEditModal}
                formData={formData}
                saveProfile={saveProfile}
                updateFormField={updateFormField}
                isUpdating={isUpdating}
            />
        </View>
    )
})



