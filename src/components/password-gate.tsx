"use client";

import { useState, useEffect } from "react";
import { verifyGroupPassword } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PasswordGateProps {
    groupId: string;
    children: React.ReactNode;
}

export function PasswordGate({ groupId, children }: PasswordGateProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    // Check session storage on mount
    useEffect(() => {
        const storedAuth = sessionStorage.getItem(`travel-app-auth-${groupId}`);
        if (storedAuth === "true") {
            setIsAuthenticated(true);
        }
        setIsChecking(false);
    }, [groupId]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await verifyGroupPassword(groupId, password);
            if (result.success) {
                setIsAuthenticated(true);
                sessionStorage.setItem(`travel-app-auth-${groupId}`, "true");
                toast.success("認証に成功しました");
            } else {
                toast.error(result.error || "パスワードが間違っています");
            }
        } catch {
            toast.error("エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    }

    if (isChecking) {
        return null;
    }

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-l-4 border-l-orange-400 shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-orange-600" />
                    </div>
                    <CardTitle>グループパスワードを入力</CardTitle>
                    <CardDescription>
                        このグループにアクセスするにはパスワードが必要です
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="パスワード"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="text-center text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:tracking-normal"
                                autoComplete="off"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold shadow-md"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 確認中...
                                </>
                            ) : (
                                "アクセスする"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
