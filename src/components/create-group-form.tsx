"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupSchema, CreateGroupSchema } from "@/lib/schemas";
import { createGroup } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Loader2 } from "lucide-react";

export function CreateGroupForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateGroupSchema>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            name: "",
            description: "",
            groupPassword: "",
            adminPassword: "",
            questions: [
                { text: "インドア派？アウトドア派？", leftLabel: "インドア", rightLabel: "アウトドア" },
                { text: "朝型？夜型？", leftLabel: "朝型", rightLabel: "夜型" },
                { text: "計画的？行き当たりばったり？", leftLabel: "計画的", rightLabel: "即興" },
            ],
            members: [{ name: "" }, { name: "" }, { name: "" }],
        },
    });

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control: form.control,
        name: "questions",
    });

    const { fields: memberFields, append: appendMember, remove: removeMember } = useFieldArray({
        control: form.control,
        name: "members",
    });

    async function onSubmit(data: CreateGroupSchema) {
        setIsSubmitting(true);
        try {
            const result = await createGroup(data);
            if (result.success) {
                toast.success("グループを作成しました！");
                router.push(`/g/${result.groupId}`);
            } else {
                toast.error(result.error || "エラーが発生しました");
            }
        } catch {
            toast.error("予期せぬエラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-3xl mx-auto py-10 px-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-primary">新しい旅グループを作成</h1>
                <p className="text-muted-foreground">
                    グループ名とメンバー、価値観を測る質問を設定しましょう。
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>基本情報</CardTitle>
                    <CardDescription>グループの基本設定とセキュリティ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">グループ名</Label>
                        <Input id="name" {...form.register("name")} placeholder="例: 2024夏 沖縄旅行" />
                        {form.formState.errors.name && (
                            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">説明 (任意)</Label>
                        <Input id="description" {...form.register("description")} placeholder="例: 3泊4日の卒業旅行！" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="groupPassword">グループパスワード</Label>
                            <Input
                                id="groupPassword"
                                {...form.register("groupPassword")}
                                placeholder="メンバー共有用"
                                autoComplete="off"
                            />
                            <p className="text-xs text-muted-foreground">メンバーがアクセスする際に必要です</p>
                            {form.formState.errors.groupPassword && (
                                <p className="text-sm text-destructive">{form.formState.errors.groupPassword.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adminPassword">管理者パスワード</Label>
                            <Input
                                id="adminPassword"
                                {...form.register("adminPassword")}
                                placeholder="管理者用"
                                type="password"
                                autoComplete="off"
                            />
                            <p className="text-xs text-muted-foreground">結果の閲覧や編集に必要です</p>
                            {form.formState.errors.adminPassword && (
                                <p className="text-sm text-destructive">{form.formState.errors.adminPassword.message}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>メンバー</CardTitle>
                    <CardDescription>参加するメンバーの名前を登録してください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {memberFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <Input
                                {...form.register(`members.${index}.name`)}
                                placeholder={`メンバー ${index + 1}`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeMember(index)}
                                disabled={memberFields.length <= 1}
                            >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendMember({ name: "" })}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" /> メンバーを追加
                    </Button>
                    {form.formState.errors.members && (
                        <p className="text-sm text-destructive">{form.formState.errors.members.message}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>価値観の質問</CardTitle>
                    <CardDescription>
                        7段階で答えてもらう質問を設定します。左と右に対立する概念を入力してください。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {questionFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                            <div className="flex justify-between items-center">
                                <Label>質問 {index + 1}</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeQuestion(index)}
                                    disabled={questionFields.length <= 1}
                                >
                                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </div>
                            <div className="space-y-2">
                                <Input
                                    {...form.register(`questions.${index}.text`)}
                                    placeholder="質問内容 (例: 旅行のペースは？)"
                                />
                            </div>
                            <div className="flex gap-2 items-center">
                                <Input
                                    {...form.register(`questions.${index}.leftLabel`)}
                                    placeholder="左: ゆったり"
                                    className="text-right"
                                />
                                <span className="text-xs text-muted-foreground whitespace-nowrap">vs</span>
                                <Input
                                    {...form.register(`questions.${index}.rightLabel`)}
                                    placeholder="右: 詰め込み"
                                />
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendQuestion({ text: "", leftLabel: "", rightLabel: "" })}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" /> 質問を追加
                    </Button>
                    {form.formState.errors.questions && (
                        <p className="text-sm text-destructive">{form.formState.errors.questions.message}</p>
                    )}
                </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 作成中...
                    </>
                ) : (
                    "グループを作成して開始"
                )}
            </Button>
        </form>
    );
}
