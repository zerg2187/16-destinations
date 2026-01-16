"use client";

import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";

interface AuthResult<T> {
    success: boolean;
    error?: string;
    data?: T;
}

interface UseAutoAuthOptions<T> {
    verifyFn: (token: string) => Promise<AuthResult<T>>;
    onSuccess?: (data: T) => void;
}

export function useAutoAuth<T>({ verifyFn, onSuccess }: UseAutoAuthOptions<T>) {
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [authResult, setAuthResult] = useState<AuthResult<T> | null>(null);

    const checkAuth = useCallback(async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await user.getIdToken();
                const result = await verifyFn(token);
                if (result.success && result.data) {
                    setAuthResult(result);
                    onSuccess?.(result.data);
                }
            } catch (e) {
                console.error("Auto-auth failed", e);
            }
        }
        setIsCheckingAuth(false);
    }, [verifyFn, onSuccess]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                await checkAuth();
            } else {
                setIsCheckingAuth(false);
            }
        });
        return () => unsubscribe();
    }, [checkAuth]);

    return { isCheckingAuth, authResult };
}
