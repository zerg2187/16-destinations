"use client";

import { Star } from "lucide-react";
import { Question, Member } from "@/types";
import { calculateStats } from "@/lib/statistics";
import { SCALE_MIN, SCALE_MAX } from "@/lib/constants";

interface ResultsChartProps {
    questions: Question[];
    members: Member[];
}

// グループ化されたドットデータ
interface DotData {
    value: number;
    memberName: string;
    stackIndex: number;
}

export function ResultsChart({ questions, members }: ResultsChartProps) {
    const scaleRange = SCALE_MAX - SCALE_MIN; // 6

    const data = questions.map((q) => {
        const answers = members
            .map((m) => m.answers?.[q.id])
            .filter((a): a is number => a !== undefined);

        const stats = calculateStats(answers);

        // ドットプロット用のデータを作成（同じ値の回答は縦に積み重ねる）
        const valueGroups: Record<number, string[]> = {};
        members.forEach((m) => {
            const answer = m.answers?.[q.id];
            if (answer !== undefined) {
                if (!valueGroups[answer]) {
                    valueGroups[answer] = [];
                }
                valueGroups[answer].push(m.name);
            }
        });

        const dots: DotData[] = [];
        Object.entries(valueGroups).forEach(([value, names]) => {
            names.forEach((name, stackIndex) => {
                dots.push({
                    value: Number(value),
                    memberName: name,
                    stackIndex,
                });
            });
        });

        return {
            ...q,
            ...stats,
            dots,
        };
    });

    return (
        <div className="space-y-8">
            {data.map((item) => (
                <div key={item.id} className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
                    {/* Header: Question Text & Stats */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h3 className="font-bold text-lg text-foreground/90">
                            <span className="text-muted-foreground mr-2 text-sm">Q{item.id.replace("q", "")}.</span>
                            {item.text}
                        </h3>
                        {item.hasAnswers && (
                            <div className="flex items-center gap-4 text-sm bg-muted/30 px-3 py-1 rounded-full self-start md:self-auto">
                                <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">平均:</span>
                                    <span className="font-bold text-foreground text-base">{item.avg.toFixed(1)}</span>
                                </div>
                                <div className="w-px h-4 bg-border" />
                                <div className="flex items-center gap-1">
                                    <span className="text-muted-foreground">ばらつき:</span>
                                    <span className="font-medium text-foreground">±{item.stdDev.toFixed(1)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Spectrum Visualization */}
                    <div className="relative pt-6 pb-2 px-2">
                        {/* Labels */}
                        <div className="flex justify-between text-sm font-bold mb-2">
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {item.leftLabel}
                            </span>
                            <span className="text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">
                                {item.rightLabel}
                            </span>
                        </div>

                        {/* Track */}
                        <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-emerald-400 via-gray-200 to-violet-400 shadow-inner">
                            {/* Grid lines (optional, for 1-7 scale) */}
                            {[1, 2, 3, 4, 5, 6, 7].map((tick) => (
                                <div
                                    key={tick}
                                    className="absolute top-0 bottom-0 w-px bg-white/50 first:hidden last:hidden"
                                    style={{ left: `${((tick - SCALE_MIN) / scaleRange) * 100}%` }}
                                />
                            ))}
                        </div>

                        {item.hasAnswers ? (
                            <>
                                {/* Dot Plot - Individual Response Dots */}
                                <div className="absolute top-6 left-0 right-0 h-20 pointer-events-none">
                                    {item.dots.map((dot, idx) => {
                                        // イニシャルを取得
                                        const getInitial = (name: string) => {
                                            return name.charAt(0).toUpperCase();
                                        };

                                        return (
                                            <div
                                                key={`${dot.memberName}-${idx}`}
                                                className="absolute pointer-events-auto group"
                                                style={{
                                                    left: `${((dot.value - SCALE_MIN) / scaleRange) * 100}%`,
                                                    bottom: `${dot.stackIndex * 18 + 4}px`,
                                                    transform: "translateX(-50%)",
                                                }}
                                            >
                                                {/* Dot with gradient and initial */}
                                                <div
                                                    className="
                                                        w-6 h-6 md:w-7 md:h-7 rounded-full 
                                                        bg-gradient-to-br from-teal-400 to-cyan-500
                                                        shadow-md shadow-teal-200 hover:shadow-lg
                                                        flex items-center justify-center
                                                        text-white text-xs md:text-sm font-bold
                                                        border-2 border-white
                                                        hover:scale-110 hover:-translate-y-0.5
                                                        transition-all duration-200 cursor-pointer
                                                        ring-0 hover:ring-2 hover:ring-offset-1 hover:ring-orange-300
                                                    "
                                                >
                                                    {getInitial(dot.memberName)}
                                                </div>
                                                {/* Tooltip */}
                                                <div
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5
                                                               bg-foreground text-background text-xs font-medium rounded-lg
                                                               opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20
                                                               pointer-events-none shadow-lg"
                                                >
                                                    <span className="font-bold">{dot.memberName}</span>
                                                    <span className="text-background/70 ml-1">({dot.value})</span>
                                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-foreground" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Average Marker */}
                                <div
                                    className="absolute top-28 -ml-4 flex flex-col items-center transition-all duration-500 z-10"
                                    style={{ left: `${((item.avg - SCALE_MIN) / scaleRange) * 100}%` }}
                                >
                                    <div className="w-0.5 h-4 bg-orange-400" />
                                    <div className="bg-white p-1.5 rounded-full shadow-lg border-2 border-orange-400">
                                        <Star className="w-5 h-5 md:w-6 md:h-6 text-orange-500 fill-orange-500" />
                                    </div>
                                    <span className="text-xs font-bold text-orange-600 mt-0.5">平均</span>
                                </div>
                            </>
                        ) : (
                            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                                まだ回答がありません
                            </div>
                        )}
                    </div>

                    {/* Spacer for average marker when there are answers */}
                    {item.hasAnswers && <div className="h-16" />}
                </div>
            ))}
        </div>
    );
}
