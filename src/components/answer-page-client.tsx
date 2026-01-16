"use client";

import { useState } from "react";
import { AnswerForm } from "@/components/answer-form";
import { EditPasswordGate } from "@/components/edit-password-gate";
import { Question } from "@/types";

interface AnswerPageClientProps {
    groupId: string;
    memberId: string;
    memberName: string;
    memberStatus: string;
    questions: Question[];
}

export function AnswerPageClient({ groupId, memberId, memberName, memberStatus, questions }: AnswerPageClientProps) {
    const [isVerified, setIsVerified] = useState(false);
    const [initialAnswers, setInitialAnswers] = useState<Record<string, number>>({});
    const [editPassword, setEditPassword] = useState("");

    const handleVerified = (answers: Record<string, number>, password: string) => {
        setInitialAnswers(answers);
        setEditPassword(password);
        setIsVerified(true);
    };

    // If member has not answered yet, show form directly
    if (memberStatus !== "completed") {
        return (
            <AnswerForm
                groupId={groupId}
                memberId={memberId}
                memberName={memberName}
                questions={questions}
            />
        );
    }

    // If member has answered but not verified yet, show gate
    if (!isVerified) {
        return (
            <EditPasswordGate
                groupId={groupId}
                memberId={memberId}
                memberName={memberName}
                onVerified={handleVerified}
            />
        );
    }

    // If verified, show form with initial values
    return (
        <AnswerForm
            groupId={groupId}
            memberId={memberId}
            memberName={memberName}
            questions={questions}
            initialAnswers={initialAnswers}
            initialEditPassword={editPassword}
        />
    );
}
