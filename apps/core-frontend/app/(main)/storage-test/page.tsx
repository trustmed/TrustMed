"use client";

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { axiosInstance } from "@/config/api-config/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface StorageUploadResponse {
  message: string;
  fileName: string;
  mimeType: string;
  size: number;
}

function getPreviewType(fileName: string, mimeType: string | null) {
  const lowerFileName = fileName.toLowerCase();

  if (mimeType?.startsWith("image/") || [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) => lowerFileName.endsWith(ext))) {
    return "image";
  }

  if (mimeType === "application/pdf" || lowerFileName.endsWith(".pdf")) {
    return "pdf";
  }

  return "other";
}

export default function StorageTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState("example");
  const [nestedDirectoriesInput, setNestedDirectoriesInput] = useState("medical-records,uploads");
  const [isUploading, setIsUploading] = useState(false);
  const [response, setResponse] = useState<StorageUploadResponse | null>(null);
  const [viewFileName, setViewFileName] = useState("example.png");
  const [isViewing, setIsViewing] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMimeType, setPreviewMimeType] = useState<string | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const nestedDirectories = nestedDirectoriesInput
    .split(",")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    if (!customFileName.trim()) {
      setError("Please enter a custom file name.");
      return;
    }

    const nestedDirectories = nestedDirectoriesInput
      .split(",")
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (nestedDirectories.length === 0) {
      setError("Please enter nested directories.");
      return;
    }

    setIsUploading(true);
    setResponse(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("customFileName", customFileName.trim());
      nestedDirectories.forEach((segment) => {
        formData.append("nestedDirectories", segment);
      });

      const { data } = await axiosInstance.post<StorageUploadResponse>(
        "/api/storage/save-file",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setResponse(data);
    } catch (uploadError) {
      if (uploadError instanceof Error) {
        setError(uploadError.message);
      } else {
        setError("Upload failed");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleView = async () => {
    if (!viewFileName.trim()) {
      setViewError("Please enter a file name.");
      return;
    }

    if (nestedDirectories.length === 0) {
      setViewError("Please enter nested directories.");
      return;
    }

    setIsViewing(true);
    setViewError(null);

    try {
      const response = await axiosInstance.get("/api/storage/view-file", {
        params: {
          fileName: viewFileName.trim(),
          nestedDirectories: nestedDirectories.join(","),
        },
        responseType: "blob",
      });

      const blob = response.data as Blob;

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
      setPreviewMimeType(blob.type || null);
      setPreviewFileName(viewFileName.trim());
    } catch (viewDocumentError) {
      if (viewDocumentError instanceof Error) {
        setViewError(viewDocumentError.message);
      } else {
        setViewError("View failed");
      }
    } finally {
      setIsViewing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Storage Test</CardTitle>
          <CardDescription>
            Upload a document to test the backend storage endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={customFileName}
            onChange={(event) => {
              setCustomFileName(event.target.value);
              setResponse(null);
              setError(null);
              setViewError(null);
            }}
            placeholder="Custom file name (required)"
          />

          <Input
            value={nestedDirectoriesInput}
            onChange={(event) => {
              setNestedDirectoriesInput(event.target.value);
              setResponse(null);
              setError(null);
              setViewError(null);
            }}
            placeholder="Nested directories (comma separated, required)"
          />

          <Input
            type="file"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setResponse(null);
              setError(null);
            }}
          />

          <Button
            onClick={handleUpload}
            disabled={!file || !customFileName.trim() || !nestedDirectoriesInput.trim() || isUploading}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload Document"}
          </Button>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {response && (
            <div className="rounded-md border border-green-200 bg-green-50 text-green-800 px-3 py-2 text-sm space-y-1">
              <p>{response.message}</p>
              <p>File: {response.fileName}</p>
              <p>Type: {response.mimeType}</p>
              <p>Size: {response.size} bytes</p>
            </div>
          )}


          <div className="rounded-md border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="text-sm font-medium text-slate-700">View saved document</div>
            <Input
              value={viewFileName}
              onChange={(event) => {
                setViewFileName(event.target.value);
                setViewError(null);
              }}
              placeholder="File name to view (for example: example.png)"
            />
            <Button
              onClick={handleView}
              disabled={!viewFileName.trim() || nestedDirectories.length === 0 || isViewing}
              variant="secondary"
              className="gap-2"
            >
              {isViewing ? "Loading preview..." : "View Document"}
            </Button>
            {viewError && (
              <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {viewError}
              </div>
            )}
          </div>

          {previewUrl && previewFileName && (
            <div className="rounded-lg border border-slate-200 overflow-hidden space-y-3 p-3">
              <div className="text-sm font-medium">Preview: {previewFileName}</div>
              {getPreviewType(previewFileName, previewMimeType) === "image" ? (
                <img
                  src={previewUrl}
                  alt={previewFileName}
                  className="w-full max-h-[500px] object-contain rounded-md bg-white"
                />
              ) : getPreviewType(previewFileName, previewMimeType) === "pdf" ? (
                <iframe
                  src={previewUrl}
                  title={previewFileName}
                  className="w-full h-[600px] rounded-md border"
                />
              ) : (
                <div className="text-sm text-slate-600 space-y-2">
                  <p>Preview not available for this file type.</p>
                  <a
                    href={previewUrl}
                    download={previewFileName}
                    className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-white"
                  >
                    Download file
                  </a>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}