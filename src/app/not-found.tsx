import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MapPin, Home } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-pink-50 text-center p-4">
            <div className="bg-white p-8 rounded-full shadow-lg mb-8 animate-bounce">
                <MapPin className="w-16 h-16 text-orange-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                ページが見つかりません
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md">
                お探しのページは移動したか、削除された可能性があります。<br />
                URLが正しいかもう一度確認してみてください。
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all">
                <Link href="/new">
                    <Home className="mr-2 h-5 w-5" />
                    グループ作成ページに行く
                </Link>
            </Button>
        </div>
    );
}
