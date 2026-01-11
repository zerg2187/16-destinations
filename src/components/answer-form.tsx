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
import { Loader2, User, MessageCircle, Lock, ArrowRight, ArrowLeft } from "lucide-react";

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
    initialAnswers?: Record<string, number>;
    initialEditPassword?: string;
}

export function AnswerForm({ groupId, memberId, memberName, questions, initialAnswers = {}, initialEditPassword = "" }: AnswerFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<AnswerSchema>({
        resolver: zodResolver(answerSchema),
        defaultValues: {
            answers: initialAnswers,
            editPassword: initialEditPassword,
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
            <div className="space-y-4 text-center">
                <div className="flex justify-start">
                    <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                        <a href={`/g/${groupId}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> グループページに戻る
                        </a>
                    </Button>
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                        <span className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                            <User className="w-6 h-6" />
                        </span>
                        {memberName} さんの回答
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        直感で答えてください。考えすぎないのがコツです。
                    </p>
                </div>
            </div>

            <Card className="border-l-4 border-l-purple-400 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                            <MessageCircle className="w-5 h-5" />
                        </span>
                        価値観の質問
                    </CardTitle>
                </CardHeader>
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

            <Card className="border-l-4 border-l-orange-400 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <span className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                            <Lock className="w-5 h-5" />
                        </span>
                        送信前の確認
                    </CardTitle>
                    <CardDescription>
                        回答を後で修正するために、6桁の数字パスワードを設定（または入力）してください。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="editPassword">編集用パスワード (6桁の数字)</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="editPassword"
                                type="password"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="（数字6桁）"
                                {...form.register("editPassword")}
                                className="pl-9 text-center text-lg tracking-widest placeholder:text-muted-foreground/50 placeholder:tracking-normal"
                                autoComplete="off"
                            />
                        </div>
                        {form.formState.errors.editPassword && (
                            <p className="text-sm font-bold text-red-500 flex items-center gap-1">
                                <span>⚠️</span> {form.formState.errors.editPassword.message}
                            </p>
                        )}
                    </div>
                    <Button
                        type="submit"
                        className="w-full text-lg h-14 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold rounded-xl transform hover:-translate-y-1"
                        size="lg"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-6 w-6 animate-spin" /> 送信中...
                            </>
                        ) : (
                            <>
                                回答を送信する <ArrowRight className="ml-2 h-6 w-6" />
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </form>
    );
}
