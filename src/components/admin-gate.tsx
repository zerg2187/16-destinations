"use client";

import { useState } from "react";
import { verifyAdminPassword } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminView } from "@/components/admin-view";
import { Group } from "@/types";

interface AdminGateProps {
    groupId: string;
}

import { auth } from "@/lib/firebase";
import { useEffect } from "react";

export function AdminGate({ groupId }: AdminGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [groupData, setGroupData] = useState<Group | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const result = await verifyAdminPassword(groupId, "", token);
                    if (result.success && result.group) {
                        setGroupData(result.group as Group);
                        setIsAuthenticated(true);
                        toast.success("管理者として自動認証されました");
                    }
                } catch (e) {
                    console.error("Auto-auth failed", e);
                }
            }
            setIsCheckingAuth(false);
        };

        // Wait for auth to initialize if needed, but usually onAuthStateChanged fires quickly.
        // If auth.currentUser is null, we might want to wait for onAuthStateChanged first event?
        // Actually, onAuthStateChanged fires with null if not logged in.

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                await checkAuth();
            } else {
                setIsCheckingAuth(false);
            }
        });
        return () => unsubscribe();
    }, [groupId]);

    async function refreshData() {
        if (!password && !isAuthenticated) return; // If authenticated via token, password is empty

        // If authenticated, we can just fetch without password if we have token?
        // But refreshData logic in previous step used verifyAdminPassword(groupId, password).
        // If auto-authed, password is "".
        // So we need to use token again for refresh?
        // Yes.

        const user = auth.currentUser;
        const token = user ? await user.getIdToken() : undefined;

        try {
            const result = await verifyAdminPassword(groupId, password, token);
            if (result.success && result.group) {
                setGroupData(result.group as Group);
            }
        } catch (error) {
            console.error("Failed to refresh data", error);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await verifyAdminPassword(groupId, password);
            if (result.success && result.group) {
                setGroupData(result.group as Group);
                setIsAuthenticated(true);
                toast.success("管理者認証に成功しました");
            } else {
                toast.error(result.error || "パスワードが間違っています");
            }
        } catch {
            toast.error("エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    }

    if (isCheckingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (isAuthenticated && groupData) {
        return <AdminView group={groupData} onRefresh={refreshData} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-primary/20">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>管理者ログイン</CardTitle>
                    <CardDescription>
                        集計結果の閲覧には管理者パスワードが必要です
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="管理者パスワード"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="off"
                        />
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 確認中...
                                </>
                            ) : (
                                "ログイン"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
