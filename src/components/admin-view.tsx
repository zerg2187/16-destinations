"use client";

import { ResultsChart } from "@/components/results-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

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
    return (
        <div className="space-y-8 max-w-5xl mx-auto py-10 px-4">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-primary">管理者ダッシュボード</h1>
                <p className="text-muted-foreground">
                    {group.name} の集計結果と設定
                </p>
            </div>

            <Tabs defaultValue="results" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="results">集計結果</TabsTrigger>
                    <TabsTrigger value="members">メンバー管理</TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>価値観マップ</CardTitle>
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
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">回答済み人数</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {group.members.filter((m) => m.status === "completed").length} / {group.members.length}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="members">
                    <Card>
                        <CardHeader>
                            <CardTitle>メンバーリスト</CardTitle>
                            <CardDescription>
                                メンバーの追加や削除ができます（実装予定）
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {group.members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{member.name}</span>
                                            {member.status === "completed" && (
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                    回答済
                                                </span>
                                            )}
                                        </div>
                                        {/* Delete button placeholder */}
                                        <Button variant="ghost" size="icon" disabled>
                                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))}
                                {/* Add member placeholder */}
                                <Button variant="outline" className="w-full" disabled>
                                    <Plus className="h-4 w-4 mr-2" /> メンバーを追加 (未実装)
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
