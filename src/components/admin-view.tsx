"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMember, deleteMember, updateMemberName } from "@/lib/actions";
import { ResultsChart } from "@/components/results-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, ArrowLeft, Settings, BarChart3, Users, User, Pencil, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface AdminViewProps {
    group: {
        id: string;
        name: string;
        description: string;
        questions: {
            id: string;
            text: string;
            leftLabel: string;
            rightLabel: string;
        }[];
        members: {
            id: string;
            name: string;
            status: string;
            answers?: Record<string, number>;
        }[];
    };
}

export function AdminView({ group }: AdminViewProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Dialog states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Form states
    const [newMemberName, setNewMemberName] = useState("");
    const [selectedMember, setSelectedMember] = useState<{ id: string, name: string } | null>(null);

    async function handleAddMember(e: React.FormEvent) {
        e.preventDefault();
        if (!newMemberName.trim()) return;

        setIsLoading(true);
        try {
            const result = await addMember(group.id, newMemberName);
            if (result.success) {
                toast.success("メンバーを追加しました");
                setNewMemberName("");
                setIsAddOpen(false);
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

    async function handleRenameMember(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedMember || !newMemberName.trim()) return;

        setIsLoading(true);
        try {
            const result = await updateMemberName(group.id, selectedMember.id, newMemberName);
            if (result.success) {
                toast.success("名前を変更しました");
                setNewMemberName("");
                setSelectedMember(null);
                setIsRenameOpen(false);
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

    async function handleDeleteMember() {
        if (!selectedMember) return;

        setIsLoading(true);
        try {
            const result = await deleteMember(group.id, selectedMember.id);
            if (result.success) {
                toast.success("メンバーを削除しました");
                setSelectedMember(null);
                setIsDeleteOpen(false);
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

    const openRenameDialog = (member: { id: string, name: string }) => {
        setSelectedMember(member);
        setNewMemberName(member.name);
        setIsRenameOpen(true);
    };

    const openDeleteDialog = (member: { id: string, name: string }) => {
        setSelectedMember(member);
        setIsDeleteOpen(true);
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-10 px-4">
            <div className="space-y-4">
                <div className="flex justify-start">
                    <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                        <a href={`/g/${group.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> グループページに戻る
                        </a>
                    </Button>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                            <Settings className="w-8 h-8" />
                        </span>
                        管理者ダッシュボード
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {group.name} の集計結果と設定
                    </p>
                </div>
            </div>

            <Tabs defaultValue="results" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="results">集計結果</TabsTrigger>
                    <TabsTrigger value="members">メンバー管理</TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-6">
                    <Card className="border-l-4 border-l-purple-400 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                                    <BarChart3 className="w-5 h-5" />
                                </span>
                                価値観マップ
                            </CardTitle>
                            <CardDescription>
                                メンバー全員の回答の平均値とばらつき（標準偏差）を表示しています。
                                横棒が平均、ヒゲがばらつきを表します。
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResultsChart questions={group.questions} members={group.members} />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-l-4 border-l-blue-400 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    回答済み人数
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-blue-600">
                                    {group.members.filter((m) => m.status === "completed").length}
                                    <span className="text-lg text-muted-foreground font-normal ml-2">/ {group.members.length}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="members">
                    <Card className="border-l-4 border-l-teal-400 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <span className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                                    <Users className="w-5 h-5" />
                                </span>
                                メンバーリスト
                            </CardTitle>
                            <CardDescription>
                                メンバーの追加、名前の変更、削除ができます。
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {group.members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-teal-50 text-teal-600 p-2 rounded-full">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium">{member.name}</span>
                                            {member.status === "completed" && (
                                                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">
                                                    回答済
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openRenameDialog(member)}
                                                className="text-muted-foreground hover:text-primary"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openDeleteDialog(member)}
                                                disabled={group.members.length <= 1}
                                                className="text-muted-foreground hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed border-2 hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50"
                                    onClick={() => {
                                        setNewMemberName("");
                                        setIsAddOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> メンバーを追加
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Member Dialog */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>メンバーを追加</DialogTitle>
                        <DialogDescription>
                            新しいメンバーの名前を入力してください。
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMember}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">名前</Label>
                                <Input
                                    id="name"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    placeholder="山田 太郎"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading || !newMemberName.trim()}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "追加する"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Rename Member Dialog */}
            <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>名前を変更</DialogTitle>
                        <DialogDescription>
                            メンバーの名前を修正します。
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleRenameMember}>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="rename">名前</Label>
                                <Input
                                    id="rename"
                                    value={newMemberName}
                                    onChange={(e) => setNewMemberName(e.target.value)}
                                    placeholder="山田 太郎"
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={isLoading || !newMemberName.trim()}>
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "変更する"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Member Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            メンバーを削除
                        </DialogTitle>
                        <DialogDescription>
                            本当に <strong>{selectedMember?.name}</strong> を削除してもよろしいですか？<br />
                            この操作は取り消せません。回答データも完全に削除されます。
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button type="button" variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={isLoading}>
                            キャンセル
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteMember}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "削除実行"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
