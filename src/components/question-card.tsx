import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Question } from "@/types";
import { SCALE_MIN, SCALE_MAX, SCALE_CENTER } from "@/lib/constants";

interface QuestionCardProps {
    question: Question;
    value: number | undefined;
    onChange: (value: number) => void;
    error?: boolean;
}

export function QuestionCard({ question, value, onChange, error }: QuestionCardProps) {
    // Generate options array from constants
    const options = Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => SCALE_MIN + i);

    const getSizeClass = (val: number) => {
        const dist = Math.abs(val - SCALE_CENTER); // Distance from center (0 to 3)
        switch (dist) {
            case 3: return "w-10 h-10 sm:w-12 sm:h-12 md:w-20 md:h-20"; // 1 & 7 (Largest)
            case 2: return "w-9 h-9 sm:w-10 sm:h-10 md:w-16 md:h-16";   // 2 & 6
            case 1: return "w-8 h-8 sm:w-9 sm:h-9 md:w-14 md:h-14";     // 3 & 5
            case 0: return "w-7 h-7 sm:w-8 sm:h-8 md:w-12 md:h-12";     // 4 (Smallest)
            default: return "w-8 h-8";
        }
    };

    const getBaseColorClass = (val: number) => {
        if (val < SCALE_CENTER) return "border-emerald-400 text-emerald-600"; // Green side
        if (val > SCALE_CENTER) return "border-violet-400 text-violet-600";   // Purple side
        return "border-gray-400 text-gray-600";                               // Neutral
    };

    const getSelectedColorClass = (val: number) => {
        if (val < SCALE_CENTER) return "bg-emerald-500 border-emerald-500 text-white"; // Green side
        if (val > SCALE_CENTER) return "bg-violet-500 border-violet-500 text-white";   // Purple side
        return "bg-gray-500 border-gray-500 text-white";                               // Neutral
    };

    return (
        <div className={cn("space-y-6 py-6 rounded-lg transition-colors", error && "bg-red-50 border border-red-200")}>
            <h3 className={cn("text-xl font-bold text-center mb-8 flex items-center justify-center gap-2 flex-wrap", error ? "text-red-600" : "text-foreground/90")}>
                <span>{question.text}</span>
                {error && <span className="text-sm font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200">未回答</span>}
            </h3>

            <div className="flex justify-between items-center px-4 text-base font-bold mb-4">
                <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {question.leftLabel}
                </span>
                <span className="text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
                    {question.rightLabel}
                </span>
            </div>

            <div className="flex justify-between items-center relative px-2 py-4 md:px-8">
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
                                "rounded-full border-2 transition-all duration-300 flex items-center justify-center shadow-sm bg-background hover:scale-110 flex-shrink-0",
                                getSizeClass(opt),
                                isSelected ? getSelectedColorClass(opt) : getBaseColorClass(opt),
                                isSelected ? "ring-2 md:ring-4 ring-offset-2 ring-offset-background scale-110 shadow-md" : "hover:border-opacity-80"
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
