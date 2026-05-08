import UserRepository from "../repositories/UserRepository.js";
import JwtUtil from "../utils/jwtUtil.js";

class AuthService {
  async register(userData) {
    // Check if email already exists
    const existingUser = await UserRepository.emailExists(userData.email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    // Create new user
    const user = await UserRepository.create({
      full_name: userData.full_name,
      email: userData.email,
      password_hash: userData.password,
      birth_date: userData.birth_date,
      gender: userData.gender,
      bio: userData.bio,
    });

    // Generate JWT token
    const token = JwtUtil.generateToken(user.user_id);

    return {
      user: user.toJSON(),
      token,
    };
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
