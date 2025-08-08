import { useAuth } from '@clerk/clerk-expo';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { AuthNavigator } from './auth-navigator';

import { NavigationContainer } from './navigation-container';
import AuthNavigator from './auth-navigator';
import UserRootNavigator from './user-navigation/user-root-navigation';
import { usePushTokenStore } from '../store/use-registerToken-store';
import { forwardRef, useEffect, useRef } from 'react';
import { pushNotificationApi, useApiClient } from '../api/api';
import { NavigationContainerRef } from '@react-navigation/native';
import { RootTabParamList } from './type';
import { usePushNotification } from '../hooks/usePushNotification';
// import { UserRootNavigator } from './user-navigation/user-root-navigation';
const Stack = createNativeStackNavigator()


const Root = () => {
    const pushToken = usePushTokenStore((state) => state.pushToken);

    const { isLoaded, isSignedIn } = useAuth(); // Use Clerk's hook directly
    const { updateTokenInDb } = usePushNotification()
  
    //   const hideSplash = useCallback(async () => {
    //     await SplashScreen.hideAsync();
    //   }, []);
    
    // Handle back press logic...
    
    useEffect(() => {
        const sendToken = async () => {
            if (!pushToken) return; // ✅ Make sure token is not null
            try {
                // await pushNotificationApi.sendTokenToBackend(api, pushToken);
                await updateTokenInDb(pushToken)
            } catch (error) {
                console.error("❌ Failed to send push token:", error);
            }
        };

        sendToken();
    }, [pushToken,updateTokenInDb]);
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: false,
                animation: 'none',
            }}
        >
            <Stack.Group>
                {!isSignedIn ? (
                    <Stack.Screen name="AuthNavigator" component={AuthNavigator} />
                ) :
                    (
                        <Stack.Screen name="UserRootNavigator" component={UserRootNavigator} />
                    )
                }
                {/* <Stack.Screen name="AuthNavigator" component={AuthNavigator} /> */}
            </Stack.Group>
        </Stack.Navigator>
    );
};


const RootNavigator = forwardRef<NavigationContainerRef<RootTabParamList>>(
    (_, ref) => {
        return (
            <NavigationContainer ref={ref}>
                <Root />
            </NavigationContainer>
        );
    }
);

export default RootNavigator;