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
    const preference = await this.findByUserId(userId);

    if (!preference) {
      return null;
    }

    return await preference.update(updateData);
  }

  async delete(userId) {
    return await UserPreference.destroy({
      where: { user_id: userId },
    });
  }
}

export default new UserPreferenceRepository();
