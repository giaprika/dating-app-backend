import Interaction from "../models/Interaction.js";
import { Op } from "sequelize";

class InteractionRepository {
  async create(interactionData) {
    return await Interaction.create(interactionData);
  }

  async findByActorAndTarget(actorId, targetId) {
    return await Interaction.findOne({
      where: { actor_id: actorId, target_id: targetId },
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
}

export default new InteractionRepository();
