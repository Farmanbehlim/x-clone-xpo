import { useTypedNavigation } from "@/src/navigations/hooks/useTypedNavigation";
import { useAuth, useSSO } from "@clerk/clerk-expo";
import { CommonActions } from "@react-navigation/native";



import { useState } from "react";
import { Alert } from "react-native";

export const useSocialAuth = () => {
  // navigation: StackNavigationProp<RootTabParamList>
  const [isLoadingG, setIsLoadingG] = useState(false);
  const [isLoadingA, setIsLoadingA] = useState(false);
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const navigation = useTypedNavigation()
  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    if (strategy === "oauth_google") {
      setIsLoadingG(true);
    } else if (strategy === "oauth_apple") {
      setIsLoadingA(true)
    }

    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{
              name: "MainTabs",
              params: { screen: "HomeScreen" } // Open HomeScreen tab by default
            }],
          })
        );
      }
    } catch (err) {

      console.error("SSO Error:", JSON.stringify(err))
      const provider = strategy === "oauth_google" ? "Google" : "Apple";
      Alert.alert("Error", `Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoadingG(false);
      setIsLoadingA(false);
    }
  };

  return { isLoadingG, isLoadingA, handleSocialAuth };
};