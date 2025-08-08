import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import * as Notifications from 'expo-notifications';
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";

import RootNavigator from "./navigations/root-navigator";
import { registerForPushNotifications } from "@/utils/registerForPushNotifications";
import { usePushTokenStore } from "./store/use-registerToken-store";
import { NavigationContainerRef } from "@react-navigation/native";
import { RootTabParamList } from "./navigations/type";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = "pk_test_Y2hhcm1pbmctcGFycm90LTk2LmNsZXJrLmFjY291bnRzLmRldiQ"
export default function App() {
  const navigationRef = useRef<NavigationContainerRef<RootTabParamList>>(null);
 
  
  useEffect(() => {
    // console.log(registerForPushNotifications())
    const register = async () => {
      try {
        const token = await registerForPushNotifications();
        if (token?.data) {

          usePushTokenStore.getState().setPushToken(token?.data)
        }
      } catch (error) {
        console.error("Error getting push token:", error);
      }
    };

    register();
    // schedulePushNotification();


    const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Background/quit notification tap handler
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification tapped:', data);
      if (data) {
        navigationRef.current?.navigate("Notifications");
       
      }
      
    });

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };

  }, [])
  // Configure notification handling
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });


  return (


    <ClerkProvider tokenCache={tokenCache} publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={queryClient}>
        <RootNavigator ref={navigationRef} />
        <StatusBar style="dark" />
      </QueryClientProvider>
    </ClerkProvider>

  );
}
