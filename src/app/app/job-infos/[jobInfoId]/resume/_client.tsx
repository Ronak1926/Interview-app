"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { toast } from "sonner";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { file } from "zod";
import { aiAnalyzeSchema } from "@/services/ai/resume/schema";

export function RunResumeClient({ jobInfoId }: { jobInfoId: string }) {
  const [isDragOver, setIsDragOver] = useState(false);

  const fileRef = useRef<File | null>(null);
  const {
    object: aiAnalysis,
    isLoading,
    submit: generateAnalysis,
  } = useObject({
    api: "/api/ai/resumes/analyze",
    schema: aiAnalyzeSchema,
    fetch: (url, options) => {
      const headers = new Headers(options?.headers);
      headers.delete("Content-Type");

      const formData = new FormData();
      if (fileRef.current) {
        formData.append("resumeFile", fileRef.current);
      }
      formData.append("jobInfoId", jobInfoId);
      return fetch(url, { ...options, body: formData, headers});
    },
  });

  function handleFileUpload(file: File | null) {
    fileRef.current = file;

    if (file == null) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      fileRef.current = null;
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Unsupported file type. Please upload a PDF, DOC, DOCX, or TXT file.",
      );
      fileRef.current = null;
      return;
    }

    generateAnalysis(null);
  }

  return (
    <div className="space-y-8 w-full">
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? "Analyzing your resume..." : "Upload your resume"}
          </CardTitle>
          <CardDescription>
            {isLoading
              ? "Get personalized feedback on how well your resume matches the job description and how to improve it."
              : "Upload your resume to get personalized feedback on how well it matches the job description and how to improve it."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSwap
            loadingIconClassName="size-16 text-muted-foreground"
            isLoading={isLoading}
          >
            <div
              className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-6 transition-colors relative",
                isDragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/50 bg-muted/10",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFileUpload(e.dataTransfer.files[0] || null);
              }}
            >
              <label htmlFor="resume-upload" className="sr-only">
                Upload your resume
              </label>
              <input
                type="file"
                id="resume-upload"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => {
                  handleFileUpload(e.target.files?.[0] ?? null);
                }}
              />
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <UploadIcon className="size-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg">
                    Drag and drop your resume here, or click to select a file
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: PDF, DOC, DOCX, TXT
                  </p>
                </div>
              </div>
            </div>
          </LoadingSwap>
        </CardContent>
      </Card>

      <pre>
        <code>
            {JSON.stringify(aiAnalysis, null, 2)}
        </code>
      </pre>
    </div>
    
  );
}
