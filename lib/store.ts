import { VaultStore, Category, ReadingProgress } from "./types";
export type { VaultStore };

const STORE_KEY = "knowledge-vault-v1";

const defaultStore = (): VaultStore => ({
  files: {},
  categoryFiles: {
    "formal-sciences": [],
    "natural-sciences": [],
    "social-sciences": [],
    "arts-humanities": [],
    "applied-sciences": [],
  },
});

export function getStore(): VaultStore {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return defaultStore();
    return JSON.parse(raw);
  } catch {
    return defaultStore();
  }
}

export function saveStore(store: VaultStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
}

export function addFileToVault(
  fileId: string,
  category: Category
): VaultStore {
  const store = getStore();
  if (!store.files[fileId]) {
    store.files[fileId] = {
      fileId,
      status: "unread",
      progress: 0,
      notes: "",
      timeSpent: 0,
      addedAt: new Date().toISOString(),
      category,
    };
  }
  if (!store.categoryFiles[category].includes(fileId)) {
    store.categoryFiles[category].push(fileId);
  }
  saveStore(store);
  return store;
}

export function updateProgress(
  fileId: string,
  update: Partial<ReadingProgress>
): VaultStore {
  const store = getStore();
  if (store.files[fileId]) {
    store.files[fileId] = { ...store.files[fileId], ...update };
    saveStore(store);
  }
  return store;
}

export function removeFileFromVault(fileId: string): VaultStore {
  const store = getStore();
  delete store.files[fileId];
  for (const cat in store.categoryFiles) {
    store.categoryFiles[cat as Category] = store.categoryFiles[
      cat as Category
    ].filter((id) => id !== fileId);
  }
  saveStore(store);
  return store;
}

export function getStats(store: VaultStore) {
  const all = Object.values(store.files);
  return {
    total: all.length,
    unread: all.filter((f) => f.status === "unread").length,
    reading: all.filter((f) => f.status === "reading").length,
    done: all.filter((f) => f.status === "done").length,
    totalTime: all.reduce((acc, f) => acc + f.timeSpent, 0),
  };
}
