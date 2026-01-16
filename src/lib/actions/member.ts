"use server";

import { adminDb } from "@/lib/firebase-admin";
import { Member } from "@/types";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

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
