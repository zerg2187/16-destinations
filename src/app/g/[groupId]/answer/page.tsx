import { getGroupData } from "@/lib/actions";
import { AnswerPageClient } from "@/components/answer-page-client";
import { notFound, redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ groupId: string }>;
    searchParams: Promise<{ memberId?: string }>;
}

export default async function AnswerPage({ params, searchParams }: PageProps) {
    const { groupId } = await params;
    const { memberId } = await searchParams;

    if (!memberId) {
        redirect(`/g/${groupId}`);
    }

    const group = await getGroupData(groupId);

    if (!group) {
        notFound();
    }

    const member = group.members.find((m: { id: string; name: string; status: string }) => m.id === memberId);

    if (!member) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <AnswerPageClient
                groupId={groupId}
                memberId={memberId}
                memberName={member.name}
                memberStatus={member.status}
                questions={group.questions}
            />
        </div>
    );
}
