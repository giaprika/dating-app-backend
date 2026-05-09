import express from "express";
import MatchController from "../controllers/MatchController.js";
import authenticateToken from "../middlewares/auth.js";

const router = express.Router();

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

router.post(
  "/:matchId/messages",
  authenticateToken,
  MatchController.sendMessage.bind(MatchController),
);

router.delete(
  "/:matchId",
  authenticateToken,
  MatchController.deleteMatch.bind(MatchController),
);

export default router;
