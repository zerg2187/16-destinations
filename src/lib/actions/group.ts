"use server";

import { adminDb } from "@/lib/firebase-admin";
import { createGroupSchema, CreateGroupSchema } from "@/lib/schemas";
import { Member } from "@/types";
import { hashPassword } from "./helpers";
import crypto from "crypto";

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
            // Stored as hash for security
            groupPasswordHash: hashPassword(groupPassword),
            adminPasswordHash: hashPassword(adminPassword),
        });

        return { success: true, groupId };
    } catch (error) {
        console.error("Error creating group:", error);
        return { success: false, error: "グループの作成に失敗しました" };
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
