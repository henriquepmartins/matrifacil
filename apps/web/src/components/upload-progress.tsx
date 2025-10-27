"use client";

import { useDocumentUpload } from "@/lib/hooks/useDocumentUpload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, XCircle, Trash2 } from "lucide-react";

export function UploadProgress() {
  const { uploads, clearCompleted } = useDocumentUpload();

  if (uploads.length === 0) {
    return null;
  }

  const activeUploads = uploads.filter((u) => u.status !== "completed");

  return (
    <Card className="fixed bottom-20 right-4 w-96 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Uploads em Progresso</CardTitle>
          <CardDescription>
            {activeUploads.length} arquivo(s) sendo enviado(s)
          </CardDescription>
        </div>
        {uploads.some((u) => u.status === "completed") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCompleted}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {uploads.map((upload, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {upload.status === "uploading" && (
                  <Upload className="h-4 w-4 animate-pulse text-blue-500 flex-shrink-0" />
                )}
                {upload.status === "completed" && (
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
                {upload.status === "failed" && (
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
                <span className="text-sm font-medium truncate">
                  {upload.fileName}
                </span>
              </div>
            </div>

            {upload.status === "uploading" && (
              <Progress value={upload.progress} className="h-1" />
            )}

            {upload.status === "failed" && upload.error && (
              <p className="text-xs text-red-500">{upload.error}</p>
            )}

            {upload.status === "completed" && (
              <p className="text-xs text-green-500">
                Upload concluído com sucesso
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
