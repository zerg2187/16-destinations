import "server-only";
import { initializeApp, getApps, getApp, cert, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Check if we are running in a server environment
if (typeof window !== "undefined") {
    throw new Error("firebase-admin can only be used on the server");
}

function getFirebaseAdminApp() {
    if (getApps().length > 0) {
        return getApp();
    }

    // For local development or if using specific credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
            return initializeApp({
                credential: cert(serviceAccount),
            });
        } catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY", error);
        }
    }

    // Fallback to default application credentials (e.g. on Vercel/GCP)
    // or if using FIREBASE_CONFIG env var
    return initializeApp();
}

const app = getFirebaseAdminApp();
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);
