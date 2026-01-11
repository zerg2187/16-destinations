export interface Question {
    id: string;
    text: string;
    leftLabel: string;
    rightLabel: string;
}

export interface Member {
    id: string;
    name: string;
    status: string; // "pending" | "completed"
    editPassword?: string;
    answers?: Record<string, number>;
    updatedAt?: string;
}

export interface Group {
    id: string;
    name: string;
    description: string;
    questions: Question[];
    members: Member[];
    createdAt?: string;
}
