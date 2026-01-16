export interface QuestionStats {
    avg: number;
    stdDev: number;
    count: number;
    hasAnswers: boolean;
}

export function calculateStats(values: number[]): QuestionStats {
    if (values.length === 0) {
        return { avg: 4, stdDev: 0, count: 0, hasAnswers: false };
    }

    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;

    const variance = values.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
        avg,
        stdDev,
        count: values.length,
        hasAnswers: true,
    };
}
