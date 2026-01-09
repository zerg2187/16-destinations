import { z } from "zod";

export const questionSchema = z.object({
    text: z.string().min(1, "質問内容は必須です"),
    leftLabel: z.string().min(1, "左側のラベルは必須です"),
    rightLabel: z.string().min(1, "右側のラベルは必須です"),
});

export const memberSchema = z.object({
    name: z.string().min(1, "メンバー名は必須です"),
});

export const createGroupSchema = z.object({
    name: z.string().min(1, "グループ名は必須です"),
    description: z.string().optional(),
    groupPassword: z.string().min(4, "グループパスワードは4文字以上で入力してください"),
    adminPassword: z.string().min(6, "管理者パスワードは6文字以上で入力してください"),
    questions: z
        .array(questionSchema)
        .min(1, "少なくとも1つの質問が必要です")
        .max(50, "質問は最大50個までです"),
    members: z
        .array(memberSchema)
        .min(1, "少なくとも1人のメンバーが必要です"),
});

export type CreateGroupSchema = z.infer<typeof createGroupSchema>;

export const answerSchema = z.object({
    answers: z.record(z.string(), z.number().min(1).max(7)),
    editPassword: z.string().regex(/^\d{6}$/, "パスワードは6桁の数字で入力してください"),
});

export type AnswerSchema = z.infer<typeof answerSchema>;
