import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, LucideIcon } from "lucide-react";
import Link from "next/link";

interface AuthCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    onSubmit: (e: React.FormEvent) => void;
    isLoading: boolean;
    buttonText: string;
    backLink?: string;
    backText?: string;
    children: ReactNode; // Input fields
}

export function AuthCard({
    icon: Icon,
    title,
    description,
    onSubmit,
    isLoading,
    buttonText,
    backLink,
    backText = "戻る",
    children,
}: AuthCardProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-4">
                {backLink && (
                    <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
                        <Link href={backLink}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> {backText}
                        </Link>
                    </Button>
                )}

                <Card className="border-l-4 border-l-orange-400 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <Icon className="w-6 h-6 text-orange-600" />
                        </div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-6">
                            {children}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold shadow-md"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 確認中...
                                    </>
                                ) : (
                                    buttonText
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export function AuthLoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
    );
}
