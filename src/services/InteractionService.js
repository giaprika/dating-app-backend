import InteractionRepository from "../repositories/InteractionRepository.js";
import MatchRepository from "../repositories/MatchRepository.js";
import UserDiscoveryRepository from "../repositories/UserDiscoveryRepository.js";

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

    await this._ensureTargetUserExists(targetId);

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

    const targetUser = await UserDiscoveryRepository.getUserWithDetails(targetId);

    return {
      interaction,
      match,
      targetUser: targetUser ? this._formatDiscoveryUser(targetUser) : null,
      shouldStartMatchNow: Boolean(match),
    };
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

  async getMatchStatus(currentUserId, otherUserId) {
    if (currentUserId === otherUserId) {
      throw new Error("Cannot check match status with yourself");
    }

    const outgoingInteraction = await InteractionRepository.findByActorAndTarget(
      currentUserId,
      otherUserId,
    );
    const incomingInteraction = await InteractionRepository.findByActorAndTarget(
      otherUserId,
      currentUserId,
    );

    const [user1Id, user2Id] =
      currentUserId < otherUserId
        ? [currentUserId, otherUserId]
        : [otherUserId, currentUserId];

    const match = await MatchRepository.findByUsers(user1Id, user2Id);

    let status = "none";
    if (match?.is_active) {
      status = "matched";
    } else if (incomingInteraction?.action_type === "LIKE") {
      status = "incoming_like";
    } else if (outgoingInteraction?.action_type === "LIKE") {
      status = "outgoing_like";
    } else if (
      outgoingInteraction?.action_type === "PASS" ||
      incomingInteraction?.action_type === "PASS"
    ) {
      status = "passed";
    }

    return {
      status,
      match,
      outgoingInteraction,
      incomingInteraction,
    };
  }

  async getPendingReceivedRequests(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const interactions =
      await InteractionRepository.findPendingLikesReceivedWithActor(
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

  async getPendingSentRequests(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const interactions = await InteractionRepository.findPendingLikesSentWithTarget(
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

  async rejectInteraction(interactionId, currentUserId, interactionMode = "traditional") {
    const interaction = await InteractionRepository.findById(interactionId);
    if (!interaction) {
      throw new Error("Interaction not found");
    }

    if (interaction.target_id !== currentUserId) {
      throw new Error("You can only reject interactions addressed to you");
    }

    interactionMode = interactionMode || interaction.interaction_mode || "traditional";
    if (!VALID_INTERACTION_MODES.includes(interactionMode)) {
      throw new Error("Invalid interaction mode");
    }

    const replyInteraction = await InteractionRepository.upsert(
      currentUserId,
      interaction.actor_id,
      "PASS",
      interactionMode,
    );

    const [user1Id, user2Id] =
      currentUserId < interaction.actor_id
        ? [currentUserId, interaction.actor_id]
        : [interaction.actor_id, currentUserId];

    const existingMatch = await MatchRepository.findByUsers(user1Id, user2Id);
    if (existingMatch?.is_active) {
      await MatchRepository.deactivate(existingMatch.match_id);
    }

    return { interaction: replyInteraction };
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

  async _ensureTargetUserExists(targetId) {
    const targetUser = await UserDiscoveryRepository.getUserWithDetails(targetId);
    if (!targetUser) {
      throw new Error("User not found");
    }
  }

  _formatDiscoveryUser(user) {
    const userData = user.toJSON ? user.toJSON() : user;

    return {
      user_id: userData.user_id,
      full_name: userData.full_name,
      birth_date: userData.birth_date,
      gender: userData.gender,
      bio: userData.bio,
      default_mode: userData.default_mode,
      created_at: userData.created_at,
      preferences: userData.preferences || null,
      primary_photo: userData.photos?.[0] || null,
    };
  }
}

export default new InteractionService();
