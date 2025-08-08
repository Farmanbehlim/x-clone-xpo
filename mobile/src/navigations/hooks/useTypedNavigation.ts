
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import {  RootTabParamList } from "../type";

export const useTypedNavigation = () => {
    return useNavigation<StackNavigationProp<RootTabParamList>>();
};