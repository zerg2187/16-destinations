"use server";

import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { createGroupSchema, CreateGroupSchema } from "@/lib/schemas";
import { Member } from "@/types";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
}

export async function createGroup(data: CreateGroupSchema, adminUid?: string) {
    const result = createGroupSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: "入力内容に誤りがあります" };
    }

    const { name, description, groupPassword, adminPassword, questions, members } = result.data;

    try {
        // 1. Create Group Document (Public Data)
        const groupRef = adminDb.collection("groups").doc();
        const groupId = groupRef.id;

        const groupData = {
            name,
            description,
            // NO PASSWORDS HERE
            questions: questions.map((q, index) => ({ ...q, id: `q${index + 1}` })),
            members: members.map((m) => ({
                id: crypto.randomUUID(),
                name: m.name,
                status: "pending",
                // NO EDIT PASSWORD HERE
            })),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days TTL
            adminUid: adminUid || null,
        };

        await groupRef.set(groupData);

        // 2. Create Secrets Document (Private Data)
        const secretsRef = groupRef.collection("secrets").doc("admin_auth");
        await secretsRef.set({
            groupPassword, // Stored as plain text per requirements ("simple_string") - wait, requirements said simple string, but architecture doc says hash. 
            // The user's architecture doc says: "groupPasswordHash": "hash_xxxx". 
            // But the original requirement was "simple_string" for group password and hashed for admin.
            // However, to be safe and consistent with "Secrets", I should probably hash them if the architecture doc implies it.
            // The architecture doc example shows: "groupPasswordHash": "hash_xxxx".
            // BUT, the `verifyGroupPassword` logic in the prompt compares `data.groupPassword !== password`.
            // I will stick to the original logic for groupPassword (plain text) BUT put it in secrets, 
            // OR if I strictly follow the "Server-Authoritative" doc, it says "groupPasswordHash".
            // Let's look at the user's prompt again: "groupPasswordHash": "hash_xxxx".
            // Okay, I will hash the group password too for better security since we are refactoring.
            // Wait, if I hash it, I need to update verifyGroupPassword to hash the input before comparing.
            // Let's do that. It's better security.
            groupPasswordHash: hashPassword(groupPassword),
            adminPasswordHash: hashPassword(adminPassword),
        });

        return { success: true, groupId };
    } catch (error) {
        console.error("Error creating group:", error);
        return { success: false, error: "グループの作成に失敗しました" };
    }
}

// Removed client SDK imports
// import { doc, getDoc, updateDoc } from "firebase/firestore";

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



export async function getGroupData(groupId: string) {
    try {
        const docRef = adminDb.collection("groups").doc(groupId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return null;
        }

        const data = docSnap.data();
        // Return only necessary public data
        return {
            id: docSnap.id,
            name: data?.name,
            description: data?.description,
            questions: data?.questions,
            members: data?.members.map((m: Member) => ({
                id: m.id,
                name: m.name,
                status: m.status,
            })),
        };
    } catch (error) {
        console.error("Error fetching group data:", error);
        return null;
    }
}

export async function submitAnswer(
    groupId: string,
    memberId: string,
    answers: Record<string, number>,
    editPassword: string,
    idToken?: string
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
        let verifiedUid: string | null = null;
        if (idToken) {
            try {
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                verifiedUid = decodedToken.uid;
            } catch (e) {
                console.warn("Token verification failed", e);
            }
        }

        // Auth Check (Secrets)
        const memberAuthRef = groupRef.collection("secrets").doc(`member_auth_${memberId}`);
        const memberAuthSnap = await memberAuthRef.get();

        if (memberAuthSnap.exists) {
            // Existing answer/auth
            // If token matches existing authorId, allow
            if (verifiedUid && member.authorId === verifiedUid) {
                isAuthorized = true;
            } else {
                // Verify password
                const authData = memberAuthSnap.data();
                if (authData?.editPasswordHash !== hashPassword(editPassword)) {
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

            await memberAuthRef.set({
                editPasswordHash: hashPassword(editPassword),
            });

            // Set authorId if verified
            if (verifiedUid) {
                authorIdToSave = verifiedUid;
            }
            isAuthorized = true;
        }

        if (!isAuthorized) {
            return { success: false, error: "認証に失敗しました" };
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
            try {
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                if (decodedToken.uid === groupData.adminUid) {
                    isAuthorized = true;
                }
            } catch (e) {
                console.warn("Token verification failed", e);
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
            try {
                const decodedToken = await adminAuth.verifyIdToken(idToken);
                if (decodedToken.uid === member.authorId) {
                    isAuthorized = true;
                }
            } catch (e) {
                console.warn("Token verification failed", e);
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

export async function addMember(groupId: string, memberName: string) {
    try {
        const groupRef = adminDb.collection("groups").doc(groupId);
        const groupSnap = await groupRef.get();

        if (!groupSnap.exists) {
            return { success: false, error: "グループが見つかりません" };
        }

        const groupData = groupSnap.data();
        const members = groupData?.members || [];

        const newMember = {
            id: crypto.randomUUID(),
            name: memberName,
            status: "pending",
        };

        await groupRef.update({
            members: [...members, newMember],
        });
        revalidatePath(`/g/${groupId}`);

        return { success: true };
    } catch (error) {
        console.error("Error adding member:", error);
        return { success: false, error: "メンバーの追加に失敗しました" };
    }
}

export async function deleteMember(groupId: string, memberId: string) {
    try {
        const groupRef = adminDb.collection("groups").doc(groupId);
        const groupSnap = await groupRef.get();

        if (!groupSnap.exists) {
            return { success: false, error: "グループが見つかりません" };
        }

        const groupData = groupSnap.data();
        const members = groupData?.members || [];

        if (members.length <= 1) {
            return { success: false, error: "メンバーが1人のため削除できません" };
        }

        const updatedMembers = members.filter((m: Member) => m.id !== memberId);

        await groupRef.update({
            members: updatedMembers,
        });
        revalidatePath(`/g/${groupId}`);

        return { success: true };
    } catch (error) {
        console.error("Error deleting member:", error);
        return { success: false, error: "メンバーの削除に失敗しました" };
    }
}

export async function updateMemberName(groupId: string, memberId: string, newName: string) {
    try {
        const groupRef = adminDb.collection("groups").doc(groupId);
        const groupSnap = await groupRef.get();

        if (!groupSnap.exists) {
            return { success: false, error: "グループが見つかりません" };
        }

        const groupData = groupSnap.data();
        const members = groupData?.members || [];

        const updatedMembers = members.map((m: Member) => {
            if (m.id === memberId) {
                return { ...m, name: newName };
            }
            return m;
        });

        await groupRef.update({
            members: updatedMembers,
        });
        revalidatePath(`/g/${groupId}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating member name:", error);
        return { success: false, error: "名前の変更に失敗しました" };
    }
}
