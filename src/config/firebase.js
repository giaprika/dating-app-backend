import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let firebaseApp = null;

export const initializeFirebase = async () => {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    console.log("serviceAccountPath", serviceAccountPath);

    if (!serviceAccountPath) {
      console.warn(
        "FIREBASE_SERVICE_ACCOUNT_PATH not set. Firebase Cloud Messaging disabled.",
      );
      return null;
    }

    if (!fs.existsSync(serviceAccountPath)) {
      console.warn(
        `Firebase service account file not found at ${serviceAccountPath}. FCM disabled.`,
      );
      return null;
    }

    const serviceAccount = JSON.parse(
      fs.readFileSync(serviceAccountPath, "utf8"),
    );

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Cloud Messaging initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.error("Failed to initialize Firebase:", error.message);
    return null;
  }
};

export const getFirebaseApp = () => firebaseApp;

export const isFirebaseEnabled = () => firebaseApp !== null;
