import { DataTypes } from "sequelize";
import bcryptjs from "bcryptjs";
import { sequelize } from "../config/database.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: { msg: "Please provide a valid email" },
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    default_mode: {
      type: DataTypes.ENUM("traditional", "anonymous"),
      defaultValue: "traditional",
    },
    is_beginer: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

// Hash password before saving
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    const salt = await bcryptjs.genSalt(10);
    user.password_hash = await bcryptjs.hash(user.password_hash, salt);
  }
});

// Hash password before updating if it's changed
User.beforeUpdate(async (user) => {
  if (user.changed("password_hash")) {
    const salt = await bcryptjs.genSalt(10);
    user.password_hash = await bcryptjs.hash(user.password_hash, salt);
  }
});

// Method to compare passwords
User.prototype.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password_hash);
};

// Remove password from JSON output
User.prototype.toJSON = function () {
  const obj = this.get();
  delete obj.password_hash;
  return obj;
};

export default User;
