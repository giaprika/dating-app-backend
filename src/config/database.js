import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Initialize Sequelize for PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || "postgres",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
  },
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      `✓ PostgreSQL Connected: ${process.env.DB_HOST}:${process.env.DB_PORT}/`,
    );
    return sequelize;
  } catch (error) {
    console.error(`✗ Error connecting to PostgreSQL: ${error.message}`);
    process.exit(1);
  }
};

export { sequelize, connectDB };
