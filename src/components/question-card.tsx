import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

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
    // 1-3 = Left (Green), 5-7 = Right (Purple), 4 = Neutral (Gray)
    const options = [1, 2, 3, 4, 5, 6, 7];

    const getSizeClass = (val: number) => {
        const dist = Math.abs(val - 4); // Distance from center (0 to 3)
        switch (dist) {
            case 3: return "w-14 h-14"; // 1 & 7
            case 2: return "w-12 h-12"; // 2 & 6
            case 1: return "w-10 h-10";   // 3 & 5
            case 0: return "w-8 h-8";   // 4
            default: return "w-8 h-8";
        }
    };

    const getBaseColorClass = (val: number) => {
        if (val < 4) return "border-emerald-400 text-emerald-600"; // Green side
        if (val > 4) return "border-violet-400 text-violet-600";   // Purple side
        return "border-gray-400 text-gray-600";                    // Neutral
    };

    const getSelectedColorClass = (val: number) => {
        if (val < 4) return "bg-emerald-500 border-emerald-500 text-white"; // Green side
        if (val > 4) return "bg-violet-500 border-violet-500 text-white";   // Purple side
        return "bg-gray-500 border-gray-500 text-white";                    // Neutral
    };

    return (
        <div className="space-y-6 py-6">
            <h3 className="text-xl font-bold text-center mb-8 text-foreground/90">{question.text}</h3>

            <div className="flex justify-between items-center px-4 text-base font-bold mb-4">
                <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {question.leftLabel}
                </span>
                <span className="text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
                    {question.rightLabel}
                </span>
            </div>

            <div className="flex justify-between items-center relative px-4 py-2">
                {/* Connecting line */}
                <div className="absolute left-4 right-4 top-1/2 h-1 bg-muted -z-10 rounded-full" />

                {options.map((opt) => {
                    const isSelected = value === opt;
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => onChange(opt)}
                            className={cn(
                                "rounded-full border-2 transition-all duration-300 flex items-center justify-center shadow-sm bg-background hover:scale-110",
                                getSizeClass(opt),
                                isSelected ? getSelectedColorClass(opt) : getBaseColorClass(opt),
                                isSelected ? "ring-4 ring-offset-2 ring-offset-background scale-110 shadow-md" : "hover:border-opacity-80"
                            )}
                            aria-label={`選択肢 ${opt}`}
                        >
                            {isSelected && <Check className="w-6 h-6 stroke-[3]" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
