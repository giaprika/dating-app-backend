import AuthService from "../services/AuthService.js";
import ResponseUtil from "../utils/responseUtil.js";

class AuthController {
  async register(req, res) {
    try {
      const { email, password, full_name, birth_date, gender, bio } = req.body;

      const result = await AuthService.register({
        email,
        password,
        full_name,
        birth_date,
        gender,
        bio,
      });

      res
        .status(201)
        .json(
          ResponseUtil.success(result, "User registered successfully", 201),
        );
    } catch (error) {
      res.status(400).json(ResponseUtil.error(error.message, 400));
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res
        .status(200)
        .json(ResponseUtil.success(result, "Login successful", 200));
    } catch (error) {
      res.status(401).json(ResponseUtil.error(error.message, 401));
    }
  }

  async refreshToken(req, res) {
    try {
      const userId = req.user.id;

      const result = await AuthService.refreshToken(userId);

      res
        .status(200)
        .json(ResponseUtil.success(result, "Token refreshed", 200));
    } catch (error) {
      res.status(401).json(ResponseUtil.error(error.message, 401));
    }
  }
}

export default new AuthController();
