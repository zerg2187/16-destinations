"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupSchema, CreateGroupSchema } from "@/lib/schemas";
import { createGroup } from "@/lib/actions";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Map, Type, Lock, User, MessageCircle, ArrowRight } from "lucide-react";

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
            const adminUid = auth.currentUser?.uid;
            const result = await createGroup(data, adminUid);
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
            <div className="text-center space-y-4 mb-8">
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center">
                    <Map className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">新しい旅グループを作成</h1>
                    <p className="text-muted-foreground max-w-lg mx-auto">
                        グループ名とメンバー、価値観を測る質問を設定して、<br />
                        みんなが楽しめる旅行を計画しましょう。
                    </p>
                </div>
            </div>

            <Card className="border-l-4 border-l-orange-400 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <span className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                            <Type className="w-5 h-5" />
                        </span>
                        基本情報
                    </CardTitle>
                    <CardDescription>グループの基本設定とセキュリティ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="flex items-center gap-1">
                            グループ名 <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Type className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="name"
                                {...form.register("name")}
                                placeholder="例: 2024夏 沖縄旅行"
                                className={`pl-9 placeholder:text-muted-foreground/30 ${form.formState.errors.name ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                            />
                        </div>
                        {form.formState.errors.name && (
                            <p className="text-sm font-bold text-red-500 flex items-center gap-1">
                                <span>⚠️</span> {form.formState.errors.name.message}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">説明 (任意)</Label>
                        <div className="relative">
                            <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="description"
                                {...form.register("description")}
                                placeholder="例: 3泊4日の卒業旅行！"
                                className="pl-9 placeholder:text-muted-foreground/30"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="groupPassword" className="flex items-center gap-1">
                                グループパスワード <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="groupPassword"
                                    {...form.register("groupPassword")}
                                    placeholder="（任意の文字列）"
                                    autoComplete="off"
                                    className={`pl-9 placeholder:text-muted-foreground/50 ${form.formState.errors.groupPassword ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">メンバーがアクセスする際に必要です</p>
                            {form.formState.errors.groupPassword && (
                                <p className="text-sm font-bold text-red-500 flex items-center gap-1">
                                    <span>⚠️</span> {form.formState.errors.groupPassword.message}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="adminPassword" className="flex items-center gap-1">
                                管理者パスワード <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="adminPassword"
                                    {...form.register("adminPassword")}
                                    placeholder="（任意の文字列）"
                                    type="password"
                                    autoComplete="off"
                                    className={`pl-9 placeholder:text-muted-foreground/50 ${form.formState.errors.adminPassword ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">結果の閲覧や編集に必要です</p>
                            {form.formState.errors.adminPassword && (
                                <p className="text-sm font-bold text-red-500 flex items-center gap-1">
                                    <span>⚠️</span> {form.formState.errors.adminPassword.message}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-400 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <span className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                            <User className="w-5 h-5" />
                        </span>
                        メンバー
                    </CardTitle>
                    <CardDescription>参加するメンバーの名前を登録してください</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {memberFields.map((field, index) => (
                        <div key={field.id} className="space-y-1">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        {...form.register(`members.${index}.name`)}
                                        placeholder={`メンバー ${index + 1}`}
                                        className={`pl-9 placeholder:text-muted-foreground/30 ${form.formState.errors.members?.[index]?.name ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeMember(index)}
                                    disabled={memberFields.length <= 1}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            {form.formState.errors.members?.[index]?.name && (
                                <p className="text-xs font-bold text-red-500 flex items-center gap-1 pl-1">
                                    <span>⚠️</span> {form.formState.errors.members[index]?.name?.message}
                                </p>
                            )}
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendMember({ name: "" })}
                        className="w-full border-dashed border-2 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                    >
                        <Plus className="h-4 w-4 mr-2" /> メンバーを追加
                    </Button>
                    {form.formState.errors.members && !Array.isArray(form.formState.errors.members) && (
                        <p className="text-sm font-bold text-red-500 flex items-center gap-1">
                            <span>⚠️</span> {form.formState.errors.members.message}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-400 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                            <MessageCircle className="w-5 h-5" />
                        </span>
                        価値観の質問
                    </CardTitle>
                    <CardDescription>
                        7段階で答えてもらう質問を設定します。左と右に対立する概念を入力してください。
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {questionFields.map((field, index) => (
                        <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex justify-between items-center">
                                <Label className="text-base font-semibold text-purple-700">質問 {index + 1}</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeQuestion(index)}
                                    disabled={questionFields.length <= 1}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <Input
                                    {...form.register(`questions.${index}.text`)}
                                    placeholder="質問内容 (例: 旅行のペースは？)"
                                    className={`border-purple-200 focus-visible:ring-purple-400 placeholder:text-muted-foreground/30 ${form.formState.errors.questions?.[index]?.text ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                                />
                                {form.formState.errors.questions?.[index]?.text && (
                                    <p className="text-xs font-bold text-red-500 flex items-center gap-1 pl-1">
                                        <span>⚠️</span> {form.formState.errors.questions[index]?.text?.message}
                                    </p>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-2 items-start">
                                <div className="space-y-1">
                                    <div className="relative flex-1">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-green-400" />
                                        <Input
                                            {...form.register(`questions.${index}.leftLabel`)}
                                            placeholder="左: ゆったり"
                                            className={`text-right pl-8 placeholder:text-muted-foreground/30 ${form.formState.errors.questions?.[index]?.leftLabel ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                                        />
                                    </div>
                                    {form.formState.errors.questions?.[index]?.leftLabel && (
                                        <p className="text-xs font-bold text-red-500 flex items-center gap-1 pl-1">
                                            <span>⚠️</span> {form.formState.errors.questions[index]?.leftLabel?.message}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="relative flex-1">
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400" />
                                        <Input
                                            {...form.register(`questions.${index}.rightLabel`)}
                                            placeholder="右: 詰め込み"
                                            className={`pr-8 placeholder:text-muted-foreground/30 ${form.formState.errors.questions?.[index]?.rightLabel ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""}`}
                                        />
                                    </div>
                                    {form.formState.errors.questions?.[index]?.rightLabel && (
                                        <p className="text-xs font-bold text-red-500 flex items-center gap-1 pl-1">
                                            <span>⚠️</span> {form.formState.errors.questions[index]?.rightLabel?.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendQuestion({ text: "", leftLabel: "", rightLabel: "" })}
                        className="w-full border-dashed border-2 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50"
                    >
                        <Plus className="h-4 w-4 mr-2" /> 質問を追加
                    </Button>
                    {form.formState.errors.questions && !Array.isArray(form.formState.errors.questions) && (
                        <p className="text-sm font-bold text-red-500 flex items-center gap-1">
                            <span>⚠️</span> {form.formState.errors.questions.message}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Button
                type="submit"
                className="w-full text-lg h-14 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold rounded-xl transform hover:-translate-y-1"
                size="lg"
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> 作成中...
                    </>
                ) : (
                    <>
                        グループを作成して開始 <ArrowRight className="ml-2 h-6 w-6" />
                    </>
                )}
            </Button>
        </form>
    );
}
