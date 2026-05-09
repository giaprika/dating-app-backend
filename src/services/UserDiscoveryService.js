import UserDiscoveryRepository from "../repositories/UserDiscoveryRepository.js";
import InteractionRepository from "../repositories/InteractionRepository.js";

class UserDiscoveryService {
  async getAvailableUsers(currentUserId, queryParams = {}) {
    const { page = 1, limit = 10, gender } = queryParams;
    const offset = (page - 1) * limit;

    let result;

    if (gender) {
      result = await UserDiscoveryRepository.getUsersByGender(
        currentUserId,
        gender,
        { limit, offset },
      );
    } else {
      result = await UserDiscoveryRepository.getAvailableUsers(currentUserId, {
        limit,
        offset,
      });
    }

    return {
      users: result.users.map((user) => this._formatUserResponse(user)),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async getUserDetails(userId, currentUserId) {
    if (userId === currentUserId) {
      throw new Error("Cannot view own profile from this endpoint");
    }

    const user = await UserDiscoveryRepository.getUserWithDetails(userId);
    if (!user) {
      throw new Error("User not found");
    }

    return this._formatUserResponse(user);
  }

  async getRecommendedUsers(currentUserId, queryParams = {}) {
    try {
      const { page = 1, limit = 10 } = queryParams;
      const offset = (page - 1) * limit;

      // Get users that the current user has already interacted with
      const interactions = await InteractionRepository.findActorInteractions(
        currentUserId,
        1000,
        0,
      );
      const interactedUserIds = interactions.map((i) => i.target_id);

      const result = await UserDiscoveryRepository.getUsersExcludingInteracted(
        currentUserId,
        interactedUserIds,
        { limit, offset },
      );

      return {
        users: result.users.map((user) => this._formatUserResponse(user)),
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get recommended users: ${error.message}`);
    }
  }

  _formatUserResponse(user) {
    const userData = user.toJSON ? user.toJSON() : user;

    return {
      user_id: userData.user_id,
      full_name: userData.full_name,
      birth_date: userData.birth_date,
      gender: userData.gender,
      bio: userData.bio,
      default_mode: userData.default_mode,
      created_at: userData.created_at,
      preferences: userData.preferences || null,
      primary_photo: userData.photos?.[0] || null,
    };
  }
}

export default new UserDiscoveryService();
