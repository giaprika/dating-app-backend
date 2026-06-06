import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";

class MatchUpgradeRequest extends Model {}

MatchUpgradeRequest.init(
  {
    request_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requester_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "accepted", "rejected"),
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "MatchUpgradeRequest",
    tableName: "match_upgrade_requests",
    timestamps: true, // Tự động map created_at, updated_at
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default MatchUpgradeRequest;
