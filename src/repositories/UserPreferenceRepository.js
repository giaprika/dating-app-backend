import UserPreference from "../models/UserPreference.js";

class UserPreferenceRepository {
  async create(preferencesData) {
    return await UserPreference.create(preferencesData);
  }

  async findByUserId(userId) {
    return await UserPreference.findOne({
      where: { user_id: userId },
    });
  }

  async update(userId, updateData) {
    return await UserPreference.update(updateData, {
      where: { user_id: userId },
      returning: true,
    });
  }

  async delete(userId) {
    return await UserPreference.destroy({
      where: { user_id: userId },
    });
  }
}

export default new UserPreferenceRepository();
