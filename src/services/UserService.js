import UserRepository from "../repositories/UserRepository.js";
import UserPhotoRepository from "../repositories/UserPhotoRepository.js";

const VALID_GENDERS = new Set(["male", "female", "other"]);
const VALID_MODES = new Set(["traditional", "anonymous"]);

class UserService {
  normalizeUserPayload(userData) {
    const payload = {};

    if (userData.full_name !== undefined) {
      payload.full_name = userData.full_name;
    }

    if (userData.birth_date !== undefined) {
      payload.birth_date = userData.birth_date;
    }

    if (userData.gender !== undefined) {
      if (userData.gender !== null && !VALID_GENDERS.has(userData.gender)) {
        throw new Error("Invalid gender");
      }
      payload.gender = userData.gender;
    }

    if (userData.bio !== undefined) {
      payload.bio = userData.bio;
    }

    if (userData.default_mode !== undefined) {
      if (
        userData.default_mode !== null &&
        !VALID_MODES.has(userData.default_mode)
      ) {
        throw new Error("Invalid default mode");
      }
      payload.default_mode = userData.default_mode;
    }

    return payload;
  }

  async updateUserProfile(userId, updateData) {
    const existingUser = await UserRepository.findById(userId);

    if (!existingUser) {
      throw new Error("User not found");
    }

    const payload = this.normalizeUserPayload(updateData);

    // Nếu không có trường nào cần cập nhật, trả về user hiện tại
    if (Object.keys(payload).length === 0) {
      const plainUser = existingUser.toJSON
        ? existingUser.toJSON()
        : existingUser;
      delete plainUser.password_hash;
      return plainUser;
    }

    const updatedUser = await UserRepository.update(userId, payload);

    const plainUser = updatedUser.toJSON ? updatedUser.toJSON() : updatedUser;

    // Tuyệt đối không trả về password_hash cho client
    delete plainUser.password_hash;

    return plainUser;
  }

  async getPrimaryAvatar(userId) {
    const avatar = await UserPhotoRepository.findPrimary(userId);
    console.log("avatar:", avatar);
    if (!avatar) {
      throw new Error("Avatar not found");
    }
    const plainAvatar = avatar.toJSON ? avatar.toJSON() : avatar;

    return plainAvatar;
  }

  async getBeginnerStatus(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user.is_beginer;
  }

  async markBeginnerAsFalse(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await UserRepository.update(userId, {
      is_beginer: false,
    });
    return updatedUser.is_beginer;
  }
}

export default new UserService();
