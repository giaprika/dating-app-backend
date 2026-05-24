import express from "express";
import UserDiscoveryController from "../controllers/UserDiscoveryController.js";
import authenticateToken from "../middlewares/auth.js";
import UserPreferencesController from "../controllers/UserPreferencesController.js";
import UserPhotoController from "../controllers/UserPhotoController.js";

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

/**
 * @swagger
 * /api/users/preferences:
 *   get:
 *     summary: Get user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *       404:
 *         description: User preferences not found
 */

router.get(
  "/preferences",
  authenticateToken,
  UserPreferencesController.getUserPreferences.bind(UserPreferencesController),
);

/**
 * @swagger
 * /api/users/preferences:
 *   put:
 *     summary: Update user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               target_gender:
 *                 type: string
 *               min_age:
 *                 type: integer
 *               max_age:
 *                 type: integer
 *               max_distance_km:
 *                 type: integer
 *               anonymous_interests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: User preferences updated successfully
 *       404:
 *         description: User preferences not found
 */

router.put(
  "/preferences",
  authenticateToken,
  UserPreferencesController.updateUserPreferences.bind(
    UserPreferencesController,
  ),
);

/**
 * @swagger
 * /api/users/preferences:
 *   post:
 *     summary: Create user preferences
 *     tags: [User Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               target_gender:
 *                 type: string
 *               min_age:
 *                 type: integer
 *               max_age:
 *                 type: integer
 *               max_distance_km:
 *                 type: integer
 *               anonymous_interests:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: User preferences created successfully
 *       409:
 *         description: User preferences already exist
 */

router.post(
  "/preferences",
  authenticateToken,
  UserPreferencesController.createUserPreferences.bind(
    UserPreferencesController,
  ),
);

/**
 * @swagger
 * /api/users/photos:
 *   get:
 *     summary: Get all user photos
 *     tags: [User Photos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User photos retrieved successfully
 */

router.get(
  "/photos",
  authenticateToken,
  UserPhotoController.getUserPhotos.bind(UserPhotoController),
);

/**
 * @swagger
 * /api/users/photos:
 *   post:
 *     summary: Create a new user photo
 *     tags: [User Photos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image_url:
 *                 type: string
 *               is_primary:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Photo created successfully
 *       400:
 *         description: Invalid input
 */

router.post(
  "/photos",
  authenticateToken,
  UserPhotoController.createUserPhoto.bind(UserPhotoController),
);

/**
 * @swagger
 * /api/users/photos/{photoId}:
 *   put:
 *     summary: Update user photo
 *     tags: [User Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image_url:
 *                 type: string
 *               is_primary:
 *                 type: boolean
 *               display_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Photo updated successfully
 *       404:
 *         description: Photo not found
 */

router.put(
  "/photos/:photoId",
  authenticateToken,
  UserPhotoController.updateUserPhoto.bind(UserPhotoController),
);

/**
 * @swagger
 * /api/users/photos/{photoId}:
 *   delete:
 *     summary: Delete user photo
 *     tags: [User Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Photo deleted successfully
 *       404:
 *         description: Photo not found
 */

router.delete(
  "/photos/:photoId",
  authenticateToken,
  UserPhotoController.deleteUserPhoto.bind(UserPhotoController),
);

/**
 * @swagger
 * /api/users/photos/{photoId}/primary:
 *   put:
 *     summary: Set photo as primary (avatar)
 *     tags: [User Photos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Photo set as primary successfully
 *       404:
 *         description: Photo not found
 */

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
  "/:userId",
  authenticateToken,
  UserDiscoveryController.getUserDetails.bind(UserDiscoveryController),
);

export default router;
