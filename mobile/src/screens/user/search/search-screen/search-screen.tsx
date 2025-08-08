
import React, { useState } from 'react'
import { FlatList, Text, TextInput, View, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useInfiniteUsers } from './hooks/useSearchFollower';
import { useDebounce } from 'use-debounce';
import { Feather } from '@expo/vector-icons';

const SearchScreen = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500); 
    console.log(debouncedSearch)
    const { data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch,
    } = useInfiniteUsers(debouncedSearch);
    const users = data?.pages.flatMap(page => page.users) ?? [];
    return (
        <View className="flex-1 bg-white">
           
            <View className="px-4 py-7 border-b border-gray-100">
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
                    <Feather name="search" size={20} color="#657786" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search Twitter"
                        className="flex-1 ml-3 text-base"
                        placeholderTextColor="#657786"
                    />
                </View>
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" />
            ) : isError ? (
                <Text style={{ color: 'red' }}>{(error as Error).message}</Text>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        
                        <TouchableOpacity className="py-3 flex-row items-center border-b border-gray-100">
                            <Image
                                source={{ uri: item.profilePicture }}
                                className="w-12 h-12 rounded-full mr-3"
                            />
                            <View>
                                <Text className="font-bold text-base">{item.firstName}</Text>
                                <Text className="text-gray-500 text-base">{item.lastName}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    onEndReached={() => {
                        if (hasNextPage && !isFetchingNextPage) {
                            fetchNextPage();
                        }
                    }}
                    contentContainerStyle={{paddingHorizontal:20}}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                        isFetchingNextPage ? <ActivityIndicator size="small" /> : null
                    }
                />
            )}
        </View>
    );

}

export default SearchScreen