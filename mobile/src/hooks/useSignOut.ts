
import { useClerk } from "@clerk/clerk-expo";
import { Alert } from "react-native";
import { useNotifications } from "./useNotifications";
import { usePushNotification } from "./usePushNotification";



export const useSignOut = () => {
  const { signOut } = useClerk();
  const{ removePushToken}=usePushNotification()

  const handleSignOut = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
           
            // await removePushToken();
          } catch (error) {
            console.error("Push token removal error", error);
          }

          
          await signOut();
        },
      },
    ]);
  };

  return { handleSignOut };
};












