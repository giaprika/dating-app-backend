import InteractionRepository from "../repositories/InteractionRepository.js";
import MatchRepository from "../repositories/MatchRepository.js";

const VALID_ACTION_TYPES = ["LIKE", "PASS"];
const VALID_INTERACTION_MODES = ["traditional", "anonymous"];

class InteractionService {
  async createInteraction(
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

    // Create/update interaction
    const interaction = await InteractionRepository.upsert(
      actorId,
      targetId,
      actionType,
      interactionMode,
    );

    let match = null;

    // Only create match if LIKE
    if (actionType === "LIKE") {
      const reverseInteraction =
        await InteractionRepository.findLikeInteraction(targetId, actorId);

      // Mutual LIKE => create match
      if (reverseInteraction) {
        const [user1Id, user2Id] =
          actorId < targetId ? [actorId, targetId] : [targetId, actorId];

        match = await this._createOrActivateMatch(
          user1Id,
          user2Id,
          interactionMode,
        );
      }
    }

    // PASS => deactivate existing match
    if (actionType === "PASS") {
      const [user1Id, user2Id] =
        actorId < targetId ? [actorId, targetId] : [targetId, actorId];

      const existingMatch = await MatchRepository.findByUsers(user1Id, user2Id);

      if (existingMatch?.is_active) {
        match = await MatchRepository.deactivate(existingMatch.match_id);
      }
    }

    return {
      interaction,
      match,
    };
  }

  async getSentRequests(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const interactions = await InteractionRepository.findLikesSent(
      userId,
      limit,
      offset,
    );

    const users = []; // Đổi từ requests sang users để đồng bộ cấu trúc
    for (const interaction of interactions) {
      // Kiểm tra target user đã phản hồi lại current user chưa
      const respondedInteraction =
        await InteractionRepository.findByActorAndTarget(
          interaction.target_id, // Đối phương
          userId, // Bản thân
        );

      // Nếu đối phương đã phản hồi (LIKE/PASS) thì bỏ qua
      if (respondedInteraction) {
        continue;
      }

      // Lấy thông tin user (target) nhận được like ra và format lại giống received
      if (interaction.target) {
        users.push(this._formatUserResponse(interaction.target));
      }
    }

    return {
      users, // Trả về danh sách object User đã format
      total: users.length,
      limit,
      offset,
    };
  }

  async getReceivedRequests(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const interactions = await InteractionRepository.findLikesReceived(
      userId,
      limit,
      offset,
    );

    const users = [];
    for (const interaction of interactions) {
      // Kiểm tra current user đã phản hồi chưa
      const respondedInteraction =
        await InteractionRepository.findByActorAndTarget(
          userId, // current user
          interaction.actor_id, // người gửi request
        );

      // Nếu đã phản hồi thì bỏ qua
      if (respondedInteraction) {
        continue;
      }

      // Lấy thông tin user (actor) đã gửi like ra và format lại
      if (interaction.actor) {
        users.push(this._formatUserResponse(interaction.actor));
      }
    }

    return {
      users, // Đổi từ requests sang users
      total: users.length,
      limit,
      offset,
    };
  }

  // Thêm hàm format này vào InteractionService
  _formatUserResponse(user) {
    const userData = user.toJSON ? user.toJSON() : user;

    return {
      user_id: userData.user_id,
      email: userData.email,
      full_name: userData.full_name,
      birth_date: userData.birth_date,
      gender: userData.gender,
      bio: userData.bio,
      default_mode: userData.default_mode,
      created_at: userData.created_at,
      preferences: userData.preferences || null,
      photos: userData.photos || null,
    };
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
