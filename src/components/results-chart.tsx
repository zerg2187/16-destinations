"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ErrorBar,
} from "recharts";

interface ResultsChartProps {
    questions: {
        id: string;
        text: string;
        leftLabel: string;
        rightLabel: string;
    }[];
    members: {
        answers?: Record<string, number>;
    }[];
}

export function ResultsChart({ questions, members }: ResultsChartProps) {
    const data = questions.map((q) => {
        const answers = members
            .map((m) => m.answers?.[q.id])
            .filter((a): a is number => a !== undefined);

        if (answers.length === 0) {
            return {
                name: q.text,
                shortName: `Q${q.id.replace("q", "")}`,
                avg: 0,
                stdDev: 0,
                count: 0,
                leftLabel: q.leftLabel,
                rightLabel: q.rightLabel,
            };
        }

        const sum = answers.reduce((acc, val) => acc + val, 0);
        const avg = sum / answers.length;

        const variance =
            answers.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) /
            answers.length;
        const stdDev = Math.sqrt(variance);

        return {
            name: q.text,
            shortName: `Q${q.id.replace("q", "")}`,
            avg: parseFloat(avg.toFixed(2)),
            stdDev: [parseFloat((avg - stdDev).toFixed(2)), parseFloat((avg + stdDev).toFixed(2))], // ErrorBar expects [min, max] or error value
            stdDevVal: parseFloat(stdDev.toFixed(2)),
            count: answers.length,
            leftLabel: q.leftLabel,
            rightLabel: q.rightLabel,
        };
    });

    // Custom Error Bar logic for Recharts
    // We want to show the range [avg - stdDev, avg + stdDev]

    return (
        <div className="w-full h-[500px] bg-card rounded-lg p-4 border shadow-sm">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[1, 7]} ticks={[1, 2, 3, 4, 5, 6, 7]} />
                    <YAxis dataKey="shortName" type="category" width={30} />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                    <div className="bg-popover border rounded p-2 shadow-md text-sm">
                                        <p className="font-bold mb-1">{d.name}</p>
                                        <p className="text-muted-foreground mb-2">
                                            {d.leftLabel} vs {d.rightLabel}
                                        </p>
                                        <p>平均: {d.avg}</p>
                                        <p>標準偏差: {d.stdDevVal}</p>
                                        <p>回答数: {d.count}</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="avg" fill="var(--chart-1)" barSize={20} radius={[0, 4, 4, 0]}>
                        <ErrorBar dataKey="stdDevVal" width={4} strokeWidth={2} stroke="var(--foreground)" direction="x" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                {data.map((d) => (
                    <div key={d.shortName} className="flex gap-2">
                        <span className="font-bold w-8">{d.shortName}:</span>
                        <span className="truncate">{d.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
