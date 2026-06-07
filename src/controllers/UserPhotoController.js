import UserPhotoService from "../services/UserPhotoService.js";
import ResponseUtil from "../utils/responseUtil.js";

class UserPhotoController {
  async getUserPhotos(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const result = await UserPhotoService.getAllUserPhotos(userId);

      res
        .status(200)
        .json(
          ResponseUtil.success(
            result,
            "User photos retrieved successfully",
            200,
          ),
        );
    } catch (error) {
      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async createUserPhoto(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const result = await UserPhotoService.createUserPhoto(userId, req.body);
      console.log("photo:", result);

      res
        .status(201)
        .json(ResponseUtil.success(result, "Photo created successfully", 201));
    } catch (error) {
      if (
        error.message === "image_url is required" ||
        error.message.includes("must be a valid number") ||
        error.message.includes("must be a non-empty string")
      ) {
        return res.status(400).json(ResponseUtil.error(error.message, 400));
      }

      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async updateUserPhoto(req, res) {
    try {
      const userId = req.user?.id;
      const { photoId } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!photoId || isNaN(photoId)) {
        return res
          .status(400)
          .json(ResponseUtil.error("Invalid photo ID", 400));
      }

      const result = await UserPhotoService.updateUserPhoto(
        userId,
        parseInt(photoId),
        req.body,
      );

      res
        .status(200)
        .json(ResponseUtil.success(result, "Photo updated successfully", 200));
    } catch (error) {
      if (error.message === "Photo not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json(ResponseUtil.error(error.message, 403));
      }

      if (
        error.message.includes("must be a valid number") ||
        error.message.includes("must be a non-empty string")
      ) {
        return res.status(400).json(ResponseUtil.error(error.message, 400));
      }

      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async deleteUserPhoto(req, res) {
    try {
      const userId = req.user?.id;
      const { photoId } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!photoId || isNaN(photoId)) {
        return res
          .status(400)
          .json(ResponseUtil.error("Invalid photo ID", 400));
      }

      const result = await UserPhotoService.deleteUserPhoto(
        userId,
        parseInt(photoId),
      );

      res
        .status(200)
        .json(ResponseUtil.success(result, "Photo deleted successfully", 200));
    } catch (error) {
      if (error.message === "Photo not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json(ResponseUtil.error(error.message, 403));
      }

      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async setPhotoAsPrimary(req, res) {
    try {
      const userId = req.user?.id;
      const { photoId } = req.params;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!photoId || isNaN(photoId)) {
        return res
          .status(400)
          .json(ResponseUtil.error("Invalid photo ID", 400));
      }

      const result = await UserPhotoService.setPhotoAsPrimary(
        userId,
        parseInt(photoId),
      );

      res
        .status(200)
        .json(
          ResponseUtil.success(
            result,
            "Photo set as primary successfully",
            200,
          ),
        );
    } catch (error) {
      if (error.message === "Photo not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }

      if (error.message.includes("Unauthorized")) {
        return res.status(403).json(ResponseUtil.error(error.message, 403));
      }

      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }
}

export default new UserPhotoController();
