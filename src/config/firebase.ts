import admin from "firebase-admin";

const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG as string);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const verifyFirebaseToken = async (token: string) => {
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded;
  } catch (error) {
    throw new Error("Invalid Firebase token");
  }
};

export default admin;
