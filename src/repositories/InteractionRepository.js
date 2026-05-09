import Interaction from "../models/Interaction.js";

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
}

export default new InteractionRepository();
