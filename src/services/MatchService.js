import MatchRepository from "../repositories/MatchRepository.js";
import MessageRepository from "../repositories/MessageRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import DeviceTokenRepository from "../repositories/DeviceTokenRepository.js";
import NotificationService from "./NotificationService.js";
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

    // Fetch unread messages and last message (same as getUserMatches)
    const unreadMessages = await MessageRepository.findUnreadMessages(
      matchId,
      currentUserId,
    );
    const lastMessage = await MessageRepository.findLastMessage(matchId);

    // Fetch messages with pagination
    const messagesResult = await MessageRepository.findByMatchWithSender(
      matchId,
      limit,
      messageOffset,
    );

    await MessageRepository.markMatchMessagesAsRead(matchId, currentUserId);

    return {
      ...match.toJSON(),
      unreadMessages: unreadMessages,
      unreadCount: unreadMessages.length,
      lastMessage: lastMessage,
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

    // Determine receiver
    const receiverId =
      match.user1_id === messageData.sender_id
        ? match.user2_id
        : match.user1_id;

    // Emit real-time notification to receiver via WebSocket (non-blocking)
    try {
      emitToUser(receiverId, "new_message", {
        message,
        matchId: messageData.match_id,
      });
    } catch (emitError) {
      console.warn("Failed to emit message notification:", emitError.message);
    }

    // Send FCM push notification to receiver's devices (non-blocking)
    try {
      // Get sender info for notification title
      const sender = await UserRepository.findById(messageData.sender_id);
      const senderName = sender?.full_name || "New Message";

      // Get receiver's active device tokens
      const deviceTokens =
        await DeviceTokenRepository.findActiveTokensByUserId(receiverId);
      const tokens = deviceTokens.map((token) => token.device_token);

      if (tokens.length > 0) {
        // Send FCM notification with message content
        await NotificationService.sendMulticastNotification(
          tokens,
          senderName,
          messageData.content,
          {
            match_id: messageData.match_id.toString(),
            sender_id: messageData.sender_id.toString(),
            message_id: message.message_id?.toString() || "",
          },
        );
      }
    } catch (fcmError) {
      console.warn("Failed to send FCM notification:", fcmError.message);
    }

    return message;
  }
}

export default new MatchService();
