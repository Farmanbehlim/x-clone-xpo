// import { NavigationContainer as RNNavigationContainer } from '@react-navigation/native';
// import * as React from 'react';
// import { SafeAreaProvider } from 'react-native-safe-area-context';



// export const NavigationContainer = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {

//   return (
//     <SafeAreaProvider>
//       <RNNavigationContainer>{children}</RNNavigationContainer>
//     </SafeAreaProvider>
//   );
// };


import { NavigationContainer as RNNavigationContainer, NavigationContainerProps } from '@react-navigation/native';
import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Define the ref type
// type NavigationContainerRef = React.Ref<React.ElementRef<typeof RNNavigationContainer>>;

export const NavigationContainer = React.forwardRef<
  React.ElementRef<typeof RNNavigationContainer>,
  NavigationContainerProps & { children: React.ReactNode }
>((props, ref) => {
  return (
    <SafeAreaProvider>
      <RNNavigationContainer ref={ref} {...props}>
        {props.children}
      </RNNavigationContainer>
    </SafeAreaProvider>
  );
});