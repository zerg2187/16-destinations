export interface Question {
    id: string;
    text: string;
    leftLabel: string;
    rightLabel: string;
}

export interface Member {
    id: string;
    name: string;
    status: "pending" | "completed";
    // editPassword removed - stored in secrets
    answers?: Record<string, number>;
    updatedAt?: string;
    authorId?: string; // UID of the user who answered
}

export interface Group {
    id: string;
    name: string;
    description: string;
    questions: Question[];
    members: Member[];
    createdAt?: string;
    expiresAt?: string; // Firestore TTL
    adminUid?: string; // UID of the group creator
    // groupPassword and adminPassword removed - stored in secrets
}
