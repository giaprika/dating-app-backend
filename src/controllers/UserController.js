import UserService from "../services/UserService.js";
import ResponseUtil from "../utils/responseUtil.js";

class UserController {
  async updateProfile(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const result = await UserService.updateUserProfile(userId, req.body);

      res
        .status(200)
        .json(
          ResponseUtil.success(
            result,
            "User profile updated successfully",
            200,
          ),
        );
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }

      if (
        error.message === "Invalid gender" ||
        error.message === "Invalid default mode"
      ) {
        return res.status(400).json(ResponseUtil.error(error.message, 400));
      }

      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }

  async getAvatar(req, res) {
    try {
      const userId = req.user?.id;
      console.log("userId:", userId);

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const avatar = await UserService.getPrimaryAvatar(userId);

      res
        .status(200)
        .json(
          ResponseUtil.success(avatar, "Avatar retrieved successfully", 200),
        );
    } catch (error) {
      console.log(error);
      if (error.message === "Avatar not found") {
        return res.status(404).json(ResponseUtil.error(error.message, 404));
      }

      res.status(500).json(ResponseUtil.error(error.message, 500));
    }
  }
}

export default new UserController();
