import { NavigatorScreenParams } from "@react-navigation/native";




export interface RootTabParamList {
  Messages: undefined;
  Notifications: undefined;
  HomeScreen: undefined;
  [key: string]: any
};
export type RootStackParamList = {
  SignIn: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList>; // Connect tabs to stack
  // Add other stack screens
};
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}