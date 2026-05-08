import express from "express";
import AuthController from "../controllers/AuthController.js";
import ValidationUtil from "../utils/validationUtil.js";
import authenticateToken from "../middlewares/auth.js";

const router = express.Router();

router.post(
  "/register",
  ValidationUtil.validateRegister(),
  (req, res, next) => ValidationUtil.handleValidationErrors(req, res, next),
  AuthController.register.bind(AuthController),
);

router.post(
  "/login",
  ValidationUtil.validateLogin(),
  (req, res, next) => ValidationUtil.handleValidationErrors(req, res, next),
  AuthController.login.bind(AuthController),
);

router.post(
  "/refresh-token",
  authenticateToken,
  AuthController.refreshToken.bind(AuthController),
);

export default router;
