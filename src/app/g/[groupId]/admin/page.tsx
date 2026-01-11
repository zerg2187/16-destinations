import { AdminGate } from "@/components/admin-gate";

interface PageProps {
    params: Promise<{ groupId: string }>;
}

export default async function AdminPage({ params }: PageProps) {
    const { groupId } = await params;

    return (
        <AdminGate groupId={groupId} />
    );
}
