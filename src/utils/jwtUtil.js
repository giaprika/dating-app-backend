import jwt from "jsonwebtoken";

class JwtUtil {
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  decodeToken(token) {
    return jwt.decode(token);
  }
}

export default new JwtUtil();
