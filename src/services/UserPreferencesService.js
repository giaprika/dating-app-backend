import UserPreferenceRepository from "../repositories/UserPreferenceRepository.js";

const VALID_TARGET_GENDERS = new Set(["male", "female", "other"]);

class UserPreferencesService {
  getDefaultPreferences(userId) {
    return {
      preference_id: null,
      user_id: userId,
      target_gender: null,
      min_age: 18,
      max_age: 99,
      max_distance_km: 50,
      anonymous_interests: [],
      created_at: null,
      updated_at: null,
    };
  }

  normalizeAnonymousInterests(value) {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      return null;
    }

    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    return value;
  }

  normalizePreferencePayload(preferencesData) {
    const payload = {};

    if (preferencesData.target_gender !== undefined) {
      if (
        preferencesData.target_gender !== null &&
        !VALID_TARGET_GENDERS.has(preferencesData.target_gender)
      ) {
        throw new Error("Invalid target gender");
      }

      payload.target_gender = preferencesData.target_gender;
    }

    if (preferencesData.min_age !== undefined) {
      payload.min_age = Number.parseInt(preferencesData.min_age, 10);
    }

    if (preferencesData.max_age !== undefined) {
      payload.max_age = Number.parseInt(preferencesData.max_age, 10);
    }

    if (preferencesData.max_distance_km !== undefined) {
      payload.max_distance_km = Number.parseInt(
        preferencesData.max_distance_km,
        10,
      );
    }

    if (preferencesData.anonymous_interests !== undefined) {
      payload.anonymous_interests = this.normalizeAnonymousInterests(
        preferencesData.anonymous_interests,
      );
    }

    if (payload.min_age !== undefined && Number.isNaN(payload.min_age)) {
      throw new Error("min_age must be a valid number");
    }

    if (payload.max_age !== undefined && Number.isNaN(payload.max_age)) {
      throw new Error("max_age must be a valid number");
    }

    if (
      payload.max_distance_km !== undefined &&
      Number.isNaN(payload.max_distance_km)
    ) {
      throw new Error("max_distance_km must be a valid number");
    }

    if (
      payload.min_age !== undefined &&
      payload.max_age !== undefined &&
      payload.min_age > payload.max_age
    ) {
      throw new Error("min_age must be less than or equal to max_age");
    }

    return payload;
  }

  formatPreference(preference) {
    if (!preference) {
      return null;
    }

    const plainPreference = preference.toJSON
      ? preference.toJSON()
      : preference;
    const interests = plainPreference.anonymous_interests;

    if (typeof interests === "string" && interests.length > 0) {
      try {
        plainPreference.anonymous_interests = JSON.parse(interests);
      } catch {
        plainPreference.anonymous_interests = interests;
      }
    }

    return plainPreference;
  }

  async getUserPreferences(userId) {
    const preference = await UserPreferenceRepository.findByUserId(userId);

    if (!preference) {
      return this.getDefaultPreferences(userId);
    }

    return this.formatPreference(preference);
  }

  async createUserPreferences(userId, preferencesData) {
    const existingPreferences =
      await UserPreferenceRepository.findByUserId(userId);

    if (existingPreferences) {
      throw new Error("User preferences already exist");
    }

    const payload = this.normalizePreferencePayload(preferencesData);
    const createdPreferences = await UserPreferenceRepository.create({
      user_id: userId,
      ...payload,
    });

    return this.formatPreference(createdPreferences);
  }

  async updateUserPreferences(userId, preferencesData) {
    const existingPreferences =
      await UserPreferenceRepository.findByUserId(userId);

    if (!existingPreferences) {
      throw new Error("User preferences not found");
    }

    const payload = this.normalizePreferencePayload(preferencesData);
    const updatedPreferences = await UserPreferenceRepository.update(
      userId,
      payload,
    );

    return this.formatPreference(updatedPreferences);
  }
}

export default new UserPreferencesService();
