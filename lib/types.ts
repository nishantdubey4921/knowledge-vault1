export type Category =
  | "formal-sciences"
  | "natural-sciences"
  | "social-sciences"
  | "arts-humanities"
  | "applied-sciences";

export interface CategoryMeta {
  id: Category;
  label: string;
  short: string;
  glyph: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: "formal-sciences",
    label: "Formal Sciences",
    short: "FORM",
    glyph: "∑",
    description: "Math, Logic, Statistics, CS Theory",
  },
  {
    id: "natural-sciences",
    label: "Natural Sciences",
    short: "NATL",
    glyph: "⬡",
    description: "Physics, Biology, Chemistry, Astronomy",
  },
  {
    id: "social-sciences",
    label: "Social Sciences",
    short: "SOCL",
    glyph: "◎",
    description: "Economics, Psychology, Sociology, History",
  },
  {
    id: "arts-humanities",
    label: "Arts & Humanities",
    short: "ARTS",
    glyph: "◈",
    description: "Literature, Philosophy, Fine Arts, Music",
  },
  {
    id: "applied-sciences",
    label: "Applied Sciences",
    short: "APPL",
    glyph: "⟳",
    description: "Engineering, Medicine, Architecture, Tech",
  },
];

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
}

export interface ReadingProgress {
  fileId: string;
  status: "unread" | "reading" | "done";
  progress: number; // 0-100
  notes: string;
  lastOpened?: string;
  timeSpent: number; // minutes
  addedAt: string;
  category: Category;
}

export interface VaultStore {
  files: Record<string, ReadingProgress>;
  categoryFiles: Record<Category, string[]>; // fileId[]
}
