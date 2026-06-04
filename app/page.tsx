"use client";
import { useState, useEffect, useCallback } from "react";
import { Category, DriveFile, ReadingProgress, CATEGORIES } from "@/lib/types";
import {
  getStore,
  addFileToVault,
  updateProgress,
  removeFileFromVault,
  VaultStore,
} from "@/lib/store";
import CategorySidebar from "@/components/CategorySidebar";
import FileCard from "@/components/FileCard";
import FileViewer from "@/components/FileViewer";
import AddFileModal from "@/components/AddFileModal";

type FilterStatus = "all" | "unread" | "reading" | "done";

export default function Home() {
  const [store, setStore] = useState<VaultStore>({
    files: {},
    categoryFiles: {
      "formal-sciences": [],
      "natural-sciences": [],
      "social-sciences": [],
      "arts-humanities": [],
      "applied-sciences": [],
    },
  });
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [driveFiles, setDriveFiles] = useState<Record<string, DriveFile>>({});
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    setStore(getStore());
  }, []);

  // Fetch Drive metadata for files in vault
  const fetchFileMeta = useCallback(async (fileIds: string[]) => {
    const missing = fileIds.filter((id) => !driveFiles[id]);
    if (missing.length === 0) return;

    setLoadingFiles(new Set(missing));
    try {
      const res = await fetch("/api/drive/files");
      const data = await res.json();
      if (data.files) {
        const map: Record<string, DriveFile> = {};
        data.files.forEach((f: DriveFile) => {
          map[f.id] = f;
        });
        setDriveFiles((prev) => ({ ...prev, ...map }));
      }
    } catch {}
    setLoadingFiles(new Set());
  }, [driveFiles]);

  useEffect(() => {
    const ids = Object.keys(store.files);
    if (ids.length > 0) fetchFileMeta(ids);
  }, [store.files]);

  const getVisibleFileIds = (): string[] => {
    let ids: string[] =
      activeCategory === "all"
        ? Object.keys(store.files)
        : store.categoryFiles[activeCategory] || [];

    if (filterStatus !== "all") {
      ids = ids.filter((id) => store.files[id]?.status === filterStatus);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      ids = ids.filter((id) => {
        const name = driveFiles[id]?.name?.toLowerCase() || "";
        const notes = store.files[id]?.notes?.toLowerCase() || "";
        return name.includes(q) || notes.includes(q);
      });
    }

    return ids;
  };

  const handleAdd = (file: DriveFile, category: Category) => {
    const newStore = addFileToVault(file.id, category);
    setStore(newStore);
    setDriveFiles((prev) => ({ ...prev, [file.id]: file }));
  };

  const handleStatusChange = (fileId: string, status: "unread" | "reading" | "done") => {
    const newStore = updateProgress(fileId, { status });
    setStore(newStore);
  };

  const handleRemove = (fileId: string) => {
    const newStore = removeFileFromVault(fileId);
    setStore(newStore);
  };

  const handleProgressUpdate = (fileId: string, p: Partial<ReadingProgress>) => {
    const newStore = updateProgress(fileId, p);
    setStore(newStore);
  };

  const visibleIds = getVisibleFileIds();
  const viewingFileData = viewingFile ? driveFiles[viewingFile] : null;
  const viewingProgress = viewingFile ? store.files[viewingFile] : undefined;

  const catMeta = activeCategory !== "all" 
    ? CATEGORIES.find(c => c.id === activeCategory) 
    : null;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <CategorySidebar
        active={activeCategory}
        onSelect={setActiveCategory}
        store={store}
      />

      {/* Main content */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div
          style={{
            padding: "20px 28px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "var(--surface)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              className="font-display"
              style={{
                fontSize: 11,
                letterSpacing: "0.25em",
                color: "var(--white-30)",
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {activeCategory === "all" ? "All Categories" : catMeta?.description}
            </div>
            <h1
              className="font-display"
              style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              {activeCategory === "all"
                ? "All Files"
                : catMeta?.label}
            </h1>
          </div>

          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vault…"
            style={{
              padding: "8px 14px",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              color: "var(--white)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              outline: "none",
              width: 200,
            }}
          />

          {/* Status filter */}
          <div style={{ display: "flex", gap: 4 }}>
            {(["all", "unread", "reading", "done"] as FilterStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 5,
                  border: `1px solid ${filterStatus === s ? "var(--white)" : "var(--border)"}`,
                  background: filterStatus === s ? "var(--white-10)" : "transparent",
                  color: filterStatus === s ? "var(--white)" : "var(--white-30)",
                  fontSize: 10,
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAdd(true)}
            style={{
              padding: "8px 18px",
              background: "var(--white)",
              color: "var(--bg)",
              border: "none",
              borderRadius: 7,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-display)",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            + ADD FILE
          </button>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
          {visibleIds.length === 0 ? (
            <EmptyState
              hasFiles={Object.keys(store.files).length > 0}
              onAdd={() => setShowAdd(true)}
            />
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16,
              }}
            >
              {visibleIds.map((id) => {
                const file = driveFiles[id];
                const progress = store.files[id];
                if (!file) {
                  return (
                    <div
                      key={id}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: 20,
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          border: "1.5px solid var(--border)",
                          borderTop: "1.5px solid var(--white-30)",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <span style={{ fontSize: 11, color: "var(--white-30)" }}>
                        Loading…
                      </span>
                    </div>
                  );
                }
                return (
                  <FileCard
                    key={id}
                    file={file}
                    progress={progress}
                    onOpen={() => setViewingFile(id)}
                    onStatusChange={(status) => handleStatusChange(id, status)}
                    onRemove={() => handleRemove(id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* File Viewer */}
      {viewingFile && viewingFileData && (
        <FileViewer
          file={viewingFileData}
          progress={viewingProgress}
          onClose={() => setViewingFile(null)}
          onProgressUpdate={(p) => handleProgressUpdate(viewingFile, p)}
        />
      )}

      {/* Add Modal */}
      {showAdd && (
        <AddFileModal
          onAdd={handleAdd}
          onClose={() => setShowAdd(false)}
          alreadyAdded={new Set(Object.keys(store.files))}
        />
      )}
    </div>
  );
}

function EmptyState({ hasFiles, onAdd }: { hasFiles: boolean; onAdd: () => void }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 400,
        gap: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: 48,
          opacity: 0.15,
          fontFamily: "var(--font-display)",
          fontWeight: 800,
        }}
      >
        ∅
      </div>
      <div className="font-display" style={{ fontSize: 18, fontWeight: 700 }}>
        {hasFiles ? "No files match filter" : "Your vault is empty"}
      </div>
      <div style={{ fontSize: 12, color: "var(--white-30)", maxWidth: 300 }}>
        {hasFiles
          ? "Try clearing the filter or search query."
          : "Add files from your Google Drive to start tracking your reading."}
      </div>
      {!hasFiles && (
        <button
          onClick={onAdd}
          style={{
            marginTop: 8,
            padding: "10px 24px",
            background: "var(--white)",
            color: "var(--bg)",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "var(--font-display)",
          }}
        >
          + ADD YOUR FIRST FILE
        </button>
      )}
    </div>
  );
}
