"use client";

import { useState, useCallback } from "react";
import { verifyAdminPassword } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { AuthCard, AuthLoadingSpinner } from "@/components/auth-card";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AdminView } from "@/components/admin-view";
import { Group } from "@/types";
import { useAutoAuth } from "@/hooks/useAutoAuth";

interface AdminGateProps {
    groupId: string;
}

export function AdminGate({ groupId }: AdminGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [groupData, setGroupData] = useState<Group | null>(null);

    const handleAutoAuthSuccess = useCallback((data: Group) => {
        setGroupData(data);
        setIsAuthenticated(true);
        toast.success("管理者として自動認証されました");
    }, []);

    const verifyFn = useCallback(async (token: string) => {
        const result = await verifyAdminPassword(groupId, "", token);
        if (result.success && result.group) {
            return { success: true, data: result.group as Group };
        }
        return { success: false };
    }, [groupId]);

    const { isCheckingAuth } = useAutoAuth({ verifyFn, onSuccess: handleAutoAuthSuccess });

    const refreshData = useCallback(async () => {
        if (!password && !isAuthenticated) return;

        const { auth } = await import("@/lib/firebase");
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
    }, [groupId, password, isAuthenticated]);

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
        return <AuthLoadingSpinner />;
    }

    if (isAuthenticated && groupData) {
        return <AdminView group={groupData} onRefresh={refreshData} />;
    }

    return (
        <AuthCard
            icon={ShieldCheck}
            title="管理者ログイン"
            description="集計結果の閲覧には管理者パスワードが必要です"
            onSubmit={handleSubmit}
            isLoading={isLoading}
            buttonText="ログイン"
            backLink={`/g/${groupId}`}
            backText="グループページに戻る"
        >
            <div className="space-y-2">
                <Input
                    type="password"
                    placeholder="管理者パスワード"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-center text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:tracking-normal"
                    autoComplete="off"
                />
            </div>
        </AuthCard>
    );
}
