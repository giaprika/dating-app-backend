import Message from "../models/Message.js";

class MessageRepository {
  async create(messageData) {
    return await Message.create(messageData);
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

  async findUnreadMessages(matchId, userId) {
    return await Message.findAll({
      where: {
        match_id: matchId,
        is_read: false,
        sender_id: { [require("sequelize").Op.ne]: userId },
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
          sender_id: { [require("sequelize").Op.ne]: readerId },
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
        sender_id: { [require("sequelize").Op.ne]: userId },
      },
    });
  }
}

export default new MessageRepository();
