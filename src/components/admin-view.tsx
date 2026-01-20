"use client";
import { useState } from "react";
import Link from "next/link";
import { ResultsChart } from "@/components/results-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings, BarChart3, Users, User, Pencil, Trash2, Plus } from "lucide-react";
import { AddMemberDialog, RenameMemberDialog, DeleteMemberDialog } from "@/components/admin-member-dialogs";
import { Group } from "@/types";

interface AdminViewProps {
    group: Group;
    onRefresh: () => void;
}

export function AdminView({ group, onRefresh }: AdminViewProps) {

    // Dialog states
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Selected member state
    const [selectedMember, setSelectedMember] = useState<{ id: string, name: string } | null>(null);

    const openRenameDialog = (member: { id: string, name: string }) => {
        setSelectedMember(member);
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
                        <Link href={`/g/${group.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> グループページに戻る
                        </Link>
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
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] h-auto p-1 bg-muted/50 rounded-xl">
                    <TabsTrigger
                        value="results"
                        className="rounded-lg py-3 text-base font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
                    >
                        集計結果
                    </TabsTrigger>
                    <TabsTrigger
                        value="members"
                        className="rounded-lg py-3 text-base font-bold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md transition-all"
                    >
                        メンバー管理
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-6">
                    <Card className="border-l-4 border-l-purple-400 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                                    <BarChart3 className="w-5 h-5" />
                                </span>
                                結果
                            </CardTitle>
                            <CardDescription>
                                各回答者の回答を点でプロット。点にホバーすると名前が表示されます。
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
                                    onClick={() => setIsAddOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> メンバーを追加
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AddMemberDialog
                groupId={group.id}
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                onRefresh={onRefresh}
            />

            <RenameMemberDialog
                groupId={group.id}
                member={selectedMember}
                open={isRenameOpen}
                onOpenChange={setIsRenameOpen}
                onRefresh={onRefresh}
            />

            <DeleteMemberDialog
                groupId={group.id}
                member={selectedMember}
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onRefresh={onRefresh}
            />
        </div>
    );
}
