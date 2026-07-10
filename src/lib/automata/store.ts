// CompilLab — Store global (couche état/UI).
import { create } from "zustand";
import {
  Automaton,
  AutomatonState,
  EPSILON,
  emptyAutomaton,
  cloneAutomaton,
  uid,
} from "./types";
import {
  loadCurrent,
  loadLibrary,
  saveCurrent,
  saveLibrary,
  importJson,
} from "./storage";
import { RecognitionResult } from "./algorithms";

export interface HistoryEntry {
  id: string;
  label: string;
  detail: string;
  time: number;
}

export interface ResultData {
  title: string;
  message: string;
  steps: string[];
  recognition?: RecognitionResult;
  automaton?: Automaton;
  regex?: string;
}

interface AutomataState {
  current: Automaton;
  library: Automaton[];
  history: HistoryEntry[];
  result: ResultData | null;
  selectedStateId: string | null;
  highlightStates: string[];

  hydrate: () => void;
  persist: () => void;

  setCurrent: (a: Automaton, log?: string) => void;
  newAutomaton: () => void;
  duplicate: () => void;
  reset: () => void;
  importText: (text: string) => void;
  saveToLibrary: () => void;
  removeFromLibrary: (id: string) => void;
  loadFromLibrary: (id: string) => void;

  rename: (name: string) => void;
  setAlphabet: (symbols: string[]) => void;

  addState: () => void;
  removeState: (id: string) => void;
  renameState: (id: string, label: string) => void;
  toggleInitial: (id: string) => void;
  toggleFinal: (id: string) => void;
  moveState: (id: string, x: number, y: number) => void;
  selectState: (id: string | null) => void;

  addTransition: (from: string, to: string, symbol: string) => void;
  removeTransition: (id: string) => void;

  log: (label: string, detail: string) => void;
  setResult: (r: ResultData | null) => void;
  setHighlight: (ids: string[]) => void;
  clearHistory: () => void;
}

function defaultAutomaton(): Automaton {
  const a = emptyAutomaton("Mon automate");
  return a;
}

export const useAutomataStore = create<AutomataState>((set, get) => ({
  current: defaultAutomaton(),
  library: [],
  history: [],
  result: null,
  selectedStateId: null,
  highlightStates: [],

  hydrate: () => {
    const current = loadCurrent();
    const library = loadLibrary();
    set({
      current: current ?? defaultAutomaton(),
      library,
    });
  },

  persist: () => {
    saveCurrent(get().current);
    saveLibrary(get().library);
  },

  setCurrent: (a, logLabel) => {
    set({ current: a, selectedStateId: null, highlightStates: [] });
    if (logLabel) get().log(logLabel, a.name);
    get().persist();
  },

  newAutomaton: () => {
    set({ current: defaultAutomaton(), result: null, selectedStateId: null, highlightStates: [] });
    get().log("Nouvel automate", "Espace de travail réinitialisé");
    get().persist();
  },

  duplicate: () => {
    const copy = cloneAutomaton(get().current);
    set({ current: copy });
    get().log("Duplication", copy.name);
    get().persist();
  },

  reset: () => {
    const a = get().current;
    set({
      current: { ...a, states: [], transitions: [] },
      result: null,
      selectedStateId: null,
      highlightStates: [],
    });
    get().log("Réinitialisation", "États et transitions effacés");
    get().persist();
  },

  importText: (text) => {
    const a = importJson(text);
    set({ current: a, result: null, selectedStateId: null, highlightStates: [] });
    get().log("Import JSON", a.name);
    get().persist();
  },

  saveToLibrary: () => {
    const a = get().current;
    const lib = get().library.filter((x) => x.id !== a.id);
    const snapshot = { ...a, states: a.states.map((s) => ({ ...s })), transitions: a.transitions.map((t) => ({ ...t })) };
    set({ library: [...lib, snapshot] });
    get().log("Sauvegarde", a.name);
    get().persist();
  },

  removeFromLibrary: (id) => {
    set({ library: get().library.filter((x) => x.id !== id) });
    get().persist();
  },

  loadFromLibrary: (id) => {
    const a = get().library.find((x) => x.id === id);
    if (a) {
      set({ current: cloneAutomaton(a, a.name), result: null });
      get().log("Chargement", a.name);
      get().persist();
    }
  },

  rename: (name) => {
    set({ current: { ...get().current, name } });
    get().persist();
  },

  setAlphabet: (symbols) => {
    const clean = Array.from(new Set(symbols.map((s) => s.trim()).filter((s) => s && s !== EPSILON)));
    const a = get().current;
    // Supprimer les transitions devenues invalides (hors alphabet, hors ε).
    const valid = new Set([...clean, EPSILON]);
    const transitions = a.transitions.filter((t) => valid.has(t.symbol));
    set({ current: { ...a, alphabet: clean, transitions } });
    get().log("Modification alphabet", `{ ${clean.join(", ")} }`);
    get().persist();
  },

  addState: () => {
    const a = get().current;
    const n = a.states.length;
    const label = `q${n}`;
    const newState: AutomatonState = {
      id: uid("q"),
      label,
      isInitial: n === 0,
      isFinal: false,
      x: 220 + (n % 5) * 140,
      y: 200 + Math.floor(n / 5) * 140,
    };
    set({ current: { ...a, states: [...a.states, newState] }, selectedStateId: newState.id });
    get().log("Ajout d'état", label);
    get().persist();
  },

  removeState: (id) => {
    const a = get().current;
    const label = a.states.find((s) => s.id === id)?.label ?? id;
    set({
      current: {
        ...a,
        states: a.states.filter((s) => s.id !== id),
        transitions: a.transitions.filter((t) => t.from !== id && t.to !== id),
      },
      selectedStateId: null,
    });
    get().log("Suppression d'état", label);
    get().persist();
  },

  renameState: (id, label) => {
    const a = get().current;
    set({
      current: { ...a, states: a.states.map((s) => (s.id === id ? { ...s, label } : s)) },
    });
    get().persist();
  },

  toggleInitial: (id) => {
    const a = get().current;
    set({
      current: { ...a, states: a.states.map((s) => (s.id === id ? { ...s, isInitial: !s.isInitial } : s)) },
    });
    get().persist();
  },

  toggleFinal: (id) => {
    const a = get().current;
    set({
      current: { ...a, states: a.states.map((s) => (s.id === id ? { ...s, isFinal: !s.isFinal } : s)) },
    });
    get().persist();
  },

  moveState: (id, x, y) => {
    const a = get().current;
    set({
      current: { ...a, states: a.states.map((s) => (s.id === id ? { ...s, x, y } : s)) },
    });
  },

  selectState: (id) => set({ selectedStateId: id }),

  addTransition: (from, to, symbol) => {
    const a = get().current;
    const exists = a.transitions.some((t) => t.from === from && t.to === to && t.symbol === symbol);
    if (exists) return;
    set({
      current: { ...a, transitions: [...a.transitions, { id: uid("t"), from, to, symbol }] },
    });
    get().log("Ajout transition", symbol);
    get().persist();
  },

  removeTransition: (id) => {
    const a = get().current;
    set({ current: { ...a, transitions: a.transitions.filter((t) => t.id !== id) } });
    get().log("Suppression transition", "");
    get().persist();
  },

  log: (label, detail) =>
    set((state) => ({
      history: [{ id: uid("h"), label, detail, time: Date.now() }, ...state.history].slice(0, 100),
    })),

  setResult: (result) => set({ result }),
  setHighlight: (highlightStates) => set({ highlightStates }),
  clearHistory: () => set({ history: [] }),
}));
