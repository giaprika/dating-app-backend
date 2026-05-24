import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const AnonymousMatchingQueue = sequelize.define(
  "AnonymousMatchingQueue",
  {
    queue_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    actor_id: {
      type: DataTypes.INTEGER,
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
    expires_at: {
      type: DataTypes.DATE,
      defaultValue: () => new Date(Date.now() + 30 * 1000), // 30 seconds from now
    },
  },
  {
    tableName: "anonymous_matching_queue",
    timestamps: false,
    underscored: true,
  },
);

export default AnonymousMatchingQueue;
