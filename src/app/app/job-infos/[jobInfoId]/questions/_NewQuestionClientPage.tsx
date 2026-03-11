"use client";

import { BackLink } from "@/components/BackLink";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
    JobInfoTable,
    questionDifficulties,
    QuestionDifficulty,
} from "@/drizzle/schema";
import { formatQuestionDifficulty } from "@/features/questions/formatters";
import { useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { errorToast } from "@/lib/errorToast";

type Status = "awaiting-answer" | "awaiting-difficulty" | "init";

export function NewQuestionClientPage({
    jobInfo,
}: {
    jobInfo: Pick<typeof JobInfoTable.$inferSelect, "id" | "name" | "title">;
}) {
    const [status, setStatus] = useState<Status>("init");
    const [answer, setAnswer] = useState<string | null>(null);
    const [questionId, setQuestionId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string>("");
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

    const {
        complete: generateQuestion,
        completion: question,
        setCompletion: setQuestion,
        isLoading: isGeneratingQuestion,
    } = useCompletion({
        api: "/api/ai/questions/generate-question",
        onFinish: () => {
            setStatus("awaiting-answer");
        },
        onError: (error: Error) => {
            errorToast(error.message);
        },
    });

    async function generateFeedback() {
        if (isGeneratingFeedback) return;
        if (answer == null || answer.trim() === "") return;
        if (question == null || question.trim() === "") {
            errorToast("Please generate a question first");
            return;
        }

        setFeedback("");
        setIsGeneratingFeedback(true);
        try {
            const body: { prompt: string; question: string; questionId?: string } = {
                prompt: answer.trim(),
                question: question.trim(),
            };

            if (questionId != null) {
                body.questionId = questionId;
            }

            const res = await fetch("/api/ai/questions/generate-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(text || "Error generating feedback");
            }

            if (!res.body) {
                throw new Error("No response stream received");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                setFeedback((prev) => prev + decoder.decode(value, { stream: true }));
            }

            setStatus("awaiting-difficulty");
        } catch (e) {
            const message = e instanceof Error ? e.message : "Error generating feedback";
            errorToast(message);
        } finally {
            setIsGeneratingFeedback(false);
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full mx-w-[2000px] mx-auto grow h-screen-header">
            <div className="container flex gap-4 mt-4 items-center justify-between">
                <div className="grow basis-0">
                    <BackLink href={`/app/job-infos/${jobInfo.id}`}>
                        {jobInfo.name}
                    </BackLink>
                </div>
                <Controls
                    reset={() => {
                        setStatus("init");
                        setQuestion("");
                        setFeedback("");
                        setAnswer(null);
                        setQuestionId(null);
                    }}
                    disableAnswerButton={
                        answer == null || answer.trim() === ""
                    }
                    status={status}
                    isLoading={isGeneratingFeedback || isGeneratingQuestion}
                    generateFeedback={generateFeedback}
                    generateQuestion={(difficulty) => {
                        setQuestion("");
                        setFeedback("");
                        setAnswer(null);
                        setQuestionId(null);
                        generateQuestion(difficulty, { body: { jobInfoId: jobInfo.id } });
                    }}
                />
                <div className="grow hidden md:block" />
            </div>
            <QuestionContainer
                question={question}
                feedback={feedback}
                answer={answer}
                status={status}
                setAnswer={setAnswer}
            />
        </div>
    );
}

function QuestionContainer({
    question,
    feedback,
    answer,
    status,
    setAnswer,
}: {
    question: string | null;
    feedback: string | null;
    answer: string | null;
    status: Status;
    setAnswer: (value: string) => void;
}) {
    return (
        <ResizablePanelGroup orientation="horizontal" className="grow border-t">
            <ResizablePanel id="question-and-feedback" defaultSize={50} minSize={5}>
                <ResizablePanelGroup orientation="vertical" className="grow">
                    <ResizablePanel id="question" defaultSize={25} minSize={5}>
                        <ScrollArea className="h-full min-w-48 *:h-full">
                            {status === "init" && question == null ? (
                                <p className="text-base md:text-lg flex items-center justify-center h-full p-6">
                                    Get started by selecting a question difficulty above.
                                </p>
                            ) : (
                                question && (
                                    <MarkdownRenderer className="p-6">
                                        {question}
                                    </MarkdownRenderer>
                                )
                            )}
                        </ScrollArea>
                    </ResizablePanel>
                    {feedback && (
                        <>
                            <ResizableHandle withHandle />
                            <ResizablePanel id="feedback" defaultSize={75} minSize={5}>
                                <ScrollArea className="h-full min-w-48 *:h-full">
                                    <MarkdownRenderer className="p-6">
                                        {feedback}
                                    </MarkdownRenderer>
                                </ScrollArea>
                            </ResizablePanel>
                        </>
                    )}
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel id="answer" defaultSize={50} minSize={5}>
                <ScrollArea className="h-full min-w-48 *:h-full">
                    <Textarea
                        disabled={status !== "awaiting-answer"}
                        onChange={(e) => setAnswer(e.target.value)}
                        value={answer ?? ""}
                        placeholder="Type your answer here..."
                        className="w-full h-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset text-base! p-6"
                    />
                </ScrollArea>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}

function Controls({
    status,
    isLoading,
    disableAnswerButton,
    generateQuestion,
    generateFeedback,
    reset,
}: {
    disableAnswerButton: boolean;
    status: Status;
    isLoading: boolean;
    generateQuestion: (difficulty: QuestionDifficulty) => void;
    generateFeedback: () => void;
    reset: () => void;
}) {
    return (
        <div className="flex gap-2">
            {status === "awaiting-answer" ? (
                <>
                    <Button
                        onClick={reset}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                    >
                        <LoadingSwap isLoading={isLoading}>Skip</LoadingSwap>
                    </Button>
                    <Button
                        onClick={generateFeedback}
                        disabled={disableAnswerButton}
                        size="sm"
                    >
                        <LoadingSwap isLoading={isLoading}>Answer</LoadingSwap>
                    </Button>
                </>
            ) : (
                questionDifficulties.map((difficulty) => (
                    <Button
                        key={difficulty}
                        size="sm"
                        disabled={isLoading}
                        onClick={() => generateQuestion(difficulty)}
                    >
                        <LoadingSwap isLoading={isLoading}>
                            {formatQuestionDifficulty(difficulty)}
                        </LoadingSwap>
                    </Button>
                ))
            )}
        </div>
    );
}
