"use client";

import { useState, useEffect, createContext, useContext } from "react";

export type ViewMode = "grid" | "list" | "compact";

const ViewContext = createContext<{
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
}>({ mode: "grid", setMode: () => {} });

export function useViewMode() {
  return useContext(ViewContext);
}

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ViewMode>("grid");

  useEffect(() => {
    const saved = localStorage.getItem("catalog-view") as ViewMode | null;
    if (saved && ["grid", "list", "compact"].includes(saved)) {
      setModeState(saved);
    }
  }, []);

  const setMode = (m: ViewMode) => {
    setModeState(m);
    localStorage.setItem("catalog-view", m);
  };

  return (
    <ViewContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewContext.Provider>
  );
}

const ICONS: Record<ViewMode, { path: string; label: string }> = {
  grid: {
    path: "M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z",
    label: "Grid",
  },
  list: {
    path: "M4 6h16M4 12h16M4 18h16",
    label: "Lijst",
  },
  compact: {
    path: "M4 5a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V5zM4 11a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zM4 17a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2zm6 0a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z",
    label: "Compact",
  },
};

export default function CatalogViewToggle() {
  const { mode, setMode } = useViewMode();

  return (
    <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
      {(Object.keys(ICONS) as ViewMode[]).map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          title={ICONS[m].label}
          className={`p-1.5 rounded-md transition-all ${
            mode === m
              ? "bg-white text-navy shadow-sm"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <svg className="w-4 h-4" fill={m === "list" ? "none" : "currentColor"} stroke={m === "list" ? "currentColor" : "none"} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={m === "list" ? 2 : 0}
              d={ICONS[m].path}
            />
          </svg>
        </button>
      ))}
    </div>
  );
}
