import UserPreferencesService from "../services/UserPreferencesService.js";
import ResponseUtil from "../utils/responseUtil.js";

class UserPreferencesController {
  async getUserPreferences(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const result = await UserPreferencesService.getUserPreferences(userId);

      res
        .status(200)
        .json(
          ResponseUtil.success(
            result,
            "User preferences retrieved successfully",
            200,
          ),
        );
    } catch (error) {
      if (error.message === "User preferences not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }

      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async createUserPreferences(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const result = await UserPreferencesService.createUserPreferences(
        userId,
        req.body,
      );

      res
        .status(201)
        .json(
          ResponseUtil.success(
            result,
            "User preferences created successfully",
            201,
          ),
        );
    } catch (error) {
      if (error.message === "User preferences already exist") {
        return res.status(409).json(ResponseUtil.error(error.message, 409));
      }

      if (
        error.message === "Invalid target gender" ||
        error.message.includes("must be a valid number") ||
        error.message.includes("min_age must be less than or equal to max_age")
      ) {
        return res.status(400).json(ResponseUtil.error(error.message, 400));
      }

      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async updateUserPreferences(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const result = await UserPreferencesService.updateUserPreferences(
        userId,
        req.body,
      );

      res
        .status(200)
        .json(
          ResponseUtil.success(
            result,
            "User preferences updated successfully",
            200,
          ),
        );
    } catch (error) {
      if (error.message === "User preferences not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }

      if (
        error.message === "Invalid target gender" ||
        error.message.includes("must be a valid number") ||
        error.message.includes("min_age must be less than or equal to max_age")
      ) {
        return res.status(400).json(ResponseUtil.error(error.message, 400));
      }

      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }
}

export default new UserPreferencesController();
