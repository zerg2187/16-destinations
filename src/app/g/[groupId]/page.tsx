import { getGroupData } from "@/lib/actions";
import { PasswordGate } from "@/components/password-gate";
import { GroupView } from "@/components/group-view";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ groupId: string }>;
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
