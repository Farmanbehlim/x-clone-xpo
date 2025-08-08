import { Expo } from 'expo-server-sdk';

const expo = new Expo();

export const sendPushNotification = async (targetUser, title, body, data) => {
  try {
    if (!targetUser.pushTokens || targetUser.pushTokens.length === 0) return;

    const messages = [];
    for (const { token } of targetUser.pushTokens) {
      if (!Expo.isExpoPushToken(token)) {
        console.error(`Invalid token: ${token}`);
        continue;
      }

      messages.push({
        to: token,
        sound: 'default',
        title,
        body,
        data,
      });
    }

    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};