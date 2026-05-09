import { User, UserPhoto, UserPreference } from "../models/index.js";
import { Op } from "sequelize";

class UserDiscoveryRepository {
  async getAvailableUsers(currentUserId, options = {}) {
    const { limit = 10, offset = 0 } = options;

    const result = await User.findAndCountAll({
      where: {
        user_id: {
          [Op.ne]: currentUserId,
        },
      },
      include: [
        {
          model: UserPreference,
          as: "preferences",
          attributes: [
            "preference_id",
            "target_gender",
            "min_age",
            "max_age",
            "max_distance_km",
            "anonymous_interests",
          ],
        },
        {
          model: UserPhoto,
          as: "photos",
          where: { is_primary: true },
          attributes: ["photo_id", "image_url", "is_primary"],
          required: false,
        },
      ],
      attributes: [
        "user_id",
        "email",
        "full_name",
        "birth_date",
        "gender",
        "bio",
        "default_mode",
        "created_at",
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
      subQuery: false,
      distinct: true,
    });

    return {
      users: result.rows,
      total: result.count,
      limit,
      offset,
    };
  }

  async getUserWithDetails(userId) {
    return await User.findByPk(userId, {
      include: [
        {
          model: UserPreference,
          as: "preferences",
          attributes: [
            "preference_id",
            "target_gender",
            "min_age",
            "max_age",
            "max_distance_km",
            "anonymous_interests",
          ],
        },
        {
          model: UserPhoto,
          as: "photos",
          where: { is_primary: true },
          attributes: ["photo_id", "image_url", "is_primary"],
          required: false,
        },
      ],
      attributes: [
        "user_id",
        "email",
        "full_name",
        "birth_date",
        "gender",
        "bio",
        "default_mode",
        "created_at",
      ],
    });
  }

  async getUsersByGender(currentUserId, targetGender, options = {}) {
    const { limit = 10, offset = 0 } = options;

    const result = await User.findAndCountAll({
      where: {
        user_id: { [Op.ne]: currentUserId },
        gender: targetGender,
      },
      include: [
        {
          model: UserPreference,
          as: "preferences",
          attributes: [
            "preference_id",
            "target_gender",
            "min_age",
            "max_age",
            "max_distance_km",
            "anonymous_interests",
          ],
        },
        {
          model: UserPhoto,
          as: "photos",
          where: { is_primary: true },
          attributes: ["photo_id", "image_url", "is_primary"],
          required: false,
        },
      ],
      attributes: [
        "user_id",
        "email",
        "full_name",
        "birth_date",
        "gender",
        "bio",
        "default_mode",
        "created_at",
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
      subQuery: false,
      distinct: true,
    });

    return {
      users: result.rows,
      total: result.count,
      limit,
      offset,
    };
  }

  async getUsersExcludingInteracted(
    currentUserId,
    excludeUserIds = [],
    options = {},
  ) {
    const { limit = 10, offset = 0 } = options;
    const usersToExclude = [currentUserId, ...excludeUserIds];

    const result = await User.findAndCountAll({
      where: {
        user_id: {
          [Op.notIn]: usersToExclude,
        },
      },
      include: [
        {
          model: UserPreference,
          as: "preferences",
          attributes: [
            "preference_id",
            "target_gender",
            "min_age",
            "max_age",
            "max_distance_km",
            "anonymous_interests",
          ],
        },
        {
          model: UserPhoto,
          as: "photos",
          where: { is_primary: true },
          attributes: ["photo_id", "image_url", "is_primary"],
          required: false,
        },
      ],
      attributes: [
        "user_id",
        "email",
        "full_name",
        "birth_date",
        "gender",
        "bio",
        "default_mode",
        "created_at",
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
      subQuery: false,
      distinct: true,
    });

    return {
      users: result.rows,
      total: result.count,
      limit,
      offset,
    };
  }
}

export default new UserDiscoveryRepository();
