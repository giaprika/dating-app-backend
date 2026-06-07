import UserPhotoRepository from "../repositories/UserPhotoRepository.js";
import { checkImageSafety } from "../utils/checkImage.js";

class UserPhotoService {
  validatePhotoData(photoData) {
    const payload = {};

    if (photoData.image_url !== undefined) {
      if (!photoData.image_url || typeof photoData.image_url !== "string") {
        throw new Error("image_url must be a non-empty string");
      }
      payload.image_url = photoData.image_url;
    }

    if (photoData.is_primary !== undefined) {
      payload.is_primary = Boolean(photoData.is_primary);
    }

    if (photoData.display_order !== undefined) {
      if (photoData.display_order !== null) {
        const order = Number.parseInt(photoData.display_order, 10);
        if (Number.isNaN(order)) {
          throw new Error("display_order must be a valid number");
        }
        payload.display_order = order;
      } else {
        payload.display_order = null;
      }
    }

    return payload;
  }

  formatPhoto(photo) {
    if (!photo) {
      return null;
    }

    return photo.toJSON ? photo.toJSON() : photo;
  }

  async getAllUserPhotos(userId) {
    const photos = await UserPhotoRepository.findByUserId(userId);
    return photos.map((photo) => this.formatPhoto(photo));
  }

  async createUserPhoto(userId, photoData) {
    const payload = this.validatePhotoData(photoData);

    if (!payload.image_url) {
      throw new Error("image_url is required");
    }

    if (payload.is_primary === true) {
      const existingPrimary = await UserPhotoRepository.findPrimary(userId);
      if (existingPrimary) {
        await UserPhotoRepository.update(existingPrimary.photo_id, {
          is_primary: false,
        });
      }
    }

    const isSafe = await checkImageSafety(payload.image_url);
    console.log("isSafe:", isSafe);

    const createdPhoto = await UserPhotoRepository.create({
      user_id: userId,
      is_sfw: isSafe,
      ...payload,
    });

    return this.formatPhoto(createdPhoto);
  }

  async updateUserPhoto(userId, photoId, photoData) {
    const photo = await UserPhotoRepository.findById(photoId);

    if (!photo) {
      throw new Error("Photo not found");
    }

    if (photo.user_id !== userId) {
      throw new Error("Unauthorized: photo does not belong to current user");
    }

    const payload = this.validatePhotoData(photoData);

    if (payload.is_primary === true) {
      const existingPrimary = await UserPhotoRepository.findPrimary(userId);
      if (existingPrimary && existingPrimary.photo_id !== photoId) {
        await UserPhotoRepository.update(existingPrimary.photo_id, {
          is_primary: false,
        });
      }
    }

    const updatedPhoto = await UserPhotoRepository.update(photoId, payload);

    return this.formatPhoto(updatedPhoto);
  }

  async deleteUserPhoto(userId, photoId) {
    const photo = await UserPhotoRepository.findById(photoId);

    if (!photo) {
      throw new Error("Photo not found");
    }

    if (photo.user_id !== userId) {
      throw new Error("Unauthorized: photo does not belong to current user");
    }

    const isPrimary = photo.is_primary;

    await UserPhotoRepository.delete(photoId);

    if (isPrimary) {
      const remainingPhotos = await UserPhotoRepository.findByUserId(userId);
      if (remainingPhotos.length > 0) {
        await UserPhotoRepository.update(remainingPhotos[0].photo_id, {
          is_primary: true,
        });
      }
    }

    return { message: "Photo deleted successfully" };
  }

  async setPhotoAsPrimary(userId, photoId) {
    const photo = await UserPhotoRepository.findById(photoId);

    if (!photo) {
      throw new Error("Photo not found");
    }

    if (photo.user_id !== userId) {
      throw new Error("Unauthorized: photo does not belong to current user");
    }

    const existingPrimary = await UserPhotoRepository.findPrimary(userId);
    if (existingPrimary && existingPrimary.photo_id !== photoId) {
      await UserPhotoRepository.update(existingPrimary.photo_id, {
        is_primary: false,
      });
    }

    const updatedPhoto = await UserPhotoRepository.update(photoId, {
      is_primary: true,
    });

    return this.formatPhoto(updatedPhoto);
  }
}

export default new UserPhotoService();
