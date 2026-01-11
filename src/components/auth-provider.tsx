"use client";

import { useEffect } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                signInAnonymously(auth).catch((error) => {
                    console.error("Anonymous auth failed:", error);
                });
            }
        });

        return () => unsubscribe();
    }, []);

    return <>{children}</>;
}
