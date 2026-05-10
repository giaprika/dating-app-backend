import fs from "fs";
import path from "path";
import YAML from "yaml";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "openapi.yaml");
console.log("Đường dẫn file Swagger:", filePath);

let swaggerSpec = {};

try {
  const fileContents = fs.readFileSync(filePath, "utf8");
  swaggerSpec = YAML.parse(fileContents);
} catch (error) {
  console.error(
    "Unable to read the openapi.yaml file. Please verify the file path.",
    error.message,
  );
}

export default swaggerSpec;
