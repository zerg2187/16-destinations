"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { answerSchema, AnswerSchema } from "@/lib/schemas";
import { submitAnswer } from "@/lib/actions";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface AnswerFormProps {
    groupId: string;
    memberId: string;
    memberName: string;
    questions: {
        id: string;
        text: string;
        leftLabel: string;
        rightLabel: string;
    }[];
}

export function AnswerForm({ groupId, memberId, memberName, questions }: AnswerFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AnswerSchema>({
        resolver: zodResolver(answerSchema),
        defaultValues: {
            answers: {},
            editPassword: "",
        },
    });

    async function onSubmit(data: AnswerSchema) {
        // Validate that all questions are answered
        const answeredCount = Object.keys(data.answers).length;
        if (answeredCount < questions.length) {
            toast.error("すべての質問に回答してください");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await submitAnswer(groupId, memberId, data.answers, data.editPassword);
            if (result.success) {
                toast.success("回答を送信しました！");
                router.push(`/g/${groupId}`);
            } else {
                toast.error(result.error || "送信に失敗しました");
            }
        } catch {
            toast.error("予期せぬエラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto py-10 px-4">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold text-primary">{memberName} さんの回答</h1>
                <p className="text-muted-foreground">
                    直感で答えてください。考えすぎないのがコツです。
                </p>
            </div>

            <Card>
                <CardContent className="divide-y">
                    {questions.map((q) => (
                        <Controller
                            key={q.id}
                            control={form.control}
                            name={`answers.${q.id}`}
                            render={({ field }) => (
                                <QuestionCard
                                    question={q}
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>送信前の確認</CardTitle>
                    <CardDescription>
                        回答を後で修正するために、6桁の数字パスワードを設定（または入力）してください。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="editPassword">編集用パスワード (6桁の数字)</Label>
                        <Input
                            id="editPassword"
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            {...form.register("editPassword")}
                            className="text-center text-lg tracking-widest"
                            autoComplete="off"
                        />
                        {form.formState.errors.editPassword && (
                            <p className="text-sm text-destructive">{form.formState.errors.editPassword.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 送信中...
                            </>
                        ) : (
                            "回答を送信する"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
