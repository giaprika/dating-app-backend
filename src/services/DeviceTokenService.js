import DeviceTokenRepository from "../repositories/DeviceTokenRepository.js";
import NotificationService from "./NotificationService.js";

class DeviceTokenService {
  async registerDevice(userId, deviceToken, deviceType) {
    const validTypes = ["ios", "android", "web"];
    if (!validTypes.includes(deviceType)) {
      throw new Error("Invalid device type");
    }

    const existingToken = await DeviceTokenRepository.findByToken(deviceToken);
    if (existingToken) {
      if (existingToken.user_id !== userId) {
        await DeviceTokenRepository.deactivate(deviceToken);
        await DeviceTokenRepository.delete(deviceToken);
      } else {
        await DeviceTokenRepository.updateLastUsed(deviceToken);
        return existingToken;
      }
    }

    return await DeviceTokenRepository.create(userId, deviceToken, deviceType);
  }

  async unregisterDevice(deviceToken) {
    return await DeviceTokenRepository.deactivate(deviceToken);
  }

  async unregisterAllDevices(userId) {
    return await DeviceTokenRepository.deactivateAllUserTokens(userId);
  }

  async getActiveDevices(userId) {
    return await DeviceTokenRepository.findActiveTokensByUserId(userId);
  }

  async sendNotificationToUser(userId, title, body, data = {}) {
    const devices = await this.getActiveDevices(userId);
    if (!devices || devices.length === 0) {
      console.log(`No active devices for user ${userId}`);
      return null;
    }

    const tokens = devices.map((d) => d.device_token);
    return await NotificationService.sendMulticastNotification(
      tokens,
      title,
      body,
      data,
    );
  }

  async sendNotificationToUsers(userIds, title, body, data = {}) {
    const results = [];
    for (const userId of userIds) {
      const result = await this.sendNotificationToUser(
        userId,
        title,
        body,
        data,
      );
      if (result) {
        results.push(result);
      }
    }
    return results;
  }
}

export default new DeviceTokenService();
