import InteractionRepository from "../repositories/InteractionRepository.js";
import MatchRepository from "../repositories/MatchRepository.js";

const VALID_ACTION_TYPES = ["LIKE", "PASS"];
const VALID_INTERACTION_MODES = ["traditional", "anonymous"];

class InteractionService {
  async requestInteraction(
    actorId,
    targetId,
    actionType = "LIKE",
    interactionMode = "traditional",
  ) {
    if (actorId === targetId) {
      throw new Error("Cannot interact with yourself");
    }

    actionType = actionType?.toUpperCase?.() || "LIKE";
    interactionMode = interactionMode || "traditional";

    if (!VALID_ACTION_TYPES.includes(actionType)) {
      throw new Error("Invalid action type");
    }

    if (!VALID_INTERACTION_MODES.includes(interactionMode)) {
      throw new Error("Invalid interaction mode");
    }

    const interaction = await InteractionRepository.upsert(
      actorId,
      targetId,
      actionType,
      interactionMode,
    );

    const reverseInteraction = await InteractionRepository.findByActorAndTarget(
      targetId,
      actorId,
    );

    const [user1Id, user2Id] =
      actorId < targetId ? [actorId, targetId] : [targetId, actorId];

    let match = null;
    if (actionType === "LIKE" && reverseInteraction?.action_type === "LIKE") {
      match = await this._createOrActivateMatch(
        user1Id,
        user2Id,
        interactionMode,
      );
    }

    if (actionType === "PASS") {
      const existingMatch = await MatchRepository.findByUsers(user1Id, user2Id);
      if (existingMatch?.is_active) {
        match = await MatchRepository.deactivate(existingMatch.match_id);
      }
    }

    return { interaction, match };
  }

  async acceptInteraction(
    interactionId,
    currentUserId,
    interactionMode = "traditional",
  ) {
    const interaction = await InteractionRepository.findById(interactionId);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    if (interaction.target_id !== currentUserId) {
      throw new Error("You can only accept interactions addressed to you");
    }

    if (interaction.action_type !== "LIKE") {
      throw new Error("Only LIKE interactions can be accepted");
    }

    interactionMode =
      interactionMode || interaction.interaction_mode || "traditional";
    if (!VALID_INTERACTION_MODES.includes(interactionMode)) {
      throw new Error("Invalid interaction mode");
    }

    const replyInteraction = await InteractionRepository.upsert(
      currentUserId,
      interaction.actor_id,
      "LIKE",
      interactionMode,
    );

    const [user1Id, user2Id] =
      currentUserId < interaction.actor_id
        ? [currentUserId, interaction.actor_id]
        : [interaction.actor_id, currentUserId];

    const match = await this._createOrActivateMatch(
      user1Id,
      user2Id,
      interactionMode,
    );

    return { interaction: replyInteraction, match };
  }

  async getSentRequests(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const interactions = await InteractionRepository.findLikesSent(
      userId,
      limit,
      offset,
    );

    const requests = [];
    for (const interaction of interactions) {
      const [user1Id, user2Id] =
        interaction.actor_id < interaction.target_id
          ? [interaction.actor_id, interaction.target_id]
          : [interaction.target_id, interaction.actor_id];

      const match = await MatchRepository.findByUsers(user1Id, user2Id);
      if (!match?.is_active) {
        requests.push(interaction);
      }
    }

    return { requests, total: requests.length, limit, offset };
  }

  async getReceivedRequests(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const interactions = await InteractionRepository.findLikesReceived(
      userId,
      limit,
      offset,
    );

    const requests = [];
    for (const interaction of interactions) {
      const [user1Id, user2Id] =
        interaction.actor_id < interaction.target_id
          ? [interaction.actor_id, interaction.target_id]
          : [interaction.target_id, interaction.actor_id];

      const match = await MatchRepository.findByUsers(user1Id, user2Id);
      if (!match?.is_active) {
        requests.push(interaction);
      }
    }

    return { requests, total: requests.length, limit, offset };
  }

  async _createOrActivateMatch(user1Id, user2Id, matchMode) {
    const existingMatch = await MatchRepository.findByUsers(user1Id, user2Id);
    if (existingMatch) {
      if (existingMatch.is_active) {
        return existingMatch;
      }
      return await MatchRepository.acceptMatch(existingMatch.match_id);
    }

    return await MatchRepository.create({
      user1_id: user1Id,
      user2_id: user2Id,
      match_mode: matchMode,
      is_active: true,
    });
  }
}

export default new InteractionService();
