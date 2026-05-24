import User from "../models/User.js";
import UserPhoto from "../models/UserPhoto.js";
import UserPreference from "../models/UserPreference.js";

class UserRepository {
  async create(userData, transaction) {
    return await User.create(
      {
        email: userData.email,
        password_hash: userData.password_hash,
        full_name: userData.full_name,
        birth_date: userData.birth_date,
        gender: userData.gender,
        bio: userData.bio,
      },
      { transaction },
    );
  }

  async findById(id) {
    return await User.findByPk(id);
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findByEmailWithoutPassword(email) {
    return await User.findOne({ where: { email } });
  }

  async update(id, updateData) {
    const user = await User.findByPk(id);
    if (!user) return null;
    return await user.update(updateData);
  }

  async delete(id) {
    return await User.destroy({ where: { user_id: id } });
  }

  async findAll(query = {}, limit = 10, offset = 0) {
    return await User.findAll({
      where: query,
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }

  async countTotal(query = {}) {
    return await User.count({ where: query });
  }

  async emailExists(email) {
    return await User.findOne({ where: { email } });
  }

  async findCurrentUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: [
        "user_id",
        "email",
        "full_name",
        "birth_date",
        "gender",
        "bio",
        "default_mode",
        "created_at",
        "updated_at",
      ],

      include: [
        {
          model: UserPhoto,
          as: "photos",
          attributes: [
            "photo_id",
            "image_url",
            "is_primary",
            "display_order",
            "created_at",
          ],
          required: false,
          separate: true,
          order: [["display_order", "ASC"]],
        },

        {
          model: UserPreference,
          as: "preferences",
          required: false,
          attributes: [
            "preference_id",
            "target_gender",
            "min_age",
            "max_age",
            "max_distance_km",
            "anonymous_interests",
            "created_at",
            "updated_at",
          ],
        },
      ],
    });

    if (!user) {
      return null;
    }

    const plainUser = user.toJSON();

    return plainUser;
  }
}

export default new UserRepository();
