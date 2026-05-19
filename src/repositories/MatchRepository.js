import Match from "../models/Match.js";
import { User, UserPhoto } from "../models/index.js";
import { Op } from "sequelize";

class MatchRepository {
  async create(matchData) {
    return await Match.create(matchData);
  }

  async findById(id) {
    return await Match.findByPk(id);
  }

  async findByIdWithDetails(matchId) {
    return await Match.findByPk(matchId, {
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["user_id", "full_name", "bio", "gender", "birth_date"],
        },
        {
          model: User,
          as: "user2",
          attributes: ["user_id", "full_name", "bio", "gender", "birth_date"],
        },
      ],
    });
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

  async findUserMatchesWithDetails(userId, limit = 10, offset = 0) {
    const result = await Match.findAndCountAll({
      where: {
        [Op.or]: [{ user1_id: userId }, { user2_id: userId }],
        is_active: true,
      },
      include: [
        {
          model: User,
          as: "user1",
          attributes: { exclude: ["password_hash"] },
          include: [
            {
              model: UserPhoto,
              as: "photos",
              where: { is_primary: true },
              required: false,
              attributes: ["photo_id", "image_url", "is_primary"],
            },
          ],
        },
        {
          model: User,
          as: "user2",
          attributes: { exclude: ["password_hash"] },
          include: [
            {
              model: UserPhoto,
              as: "photos",
              where: { is_primary: true },
              required: false,
              attributes: ["photo_id", "image_url", "is_primary"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["matched_at", "DESC"]],
      subQuery: false,
      distinct: true,
    });

    return {
      matches: result.rows,
      total: result.count,
      limit,
      offset,
    };
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

  async getPendingMatchRequests(userId, limit = 10, offset = 0) {
    const result = await Match.findAndCountAll({
      where: {
        user2_id: userId,
        is_active: false,
      },
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["user_id", "full_name", "bio", "gender", "birth_date"],
        },
        {
          model: User,
          as: "user2",
          attributes: ["user_id", "full_name", "bio", "gender", "birth_date"],
        },
      ],
      limit,
      offset,
      order: [["matched_at", "DESC"]],
      subQuery: false,
      distinct: true,
    });

    return {
      requests: result.rows,
      total: result.count,
      limit,
      offset,
    };
  }

  async acceptMatch(matchId) {
    const match = await Match.findByPk(matchId);
    if (!match) return null;
    return await match.update({ is_active: true, matched_at: new Date() });
  }

  async deleteMatch(matchId) {
    return await this.deactivate(matchId);
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
