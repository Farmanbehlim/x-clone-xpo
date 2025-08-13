import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
// import {HomeScreen} from '@/src/screens/user/home/home-screen/home-screen';
import NotificationsScreen from '@/src/screens/user/notifications/notifications';
// import ProfileScreens from '@/src/screens/user/profile/Profile-screen/profile';
import SearchScreen from '@/src/screens/user/search/search-screen/search-screen';
import {  RootTabParamList } from '../type';
import ProfileScreens from '@/src/screens/user/profile/profile-screen/profile';
import { HomeScreen } from '@/src/screens/user/home/home-screen/homescreen';

// Create placeholder screens (replace with your actual components)

// const ProfileScreens = () => (
//   <View><Text>profilescreen</Text></View>
// );
const MessagesScreen = () => (
  <View><Text>upcoming soon</Text></View>
);

const Tab = createBottomTabNavigator<RootTabParamList>();
export const UserRootNavigator = () => {
  type TabBarIconProps = {
    color: string;
    size: number;
  };
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#1DA1F2',
        tabBarInactiveTintColor: '#657786',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E1E8ED',
          height: 50 + insets.bottom,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Feather name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Feather name="bell" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Feather name="mail" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreens}
        options={{
          tabBarIcon: ({ color, size }: TabBarIconProps) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};



