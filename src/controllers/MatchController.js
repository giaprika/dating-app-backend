import MatchService from "../services/MatchService.js";
import ResponseUtil from "../utils/responseUtil.js";

class MatchController {
  async getUserMatches(req, res) {
    try {
      const currentUserId = req.user?.id;
      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }
      console.log("currentUserId", currentUserId);

      const { page = 1, limit = 10, search = "" } = req.query;

      const result = await MatchService.getUserMatches(currentUserId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search.trim(),
      });

      res.status(200).json(
        ResponseUtil.success(
          {
            matches: result.matches,
            pagination: {
              page: Math.ceil(result.offset / result.limit) + 1,
              limit: result.limit,
              total: result.total,
              totalPages: Math.ceil(result.total / result.limit),
            },
          },
          "Matches retrieved successfully",
          200,
        ),
      );
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async getMatchWithMessages(req, res) {
    try {
      const { matchId } = req.params;
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!matchId || isNaN(matchId)) {
        return res
          .status(400)
          .json(ResponseUtil.error("Invalid match ID", 400));
      }

      const { page = 1, limit = 50 } = req.query;

      const result = await MatchService.getMatchWithMessages(
        parseInt(matchId),
        currentUserId,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 50,
        },
      );

      res
        .status(200)
        .json(
          ResponseUtil.success(result, "Match and messages retrieved", 200),
        );
    } catch (error) {
      if (error.message === "Match not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }
      if (error.message === "Match is inactive") {
        return res.status(403).json(ResponseUtil.error(error.message, 403));
      }
      if (error.message.includes("do not have access")) {
        return res.status(403).json(ResponseUtil.error(error.message, 403));
      }
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async sendMessage(req, res) {
    try {
      const { matchId } = req.params;
      const { content } = req.body;
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!matchId || isNaN(matchId)) {
        return res
          .status(400)
          .json(ResponseUtil.error("Invalid match ID", 400));
      }

      if (!content || content.trim() === "") {
        return res
          .status(400)
          .json(ResponseUtil.error("Message content is required", 400));
      }

      const message = await MatchService.sendMessage({
        match_id: parseInt(matchId),
        sender_id: currentUserId,
        content: content.trim(),
      });

      res
        .status(201)
        .json(ResponseUtil.success(message, "Message sent successfully", 201));
    } catch (error) {
      console.error("[sendMessage] Error:", error.message);
      console.error(error.stack);
      if (error.message === "Match not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }
      if (
        error.message.includes("not part of this match") ||
        error.message === "Cannot send messages for an inactive match"
      ) {
        return res.status(403).json(ResponseUtil.error(error.message, 403));
      }
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async deleteMatch(req, res) {
    try {
      const { matchId } = req.params;
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!matchId || isNaN(matchId)) {
        return res
          .status(400)
          .json(ResponseUtil.error("Invalid match ID", 400));
      }

      await MatchService.deleteMatch(parseInt(matchId), currentUserId);

      res
        .status(200)
        .json(ResponseUtil.success(null, "Match deleted successfully", 200));
    } catch (error) {
      if (error.message.includes("not found")) {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }
      if (error.message.includes("do not have access")) {
        return res.status(403).json(ResponseUtil.error(error.message, 403));
      }
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async matchAnonymous(req, res) {
    try {
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const result = await MatchService.matchAnonymous(currentUserId);

      if (result.status === "matched") {
        res
          .status(201)
          .json(
            ResponseUtil.success(
              result,
              "Anonymous match found successfully",
              201,
            ),
          );
      } else {
        res
          .status(202)
          .json(
            ResponseUtil.success(
              result,
              "Added to anonymous matching queue",
              202,
            ),
          );
      }
    } catch (error) {
      console.error("[matchAnonymous] Error:", error.message);
      console.error(error.stack);

      if (error.message.includes("not found")) {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }
      if (
        error.message.includes("not set") ||
        error.message.includes("already")
      ) {
        return res.status(400).json(ResponseUtil.error(error.message, 400));
      }
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }
}

export default new MatchController();
