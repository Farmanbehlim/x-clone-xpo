// import { useSignOut } from "@/hooks/useSignOut";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useSignOut } from "../hooks/useSignOut";
import React from "react";
export const SignOutButton = React.memo(() => {
  const { handleSignOut } = useSignOut();
  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Feather name="log-out" size={24} color={"#E0245E"} />
    </TouchableOpacity>
  );
});
