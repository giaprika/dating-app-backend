import UserRepository from "../repositories/UserRepository.js";
import UserPhotoRepository from "../repositories/UserPhotoRepository.js";
import UserPreferenceRepository from "../repositories/UserPreferenceRepository.js";
import JwtUtil from "../utils/jwtUtil.js";
import { sequelize } from "../config/database.js";

class AuthService {
  async register(userData) {
    const existingUser = await UserRepository.emailExists(userData.email);

    if (existingUser) {
      throw new Error("Email already registered");
    }

    const transaction = await sequelize.transaction();

    try {
      // 1. Create user
      const user = await UserRepository.create(
        {
          full_name: userData.full_name,
          email: userData.email,
          password_hash: userData.password,
          birth_date: userData.birth_date,
          gender: userData.gender,
          bio: userData.bio,
        },
        transaction,
      );

      // 2. Create avatar
      if (userData.image_url) {
        await UserPhotoRepository.create(
          {
            user_id: user.user_id,
            image_url: userData.image_url,
            is_primary: true,
            display_order: 1,
          },
          transaction,
        );
      }

      // 3. Create preferences
      await UserPreferenceRepository.create(
        {
          user_id: user.user_id,
          target_gender: userData.target_gender,
          min_age: userData.min_age || 18,
          max_age: userData.max_age || 99,
          max_distance_km: userData.max_distance_km || 50,
          anonymous_interests: (userData.anonymous_interests || []).join(", "),
        },
        transaction,
      );

      // commit nếu mọi thứ thành công
      await transaction.commit();

      // 4. Generate token
      const token = JwtUtil.generateToken(user.user_id);

      return {
        user: {
          ...user.toJSON(),
          avatar_url: userData.image_url || null,
        },
        token,
      };
    } catch (error) {
      // rollback toàn bộ
      await transaction.rollback();
      throw error;
    }
  }

  async login(email, password) {
    // Find user by email with password field
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    // Generate JWT token
    const token = JwtUtil.generateToken(user.user_id);

    return {
      user: user.toJSON(),
      token,
    };
  }

  async refreshToken(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const token = JwtUtil.generateToken(user.user_id);
    return { token };
  }

  async verifyToken(token) {
    return JwtUtil.verifyToken(token);
  }
}

export default new AuthService();
