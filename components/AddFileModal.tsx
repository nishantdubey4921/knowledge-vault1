"use client";
import { useState, useEffect } from "react";
import { DriveFile, Category, CATEGORIES } from "@/lib/types";

interface Props {
  onAdd: (file: DriveFile, category: Category) => void;
  onClose: () => void;
  alreadyAdded: Set<string>;
}

export default function AddFileModal({ onAdd, onClose, alreadyAdded }: Props) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCat, setSelectedCat] = useState<Category>("formal-sciences");

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const url = q ? `/api/drive/files?q=${encodeURIComponent(q)}` : "/api/drive/files";
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFiles(data.files || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load Drive files");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFiles(search);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.88)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          width: "100%",
          maxWidth: 620,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              className="font-display"
              style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}
            >
              Add from Google Drive
            </div>
            <div style={{ fontSize: 11, color: "var(--white-30)" }}>
              Select files to add to your vault
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--white-30)",
              fontSize: 20,
              cursor: "pointer",
              padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Category select */}
        <div
          style={{
            padding: "14px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              style={{
                padding: "5px 12px",
                borderRadius: 6,
                border: `1px solid ${selectedCat === c.id ? "var(--white)" : "var(--border)"}`,
                background: selectedCat === c.id ? "var(--white-10)" : "transparent",
                color: selectedCat === c.id ? "var(--white)" : "var(--white-30)",
                fontSize: 11,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}
            >
              {c.glyph} {c.short}
            </button>
          ))}
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          style={{
            padding: "12px 24px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 8,
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Drive files…"
            style={{
              flex: 1,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              color: "var(--white)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: "var(--surface-3)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--white)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "var(--font-mono)",
            }}
          >
            Search
          </button>
        </form>

        {/* File list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {loading && (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--white-30)",
                fontSize: 12,
              }}
            >
              Loading Drive…
            </div>
          )}
          {error && (
            <div style={{ padding: 24 }}>
              <div
                style={{
                  background: "rgba(255,68,68,0.08)",
                  border: "1px solid rgba(255,68,68,0.3)",
                  borderRadius: 8,
                  padding: 14,
                  fontSize: 12,
                  color: "#ff8888",
                }}
              >
                <strong>Error:</strong> {error}
                <br />
                <br />
                <span style={{ color: "var(--white-30)", fontSize: 11 }}>
                  Make sure GOOGLE_SERVICE_ACCOUNT_JSON and GOOGLE_DRIVE_FOLDER_ID are set in .env.local
                </span>
              </div>
            </div>
          )}
          {!loading && !error && files.length === 0 && (
            <div
              style={{
                padding: 32,
                textAlign: "center",
                color: "var(--white-30)",
                fontSize: 12,
              }}
            >
              No files found
            </div>
          )}
          {!loading &&
            !error &&
            files.map((f) => {
              const added = alreadyAdded.has(f.id);
              return (
                <div
                  key={f.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 24px",
                    borderBottom: "1px solid var(--border)",
                    opacity: added ? 0.4 : 1,
                  }}
                >
                  <span style={{ fontSize: 16, opacity: 0.5 }}>▣</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        marginBottom: 2,
                      }}
                    >
                      {f.name}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--white-30)" }}>
                      {f.mimeType.split(".").pop()?.replace("vnd.google-apps.", "GDoc: ") || "file"}
                    </div>
                  </div>
                  <button
                    disabled={added}
                    onClick={() => onAdd(f, selectedCat)}
                    style={{
                      padding: "6px 14px",
                      background: added ? "transparent" : "var(--white)",
                      color: added ? "var(--white-30)" : "var(--bg)",
                      border: `1px solid ${added ? "var(--border)" : "var(--white)"}`,
                      borderRadius: 6,
                      fontSize: 11,
                      cursor: added ? "default" : "pointer",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    {added ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
