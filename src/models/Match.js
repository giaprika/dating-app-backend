import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Match = sequelize.define(
  "Match",
  {
    match_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user1_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user2_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    match_mode: {
      type: DataTypes.ENUM("traditional", "anonymous"),
      defaultValue: "traditional",
    },
    matched_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "matches",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["user1_id", "user2_id"],
      },
    ],
  },
);

export default Match;
