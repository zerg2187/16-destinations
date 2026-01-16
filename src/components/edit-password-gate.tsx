"use client";

import { useState, useCallback } from "react";
import { verifyEditPassword } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { AuthCard, AuthLoadingSpinner } from "@/components/auth-card";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { useAutoAuth } from "@/hooks/useAutoAuth";

interface EditPasswordGateProps {
    groupId: string;
    memberId: string;
    memberName: string;
    onVerified: (answers: Record<string, number>, password: string) => void;
}

export function EditPasswordGate({ groupId, memberId, memberName, onVerified }: EditPasswordGateProps) {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleAutoAuthSuccess = useCallback((answers: Record<string, number>) => {
        toast.success("自動認証されました");
        // Pass dummy password since we bypassed it with token
        onVerified(answers, "000000");
    }, [onVerified]);

    const verifyFn = useCallback(async (token: string) => {
        const result = await verifyEditPassword(groupId, memberId, "", token);
        if (result.success && result.answers) {
            return { success: true, data: result.answers as Record<string, number> };
        }
        return { success: false };
    }, [groupId, memberId]);

    const { isCheckingAuth } = useAutoAuth({ verifyFn, onSuccess: handleAutoAuthSuccess });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await verifyEditPassword(groupId, memberId, password);
            if (result.success && result.answers) {
                toast.success("認証に成功しました");
                onVerified(result.answers, password);
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

    return (
        <AuthCard
            icon={Lock}
            title="再回答にはパスワードが必要です"
            description={`${memberName} さんの回答を修正するには、設定した6桁の編集用パスワードを入力してください。`}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            buttonText="認証して編集する"
            backLink={`/g/${groupId}`}
            backText="グループページに戻る"
        >
            <div className="space-y-2">
                <Input
                    type="password"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="（数字6桁）"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-center text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:tracking-normal"
                    autoComplete="off"
                />
            </div>
        </AuthCard>
    );
}
