import express from "express";
import InteractionController from "../controllers/InteractionController.js";
import authenticateToken from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/request/:userId",
  authenticateToken,
  InteractionController.requestInteraction.bind(InteractionController),
);

router.post(
  "/:interactionId/accept",
  authenticateToken,
  InteractionController.acceptInteraction.bind(InteractionController),
);

router.get(
  "/requests/sent",
  authenticateToken,
  InteractionController.getSentRequests.bind(InteractionController),
);

router.get(
  "/requests/received",
  authenticateToken,
  InteractionController.getReceivedRequests.bind(InteractionController),
);

export default router;
