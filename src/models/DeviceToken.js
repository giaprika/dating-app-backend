import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const DeviceToken = sequelize.define(
  "DeviceToken",
  {
    token_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    device_token: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    device_type: {
      type: DataTypes.ENUM("ios", "android", "web"),
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    last_used_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "device_tokens",
    timestamps: false,
    underscored: true,
  },
);

export default DeviceToken;
