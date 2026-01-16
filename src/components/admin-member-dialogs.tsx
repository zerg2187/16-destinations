"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertTriangle } from "lucide-react";
import { addMember, updateMemberName, deleteMember } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AddMemberDialogProps {
    groupId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRefresh: () => void;
}

export function AddMemberDialog({ groupId, open, onOpenChange, onRefresh }: AddMemberDialogProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const result = await addMember(groupId, name);
            if (result.success) {
                toast.success("メンバーを追加しました");
                setName("");
                onOpenChange(false);
                onRefresh();
                router.refresh();
            } else {
                toast.error(result.error || "追加に失敗しました");
            }
        } catch {
            toast.error("エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>メンバーを追加</DialogTitle>
                    <DialogDescription>
                        新しいメンバーの名前を入力してください。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">名前</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="山田 太郎"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || !name.trim()}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "追加する"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface RenameMemberDialogProps {
    groupId: string;
    member: { id: string; name: string } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRefresh: () => void;
}

export function RenameMemberDialog({ groupId, member, open, onOpenChange, onRefresh }: RenameMemberDialogProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");

    // Sync name state when member changes
    useEffect(() => {
        if (member) {
            setName(member.name);
        }
    }, [member]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!member || !name.trim()) return;

        setIsLoading(true);
        try {
            const result = await updateMemberName(groupId, member.id, name);
            if (result.success) {
                toast.success("名前を変更しました");
                onOpenChange(false);
                onRefresh();
                router.refresh();
            } else {
                toast.error(result.error || "変更に失敗しました");
            }
        } catch {
            toast.error("エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>名前を変更</DialogTitle>
                    <DialogDescription>
                        メンバーの名前を修正します。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="rename">名前</Label>
                            <Input
                                id="rename"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="山田 太郎"
                                autoComplete="off"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading || !name.trim()}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "変更する"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface DeleteMemberDialogProps {
    groupId: string;
    member: { id: string; name: string } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRefresh: () => void;
}

export function DeleteMemberDialog({ groupId, member, open, onOpenChange, onRefresh }: DeleteMemberDialogProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleDelete() {
        if (!member) return;

        setIsLoading(true);
        try {
            const result = await deleteMember(groupId, member.id);
            if (result.success) {
                toast.success("メンバーを削除しました");
                onOpenChange(false);
                onRefresh();
                router.refresh();
            } else {
                toast.error(result.error || "削除に失敗しました");
            }
        } catch {
            toast.error("エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        メンバーを削除
                    </DialogTitle>
                    <DialogDescription>
                        本当に <strong>{member?.name}</strong> を削除してもよろしいですか？<br />
                        この操作は取り消せません。回答データも完全に削除されます。
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        キャンセル
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "削除実行"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
