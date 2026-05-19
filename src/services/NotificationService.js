import admin from "firebase-admin";
import { isFirebaseEnabled } from "../config/firebase.js";

class NotificationService {
  async sendPushNotification(deviceToken, title, body, data = {}) {
    if (!isFirebaseEnabled()) {
      console.log("Firebase not enabled. Notification not sent:", {
        title,
        body,
      });
      return null;
    }

    try {
      const message = {
        token: deviceToken,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: "high",
          notification: {
            sound: "default",
            clickAction: "OPEN_CHAT",
          },
        },
        apns: {
          headers: {
            "apns-priority": "10",
          },
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              sound: "default",
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      console.log("Push notification sent:", response);
      return response;
    } catch (error) {
      console.error("Failed to send push notification:", error.message);
      return null;
    }
  }

  async sendMulticastNotification(deviceTokens, title, body, data = {}) {
    if (!isFirebaseEnabled()) {
      console.log("Firebase not enabled. Multicast notification not sent:", {
        title,
        body,
        recipients: deviceTokens.length,
      });
      return null;
    }

    try {
      const message = {
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: "high",
          notification: {
            sound: "default",
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast({
        tokens: deviceTokens,
        ...message,
      });

      console.log(
        `Multicast notification sent to ${response.successCount} devices`,
      );
      return response;
    } catch (error) {
      console.error("Failed to send multicast notification:", error.message);
      return null;
    }
  }

  async subscribeToTopic(deviceToken, topic) {
    if (!isFirebaseEnabled()) {
      return null;
    }

    try {
      await admin.messaging().subscribeToTopic([deviceToken], topic);
      return true;
    } catch (error) {
      console.error(
        `Failed to subscribe ${deviceToken} to topic ${topic}:`,
        error.message,
      );
      return false;
    }
  }

  async unsubscribeFromTopic(deviceToken, topic) {
    if (!isFirebaseEnabled()) {
      return null;
    }

    try {
      await admin.messaging().unsubscribeFromTopic([deviceToken], topic);
      return true;
    } catch (error) {
      console.error(
        `Failed to unsubscribe ${deviceToken} from topic ${topic}:`,
        error.message,
      );
      return false;
    }
  }
}

export default new NotificationService();
