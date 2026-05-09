import Message from "../models/Message.js";
import { User } from "../models/index.js";
import { Op } from "sequelize";

class MessageRepository {
  async create(messageData) {
    return await Message.create(messageData);
  }

  async createWithSender(messageData) {
    const message = await Message.create(messageData);
    return await Message.findByPk(message.message_id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "full_name"],
        },
      ],
    });
  }

  async findById(id) {
    return await Message.findByPk(id);
  }

  async findByMatch(matchId, limit = 50, offset = 0) {
    return await Message.findAll({
      where: { match_id: matchId },
      limit,
      offset,
      order: [["sent_at", "ASC"]],
    });
  }

  async findByMatchWithSender(matchId, limit = 50, offset = 0) {
    const result = await Message.findAndCountAll({
      where: { match_id: matchId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["user_id", "full_name"],
        },
      ],
      limit,
      offset,
      order: [["sent_at", "ASC"]],
      subQuery: false,
      distinct: true,
    });

    return {
      messages: result.rows,
      total: result.count,
      limit,
      offset,
    };
  }

  async findUnreadMessages(matchId, userId) {
    return await Message.findAll({
      where: {
        match_id: matchId,
        is_read: false,
        sender_id: { [Op.ne]: userId },
      },
    });
  }

  async markAsRead(messageId) {
    return await Message.update(
      { is_read: true },
      { where: { message_id: messageId } },
    );
  }

  async markMatchMessagesAsRead(matchId, readerId) {
    return await Message.update(
      { is_read: true },
      {
        where: {
          match_id: matchId,
          sender_id: { [Op.ne]: readerId },
          is_read: false,
        },
      },
    );
  }

  async deleteMessage(id) {
    return await Message.destroy({ where: { message_id: id } });
  }

  async countUnread(matchId, userId) {
    return await Message.count({
      where: {
        match_id: matchId,
        is_read: false,
        sender_id: { [Op.ne]: userId },
      },
    });
  }
}

export default new MessageRepository();
