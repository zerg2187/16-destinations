"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User } from "lucide-react";
import Link from "next/link";

interface GroupViewProps {
    group: {
        id: string;
        name: string;
        description: string;
        members: {
            id: string;
            name: string;
            status: string;
        }[];
    };
}

export function GroupView({ group }: GroupViewProps) {
    return (
        <div className="space-y-8 max-w-4xl mx-auto py-10 px-4">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-primary">{group.name}</h1>
                    <p className="text-muted-foreground">{group.description}</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                    {/* Admin menu will be implemented later, for now just a placeholder or link to admin page */}
                    <Link href={`/g/${group.id}/admin`}>
                        <Settings className="mr-2 h-4 w-4" /> 管理者メニュー
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>メンバーを選択して回答</CardTitle>
                    <CardDescription>
                        あなたの名前を選んで、価値観アンケートに答えてください。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {group.members.map((member) => (
                            <Button
                                key={member.id}
                                variant={member.status === "completed" ? "secondary" : "outline"}
                                className="h-24 flex flex-col gap-2 text-lg hover:border-primary/50 hover:bg-primary/5 transition-all"
                                asChild
                            >
                                <Link href={`/g/${group.id}/answer?memberId=${member.id}`}>
                                    <User className="h-6 w-6" />
                                    <span>{member.name}</span>
                                    {member.status === "completed" && (
                                        <span className="text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full">
                                            回答済み
                                        </span>
                                    )}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
