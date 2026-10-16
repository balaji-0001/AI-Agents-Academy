import { useEffect, useState } from "react";

const KEY = "academy-progress-v1";
type State = { completed: string[]; bookmarks: string[] };
const empty: State = { completed: ["m1-l1", "m1-l2", "m1-l3", "m2-l1"], bookmarks: [] };

function read(): State {
  try { return { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "null") }; } catch { return empty; }
}

export function useProgress() {
  const [state, setState] = useState<State>(empty);
  useEffect(() => setState(read()), []);
  const update = (fn: (s: State) => State) =>
    setState((s) => { const n = fn(s); localStorage.setItem(KEY, JSON.stringify(n)); return n; });
  const toggle = (list: "completed" | "bookmarks", id: string) =>
    update((s) => ({ ...s, [list]: s[list].includes(id) ? s[list].filter((x) => x !== id) : [...s[list], id] }));
  return { ...state, toggleComplete: (id: string) => toggle("completed", id), toggleBookmark: (id: string) => toggle("bookmarks", id) };
}
