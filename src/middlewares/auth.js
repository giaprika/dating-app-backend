import JwtUtil from "../utils/jwtUtil.js";
import ResponseUtil from "../utils/responseUtil.js";

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json(ResponseUtil.error("No token provided", 401));
    }

    const decoded = JwtUtil.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json(ResponseUtil.error("Invalid or expired token", 403));
  }
};

export default authenticateToken;
