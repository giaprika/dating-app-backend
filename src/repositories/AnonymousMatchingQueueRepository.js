import AnonymousMatchingQueue from "../models/AnonymousMatchingQueue.js";
import { Op } from "sequelize";
import { sequelize } from "../config/database.js";

class AnonymousMatchingQueueRepository {
  async create(queueData) {
    return await AnonymousMatchingQueue.create(queueData);
  }

  async findById(queueId) {
    return await AnonymousMatchingQueue.findByPk(queueId);
  }

  async findByActorId(actorId) {
    return await AnonymousMatchingQueue.findOne({
      where: {
        actor_id: actorId,
        is_active: true,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });
  }

  async findAllMatchingQueues(currentUserId) {
    const now = new Date();

    const result = await sequelize.query(
      `
    SELECT 
      aq.queue_id,
      aq.actor_id,
      aq.created_at,
      aq.expires_at,

      up.anonymous_interests,
      up.target_gender,

      u.gender

    FROM anonymous_matching_queue aq

    JOIN user_preferences up
      ON aq.actor_id = up.user_id

    JOIN users u
      ON aq.actor_id = u.user_id

    LEFT JOIN matches m ON
      (
        (m.user1_id = :currentUserId AND m.user2_id = aq.actor_id)
        OR
        (m.user1_id = aq.actor_id AND m.user2_id = :currentUserId)
      )

    WHERE aq.is_active = true
      AND aq.actor_id != :currentUserId
      AND aq.expires_at > :now
      AND m.match_id IS NULL
    `,
      {
        replacements: {
          currentUserId,
          now,
        },
        type: sequelize.QueryTypes.SELECT,
      },
    );

    return result;
  }

  async deleteByActorId(actorId) {
    return await AnonymousMatchingQueue.destroy({
      where: { actor_id: actorId },
    });
  }

  async deleteById(queueId) {
    return await AnonymousMatchingQueue.destroy({
      where: { queue_id: queueId },
    });
  }

  async deactivate(queueId) {
    return await AnonymousMatchingQueue.update(
      { is_active: false },
      { where: { queue_id: queueId } },
    );
  }

  async deactivateByActorId(actorId) {
    return await AnonymousMatchingQueue.update(
      { is_active: false },
      {
        where: {
          actor_id: actorId,
          is_active: true,
        },
      },
    );
  }

  async findExpiredEntries() {
    const now = new Date();
    return await AnonymousMatchingQueue.findAll({
      where: {
        is_active: true,
        expires_at: { [Op.lt]: now },
      },
    });
  }

  async deleteExpiredEntries() {
    const now = new Date();
    return await AnonymousMatchingQueue.destroy({
      where: {
        is_active: true,
        expires_at: { [Op.lt]: now },
      },
    });
  }
}

export default new AnonymousMatchingQueueRepository();
