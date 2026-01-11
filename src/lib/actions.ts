"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { createGroupSchema, CreateGroupSchema } from "@/lib/schemas";
import { Member } from "@/types";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

function hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
}

export async function createGroup(data: CreateGroupSchema) {
    const result = createGroupSchema.safeParse(data);

    if (!result.success) {
        return { success: false, error: "入力内容に誤りがあります" };
    }

    const { name, description, groupPassword, adminPassword, questions, members } = result.data;

    try {
        const docRef = await addDoc(collection(db, "groups"), {
            name,
            description,
            groupPassword, // Stored as plain text per requirements ("simple_string")
            adminPassword: hashPassword(adminPassword),
            questions: questions.map((q, index) => ({ ...q, id: `q${index + 1}` })),
            members: members.map((m) => ({
                id: crypto.randomUUID(),
                name: m.name,
                status: "pending",
                editPassword: "", // Will be set when they answer
            })),
            createdAt: new Date().toISOString(),
        });

        return { success: true, groupId: docRef.id };
    } catch (error) {
        console.error("Error creating group:", error);
        return { success: false, error: "グループの作成に失敗しました" };
    }
}

import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function verifyGroupPassword(groupId: string, password: string) {
    try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: "グループが見つかりません" };
        }

        const data = docSnap.data();
        if (data.groupPassword !== password) {
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
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        // Return only necessary public data
        return {
            id: docSnap.id,
            name: data.name,
            description: data.description,
            questions: data.questions,
            members: data.members.map((m: Member) => ({
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
    editPassword: string
) {
    try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: "グループが見つかりません" };
        }

        const groupData = docSnap.data();
        const members = groupData.members || [];
        const memberIndex = members.findIndex((m: Member) => m.id === memberId);

        if (memberIndex === -1) {
            return { success: false, error: "メンバーが見つかりません" };
        }

        const member = members[memberIndex];

        // Check password if already set
        if (member.editPassword && member.editPassword !== hashPassword(editPassword)) {
            return { success: false, error: "編集用パスワードが間違っています" };
        }

        // Update member status and password (if not set)
        members[memberIndex] = {
            ...member,
            status: "completed",
            editPassword: member.editPassword || hashPassword(editPassword),
            answers, // Store answers directly on the member object for simplicity in this schema
            updatedAt: new Date().toISOString(),
        };

        await updateDoc(docRef, { members });
        revalidatePath(`/g/${groupId}`);

        return { success: true };
    } catch (error) {
        console.error("Error submitting answer:", error);
        return { success: false, error: "回答の送信に失敗しました" };
    }
}

export async function verifyAdminPassword(groupId: string, password: string) {
    try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: "グループが見つかりません" };
        }

        const data = docSnap.data();
        if (data.adminPassword !== hashPassword(password)) {
            return { success: false, error: "パスワードが間違っています" };
        }

        return { success: true };
    } catch (error) {
        console.error("Error verifying admin password:", error);
        return { success: false, error: "エラーが発生しました" };
    }
}

export async function getAdminGroupData(groupId: string) {
    try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return null;
        }

        const data = docSnap.data();
        // Return ALL data for admin
        return {
            id: docSnap.id,
            name: data.name,
            description: data.description,
            questions: data.questions,
            members: data.members as Member[], // Includes answers and editPasswords
        };
    } catch (error) {
        console.error("Error fetching admin group data:", error);
        return null;
    }
}

export async function verifyEditPassword(groupId: string, memberId: string, password: string) {
    try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: "グループが見つかりません" };
        }

        const groupData = docSnap.data();
        const members = groupData.members || [];
        const member = members.find((m: Member) => m.id === memberId);

        if (!member) {
            return { success: false, error: "メンバーが見つかりません" };
        }

        if (member.editPassword !== hashPassword(password)) {
            return { success: false, error: "パスワードが間違っています" };
        }

        return { success: true, answers: member.answers || {} };
    } catch (error) {
        console.error("Error verifying edit password:", error);
        return { success: false, error: "エラーが発生しました" };
    }
}

export async function addMember(groupId: string, memberName: string) {
    try {
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: "グループが見つかりません" };
        }

        const groupData = docSnap.data();
        const members = groupData.members || [];

        const newMember = {
            id: crypto.randomUUID(),
            name: memberName,
            status: "pending",
            editPassword: "",
        };

        await updateDoc(docRef, {
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
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: "グループが見つかりません" };
        }

        const groupData = docSnap.data();
        const members = groupData.members || [];

        if (members.length <= 1) {
            return { success: false, error: "メンバーが1人のため削除できません" };
        }

        const updatedMembers = members.filter((m: Member) => m.id !== memberId);

        await updateDoc(docRef, {
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
        const docRef = doc(db, "groups", groupId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return { success: false, error: "グループが見つかりません" };
        }

        const groupData = docSnap.data();
        const members = groupData.members || [];

        const updatedMembers = members.map((m: Member) => {
            if (m.id === memberId) {
                return { ...m, name: newName };
            }
            return m;
        });

        await updateDoc(docRef, {
            members: updatedMembers,
        });
        revalidatePath(`/g/${groupId}`);

        return { success: true };
    } catch (error) {
        console.error("Error updating member name:", error);
        return { success: false, error: "名前の変更に失敗しました" };
    }
}
