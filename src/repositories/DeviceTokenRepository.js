import DeviceToken from "../models/DeviceToken.js";

class DeviceTokenRepository {
  async create(userId, deviceToken, deviceType) {
    return await DeviceToken.create({
      user_id: userId,
      device_token: deviceToken,
      device_type: deviceType,
      is_active: true,
    });
  }

  async findByToken(deviceToken) {
    return await DeviceToken.findOne({
      where: { device_token: deviceToken },
    });
  }

  async findActiveTokensByUserId(userId) {
    return await DeviceToken.findAll({
      where: {
        user_id: userId,
        is_active: true,
      },
    });
  }

  async updateLastUsed(deviceToken) {
    return await DeviceToken.update(
      { last_used_at: new Date() },
      { where: { device_token: deviceToken } },
    );
  }

  async deactivate(deviceToken) {
    return await DeviceToken.update(
      { is_active: false },
      { where: { device_token: deviceToken } },
    );
  }

  async deactivateAllUserTokens(userId) {
    return await DeviceToken.update(
      { is_active: false },
      { where: { user_id: userId } },
    );
  }

  async delete(deviceToken) {
    return await DeviceToken.destroy({
      where: { device_token: deviceToken },
    });
  }
}

export default new DeviceTokenRepository();
