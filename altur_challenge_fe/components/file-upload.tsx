"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUploadProps } from "@/types";

const UPLOAD_STAGES = [
  "Uploading audio file...",
  "Transcribing call...",
  "Analyzing call with AI...",
  "Finishing Up..."
] as const;

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setError(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      for (let i = 0; i < UPLOAD_STAGES.length; i++) {
        setUploadStage(UPLOAD_STAGES[i]);
        if (i === 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      onUploadSuccess(data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadStage("");
    }
  };

  return (
    <Card className={isUploading ? "opacity-60 pointer-events-none" : ""}>
      <CardHeader>
        <CardTitle>Upload Call Recording</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          } ${isUploading ? "cursor-not-allowed bg-muted/30" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Input
            ref={inputRef}
            type="file"
            accept="audio/*"
            onChange={handleChange}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className={`flex flex-col items-center gap-2 ${
              isUploading ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <svg
              className="w-10 h-10 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-sm text-muted-foreground">
              {isUploading ? "Processing..." : "Drag & drop or click to upload"}
            </span>
            <span className="text-xs text-muted-foreground">
              {isUploading ? "Please wait" : "Supported: MP3, WAV"}
            </span>
          </label>
        </div>

        {file && !isUploading && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        {isUploading && uploadStage && (
          <div className="space-y-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/30 border-t-primary"></div>
                <div className="absolute inset-0 rounded-full h-6 w-6 border-2 border-transparent border-t-primary/50 animate-ping"></div>
              </div>
              <div className="flex-1">
                <span className="text-sm text-primary font-semibold block">
                  {uploadStage}
                </span>
                <span className="text-xs text-muted-foreground">
                  This may take a minute...
                </span>
              </div>
            </div>
            <div className="w-full bg-primary/20 rounded-full h-1.5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary/50 to-primary animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]"></div>
            </div>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="w-full"
        >
          {isUploading ? "Busy proccessing..." : "Upload and Analyze"}
        </Button>
      </CardContent>
    </Card>
  );
}
