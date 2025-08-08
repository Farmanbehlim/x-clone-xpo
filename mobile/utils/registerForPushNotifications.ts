
import * as Notifications from 'expo-notifications';

import * as Device from 'expo-device';
import { Platform } from 'react-native';
export const registerForPushNotifications = async () => {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status } = await Notifications.getPermissionsAsync();
        let finalStatus = status;

        if (status !== 'granted') {
            const { status: newStatus } = await Notifications.requestPermissionsAsync();
            finalStatus = newStatus;
        }

        if (finalStatus !== 'granted') {
            alert('Failed to get push token!');
            return;
        }

        const token = await Notifications.getExpoPushTokenAsync({
            projectId: "d605e2af-5b40-4e2d-8f3e-be700f1ab7af", // From app.json
        });
       
        // Send token to your backend
        return token;
    } else {
        alert('Must use a physical device for push notifications');
    }

}