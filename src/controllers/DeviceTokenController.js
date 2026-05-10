import DeviceTokenService from "../services/DeviceTokenService.js";
import ResponseUtil from "../utils/responseUtil.js";

class DeviceTokenController {
  async registerDevice(req, res) {
    try {
      const userId = req.user?.id;
      const { device_token, device_type } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!device_token || !device_type) {
        return res
          .status(400)
          .json(
            ResponseUtil.error(
              "device_token and device_type are required",
              400,
            ),
          );
      }

      const result = await DeviceTokenService.registerDevice(
        userId,
        device_token,
        device_type,
      );

      res
        .status(201)
        .json(
          ResponseUtil.success(result, "Device registered successfully", 201),
        );
    } catch (error) {
      res.status(400).json(ResponseUtil.error(error.message, 400));
    }
  }

  async unregisterDevice(req, res) {
    try {
      const userId = req.user?.id;
      const { device_token } = req.body;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      if (!device_token) {
        return res
          .status(400)
          .json(ResponseUtil.error("device_token is required", 400));
      }

      await DeviceTokenService.unregisterDevice(device_token);

      res
        .status(200)
        .json(
          ResponseUtil.success(null, "Device unregistered successfully", 200),
        );
    } catch (error) {
      res.status(400).json(ResponseUtil.error(error.message, 400));
    }
  }

  async unregisterAllDevices(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      await DeviceTokenService.unregisterAllDevices(userId);

      res
        .status(200)
        .json(
          ResponseUtil.success(
            null,
            "All devices unregistered successfully",
            200,
          ),
        );
    } catch (error) {
      res.status(400).json(ResponseUtil.error(error.message, 400));
    }
  }

  async getActiveDevices(req, res) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseUtil.error("User not authenticated", 401));
      }

      const devices = await DeviceTokenService.getActiveDevices(userId);

      res
        .status(200)
        .json(
          ResponseUtil.success(
            devices,
            "Active devices retrieved successfully",
            200,
          ),
        );
    } catch (error) {
      res.status(400).json(ResponseUtil.error(error.message, 400));
    }
  }
}

export default new DeviceTokenController();
