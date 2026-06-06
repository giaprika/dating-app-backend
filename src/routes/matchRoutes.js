import express from "express";
import MatchController from "../controllers/MatchController.js";
import authenticateToken from "../middlewares/auth.js";

const router = express.Router();

// GET routes
router.get(
  "/",
  authenticateToken,
  MatchController.getUserMatches.bind(MatchController),
);

router.get(
  "/:matchId",
  authenticateToken,
  MatchController.getMatchWithMessages.bind(MatchController),
);

// POST routes - specific routes first
router.post(
  "/anonymous",
  authenticateToken,
  MatchController.matchAnonymous.bind(MatchController),
);

router.post(
  "/:matchId/messages",
  authenticateToken,
  MatchController.sendMessage.bind(MatchController),
);

// DELETE routes
router.delete(
  "/:matchId",
  authenticateToken,
  MatchController.deleteMatch.bind(MatchController),
);

router.post(
  "/:matchId/upgrade-request",
  authenticateToken,
  MatchController.requestUpgrade.bind(MatchController),
);

// PATCH routes - Phản hồi yêu cầu (Chấp nhận hoặc Từ chối)
router.patch(
  "/:matchId/upgrade-request",
  authenticateToken,
  MatchController.respondToUpgrade.bind(MatchController),
);

export default router;
