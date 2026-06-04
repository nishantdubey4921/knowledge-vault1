"use client";
import { CATEGORIES, Category, CategoryMeta } from "@/lib/types";
import { VaultStore, getStats } from "@/lib/store";

interface Props {
  active: Category | "all";
  onSelect: (c: Category | "all") => void;
  store: VaultStore;
}

export default function CategorySidebar({ active, onSelect, store }: Props) {
  const stats = getStats(store);

  const catCount = (id: Category) => store.categoryFiles[id]?.length || 0;
  const catDone = (id: Category) => {
    return (store.categoryFiles[id] || []).filter(
      (fid) => store.files[fid]?.status === "done"
    ).length;
  };

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 0",
        gap: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 24px 32px" }}>
        <div
          className="font-display"
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            color: "var(--white-30)",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          System
        </div>
        <div
          className="font-display"
          style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          KNOWLEDGE
          <br />
          VAULT
        </div>
      </div>

      {/* Stats strip */}
      <div
        style={{
          margin: "0 16px 24px",
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "12px 14px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
        }}
      >
        {[
          { label: "Total", val: stats.total },
          { label: "Done", val: stats.done },
          { label: "Reading", val: stats.reading },
          { label: "Hours", val: Math.round(stats.totalTime / 60) },
        ].map(({ label, val }) => (
          <div key={label}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
              }}
            >
              {val}
            </div>
            <div style={{ fontSize: 9, color: "var(--white-30)", letterSpacing: "0.15em" }}>
              {label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* All */}
      <NavItem
        label="All Files"
        glyph="⊞"
        isActive={active === "all"}
        onClick={() => onSelect("all")}
        count={stats.total}
        done={stats.done}
        total={stats.total}
      />

      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.25em",
          color: "var(--white-30)",
          padding: "16px 24px 8px",
          textTransform: "uppercase",
        }}
      >
        Categories
      </div>

      {CATEGORIES.map((cat) => (
        <NavItem
          key={cat.id}
          label={cat.label}
          glyph={cat.glyph}
          isActive={active === cat.id}
          onClick={() => onSelect(cat.id)}
          count={catCount(cat.id)}
          done={catDone(cat.id)}
          total={catCount(cat.id)}
        />
      ))}

      <div style={{ flex: 1 }} />
      <div
        style={{
          padding: "16px 24px",
          fontSize: 10,
          color: "var(--white-30)",
          fontFamily: "var(--font-mono)",
          borderTop: "1px solid var(--border)",
        }}
      >
        Files stored on Google Drive.
        <br />
        No storage used locally.
      </div>
    </aside>
  );
}

function NavItem({
  label, glyph, isActive, onClick, count, done, total,
}: {
  label: string; glyph: string; isActive: boolean;
  onClick: () => void; count: number; done: number; total: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 24px",
        background: isActive ? "var(--white-10)" : "transparent",
        border: "none",
        borderLeft: isActive
          ? "2px solid var(--white)"
          : "2px solid transparent",
        cursor: "pointer",
        color: isActive ? "var(--white)" : "var(--white-60)",
        width: "100%",
        textAlign: "left",
        transition: "all 0.15s",
        fontFamily: "var(--font-mono)",
      }}
    >
      <span style={{ fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 }}>
        {glyph}
      </span>
      <span style={{ flex: 1, fontSize: 12, letterSpacing: "0.01em" }}>{label}</span>
      <span
        style={{
          fontSize: 10,
          color: "var(--white-30)",
          background: "var(--surface-3)",
          padding: "2px 6px",
          borderRadius: 4,
          minWidth: 20,
          textAlign: "center",
        }}
      >
        {count}
      </span>
    </button>
  );
}
