import MatchRepository from "../repositories/MatchRepository.js";
import MessageRepository from "../repositories/MessageRepository.js";

class MatchService {
  async deleteMatch(matchId, currentUserId) {
    const match = await MatchRepository.findByIdWithDetails(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Verify user is part of the match
    if (match.user1_id !== currentUserId && match.user2_id !== currentUserId) {
      throw new Error("You do not have access to this match");
    }

    return await MatchRepository.deactivate(matchId);
  }

  async getUserMatches(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    return await MatchRepository.findUserMatchesWithDetails(
      userId,
      limit,
      offset,
    );
  }

  async getMatchWithMessages(matchId, currentUserId, options = {}) {
    const { page = 1, limit = 50 } = options;
    const messageOffset = (page - 1) * limit;

    const match = await MatchRepository.findByIdWithDetails(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    if (!match.is_active) {
      throw new Error("Match is inactive");
    }

    // Verify user belongs to this match
    if (match.user1_id !== currentUserId && match.user2_id !== currentUserId) {
      throw new Error("You do not have access to this match");
    }

    const messagesResult = await MessageRepository.findByMatchWithSender(
      matchId,
      limit,
      messageOffset,
    );

    await MessageRepository.markMatchMessagesAsRead(matchId, currentUserId);

    return {
      match: match,
      messages: messagesResult.messages,
      messagesPagination: {
        page,
        limit,
        total: messagesResult.total,
        totalPages: Math.ceil(messagesResult.total / limit),
      },
    };
  }

  async getUnreadCount(matchId, userId) {
    return await MessageRepository.countUnread(matchId, userId);
  }

  async sendMessage(messageData) {
    const match = await MatchRepository.findById(messageData.match_id);
    if (!match) {
      throw new Error("Match not found");
    }

    if (!match.is_active) {
      throw new Error("Cannot send messages for an inactive match");
    }

    const isUserInMatch =
      match.user1_id === messageData.sender_id ||
      match.user2_id === messageData.sender_id;
    if (!isUserInMatch) {
      throw new Error("You are not part of this match");
    }

    const message = await MessageRepository.createWithSender(messageData);

    // Emit real-time notification to receiver
    const receiverId =
      match.user1_id === messageData.sender_id
        ? match.user2_id
        : match.user1_id;
    emitToUser(receiverId, "new_message", {
      message,
      matchId: messageData.match_id,
    });

    return message;
  }

  async deleteMatch(matchId, currentUserId) {
    const match = await MatchRepository.findByIdWithDetails(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Verify user is part of the match
    if (match.user1_id !== currentUserId && match.user2_id !== currentUserId) {
      throw new Error("You do not have access to this match");
    }

    return await MatchRepository.deactivate(matchId);
  }

  async getUserMatches(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    return await MatchRepository.findUserMatchesWithDetails(
      userId,
      limit,
      offset,
    );
  }

  async getMatchWithMessages(matchId, currentUserId, options = {}) {
    const { page = 1, limit = 50 } = options;
    const messageOffset = (page - 1) * limit;

    const match = await MatchRepository.findByIdWithDetails(matchId);
    if (!match) {
      throw new Error("Match not found");
    }

    // Verify user belongs to this match
    if (match.user1_id !== currentUserId && match.user2_id !== currentUserId) {
      throw new Error("You do not have access to this match");
    }

    // Get messages with sender details
    const messagesResult = await MessageRepository.findByMatchWithSender(
      matchId,
      limit,
      messageOffset,
    );

    // Mark unread messages as read
    await MessageRepository.markMatchMessagesAsRead(matchId, currentUserId);

    return {
      match: match,
      messages: messagesResult.messages,
      messagesPagination: {
        page,
        limit,
        total: messagesResult.total,
        totalPages: Math.ceil(messagesResult.total / limit),
      },
    };
  }

  async getUnreadCount(matchId, userId) {
    return await MessageRepository.countUnread(matchId, userId);
  }
}

export default new MatchService();
