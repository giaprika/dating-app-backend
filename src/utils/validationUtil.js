import { body, validationResult } from "express-validator";

class ValidationUtil {
  validateRegister() {
    return [
      body("email").isEmail().withMessage("Please provide a valid email"),
      body("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters"),
      body("full_name").notEmpty().withMessage("Full name is required"),
    ];
  }

  validateLogin() {
    return [
      body("email").isEmail().withMessage("Please provide a valid email"),
      body("password").notEmpty().withMessage("Password is required"),
    ];
  }

  handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Validation error",
        errors: errors.array(),
      });
    }
    next();
  }
}

export default new ValidationUtil();
