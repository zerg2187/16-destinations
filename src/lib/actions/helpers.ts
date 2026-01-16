// Helper utilities for server actions (not actions themselves)

import { adminAuth } from "@/lib/firebase-admin";
import crypto from "crypto";

export function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
}

export async function verifyToken(idToken?: string): Promise<string | null> {
    if (!idToken) return null;
    try {
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        return decodedToken.uid;
    } catch {
        return null;
    }
}
