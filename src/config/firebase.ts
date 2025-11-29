
import admin from "firebase-admin";
import serviceAccount from "../../firebase-service-account.json";

admin.initializeApp({ 
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const verifyFirebaseToken = async (token: string) => {
  try { 
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded;
  } catch (error) {
    throw new Error("Invalid Firebase token");
  }
}; 

export default admin;