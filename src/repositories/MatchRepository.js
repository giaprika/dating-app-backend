import Match from "../models/Match.js";
import { Op } from "sequelize";

class MatchRepository {
  async create(matchData) {
    return await Match.create(matchData);
  }

  async findById(id) {
    return await Match.findByPk(id);
  }

  async findByUsers(userId1, userId2) {
    // Ensure consistent order for unique constraint
    const [user1, user2] =
      userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];

    return await Match.findOne({
      where: {
        user1_id: user1,
        user2_id: user2,
      },
    });
  }

  async findUserMatches(userId, limit = 20, offset = 0) {
    return await Match.findAll({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
        is_active: true,
      },
      limit,
      offset,
      order: [["matched_at", "DESC"]],
    });
  }

  async findActiveMatches(userId) {
    return await Match.findAll({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
        is_active: true,
      },
    });
  }

  async update(id, updateData) {
    const match = await Match.findByPk(id);
    if (!match) return null;
    return await match.update(updateData);
  }

  async deactivate(id) {
    return await Match.update(
      { is_active: false },
      { where: { match_id: id } },
    );
  }

  async countMatches(userId) {
    return await Match.count({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
        is_active: true,
      },
    });
  }
}

export default new MatchRepository();
