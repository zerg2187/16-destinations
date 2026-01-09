import { getAdminGroupData } from "@/lib/actions";
import { AdminGate } from "@/components/admin-gate";
import { AdminView } from "@/components/admin-view";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ groupId: string }>;
}

export default async function AdminPage({ params }: PageProps) {
    const { groupId } = await params;
    const group = await getAdminGroupData(groupId);

    if (!group) {
        notFound();
    }

    return (
        <AdminGate groupId={groupId}>
            <AdminView group={group} />
        </AdminGate>
    );
}
