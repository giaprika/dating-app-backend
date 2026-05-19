import MatchRepository from "../repositories/MatchRepository.js";
import MessageRepository from "../repositories/MessageRepository.js";
import { emitToUser } from "../config/socketio.js";

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

    const result = await MatchRepository.findUserMatchesWithDetails(
      userId,
      limit,
      offset,
    );

    // Fetch unread messages and last message for each match
    const matchesWithUnread = await Promise.all(
      result.matches.map(async (match) => {
        const unreadMessages = await MessageRepository.findUnreadMessages(
          match.match_id,
          userId,
        );
        const lastMessage = await MessageRepository.findLastMessage(
          match.match_id,
        );
        return {
          ...match.toJSON(),
          unreadMessages: unreadMessages,
          unreadCount: unreadMessages.length,
          lastMessage: lastMessage,
        };
      }),
    );

    return {
      matches: matchesWithUnread,
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
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

    // Emit real-time notification to receiver (non-blocking)
    try {
      const receiverId =
        match.user1_id === messageData.sender_id
          ? match.user2_id
          : match.user1_id;
      emitToUser(receiverId, "new_message", {
        message,
        matchId: messageData.match_id,
      });
    } catch (emitError) {
      console.warn("Failed to emit message notification:", emitError.message);
    }

    return message;
  }
}

export default new MatchService();
