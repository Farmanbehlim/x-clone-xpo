import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';


import GoogleSignInScreen from '../screens/auth/google-sighn-in/google-sign-in';



const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        // animation: 'slide_from_right',
        headerShown: false,
      }}
      initialRouteName="GoogleSignInScreen"
    >
      <Stack.Screen name="GoogleSignInScreen" component={GoogleSignInScreen} />
      
    </Stack.Navigator>
  );
};

export default AuthNavigator
