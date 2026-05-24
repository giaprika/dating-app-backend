import MatchRepository from "../repositories/MatchRepository.js";
import MessageRepository from "../repositories/MessageRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import DeviceTokenRepository from "../repositories/DeviceTokenRepository.js";
import UserPreferenceRepository from "../repositories/UserPreferenceRepository.js";
import AnonymousMatchingQueueRepository from "../repositories/AnonymousMatchingQueueRepository.js";
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
    const { page = 1, limit = 10, search = "" } = options;
    const offset = (page - 1) * limit;

    const result = await MatchRepository.findUserMatchesWithDetails(
      userId,
      limit,
      offset,
      search,
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
      const senderName =
        match.match_mode === "anonymous" ? "Ẩn danh" : sender.full_name;

      // Get receiver's active device tokens
      const deviceTokens =
        await DeviceTokenRepository.findActiveTokensByUserId(receiverId);
      const tokens = deviceTokens.map((token) => token.device_token);
      console.log("tokens:", tokens);

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

  /**
   * Calculate match score based on common interests
   * @param {string} interests1 - Comma-separated interests
   * @param {string} interests2 - Comma-separated interests
   * @returns {number} - Number of common interests
   */
  calculateMatchScore(interests1, interests2) {
    if (!interests1 || !interests2) return 0;

    const set1 = new Set(
      interests1
        .split(",")
        .map((i) => i.trim().toLowerCase())
        .filter((i) => i),
    );
    const set2 = new Set(
      interests2
        .split(",")
        .map((i) => i.trim().toLowerCase())
        .filter((i) => i),
    );

    let commonCount = 0;
    for (let interest of set1) {
      if (set2.has(interest)) {
        commonCount++;
      }
    }
    return commonCount;
  }

  /**
   * Handle anonymous matching request
   * TH1: If there's an active queue entry matching preferences -> create match
   * TH2: If no match found -> add current user to queue
   */
  async matchAnonymous(currentUserId) {
    // Get current user details
    const currentUser = await UserRepository.findById(currentUserId);
    if (!currentUser) {
      throw new Error("User not found");
    }

    // Get current user preferences
    const currentUserPrefs =
      await UserPreferenceRepository.findByUserId(currentUserId);
    if (!currentUserPrefs || !currentUserPrefs.target_gender) {
      throw new Error(
        "User preferences not set or target gender not specified",
      );
    }

    // Check if user already has an active queue entry
    const existingQueueEntry =
      await AnonymousMatchingQueueRepository.findByActorId(currentUserId);
    if (existingQueueEntry) {
      throw new Error(
        "You already have an active queue entry. Please wait for a match.",
      );
    }

    // Try to find a matching queue entry
    const allQueues =
      await AnonymousMatchingQueueRepository.findAllMatchingQueues(
        currentUserId,
      );

    let bestMatch = null;
    let bestScore = -1;

    for (const queueEntry of allQueues) {
      // current user thích giới tính đối phương
      const currentLikesTarget =
        currentUserPrefs.target_gender === queueEntry.gender;

      // đối phương thích giới tính current user
      const targetLikesCurrent =
        queueEntry.target_gender === currentUser.gender;

      if (!currentLikesTarget || !targetLikesCurrent) {
        continue;
      }

      const matchScore = this.calculateMatchScore(
        currentUserPrefs.anonymous_interests || "",
        queueEntry.anonymous_interests || "",
      );

      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMatch = {
          ...queueEntry,
          matchScore,
        };
      }
    }

    if (bestMatch) {
      const match = await MatchRepository.createAnonymousMatch(
        currentUserId,
        bestMatch.actor_id,
      );
      await AnonymousMatchingQueueRepository.deleteByActorId(
        bestMatch.actor_id,
      );
      const matchDetails = await MatchRepository.findByIdWithDetails(
        match.match_id,
      );

      // Emit real-time notification to matched user
      try {
        emitToUser(matchedUserId, "anonymous_match", {
          match: matchDetails,
        });
      } catch (emitError) {
        console.warn(
          "Failed to emit anonymous match notification:",
          emitError.message,
        );
      }
      return {
        status: "matched",
        match: matchDetails,
        matchScore: bestMatch.matchScore,
      };
    }

    // Case 2: No match found or match already exists - Add to queue
    const queueEntry = await AnonymousMatchingQueueRepository.create({
      actor_id: currentUserId,
      is_active: true,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 30 * 1000), // 30 seconds expiry
    });

    return {
      status: "queued",
      queueId: queueEntry.queue_id,
      message:
        "Added to anonymous matching queue. Waiting for a match (30 seconds timeout)...",
    };
  }
}

export default new MatchService();
