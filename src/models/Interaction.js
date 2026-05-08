import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

const Interaction = sequelize.define(
  "Interaction",
  {
    interaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    actor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    target_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action_type: {
      type: DataTypes.ENUM("LIKE", "PASS"),
      allowNull: false,
    },
    interaction_mode: {
      type: DataTypes.ENUM("traditional", "anonymous"),
      defaultValue: "traditional",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "interactions",
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ["actor_id", "target_id"],
      },
    ],
  },
);

export default Interaction;
