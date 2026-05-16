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

router.post(
  "/:interactionId/reject",
  authenticateToken,
  InteractionController.rejectInteraction.bind(InteractionController),
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

router.get(
  "/requests/pending-sent",
  authenticateToken,
  InteractionController.getPendingSentRequests.bind(InteractionController),
);

router.get(
  "/requests/pending-received",
  authenticateToken,
  InteractionController.getPendingReceivedRequests.bind(InteractionController),
);

router.get(
  "/status/:userId",
  authenticateToken,
  InteractionController.getMatchStatus.bind(InteractionController),
);

export default router;
