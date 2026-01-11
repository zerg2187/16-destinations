"use client";

import { useState } from "react";
import { verifyEditPassword } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface EditPasswordGateProps {
    groupId: string;
    memberId: string;
    memberName: string;
    onVerified: (answers: Record<string, number>, password: string) => void;
}

import { auth } from "@/lib/firebase";
import { useEffect } from "react";

export function EditPasswordGate({ groupId, memberId, memberName, onVerified }: EditPasswordGateProps) {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const user = auth.currentUser;
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const result = await verifyEditPassword(groupId, memberId, "", token);
                    if (result.success && result.answers) {
                        toast.success("自動認証されました");
                        // Pass dummy password since we bypassed it with token
                        onVerified(result.answers, "000000");
                    }
                } catch (e) {
                    console.error("Auto-auth failed", e);
                }
            }
            setIsCheckingAuth(false);
        };

        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                await checkAuth();
            } else {
                setIsCheckingAuth(false);
            }
        });
        return () => unsubscribe();
    }, [groupId, memberId, onVerified]);

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
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-4">
                <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                    <Link href={`/g/${groupId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> グループページに戻る
                    </Link>
                </Button>

                <Card className="border-l-4 border-l-orange-400 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-6 h-6 text-orange-600" />
                        </div>
                        <CardTitle>再回答にはパスワードが必要です</CardTitle>
                        <CardDescription>
                            {memberName} さんの回答を修正するには、<br />
                            設定した6桁の編集用パスワードを入力してください。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                    "認証して編集する"
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
