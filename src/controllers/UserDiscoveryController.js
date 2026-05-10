import UserDiscoveryService from "../services/UserDiscoveryService.js";
import ResponseUtil from "../utils/responseUtil.js";

class UserDiscoveryController {
  async getAvailableUsers(req, res) {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const { page = 1, limit = 10, gender } = req.query;

      const result = await UserDiscoveryService.getAvailableUsers(
        currentUserId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          gender,
        },
      );

      res
        .status(200)
        .json(
          ResponseUtil.success(result, "Users retrieved successfully", 200),
        );
    } catch (error) {
      if (error.message === "Cannot filter by your own gender") {
        return res.status(400).json(ResponseUtil.error(error.message, 400));
      }
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!userId || isNaN(userId)) {
        return res.status(400).json(ResponseUtil.error("Invalid user ID", 400));
      }

      const user = await UserDiscoveryService.getUserDetails(
        parseInt(userId),
        currentUserId,
      );

      res
        .status(200)
        .json(ResponseUtil.success(user, "User retrieved successfully", 200));
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }
      if (error.message.includes("Cannot view own profile")) {
        return res.status(403).json(ResponseUtil.error(error.message, 403));
      }
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async getRecommendedUsers(req, res) {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const { page = 1, limit = 10 } = req.query;

      const result = await UserDiscoveryService.getRecommendedUsers(
        currentUserId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
        },
      );

      res
        .status(200)
        .json(
          ResponseUtil.success(
            result,
            "Recommended users retrieved successfully",
            200,
          ),
        );
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }
}

export default new UserDiscoveryController();
