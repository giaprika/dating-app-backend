import InteractionService from "../services/InteractionService.js";
import ResponseUtil from "../utils/responseUtil.js";

class InteractionController {
  async createInteraction(req, res) {
    try {
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const {
        target_id,
        action_type = "LIKE",
        interaction_mode = "traditional",
      } = req.body;

      if (!target_id || isNaN(target_id)) {
        return res
          .status(400)
          .json(ResponseUtil.error("Invalid target user ID", 400));
      }

      const result = await InteractionService.createInteraction(
        currentUserId,
        parseInt(target_id),
        action_type,
        interaction_mode,
      );

      res
        .status(201)
        .json(
          ResponseUtil.success(result, "Interaction created successfully", 201),
        );
    } catch (error) {
      res.status(400).json(ResponseUtil.error(error.message, 400));
    }
  }

  async getSentRequests(req, res) {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const { page = 1, limit = 10 } = req.query;
      const result = await InteractionService.getSentRequests(currentUserId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });

      res.status(200).json(
        ResponseUtil.success(
          {
            users: result.users, // Đổi từ requests thành users giống endpoint received
            pagination: {
              page: Math.ceil(result.offset / result.limit) + 1,
              limit: result.limit,
              total: result.total,
              totalPages: Math.ceil(result.total / result.limit),
            },
          },
          "Sent interaction requests retrieved",
          200,
        ),
      );
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async getReceivedRequests(req, res) {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const { page = 1, limit = 10 } = req.query;
      const result = await InteractionService.getReceivedRequests(
        currentUserId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
        },
      );

      res.status(200).json(
        ResponseUtil.success(
          {
            users: result.users, // Đổi key từ requests thành users
            pagination: {
              page: Math.ceil(result.offset / result.limit) + 1,
              limit: result.limit,
              total: result.total,
              totalPages: Math.ceil(result.total / result.limit),
            },
          },
          "Received interaction requests retrieved",
          200,
        ),
      );
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }
}

export default new InteractionController();
