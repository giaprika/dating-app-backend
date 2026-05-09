import express from "express";
import UserDiscoveryController from "../controllers/UserDiscoveryController.js";
import authenticateToken from "../middlewares/auth.js";

const router = express.Router();

router.get(
  "/discover",
  authenticateToken,
  UserDiscoveryController.getAvailableUsers.bind(UserDiscoveryController),
);

router.get(
  "/recommended",
  authenticateToken,
  UserDiscoveryController.getRecommendedUsers.bind(UserDiscoveryController),
);

router.get(
  "/:userId",
  authenticateToken,
  UserDiscoveryController.getUserDetails.bind(UserDiscoveryController),
);

export default router;
