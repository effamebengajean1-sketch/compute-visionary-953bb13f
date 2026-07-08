// CompilLab — Modèle de données des automates finis (couche "moteur").
// Tous les algorithmes opèrent sur ces structures pures et immuables.

export const EPSILON = "ε";

export interface AutomatonState {
  id: string;
  label: string;
  isInitial: boolean;
  isFinal: boolean;
  x: number;
  y: number;
}

export interface Transition {
  id: string;
  from: string;
  to: string;
  symbol: string; // un symbole de l'alphabet, ou EPSILON
}

export interface Automaton {
  id: string;
  name: string;
  alphabet: string[]; // n'inclut jamais EPSILON
  states: AutomatonState[];
  transitions: Transition[];
}

export type AutomatonKind = "AFD" | "AFN" | "ε-AFN";

/** Cas de test pédagogique : une chaîne et le résultat attendu (accepté ou rejeté). */
export interface TestCase {
  input: string;
  accept: boolean;
}

export interface AutomatonProperties {
  stateCount: number;
  transitionCount: number;
  alphabet: string[];
  initialStates: string[];
  finalStates: string[];
  kind: AutomatonKind;
  hasEpsilon: boolean;
  isDeterministic: boolean;
  isComplete: boolean;
}

let counter = 0;
export function uid(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export function emptyAutomaton(name = "Nouvel automate"): Automaton {
  return {
    id: uid("aut"),
    name,
    alphabet: ["a", "b"],
    states: [],
    transitions: [],
  };
}

export function cloneAutomaton(a: Automaton, name?: string): Automaton {
  return {
    id: uid("aut"),
    name: name ?? `${a.name} (copie)`,
    alphabet: [...a.alphabet],
    states: a.states.map((s) => ({ ...s })),
    transitions: a.transitions.map((t) => ({ ...t })),
  };
}

// ---- Helpers ----

export function stateById(a: Automaton, id: string): AutomatonState | undefined {
  return a.states.find((s) => s.id === id);
}

export function stateLabel(a: Automaton, id: string): string {
  return stateById(a, id)?.label ?? id;
}

export function initialStateIds(a: Automaton): string[] {
  return a.states.filter((s) => s.isInitial).map((s) => s.id);
}

export function finalStateIds(a: Automaton): string[] {
  return a.states.filter((s) => s.isFinal).map((s) => s.id);
}

export function hasEpsilon(a: Automaton): boolean {
  return a.transitions.some((t) => t.symbol === EPSILON);
}

/** Transitions depuis `stateId` sur `symbol`. */
export function delta(a: Automaton, stateId: string, symbol: string): string[] {
  return a.transitions
    .filter((t) => t.from === stateId && t.symbol === symbol)
    .map((t) => t.to);
}

export function isDeterministic(a: Automaton): boolean {
  if (hasEpsilon(a)) return false;
  if (initialStateIds(a).length > 1) return false;
  for (const s of a.states) {
    for (const sym of a.alphabet) {
      if (delta(a, s.id, sym).length > 1) return false;
    }
  }
  return true;
}

export function isComplete(a: Automaton): boolean {
  if (hasEpsilon(a)) return false;
  if (a.states.length === 0) return false;
  for (const s of a.states) {
    for (const sym of a.alphabet) {
      if (delta(a, s.id, sym).length === 0) return false;
    }
  }
  return true;
}

export function kindOf(a: Automaton): AutomatonKind {
  if (hasEpsilon(a)) return "ε-AFN";
  return isDeterministic(a) ? "AFD" : "AFN";
}

export function getProperties(a: Automaton): AutomatonProperties {
  return {
    stateCount: a.states.length,
    transitionCount: a.transitions.length,
    alphabet: a.alphabet,
    initialStates: initialStateIds(a).map((id) => stateLabel(a, id)),
    finalStates: finalStateIds(a).map((id) => stateLabel(a, id)),
    kind: kindOf(a),
    hasEpsilon: hasEpsilon(a),
    isDeterministic: isDeterministic(a),
    isComplete: isComplete(a),
  };
}
