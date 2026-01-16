"use server";

import { adminDb } from "@/lib/firebase-admin";
import { Member } from "@/types";
import { revalidatePath } from "next/cache";
import { hashPassword, verifyToken } from "./helpers";

export async function submitAnswer(
    groupId: string,
    memberId: string,
    answers: Record<string, number>,
    editPassword: string,
    idToken?: string,
    currentPassword?: string // Added for verification when changing password
) {
    try {
        const groupRef = adminDb.collection("groups").doc(groupId);
        const groupSnap = await groupRef.get();

        if (!groupSnap.exists) {
            return { success: false, error: "グループが見つかりません" };
        }

        const groupData = groupSnap.data();
        const members = groupData?.members || [];
        const memberIndex = members.findIndex((m: Member) => m.id === memberId);

        if (memberIndex === -1) {
            return { success: false, error: "メンバーが見つかりません" };
        }

        const member = members[memberIndex];
        let authorIdToSave = member.authorId || null;
        let isAuthorized = false;

        // 1. Verify Token if provided
        const verifiedUid = await verifyToken(idToken);

        // Auth Check (Secrets)
        const memberAuthRef = groupRef.collection("secrets").doc(`member_auth_${memberId}`);
        const memberAuthSnap = await memberAuthRef.get();

        if (memberAuthSnap.exists) {
            // Existing answer/auth
            // If token matches existing authorId, allow
            if (verifiedUid && member.authorId === verifiedUid) {
                isAuthorized = true;
            } else {
                // Verify password using currentPassword (proof) or editPassword (if not changing)
                // If currentPassword is provided, use it. Otherwise use editPassword (legacy behavior)
                const passwordToVerify = currentPassword || editPassword;
                const authData = memberAuthSnap.data();
                if (authData?.editPasswordHash !== hashPassword(passwordToVerify)) {
                    return { success: false, error: "編集用パスワードが間違っています" };
                }
                isAuthorized = true;
            }
        } else {
            // First time submission
            // Password is REQUIRED for first time to set it up
            if (!editPassword) {
                return { success: false, error: "パスワードを設定してください" };
            }
            isAuthorized = true;
        }

        if (!isAuthorized) {
            return { success: false, error: "認証に失敗しました" };
        }

        // Update Password Hash if authorized (Always update to the new editPassword)
        // This allows changing the password
        await memberAuthRef.set({
            editPasswordHash: hashPassword(editPassword),
        }, { merge: true });

        // Set authorId if verified and not set (or update it?)
        // Usually we keep the original authorId, but if it was null, we set it.
        if (verifiedUid && !authorIdToSave) {
            authorIdToSave = verifiedUid;
        }

        // Save Answer (Subcollection)
        const answerRef = groupRef.collection("answers").doc(memberId);
        await answerRef.set({
            uid: authorIdToSave,
            values: answers,
            updatedAt: new Date().toISOString(),
        });

        // Update Member Status (Public Doc)
        members[memberIndex] = {
            ...member,
            status: "completed",
            updatedAt: new Date().toISOString(),
            authorId: authorIdToSave,
        };

        await groupRef.update({ members });
        revalidatePath(`/g/${groupId}`);

        return { success: true };
    } catch (error) {
        console.error("Error submitting answer:", error);
        return { success: false, error: "回答の送信に失敗しました" };
    }
}
