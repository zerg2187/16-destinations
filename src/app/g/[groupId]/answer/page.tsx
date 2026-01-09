import { getGroupData } from "@/lib/actions";
import { AnswerForm } from "@/components/answer-form";
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

    const member = group.members.find((m: { id: string; name: string }) => m.id === memberId);

    if (!member) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <AnswerForm
                groupId={groupId}
                memberId={memberId}
                memberName={member.name}
                questions={group.questions}
            />
        </div>
    );
}
