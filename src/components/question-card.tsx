"use client";

import { cn } from "@/lib/utils";

interface QuestionCardProps {
    question: {
        id: string;
        text: string;
        leftLabel: string;
        rightLabel: string;
    };
    value: number | undefined;
    onChange: (value: number) => void;
}

export function QuestionCard({ question, value, onChange }: QuestionCardProps) {
    // 1 to 7 scale
    // 1 = Left (Green), 7 = Right (Purple), 4 = Neutral (Gray)
    // Sizes: 1 & 7 = Large, 2 & 6 = Medium, 3 & 5 = Small, 4 = Smallest
    const options = [1, 2, 3, 4, 5, 6, 7];

    const getSizeClass = (val: number) => {
        const dist = Math.abs(val - 4); // Distance from center (0 to 3)
        switch (dist) {
            case 3: return "w-12 h-12"; // 1 & 7
            case 2: return "w-10 h-10"; // 2 & 6
            case 1: return "w-8 h-8";   // 3 & 5
            case 0: return "w-6 h-6";   // 4
            default: return "w-6 h-6";
        }
    };

    const getColorClass = (val: number, isSelected: boolean) => {
        if (!isSelected) return "bg-muted hover:bg-muted-foreground/20";

        if (val < 4) return "bg-emerald-400 border-emerald-500"; // Green side
        if (val > 4) return "bg-violet-400 border-violet-500";   // Purple side
        return "bg-gray-400 border-gray-500";                    // Neutral
    };

    return (
        <div className="space-y-4 py-4">
            <h3 className="text-lg font-medium text-center mb-6">{question.text}</h3>

            <div className="flex justify-between items-center px-2 text-sm font-medium text-muted-foreground mb-2">
                <span className="text-emerald-600">{question.leftLabel}</span>
                <span className="text-violet-600">{question.rightLabel}</span>
            </div>

            <div className="flex justify-between items-center relative px-2">
                {/* Connecting line */}
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted -z-10" />

                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        className={cn(
                            "rounded-full border-2 transition-all duration-200 flex items-center justify-center shadow-sm",
                            getSizeClass(opt),
                            getColorClass(opt, value === opt),
                            value === opt ? "scale-110 ring-2 ring-offset-2 ring-offset-background" : "border-transparent"
                        )}
                        aria-label={`選択肢 ${opt}`}
                    />
                ))}
            </div>
        </div>
    );
}
