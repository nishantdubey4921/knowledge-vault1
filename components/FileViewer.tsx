"use client";
import { useState, useEffect, useRef } from "react";
import { DriveFile, ReadingProgress } from "@/lib/types";

interface Props {
  file: DriveFile;
  progress?: ReadingProgress;
  onClose: () => void;
  onProgressUpdate: (p: Partial<ReadingProgress>) => void;
}

export default function FileViewer({ file, progress, onClose, onProgressUpdate }: Props) {
  const [notes, setNotes] = useState(progress?.notes || "");
  const [prog, setProg] = useState(progress?.progress || 0);
  const [timeStart] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auto-set to reading when opened
  useEffect(() => {
    if (progress?.status === "unread") {
      onProgressUpdate({ status: "reading", lastOpened: new Date().toISOString() });
    }
  }, []);

  // Track time on close
  useEffect(() => {
    return () => {
      const minutes = Math.round((Date.now() - timeStart) / 60000);
      if (minutes > 0) {
        onProgressUpdate({
          timeSpent: (progress?.timeSpent || 0) + minutes,
          notes,
          progress: prog,
        });
      }
    };
  }, [notes, prog]);

  const fileUrl = `/api/drive/file?id=${file.id}`;

  const handleSave = () => {
    onProgressUpdate({ notes, progress: prog });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--white)",
            padding: "6px 14px",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div
            className="font-display"
            style={{ fontSize: 13, fontWeight: 600, marginBottom: 1 }}
          >
            {file.name}
          </div>
        </div>

        {/* Progress control */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, color: "var(--white-30)" }}>Progress</span>
          <input
            type="range"
            min={0}
            max={100}
            value={prog}
            onChange={(e) => setProg(parseInt(e.target.value))}
            style={{ width: 80, accentColor: "#f5c518" }}
          />
          <span style={{ fontSize: 11, color: "#f5c518", minWidth: 28 }}>{prog}%</span>
        </div>

        <button
          onClick={handleSave}
          style={{
            padding: "6px 16px",
            background: "var(--white)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-display)",
          }}
        >
          SAVE
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Document viewer */}
        <div style={{ flex: 1, position: "relative", background: "#111" }}>
          {isLoading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  border: "2px solid var(--border)",
                  borderTop: "2px solid var(--white)",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <span style={{ fontSize: 12, color: "var(--white-30)" }}>Loading from Drive…</span>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={fileUrl}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              opacity: isLoading ? 0 : 1,
              transition: "opacity 0.3s",
            }}
            onLoad={() => setIsLoading(false)}
            title={file.name}
          />
        </div>

        {/* Notes panel */}
        <div
          style={{
            width: 280,
            borderLeft: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            padding: 0,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: "16px 16px 12px",
              borderBottom: "1px solid var(--border)",
              fontSize: 10,
              letterSpacing: "0.25em",
              color: "var(--white-30)",
              textTransform: "uppercase",
            }}
          >
            Notes
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Jot down thoughts, key points, questions…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "var(--white-60)",
              padding: "14px 16px",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              resize: "none",
              outline: "none",
              lineHeight: 1.7,
            }}
          />
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ fontSize: 10, color: "var(--white-30)" }}>
              Session time: {Math.round((Date.now() - timeStart) / 60000)} min
            </div>
            <div style={{ fontSize: 10, color: "var(--white-30)" }}>
              Total: {progress?.timeSpent || 0} min
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
