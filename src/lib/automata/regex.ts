// CompilLab — Module Expressions régulières (couche "moteur").
// Parsing d'une regex, constructions de Thompson et Glushkov (regex → automate),
// et théorème d'Arden (automate → regex). Chaque fonction renvoie des étapes
// pédagogiques détaillées.

import {
  Automaton,
  AutomatonState,
  EPSILON,
  TestCase,
  Transition,
  finalStateIds,
  initialStateIds,
  stateLabel,
  uid,
} from "./types";

// ---------------------------------------------------------------------------
// AST des expressions régulières
// ---------------------------------------------------------------------------
export type RegexNode =
  | { t: "empty" } // ∅ : langage vide
  | { t: "eps" } // ε : mot vide
  | { t: "sym"; v: string; pos?: number } // un symbole (pos = indice de linéarisation)
  | { t: "concat"; a: RegexNode; b: RegexNode }
  | { t: "union"; a: RegexNode; b: RegexNode }
  | { t: "star"; a: RegexNode };

export const EMPTY_SET = "∅";

// ---- Tokenizer ----
type Tok =
  | { k: "LP" }
  | { k: "RP" }
  | { k: "STAR" }
  | { k: "UNION" }
  | { k: "EPS" }
  | { k: "EMPTY" }
  | { k: "SYM"; v: string };

function tokenize(src: string): Tok[] {
  const toks: Tok[] = [];
  for (const ch of src) {
    if (ch === " " || ch === "\t" || ch === "\n") continue;
    if (ch === "(") toks.push({ k: "LP" });
    else if (ch === ")") toks.push({ k: "RP" });
    else if (ch === "*") toks.push({ k: "STAR" });
    else if (ch === "|" || ch === "+") toks.push({ k: "UNION" });
    else if (ch === EPSILON || ch === "&") toks.push({ k: "EPS" });
    else if (ch === EMPTY_SET) toks.push({ k: "EMPTY" });
    else if (ch === ".") continue; // concaténation explicite, ignorée
    else toks.push({ k: "SYM", v: ch });
  }
  return toks;
}

// ---- Parseur à descente récursive ----
// Grammaire :  union := concat (('|'|'+') concat)*
//              concat := star+
//              star := atom '*'*
//              atom := SYM | EPS | EMPTY | '(' union ')'
export function parseRegex(src: string): RegexNode {
  const toks = tokenize(src);
  let i = 0;
  const peek = () => toks[i];
  const eat = () => toks[i++];

  function parseUnion(): RegexNode {
    let left = parseConcat();
    while (peek() && peek().k === "UNION") {
      eat();
      const right = parseConcat();
      left = { t: "union", a: left, b: right };
    }
    return left;
  }

  function startsAtom(): boolean {
    const t = peek();
    return !!t && (t.k === "SYM" || t.k === "EPS" || t.k === "EMPTY" || t.k === "LP");
  }

  function parseConcat(): RegexNode {
    if (!startsAtom()) return { t: "eps" };
    let left = parseStar();
    while (startsAtom()) {
      const right = parseStar();
      left = { t: "concat", a: left, b: right };
    }
    return left;
  }

  function parseStar(): RegexNode {
    let node = parseAtom();
    while (peek() && peek().k === "STAR") {
      eat();
      node = { t: "star", a: node };
    }
    return node;
  }

  function parseAtom(): RegexNode {
    const t = peek();
    if (!t) throw new Error("Expression incomplète.");
    if (t.k === "LP") {
      eat();
      const inner = parseUnion();
      if (!peek() || peek().k !== "RP") throw new Error("Parenthèse fermante « ) » manquante.");
      eat();
      return inner;
    }
    if (t.k === "RP") throw new Error("Parenthèse fermante « ) » inattendue.");
    if (t.k === "STAR") throw new Error("Étoile « * » sans opérande.");
    if (t.k === "UNION") throw new Error("Opérateur « | » sans opérande.");
    if (t.k === "EPS") {
      eat();
      return { t: "eps" };
    }
    if (t.k === "EMPTY") {
      eat();
      return { t: "empty" };
    }
    eat();
    return { t: "sym", v: (t as { k: "SYM"; v: string }).v };
  }

  if (toks.length === 0) return { t: "eps" };
  const node = parseUnion();
  if (i < toks.length) throw new Error("Caractère inattendu dans l'expression.");
  return node;
}

// ---- Affichage d'une regex avec parenthésage minimal ----
// précédence : union = 1, concat = 2, star = 3
function prec(n: RegexNode): number {
  switch (n.t) {
    case "union":
      return 1;
    case "concat":
      return 2;
    case "star":
      return 3;
    default:
      return 4;
  }
}

export function regexToString(n: RegexNode, parent = 0): string {
  let s: string;
  switch (n.t) {
    case "empty":
      s = EMPTY_SET;
      break;
    case "eps":
      s = EPSILON;
      break;
    case "sym":
      s = n.pos !== undefined ? `${n.v}${sub(n.pos)}` : n.v;
      break;
    case "star":
      s = `${regexToString(n.a, 3)}*`;
      break;
    case "concat":
      s = `${regexToString(n.a, 2)}${regexToString(n.b, 2)}`;
      break;
    case "union":
      s = `${regexToString(n.a, 1)}|${regexToString(n.b, 1)}`;
      break;
  }
  return prec(n) < parent ? `(${s})` : s;
}

function collectAlphabet(n: RegexNode, into: Set<string>) {
  if (n.t === "sym") into.add(n.v);
  else if (n.t === "concat" || n.t === "union") {
    collectAlphabet(n.a, into);
    collectAlphabet(n.b, into);
  } else if (n.t === "star") collectAlphabet(n.a, into);
}

export function alphabetOf(n: RegexNode): string[] {
  const set = new Set<string>();
  collectAlphabet(n, set);
  return [...set].sort();
}

// ---------------------------------------------------------------------------
// Mises en page
// ---------------------------------------------------------------------------
function layeredLayout(
  states: AutomatonState[],
  transitions: Transition[],
  startIds: string[],
): AutomatonState[] {
  const level = new Map<string, number>();
  const queue = [...startIds];
  startIds.forEach((id) => level.set(id, 0));
  while (queue.length) {
    const cur = queue.shift()!;
    const l = level.get(cur)!;
    for (const t of transitions.filter((x) => x.from === cur)) {
      if (!level.has(t.to)) {
        level.set(t.to, l + 1);
        queue.push(t.to);
      }
    }
  }
  let maxLevel = 0;
  states.forEach((s) => {
    if (!level.has(s.id)) level.set(s.id, 0);
    maxLevel = Math.max(maxLevel, level.get(s.id)!);
  });
  const perLevel = new Map<number, number>();
  return states.map((s) => {
    const l = level.get(s.id)!;
    const idx = perLevel.get(l) ?? 0;
    perLevel.set(l, idx + 1);
    return { ...s, x: 160 + l * 170, y: 140 + idx * 120 };
  });
}

const SUBSCRIPTS = "₀₁₂₃₄₅₆₇₈₉";
function sub(n: number): string {
  return String(n)
    .split("")
    .map((d) => SUBSCRIPTS[Number(d)])
    .join("");
}

export interface RegexBuildResult {
  automaton?: Automaton;
  regex?: string;
  steps: string[];
  message: string;
}

// ---------------------------------------------------------------------------
// Construction de Thompson (regex → ε-AFN)
// ---------------------------------------------------------------------------
export function thompson(src: string): RegexBuildResult {
  const ast = parseRegex(src);
  const alphabet = alphabetOf(ast);
  const states: AutomatonState[] = [];
  const transitions: Transition[] = [];
  const steps: string[] = [];

  const mkState = (): string => {
    const id = uid("q");
    states.push({ id, label: "", isInitial: false, isFinal: false, x: 0, y: 0 });
    return id;
  };
  const addT = (from: string, to: string, symbol: string) =>
    transitions.push({ id: uid("t"), from, to, symbol });

  function build(n: RegexNode): { start: string; accept: string } {
    switch (n.t) {
      case "empty": {
        const s = mkState();
        const a = mkState();
        steps.push(`∅ : deux états sans transition (aucun mot reconnu).`);
        return { start: s, accept: a };
      }
      case "eps": {
        const s = mkState();
        const a = mkState();
        addT(s, a, EPSILON);
        steps.push(`ε : transition ε entre un état initial et un état final.`);
        return { start: s, accept: a };
      }
      case "sym": {
        const s = mkState();
        const a = mkState();
        addT(s, a, n.v);
        steps.push(`Symbole « ${n.v} » : un arc étiqueté ${n.v} entre deux états.`);
        return { start: s, accept: a };
      }
      case "concat": {
        const f1 = build(n.a);
        const f2 = build(n.b);
        addT(f1.accept, f2.start, EPSILON);
        steps.push(
          `Concaténation ${regexToString(n)} : on relie la fin de ${regexToString(
            n.a,
          )} au début de ${regexToString(n.b)} par ε.`,
        );
        return { start: f1.start, accept: f2.accept };
      }
      case "union": {
        const s = mkState();
        const a = mkState();
        const f1 = build(n.a);
        const f2 = build(n.b);
        addT(s, f1.start, EPSILON);
        addT(s, f2.start, EPSILON);
        addT(f1.accept, a, EPSILON);
        addT(f2.accept, a, EPSILON);
        steps.push(
          `Union ${regexToString(n)} : nouvel état initial vers les deux branches, et leurs fins vers un nouvel état final, par ε.`,
        );
        return { start: s, accept: a };
      }
      case "star": {
        const s = mkState();
        const a = mkState();
        const f = build(n.a);
        addT(s, f.start, EPSILON);
        addT(s, a, EPSILON);
        addT(f.accept, f.start, EPSILON);
        addT(f.accept, a, EPSILON);
        steps.push(
          `Étoile ${regexToString(n)} : ε pour entrer/sauter la boucle, et ε de retour pour la répéter.`,
        );
        return { start: s, accept: a };
      }
    }
  }

  steps.unshift(`Expression analysée : ${regexToString(ast)}`);
  const frag = build(ast);
  const startState = states.find((s) => s.id === frag.start)!;
  const acceptState = states.find((s) => s.id === frag.accept)!;
  startState.isInitial = true;
  acceptState.isFinal = true;

  // Étiquettes q0, q1, … selon l'ordre de création.
  states.forEach((s, idx) => (s.label = `q${idx}`));

  steps.push(
    `Automate de Thompson : ${states.length} états, exactement un état initial et un état final, ${transitions.filter((t) => t.symbol === EPSILON).length} ε-transition(s).`,
  );

  return {
    automaton: {
      id: uid("aut"),
      name: `Thompson(${regexToString(ast)})`,
      alphabet,
      states: layeredLayout(states, transitions, [frag.start]),
      transitions,
    },
    steps,
    message: `Construction de Thompson : ε-AFN de ${states.length} états.`,
  };
}

// ---------------------------------------------------------------------------
// Construction de Glushkov (regex → AFN sans ε)
// ---------------------------------------------------------------------------
function linearize(n: RegexNode, counter: { v: number }): RegexNode {
  switch (n.t) {
    case "sym":
      counter.v += 1;
      return { t: "sym", v: n.v, pos: counter.v };
    case "concat":
      return { t: "concat", a: linearize(n.a, counter), b: linearize(n.b, counter) };
    case "union":
      return { t: "union", a: linearize(n.a, counter), b: linearize(n.b, counter) };
    case "star":
      return { t: "star", a: linearize(n.a, counter) };
    default:
      return n;
  }
}

function nullable(n: RegexNode): boolean {
  switch (n.t) {
    case "eps":
    case "star":
      return true;
    case "empty":
    case "sym":
      return false;
    case "union":
      return nullable(n.a) || nullable(n.b);
    case "concat":
      return nullable(n.a) && nullable(n.b);
  }
}

function firstSet(n: RegexNode): number[] {
  switch (n.t) {
    case "sym":
      return [n.pos!];
    case "union":
      return uniq([...firstSet(n.a), ...firstSet(n.b)]);
    case "concat":
      return nullable(n.a) ? uniq([...firstSet(n.a), ...firstSet(n.b)]) : firstSet(n.a);
    case "star":
      return firstSet(n.a);
    default:
      return [];
  }
}

function lastSet(n: RegexNode): number[] {
  switch (n.t) {
    case "sym":
      return [n.pos!];
    case "union":
      return uniq([...lastSet(n.a), ...lastSet(n.b)]);
    case "concat":
      return nullable(n.b) ? uniq([...lastSet(n.a), ...lastSet(n.b)]) : lastSet(n.b);
    case "star":
      return lastSet(n.a);
    default:
      return [];
  }
}

function followSets(n: RegexNode, follow: Map<number, Set<number>>) {
  if (n.t === "concat") {
    followSets(n.a, follow);
    followSets(n.b, follow);
    const f = firstSet(n.b);
    for (const x of lastSet(n.a)) {
      const set = follow.get(x) ?? new Set<number>();
      f.forEach((y) => set.add(y));
      follow.set(x, set);
    }
  } else if (n.t === "union") {
    followSets(n.a, follow);
    followSets(n.b, follow);
  } else if (n.t === "star") {
    followSets(n.a, follow);
    const f = firstSet(n.a);
    for (const x of lastSet(n.a)) {
      const set = follow.get(x) ?? new Set<number>();
      f.forEach((y) => set.add(y));
      follow.set(x, set);
    }
  }
}

function uniq(arr: number[]): number[] {
  return [...new Set(arr)].sort((a, b) => a - b);
}

export function glushkov(src: string): RegexBuildResult {
  const ast = parseRegex(src);
  const alphabet = alphabetOf(ast);
  const lin = linearize(ast, { v: 0 });
  const steps: string[] = [];

  // Symbole de chaque position.
  const symAt = new Map<number, string>();
  (function collect(n: RegexNode) {
    if (n.t === "sym") symAt.set(n.pos!, n.v);
    else if (n.t === "concat" || n.t === "union") {
      collect(n.a);
      collect(n.b);
    } else if (n.t === "star") collect(n.a);
  })(lin);

  const positions = [...symAt.keys()].sort((a, b) => a - b);
  const first = firstSet(lin);
  const last = lastSet(lin);
  const follow = new Map<number, Set<number>>();
  followSets(lin, follow);

  const fmt = (xs: number[]) =>
    xs.length ? `{ ${xs.map((p) => `${symAt.get(p)}${sub(p)}`).join(", ")} }` : "∅";

  steps.push(`Expression linéarisée : ${regexToString(lin)}`);
  steps.push(`ε ∈ L ? ${nullable(lin) ? "oui" : "non"}`);
  steps.push(`Premier(P) = ${fmt(first)}`);
  steps.push(`Dernier(D) = ${fmt(last)}`);
  positions.forEach((p) => {
    const f = [...(follow.get(p) ?? new Set<number>())].sort((a, b) => a - b);
    steps.push(`Suivant(${symAt.get(p)}${sub(p)}) = ${fmt(f)}`);
  });

  // Construction de l'automate.
  const idByPos = new Map<number, string>();
  const states: AutomatonState[] = [];
  const q0: AutomatonState = {
    id: uid("q"),
    label: "q0",
    isInitial: true,
    isFinal: nullable(lin),
    x: 0,
    y: 0,
  };
  states.push(q0);
  for (const p of positions) {
    const id = uid("q");
    idByPos.set(p, id);
    states.push({
      id,
      label: `${symAt.get(p)}${sub(p)}`,
      isInitial: false,
      isFinal: last.includes(p),
      x: 0,
      y: 0,
    });
  }

  const transitions: Transition[] = [];
  for (const y of first) {
    transitions.push({ id: uid("t"), from: q0.id, to: idByPos.get(y)!, symbol: symAt.get(y)! });
  }
  for (const p of positions) {
    for (const y of follow.get(p) ?? []) {
      transitions.push({
        id: uid("t"),
        from: idByPos.get(p)!,
        to: idByPos.get(y)!,
        symbol: symAt.get(y)!,
      });
    }
  }

  steps.push(
    `Automate de Glushkov : 1 état initial + ${positions.length} position(s), sans ε-transition.`,
  );

  return {
    automaton: {
      id: uid("aut"),
      name: `Glushkov(${regexToString(ast)})`,
      alphabet,
      states: layeredLayout(states, transitions, [q0.id]),
      transitions,
    },
    steps,
    message: `Construction de Glushkov : AFN de ${states.length} états (sans ε).`,
  };
}

// ---------------------------------------------------------------------------
// Théorème d'Arden (automate → regex)
// ---------------------------------------------------------------------------
// Combinateurs avec simplifications sur ∅ et ε.
function isEmpty(n: RegexNode): boolean {
  return n.t === "empty";
}
function isEps(n: RegexNode): boolean {
  return n.t === "eps";
}

function nUnion(a: RegexNode, b: RegexNode): RegexNode {
  if (isEmpty(a)) return b;
  if (isEmpty(b)) return a;
  if (regexToString(a) === regexToString(b)) return a;
  return { t: "union", a, b };
}

function nConcat(a: RegexNode, b: RegexNode): RegexNode {
  if (isEmpty(a) || isEmpty(b)) return { t: "empty" };
  if (isEps(a)) return b;
  if (isEps(b)) return a;
  return { t: "concat", a, b };
}

function nStar(a: RegexNode): RegexNode {
  if (isEmpty(a) || isEps(a)) return { t: "eps" };
  if (a.t === "star") return a;
  return { t: "star", a };
}

export function arden(a: Automaton): RegexBuildResult {
  const steps: string[] = [];
  const initials = initialStateIds(a);
  if (a.states.length === 0) {
    return { steps, message: "Aucun état : ajoutez un automate dans l'atelier d'abord." };
  }
  if (initials.length !== 1) {
    return {
      steps,
      message:
        "Le théorème d'Arden requiert un unique état initial. Déterminisez l'automate au préalable.",
    };
  }
  const init = initials[0];
  const ids = a.states.map((s) => s.id);
  const finals = new Set(finalStateIds(a));

  // coeff[i][j] : regex des transitions de i vers j ; cst[i] : terme constant.
  const coeff = new Map<string, Map<string, RegexNode>>();
  const cst = new Map<string, RegexNode>();
  for (const i of ids) {
    coeff.set(i, new Map());
    cst.set(i, finals.has(i) ? { t: "eps" } : { t: "empty" });
  }
  for (const t of a.transitions) {
    const row = coeff.get(t.from)!;
    const sym: RegexNode =
      t.symbol === EPSILON ? { t: "eps" } : { t: "sym", v: t.symbol };
    row.set(t.to, nUnion(row.get(t.to) ?? { t: "empty" }, sym));
  }

  const eqStr = (i: string, active: string[]) => {
    const parts: string[] = [];
    for (const j of active) {
      const c = coeff.get(i)!.get(j);
      if (c && !isEmpty(c)) parts.push(`${regexToString(c, 2)}·L(${stateLabel(a, j)})`);
    }
    const k = cst.get(i)!;
    if (!isEmpty(k)) parts.push(regexToString(k));
    return `L(${stateLabel(a, i)}) = ${parts.length ? parts.join(" + ") : "∅"}`;
  };

  let active = [...ids];
  steps.push("Système d'équations de langages :");
  active.forEach((i) => steps.push("  " + eqStr(i, active)));

  // Éliminer tous les états sauf l'initial.
  const toEliminate = ids.filter((id) => id !== init);
  for (const k of toEliminate) {
    const selfLoop = coeff.get(k)!.get(k) ?? { t: "empty" };
    const star = nStar(selfLoop);
    steps.push(`Élimination de L(${stateLabel(a, k)}) (lemme d'Arden, boucle = ${regexToString(selfLoop)}) :`);

    // L(k) = star · ( Σ_{j≠k} coeff[k][j] L(j) + cst[k] )
    const newCstK = nConcat(star, cst.get(k)!);
    const newCoefK = new Map<string, RegexNode>();
    for (const j of active) {
      if (j === k) continue;
      const c = coeff.get(k)!.get(j);
      if (c && !isEmpty(c)) newCoefK.set(j, nConcat(star, c));
    }

    // Substituer dans les autres équations.
    for (const i of active) {
      if (i === k) continue;
      const cik = coeff.get(i)!.get(k);
      if (cik && !isEmpty(cik)) {
        cst.set(i, nUnion(cst.get(i)!, nConcat(cik, newCstK)));
        for (const [j, val] of newCoefK) {
          coeff.get(i)!.set(j, nUnion(coeff.get(i)!.get(j) ?? { t: "empty" }, nConcat(cik, val)));
        }
      }
      coeff.get(i)!.delete(k);
    }
    active = active.filter((x) => x !== k);
    active.forEach((i) => steps.push("  " + eqStr(i, active)));
  }

  // Résoudre l'équation finale sur l'état initial.
  const selfInit = coeff.get(init)!.get(init) ?? { t: "empty" };
  const answer = nConcat(nStar(selfInit), cst.get(init)!);
  const regex = regexToString(answer);
  steps.push(
    `Résolution finale : L(${stateLabel(a, init)}) = ${regexToString(nStar(selfInit), 2)}·${regexToString(
      cst.get(init)!,
    )} = ${regex}`,
  );

  return {
    regex,
    steps,
    message: `Expression régulière obtenue : ${regex}`,
  };
}

// ---------------------------------------------------------------------------
// Exemples de regex
// ---------------------------------------------------------------------------
export function getRegexExamples(): { id: string; title: string; regex: string }[] {
  return [
    { id: "ab-star", title: "(a|b)* — tous les mots", regex: "(a|b)*" },
    { id: "ends-ab", title: "(a|b)*ab — finit par ab", regex: "(a|b)*ab" },
    { id: "a-star-b", title: "a*b* — des a puis des b", regex: "a*b*" },
    { id: "contains-ab", title: "(a|b)*ab(a|b)* — contient ab", regex: "(a|b)*ab(a|b)*" },
    { id: "optional", title: "a(ba)* — alternance", regex: "a(ba)*" },
    { id: "aa-or-bb", title: "(aa|bb)(a|b)* — commence par aa ou bb", regex: "(aa|bb)(a|b)*" },
    { id: "no-aa", title: "b*(ab*)* — sans deux a consécutifs", regex: "b*(ab*)*" },
    { id: "even-block", title: "(ab|ba)* — blocs ab/ba", regex: "(ab|ba)*" },
    { id: "abc", title: "(a|b|c)*abc — finit par abc (3 symboles)", regex: "(a|b|c)*abc" },
    { id: "triple", title: "(a(a|b))* — a suivi de a ou b", regex: "(a(a|b))*" },
    { id: "nested", title: "((a|b)(a|b))* — longueur paire", regex: "((a|b)(a|b))*" },
    { id: "complex-1", title: "a*b*a*b* — 4 blocs alternés", regex: "a*b*a*b*" },
    { id: "complex-2", title: "(a|ε)(ba)*b* — mot vide optionnel", regex: "(a|ε)(ba)*b*" },
    { id: "complex-3", title: "((ab)*|(ba)*)c — grande union", regex: "((ab)*|(ba)*)c" },
  ];
}
