import AuthService from "../services/AuthService.js";
import ResponseUtil from "../utils/responseUtil.js";
import moment from "moment";

class AuthController {
  async register(req, res) {
    try {
      const {
        email,
        password,
        full_name,
        birth_date,
        gender,
        bio,
        image_url,
        anonymous_interests,
        target_gender,
        min_age,
        max_age,
        max_distance_km,
      } = req.body;

      console.log("request body:", req.body);

      // Validate cơ bản
      if (!email || !password || !full_name) {
        return res
          .status(400)
          .json(ResponseUtil.error("Missing required fields", 400));
      }

      // Validate birth date
      let parsedBirthDate = null;

      if (birth_date) {
        const m = moment(birth_date, "DD/MM/YYYY", true);

        if (!m.isValid()) {
          return res
            .status(400)
            .json(
              ResponseUtil.error(
                "birth_date must be in DD/MM/YYYY format",
                400,
              ),
            );
        }

        parsedBirthDate = m.format("YYYY-MM-DD");
      }

      const result = await AuthService.register({
        email,
        password,
        full_name,
        birth_date: parsedBirthDate,
        gender,
        bio,
        image_url,
        anonymous_interests,
        target_gender,
        min_age,
        max_age,
        max_distance_km,
      });

      return res
        .status(201)
        .json(
          ResponseUtil.success(result, "User registered successfully", 201),
        );
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      return res.status(400).json(ResponseUtil.error(error.message, 400));
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

  async checkToken(req, res) {
    try {
      res.status(200).json(ResponseUtil.success(true, "Token is valid", 200));
    } catch (error) {
      res.status(401).json(ResponseUtil.error("Invalid token", 401));
    }
  }
}

export default new AuthController();
