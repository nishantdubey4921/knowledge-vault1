"use client";
import { DriveFile, ReadingProgress, CATEGORIES } from "@/lib/types";

interface Props {
  file: DriveFile;
  progress?: ReadingProgress;
  onOpen: () => void;
  onStatusChange: (status: "unread" | "reading" | "done") => void;
  onRemove: () => void;
}

const STATUS_COLOR = {
  unread: "var(--white-30)",
  reading: "#f5c518",
  done: "var(--success)",
};

const STATUS_LABEL = {
  unread: "UNREAD",
  reading: "READING",
  done: "DONE",
};

function getFileIcon(mimeType: string): string {
  if (mimeType.includes("pdf")) return "▣";
  if (mimeType.includes("document")) return "▤";
  if (mimeType.includes("spreadsheet")) return "▥";
  if (mimeType.includes("presentation")) return "▦";
  if (mimeType.includes("image")) return "▧";
  return "▨";
}

function formatSize(size?: string): string {
  if (!size) return "—";
  const bytes = parseInt(size);
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export default function FileCard({ file, progress, onOpen, onStatusChange, onRemove }: Props) {
  const status = progress?.status || "unread";
  const prog = progress?.progress || 0;
  const cat = progress?.category;
  const catMeta = CATEGORIES.find((c) => c.id === cat);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        transition: "border-color 0.15s, transform 0.15s",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-bright)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
      }}
    >
      {/* Progress bar top */}
      {status !== "unread" && (
        <div
          style={{
            position: "absolute",
            top: 0, left: 0,
            height: 2,
            width: `${prog}%`,
            background: status === "done" ? "var(--success)" : "#f5c518",
            transition: "width 0.3s",
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            fontSize: 22,
            lineHeight: 1,
            opacity: 0.6,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {getFileIcon(file.mimeType)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="font-display"
            style={{
              fontSize: 14,
              fontWeight: 600,
              lineHeight: 1.35,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              marginBottom: 4,
            }}
          >
            {file.name}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {catMeta && (
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.2em",
                  color: "var(--white-30)",
                  background: "var(--surface-3)",
                  padding: "2px 6px",
                  borderRadius: 3,
                }}
              >
                {catMeta.short}
              </span>
            )}
            <span style={{ fontSize: 10, color: "var(--white-30)" }}>
              {formatSize(file.size)}
            </span>
            <span style={{ fontSize: 10, color: "var(--white-30)" }}>
              {formatDate(file.modifiedTime)}
            </span>
          </div>
        </div>
        {/* Status badge */}
        <span
          style={{
            fontSize: 9,
            letterSpacing: "0.2em",
            color: STATUS_COLOR[status],
            border: `1px solid ${STATUS_COLOR[status]}`,
            padding: "3px 7px",
            borderRadius: 4,
            flexShrink: 0,
          }}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Notes preview */}
      {progress?.notes && (
        <div
          style={{
            fontSize: 11,
            color: "var(--white-30)",
            borderLeft: "2px solid var(--border)",
            paddingLeft: 10,
            lineHeight: 1.6,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {progress.notes}
        </div>
      )}

      {/* Progress row */}
      {status === "reading" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              flex: 1,
              height: 4,
              background: "var(--surface-3)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${prog}%`,
                background: "#f5c518",
                borderRadius: 2,
              }}
            />
          </div>
          <span style={{ fontSize: 10, color: "var(--white-30)", minWidth: 28 }}>
            {prog}%
          </span>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onOpen}
          style={{
            flex: 1,
            padding: "8px 12px",
            background: "var(--white)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.05em",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = "0.85")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = "1")}
        >
          OPEN
        </button>

        <select
          value={status}
          onChange={(e) =>
            onStatusChange(e.target.value as "unread" | "reading" | "done")
          }
          style={{
            padding: "8px 10px",
            background: "var(--surface-2)",
            color: "var(--white-60)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 11,
            cursor: "pointer",
            fontFamily: "var(--font-mono)",
          }}
        >
          <option value="unread">Unread</option>
          <option value="reading">Reading</option>
          <option value="done">Done</option>
        </select>

        <button
          onClick={onRemove}
          title="Remove from vault"
          style={{
            padding: "8px 10px",
            background: "transparent",
            color: "var(--white-30)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--danger)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--danger)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--white-30)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
