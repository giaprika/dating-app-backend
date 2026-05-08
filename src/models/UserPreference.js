import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const UserPreference = sequelize.define(
  "UserPreference",
  {
    preference_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
    },
    target_gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    min_age: {
      type: DataTypes.INTEGER,
      defaultValue: 18,
    },
    max_age: {
      type: DataTypes.INTEGER,
      defaultValue: 99,
    },
    max_distance_km: {
      type: DataTypes.INTEGER,
      defaultValue: 50,
    },
    anonymous_interests: {
      type: DataTypes.TEXT,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "user_preferences",
    timestamps: true,
    underscored: true,
  },
);

export default UserPreference;
