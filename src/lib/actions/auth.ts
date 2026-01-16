"use server";

import { adminDb } from "@/lib/firebase-admin";
import { Member } from "@/types";
import { hashPassword, verifyToken } from "./helpers";

export async function verifyGroupPassword(groupId: string, password: string) {
    try {
        const secretsRef = adminDb.collection("groups").doc(groupId).collection("secrets").doc("admin_auth");
        const secretsSnap = await secretsRef.get();

        if (!secretsSnap.exists) {
            return { success: false, error: "グループが見つかりません" };
        }

        const data = secretsSnap.data();
        if (data?.groupPasswordHash !== hashPassword(password)) {
            return { success: false, error: "パスワードが間違っています" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error verifying password:", error);
        return { success: false, error: "エラーが発生しました" };
    }
}

export async function verifyAdminPassword(groupId: string, password?: string, idToken?: string) {
    try {
        const groupRef = adminDb.collection("groups").doc(groupId);

        // 1. Fetch public group data first to check adminUid
        const groupSnap = await groupRef.get();
        if (!groupSnap.exists) {
            return { success: false, error: "グループが見つかりません" };
        }
        const groupData = groupSnap.data();

        let isAuthorized = false;

        // 2. Try Token Authentication
        if (idToken && groupData?.adminUid) {
            const verifiedUid = await verifyToken(idToken);
            if (verifiedUid === groupData.adminUid) {
                isAuthorized = true;
            }
        }

        // 3. Try Password Authentication (if not already authorized)
        if (!isAuthorized) {
            if (!password) {
                return { success: false, error: "パスワードが必要です" };
            }
            const secretsRef = groupRef.collection("secrets").doc("admin_auth");
            const secretsSnap = await secretsRef.get();
            const secretsData = secretsSnap.data();

            if (secretsData?.adminPasswordHash === hashPassword(password)) {
                isAuthorized = true;
            } else {
                return { success: false, error: "パスワードが間違っています" };
            }
        }

        // Authorized! Fetch all data.
        const members = (groupData?.members || []) as Member[];

        // Fetch answers from subcollection
        const answersSnap = await groupRef.collection("answers").get();
        const answersMap = new Map();
        answersSnap.forEach((doc) => {
            answersMap.set(doc.id, doc.data().values);
        });

        // Merge answers into members
        const membersWithAnswers = members.map((m) => ({
            ...m,
            answers: answersMap.get(m.id) || {},
        }));

        const fullGroupData = {
            id: groupSnap.id,
            name: groupData?.name,
            description: groupData?.description,
            questions: groupData?.questions,
            members: membersWithAnswers,
            adminUid: groupData?.adminUid,
            createdAt: groupData?.createdAt,
            expiresAt: groupData?.expiresAt,
        };

        return { success: true, group: fullGroupData };
    } catch (error) {
        console.error("Error verifying admin password:", error);
        return { success: false, error: "エラーが発生しました" };
    }
}

export async function verifyEditPassword(groupId: string, memberId: string, password?: string, idToken?: string) {
    try {
        const groupRef = adminDb.collection("groups").doc(groupId);

        // 1. Fetch public group data to check authorId
        const groupSnap = await groupRef.get();
        if (!groupSnap.exists) {
            return { success: false, error: "グループが見つかりません" };
        }
        const groupData = groupSnap.data();
        const members = (groupData?.members || []) as Member[];
        const member = members.find((m) => m.id === memberId);

        if (!member) {
            return { success: false, error: "メンバーが見つかりません" };
        }

        let isAuthorized = false;

        // 2. Try Token Authentication
        if (idToken && member.authorId) {
            const verifiedUid = await verifyToken(idToken);
            if (verifiedUid === member.authorId) {
                isAuthorized = true;
            }
        }

        // 3. Try Password Authentication
        if (!isAuthorized) {
            if (!password) {
                return { success: false, error: "パスワードが必要です" };
            }
            const authDocRef = groupRef.collection("secrets").doc(`member_auth_${memberId}`);
            const authDocSnap = await authDocRef.get();

            if (authDocSnap.exists) {
                const authData = authDocSnap.data();
                if (authData?.editPasswordHash === hashPassword(password)) {
                    isAuthorized = true;
                } else {
                    return { success: false, error: "パスワードが間違っています" };
                }
            } else {
                // If no auth doc exists (legacy or error), fail safe
                return { success: false, error: "認証データが見つかりません" };
            }
        }

        // Authorized! Fetch answers.
        const answerDocRef = groupRef.collection("answers").doc(memberId);
        const answerDocSnap = await answerDocRef.get();
        const currentAnswers = answerDocSnap.exists ? answerDocSnap.data()?.values : {};

        return { success: true, answers: currentAnswers };
    } catch (error) {
        console.error("Error verifying edit password:", error);
        return { success: false, error: "エラーが発生しました" };
    }
}
