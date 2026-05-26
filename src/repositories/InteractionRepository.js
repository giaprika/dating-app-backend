import { Sequelize } from "sequelize";
import Interaction from "../models/Interaction.js";
import User from "../models/User.js";
import UserPhoto from "../models/UserPhoto.js";
import UserPreference from "../models/UserPreference.js";

class InteractionRepository {
  async create(interactionData) {
    return await Interaction.create(interactionData);
  }

  async upsert(actorId, targetId, actionType, interactionMode = "traditional") {
    const existingInteraction = await this.findByActorAndTarget(
      actorId,
      targetId,
    );
    if (existingInteraction) {
      return await existingInteraction.update({
        action_type: actionType,
        interaction_mode: interactionMode,
      });
    }

    return await Interaction.create({
      actor_id: actorId,
      target_id: targetId,
      action_type: actionType,
      interaction_mode: interactionMode,
    });
  }

  async findByActorAndTarget(actorId, targetId) {
    return await Interaction.findOne({
      where: { actor_id: actorId, target_id: targetId },
    });
  }

  async findById(interactionId) {
    return await Interaction.findByPk(interactionId);
  }

  async findLikesSent(actorId, limit = 10, offset = 0) {
    return await Interaction.findAll({
      where: {
        actor_id: actorId,
        action_type: "LIKE",
      },
      include: [
        {
          model: User,
          as: "target",
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
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }

  async findLikesReceived(targetId, limit = 10, offset = 0) {
    return await Interaction.findAll({
      where: {
        target_id: targetId,
        action_type: "LIKE",
      },
      include: [
        {
          model: User,
          as: "actor",
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
          // Include giống hệt file UserDiscoveryRepository
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
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }

  async findActorInteractions(actorId, limit = 10, offset = 0) {
    return await Interaction.findAll({
      where: { actor_id: actorId },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }

  async findReceivedInteractions(targetId, limit = 10, offset = 0) {
    return await Interaction.findAll({
      where: { target_id: targetId },
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });
  }

  async findLikes(actorId) {
    return await Interaction.findAll({
      where: {
        actor_id: actorId,
        action_type: "LIKE",
      },
    });
  }

  async countLikes(userId, mode = "traditional") {
    return await Interaction.count({
      where: {
        target_id: userId,
        action_type: "LIKE",
        interaction_mode: mode,
      },
    });
  }

  async findLikeInteraction(actorId, targetId) {
    return await Interaction.findOne({
      where: {
        actor_id: actorId,
        target_id: targetId,
        action_type: "LIKE",
      },
    });
  }
}

export default new InteractionRepository();
