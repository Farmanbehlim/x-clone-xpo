// import { useClerk } from "@clerk/clerk-expo"
// import { Alert } from "react-native";
// export const useSignOut = () => {
//     const { signOut } = useClerk();
//     const handleSignOut = () => {
//         Alert.alert("Logout", "Are you sure you want to logout?", [
//             {
//                 text: "Cancel", style: "cancel"
//             },
//             {
//                 text: "Logout",
//                 style: "destructive",
//                 onPress: () => signOut(),
//             },
//         ])
//     }
//     return {handleSignOut};
// }



// hooks/useSignOut.ts
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
            // 1. Attempt to remove push token
            await removePushToken();
          } catch (error) {
            console.error("Push token removal error", error);
            // Proceed with logout even if token removal fails
          }

          // 2. Perform Clerk sign-out
          await signOut();
        },
      },
    ]);
  };

  return { handleSignOut };
};












