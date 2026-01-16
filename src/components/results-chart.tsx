"use client";

import { Star } from "lucide-react";
import { Question } from "@/types";
import { calculateStats } from "@/lib/statistics";
import { SCALE_MIN, SCALE_MAX } from "@/lib/constants";

interface ResultsChartProps {
    questions: Question[];
    members: {
        answers?: Record<string, number>;
    }[];
}

export function ResultsChart({ questions, members }: ResultsChartProps) {
    const scaleRange = SCALE_MAX - SCALE_MIN; // 6

    const data = questions.map((q) => {
        const answers = members
            .map((m) => m.answers?.[q.id])
            .filter((a): a is number => a !== undefined);

        const stats = calculateStats(answers);

        return {
            ...q,
            ...stats,
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
                                {/* Variance Range Bar */}
                                <div
                                    className="absolute top-10 h-3 bg-foreground/10 rounded-full transition-all duration-500"
                                    style={{
                                        left: `${Math.max(0, ((item.avg - item.stdDev - SCALE_MIN) / scaleRange) * 100)}%`,
                                        width: `${Math.min(100, (item.stdDev * 2 / scaleRange) * 100)}%`,
                                    }}
                                />

                                {/* Average Marker */}
                                <div
                                    className="absolute top-8 -ml-4 flex flex-col items-center transition-all duration-500 z-10"
                                    style={{ left: `${((item.avg - SCALE_MIN) / scaleRange) * 100}%` }}
                                >
                                    <div className="bg-white p-1 rounded-full shadow-md border-2 border-orange-400">
                                        <Star className="w-6 h-6 text-orange-500 fill-orange-500" />
                                    </div>
                                    <div className="w-0.5 h-3 bg-orange-400" />
                                </div>
                            </>
                        ) : (
                            <div className="absolute top-12 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
                                まだ回答がありません
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
