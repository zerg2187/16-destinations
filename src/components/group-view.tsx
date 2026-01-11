"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, User, Map as MapIcon, Check } from "lucide-react";
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
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                        <span className="bg-orange-100 text-orange-600 p-2 rounded-lg">
                            <MapIcon className="w-8 h-8" />
                        </span>
                        {group.name}
                    </h1>
                    <p className="text-muted-foreground">{group.description}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="border-dashed border-2 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50">
                    <Link href={`/g/${group.id}/admin`}>
                        <Settings className="mr-2 h-4 w-4" /> 管理者メニュー
                    </Link>
                </Button>
            </div>

            <Card className="border-l-4 border-l-teal-400 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <span className="bg-teal-100 text-teal-600 p-2 rounded-lg">
                            <User className="w-5 h-5" />
                        </span>
                        メンバーを選択して回答
                    </CardTitle>
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
                                className={`h-28 flex flex-col gap-2 text-lg transition-all shadow-sm ${member.status === "completed"
                                    ? "bg-teal-50 hover:bg-teal-100 border-teal-200 text-teal-700"
                                    : "hover:border-teal-400 hover:text-teal-600 hover:bg-teal-50 hover:-translate-y-1 hover:shadow-md"
                                    }`}
                                asChild
                            >
                                <Link href={`/g/${group.id}/answer?memberId=${member.id}`}>
                                    <div className={`p-2 rounded-full ${member.status === "completed" ? "bg-teal-100" : "bg-muted"}`}>
                                        {member.status === "completed" ? <Check className="h-6 w-6" /> : <User className="h-6 w-6" />}
                                    </div>
                                    <span className="font-bold">{member.name}</span>
                                    {member.status === "completed" && (
                                        <span className="text-xs font-normal opacity-80">
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
