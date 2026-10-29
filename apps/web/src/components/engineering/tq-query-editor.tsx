"use client";

import { useEffect, useRef, useState } from "react";
import { tqQueryImageFigure } from "@rtb/engineering-os/browser";
import { TQ_QUERY_IMAGE_ACCEPT, uploadTqQueryImage } from "@/lib/engineering/tq-query-image-upload";
import "./tq-query.css";

export function TqQueryEditor({
  id,
  tqId,
  projectId,
  value,
  onChange,
  onEnsureDraft,
  onUploadBusy,
}: {
  id: string;
  tqId: string | null;
  projectId?: string;
  value: string;
  onChange: (html: string) => void;
  onEnsureDraft: () => Promise<string>;
  onUploadBusy: (busy: boolean, message: string | null) => void;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const lastExternal = useRef("");
  const [status, setStatus] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [imageUploadEnabled, setImageUploadEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/platform/pilot/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { data?: { fileUploadEnabled?: boolean } } | null) => {
        if (!cancelled) setImageUploadEnabled(payload?.data?.fileUploadEnabled === true);
      })
      .catch(() => {
        if (!cancelled) setImageUploadEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (document.activeElement === el) return;
    if (el.innerHTML !== (value || "")) {
      el.innerHTML = value || "";
      lastExternal.current = value;
    }
  }, [value]);

  function emit() {
    const html = editorRef.current?.innerHTML ?? "";
    lastExternal.current = html;
    onChange(html);
  }

  function rejectImageUpload() {
    setFailed(true);
    setStatus("Image upload is unavailable while file upload is disabled.");
    onUploadBusy(false, null);
  }

  async function insertImageFile(file: File) {
    if (!imageUploadEnabled) {
      rejectImageUpload();
      return;
    }
    setFailed(false);
    setStatus("Uploading image...");
    onUploadBusy(true, "Uploading image...");
    try {
      const ensuredId = tqId || (await onEnsureDraft());
      const uploaded = await uploadTqQueryImage({
        tqId: ensuredId,
        file,
        engineeringProjectId: projectId,
      });
      const figure = tqQueryImageFigure({ tqId: ensuredId, documentId: uploaded.documentId });
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, figure);
      emit();
      setStatus("Upload complete");
      onUploadBusy(false, null);
    } catch (err) {
      setFailed(true);
      const message = err instanceof Error ? err.message : "Upload failed";
      setStatus(`Upload failed - ${message}`);
      onUploadBusy(false, message);
    }
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    const items = Array.from(event.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;
    event.preventDefault();
    void insertImageFile(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    const file = Array.from(event.dataTransfer.files).find((item) => item.type.startsWith("image/"));
    if (!file) return;
    event.preventDefault();
    void insertImageFile(file);
  }

  return (
    <div data-testid="tq-query-editor">
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
        Query / Information Required *
      </label>
      <div className="tq-query-toolbar mb-1 flex flex-wrap gap-1" data-testid="tq-query-toolbar">
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-xs"
          onClick={() => {
            editorRef.current?.focus();
            document.execCommand("insertUnorderedList");
            emit();
          }}
        >
          Bullets
        </button>
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-xs"
          onClick={() => {
            editorRef.current?.focus();
            document.execCommand("insertOrderedList");
            emit();
          }}
        >
          Numbered
        </button>
        <button
          type="button"
          className="rounded border border-slate-200 px-2 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Insert image"
          aria-disabled={!imageUploadEnabled}
          disabled={!imageUploadEnabled}
          title={imageUploadEnabled ? "Insert image" : "Image upload is unavailable while file upload is disabled."}
          onClick={() => {
            if (!imageUploadEnabled) {
              rejectImageUpload();
              return;
            }
            fileRef.current?.click();
          }}
        >
          Insert Image
        </button>
        {imageUploadEnabled ? (
          <input
            ref={fileRef}
            type="file"
            accept={TQ_QUERY_IMAGE_ACCEPT}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void insertImageFile(file);
            }}
          />
        ) : null}
      </div>
      <div className="tq-query-editor-frame">
        <div
          id={id}
          ref={editorRef}
          className="tq-query-editor px-3 py-2"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-required="true"
          tabIndex={0}
          data-placeholder="Describe the technical issue and insert the minimum evidence required."
          onInput={emit}
          onBlur={emit}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(event) => {
            if (Array.from(event.dataTransfer.types).includes("Files")) event.preventDefault();
          }}
          suppressContentEditableWarning
        />
      </div>
      {status ? (
        <p className={`mt-1 text-xs ${failed ? "text-rose-700" : "text-slate-500"}`} data-testid="tq-image-upload-status">
          {status}
          {failed ? (
            <button
              type="button"
              className="ml-2 underline"
              onClick={() => {
                setFailed(false);
                setStatus(null);
                fileRef.current?.click();
              }}
            >
              Retry
            </button>
          ) : null}
        </p>
      ) : (
        <p className="mt-1 text-xs text-slate-500">
          {imageUploadEnabled
            ? "Paste a screenshot or insert an image. Captions are optional."
            : "Image upload is unavailable while file upload is disabled."}
        </p>
      )}
    </div>
  );
}
