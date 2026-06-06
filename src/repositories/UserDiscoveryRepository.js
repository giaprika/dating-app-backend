import {
  User,
  UserPhoto,
  UserPreference,
  Interaction,
} from "../models/index.js";
import { Op } from "sequelize";

class UserDiscoveryRepository {
  async getAvailableUsers(currentUserId, options = {}) {
    const { limit = 10, offset = 0 } = options;

    // Get current user
    const currentUser = await User.findByPk(currentUserId, {
      attributes: ["gender"],
    });

    if (!currentUser) {
      throw new Error("Current user not found");
    }

    // Get interacted user ids
    const interactions = await Interaction.findAll({
      where: {
        actor_id: currentUserId,
      },
      attributes: ["target_id"],
    });

    const interactedUserIds = interactions.map(
      (interaction) => interaction.target_id,
    );

    const excludeUserIds = [currentUserId, ...interactedUserIds];

    const where = {
      user_id: {
        [Op.notIn]: excludeUserIds,
      },
    };

    // Opposite gender only
    if (currentUser.gender && currentUser.gender !== "other") {
      where.gender = {
        [Op.ne]: currentUser.gender,
      };
    }

    const result = await User.findAndCountAll({
      where,
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

    // Get current user's gender to validate request
    const currentUser = await User.findByPk(currentUserId, {
      attributes: ["gender"],
    });
    if (!currentUser) {
      throw new Error("Current user not found");
    }

    // Only allow querying opposite gender
    if (
      currentUser.gender &&
      currentUser.gender !== "other" &&
      currentUser.gender === targetGender
    ) {
      throw new Error("Cannot filter by your own gender");
    }

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

    // Get current user's gender to filter opposite gender only
    const currentUser = await User.findByPk(currentUserId, {
      attributes: ["gender"],
    });
    if (!currentUser) {
      throw new Error("Current user not found");
    }

    const where = {
      user_id: {
        [Op.notIn]: usersToExclude,
      },
    };

    // Filter by opposite gender (exclude same gender)
    if (currentUser.gender && currentUser.gender !== "other") {
      where.gender = {
        [Op.ne]: currentUser.gender,
      };
    }

    const result = await User.findAndCountAll({
      where,
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
