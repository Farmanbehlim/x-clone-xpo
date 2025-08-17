
import React, { useState } from 'react'
import { 
  FlatList, 
  Text, 
  TextInput, 
  View, 
  Image, 
  ActivityIndicator, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  StatusBar 
} from 'react-native';
import { useInfiniteUsers } from './hooks/useSearchFollower';
import { useDebounce } from 'use-debounce';
import { Feather } from '@expo/vector-icons';

const SearchScreen = () => {
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 500); 
    const { 
        data,
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
        <SafeAreaView 
            className="flex-1 bg-white"
            style={{
                paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
            }}
        >
            {/* Search Header */}
            <View className="px-4 py-4 border-b border-gray-100">
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

            {/* Results List */}
            {isLoading ? (
                <View >
                    <ActivityIndicator size="large" />
                </View>
            ) : isError ? (
                <View >
                    <Text className="text-red-500">{(error as Error).message}</Text>
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <TouchableOpacity className="py-3 flex-row items-center border-b border-gray-100 px-5">
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
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={{paddingHorizontal:5}}
                    ListFooterComponent={
                        isFetchingNextPage ? (
                            <View className="py-4">
                                <ActivityIndicator size="small" />
                            </View>
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
}

export default SearchScreen;