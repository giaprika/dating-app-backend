import express from "express";
import UserDiscoveryController from "../controllers/UserDiscoveryController.js";
import authenticateToken from "../middlewares/auth.js";
import UserPreferencesController from "../controllers/UserPreferencesController.js";
import UserPhotoController from "../controllers/UserPhotoController.js";
import UserController from "../controllers/UserController.js";

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
  "/preferences",
  authenticateToken,
  UserPreferencesController.getUserPreferences.bind(UserPreferencesController),
);

router.put(
  "/preferences",
  authenticateToken,
  UserPreferencesController.updateUserPreferences.bind(
    UserPreferencesController,
  ),
);

router.post(
  "/preferences",
  authenticateToken,
  UserPreferencesController.createUserPreferences.bind(
    UserPreferencesController,
  ),
);

router.get(
  "/photos",
  authenticateToken,
  UserPhotoController.getUserPhotos.bind(UserPhotoController),
);

router.post(
  "/photos",
  authenticateToken,
  UserPhotoController.createUserPhoto.bind(UserPhotoController),
);

router.put(
  "/photos/:photoId",
  authenticateToken,
  UserPhotoController.updateUserPhoto.bind(UserPhotoController),
);

router.delete(
  "/photos/:photoId",
  authenticateToken,
  UserPhotoController.deleteUserPhoto.bind(UserPhotoController),
);

router.put(
  "/photos/:photoId/primary",
  authenticateToken,
  UserPhotoController.setPhotoAsPrimary.bind(UserPhotoController),
);

router.get(
  "/me",
  authenticateToken,
  UserDiscoveryController.getCurrentUser.bind(UserDiscoveryController),
);

router.get(
  "/avatar",
  authenticateToken,
  UserController.getAvatar.bind(UserController),
);

router.get(
  "/:userId",
  authenticateToken,
  UserDiscoveryController.getUserDetails.bind(UserDiscoveryController),
);

router.put(
  "/profile",
  authenticateToken,
  UserController.updateProfile.bind(UserController),
);

router.get(
  "/onboarding/status",
  authenticateToken,
  UserController.getBeginnerStatus.bind(UserController),
);

router.put(
  "/onboarding/complete",
  authenticateToken,
  UserController.finishOnboarding.bind(UserController),
);

export default router;
