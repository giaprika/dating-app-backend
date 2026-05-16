import InteractionService from "../services/InteractionService.js";
import ResponseUtil from "../utils/responseUtil.js";

class InteractionController {
  async requestInteraction(req, res) {
    try {
      const currentUserId = req.user?.id;
      const { userId } = req.params;
      const { action_type, interaction_mode } = req.body;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!userId || isNaN(userId)) {
        return res.status(400).json(ResponseUtil.error("Invalid user ID", 400));
      }

      const result = await InteractionService.requestInteraction(
        currentUserId,
        parseInt(userId),
        action_type || "LIKE",
        interaction_mode || "traditional",
      );

      const statusCode = result.match ? 200 : 201;
      const message = result.match
        ? "Match started successfully"
        : "Interaction recorded successfully";

      res
        .status(statusCode)
        .json(ResponseUtil.success(result, message, statusCode));
    } catch (error) {
      res.status(400).json(ResponseUtil.error(error.message, 400));
    }
  }

  async acceptInteraction(req, res) {
    try {
      const currentUserId = req.user?.id;
      const { interactionId } = req.params;
      const { interaction_mode } = req.body;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!interactionId || isNaN(interactionId)) {
        return res
          .status(400)
          .json(ResponseUtil.error("Invalid interaction ID", 400));
      }

      const result = await InteractionService.acceptInteraction(
        parseInt(interactionId),
        currentUserId,
        interaction_mode,
      );

      res
        .status(200)
        .json(ResponseUtil.success(result, "Interaction accepted", 200));
    } catch (error) {
      if (error.message === "Interaction not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }
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
            requests: result.requests,
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
            requests: result.requests,
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

  async rejectInteraction(req, res) {
    try {
      const currentUserId = req.user?.id;
      const { interactionId } = req.params;
      const { interaction_mode } = req.body;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!interactionId || isNaN(interactionId)) {
        return res
          .status(400)
          .json(ResponseUtil.error("Invalid interaction ID", 400));
      }

      const result = await InteractionService.rejectInteraction(
        parseInt(interactionId),
        currentUserId,
        interaction_mode,
      );

      res.status(200).json(ResponseUtil.success(result, "Interaction rejected", 200));
    } catch (error) {
      if (error.message === "Interaction not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }
      res.status(400).json(ResponseUtil.error(error.message, 400));
    }
  }

  async getPendingReceivedRequests(req, res) {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const { page = 1, limit = 10 } = req.query;
      const result = await InteractionService.getPendingReceivedRequests(
        currentUserId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
        },
      );

      res.status(200).json(
        ResponseUtil.success(
          {
            requests: result.requests,
            pagination: {
              page: Math.ceil(result.offset / result.limit) + 1,
              limit: result.limit,
              total: result.total,
              totalPages: Math.ceil(result.total / result.limit),
            },
          },
          "Pending received interaction requests retrieved",
          200,
        ),
      );
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async getPendingSentRequests(req, res) {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const { page = 1, limit = 10 } = req.query;
      const result = await InteractionService.getPendingSentRequests(
        currentUserId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
        },
      );

      res.status(200).json(
        ResponseUtil.success(
          {
            requests: result.requests,
            pagination: {
              page: Math.ceil(result.offset / result.limit) + 1,
              limit: result.limit,
              total: result.total,
              totalPages: Math.ceil(result.total / result.limit),
            },
          },
          "Pending sent interaction requests retrieved",
          200,
        ),
      );
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async getMatchStatus(req, res) {
    try {
      const currentUserId = req.user?.id;
      const { userId } = req.params;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!userId || isNaN(userId)) {
        return res.status(400).json(ResponseUtil.error("Invalid user ID", 400));
      }

      const result = await InteractionService.getMatchStatus(
        currentUserId,
        parseInt(userId),
      );

      res.status(200).json(ResponseUtil.success(result, "Match status retrieved", 200));
    } catch (error) {
      res.status(400).json(ResponseUtil.error(error.message, 400));
    }
  }
}

export default new InteractionController();
