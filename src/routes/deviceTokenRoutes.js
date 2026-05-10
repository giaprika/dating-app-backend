import express from "express";
import DeviceTokenController from "../controllers/DeviceTokenController.js";
import authenticateToken from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/register",
  authenticateToken,
  DeviceTokenController.registerDevice.bind(DeviceTokenController),
);

router.post(
  "/unregister",
  authenticateToken,
  DeviceTokenController.unregisterDevice.bind(DeviceTokenController),
);

router.post(
  "/unregister-all",
  authenticateToken,
  DeviceTokenController.unregisterAllDevices.bind(DeviceTokenController),
);

router.get(
  "/active",
  authenticateToken,
  DeviceTokenController.getActiveDevices.bind(DeviceTokenController),
);

export default router;
