import { getGroupData } from "@/lib/actions";
import { PasswordGate } from "@/components/password-gate";
import { GroupView } from "@/components/group-view";
import { notFound } from "next/navigation";

import { Metadata } from "next";

interface PageProps {
    params: Promise<{ groupId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { groupId } = await params;
    const group = await getGroupData(groupId);

    if (!group) {
        return {
            title: "グループが見つかりません",
        };
    }

    return {
        title: group.name,
        description: group.description || "MBTI診断みたいなノリで、旅行の方向性を決めるアンケートを作れるメーカーです。",
        openGraph: {
            title: group.name,
            description: group.description || "MBTI診断みたいなノリで、旅行の方向性を決めるアンケートを作れるメーカーです。",
        },
    };
}

export default async function GroupPage({ params }: PageProps) {
    const { groupId } = await params;
    const group = await getGroupData(groupId);

    if (!group) {
        notFound();
    }

    return (
        <PasswordGate groupId={groupId}>
            <GroupView group={group} />
        </PasswordGate>
    );
}
