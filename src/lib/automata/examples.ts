// CompilLab — Automates d'exemple prêts à charger, avec chaînes de test.
import { Automaton, TestCase, uid } from "./types";

function build(
  name: string,
  alphabet: string[],
  states: [label: string, initial: boolean, final: boolean, x: number, y: number][],
  edges: [from: string, to: string, symbol: string][],
): Automaton {
  const idByLabel = new Map<string, string>();
  const stateObjs = states.map(([label, initial, final, x, y]) => {
    const id = uid("q");
    idByLabel.set(label, id);
    return { id, label, isInitial: initial, isFinal: final, x, y };
  });
  return {
    id: uid("aut"),
    name,
    alphabet,
    states: stateObjs,
    transitions: edges.map(([from, to, symbol]) => ({
      id: uid("t"),
      from: idByLabel.get(from)!,
      to: idByLabel.get(to)!,
      symbol,
    })),
  };
}

// Fabrique un jeu de cas de test.
function t(input: string, accept: boolean): TestCase {
  return { input, accept };
}

export interface ExampleAutomaton {
  id: string;
  title: string;
  description: string;
  tests: TestCase[];
  make: () => Automaton;
}

export function getExamples(): ExampleAutomaton[] {
  return [
    {
      id: "ends-ab",
      title: "Mots finissant par « ab »",
      description: "AFD sur {a, b} reconnaissant les mots se terminant par ab.",
      tests: [t("ab", true), t("aab", true), t("abab", true), t("ba", false), t("a", false), t("", false)],
      make: () =>
        build(
          "Finit par ab",
          ["a", "b"],
          [
            ["q0", true, false, 200, 300],
            ["q1", false, false, 420, 300],
            ["q2", false, true, 640, 300],
          ],
          [
            ["q0", "q1", "a"],
            ["q0", "q0", "b"],
            ["q1", "q1", "a"],
            ["q1", "q2", "b"],
            ["q2", "q1", "a"],
            ["q2", "q0", "b"],
          ],
        ),
    },
    {
      id: "nfa-contains-ab",
      title: "AFN — contient « ab »",
      description: "Automate non déterministe : les mots contenant le facteur ab.",
      tests: [t("ab", true), t("aabb", true), t("bbab", true), t("ba", false), t("aaa", false), t("", false)],
      make: () =>
        build(
          "Contient ab (AFN)",
          ["a", "b"],
          [
            ["p0", true, false, 200, 300],
            ["p1", false, false, 420, 300],
            ["p2", false, true, 640, 300],
          ],
          [
            ["p0", "p0", "a"],
            ["p0", "p0", "b"],
            ["p0", "p1", "a"],
            ["p1", "p2", "b"],
            ["p2", "p2", "a"],
            ["p2", "p2", "b"],
          ],
        ),
    },
    {
      id: "epsilon",
      title: "ε-AFN — a*b*",
      description: "Automate avec ε-transitions reconnaissant a*b*.",
      tests: [t("aabb", true), t("ab", true), t("", true), t("ba", false), t("aba", false)],
      make: () =>
        build(
          "a*b* (ε-AFN)",
          ["a", "b"],
          [
            ["s0", true, false, 200, 300],
            ["s1", false, true, 500, 300],
          ],
          [
            ["s0", "s0", "a"],
            ["s0", "s1", "ε"],
            ["s1", "s1", "b"],
          ],
        ),
    },
    {
      id: "even-a",
      title: "Nombre pair de « a »",
      description: "AFD reconnaissant les mots avec un nombre pair de a.",
      tests: [t("", true), t("aa", true), t("aba", true), t("b", true), t("a", false), t("aaa", false)],
      make: () =>
        build(
          "Nombre pair de a",
          ["a", "b"],
          [
            ["even", true, true, 250, 300],
            ["odd", false, false, 550, 300],
          ],
          [
            ["even", "odd", "a"],
            ["even", "even", "b"],
            ["odd", "even", "a"],
            ["odd", "odd", "b"],
          ],
        ),
    },
    {
      id: "div3-binary",
      title: "Binaire divisible par 3",
      description: "AFD sur {0, 1} reconnaissant les entiers binaires multiples de 3.",
      tests: [t("0", true), t("11", true), t("110", true), t("1001", true), t("1", false), t("10", false), t("111", false)],
      make: () =>
        build(
          "Divisible par 3 (binaire)",
          ["0", "1"],
          [
            ["r0", true, true, 250, 300],
            ["r1", false, false, 500, 180],
            ["r2", false, false, 500, 420],
          ],
          [
            ["r0", "r0", "0"],
            ["r0", "r1", "1"],
            ["r1", "r2", "0"],
            ["r1", "r0", "1"],
            ["r2", "r1", "0"],
            ["r2", "r2", "1"],
          ],
        ),
    },
    {
      id: "no-double-a",
      title: "Sans deux « a » consécutifs",
      description: "AFD sur {a, b} refusant tout mot contenant le facteur aa.",
      tests: [t("", true), t("ab", true), t("aba", true), t("b", true), t("aa", false), t("baa", false), t("aab", false)],
      make: () =>
        build(
          "Pas de aa",
          ["a", "b"],
          [
            ["ok", true, true, 220, 300],
            ["seenA", false, true, 480, 300],
            ["dead", false, false, 480, 500],
          ],
          [
            ["ok", "seenA", "a"],
            ["ok", "ok", "b"],
            ["seenA", "dead", "a"],
            ["seenA", "ok", "b"],
            ["dead", "dead", "a"],
            ["dead", "dead", "b"],
          ],
        ),
    },
    {
      id: "third-last-a",
      title: "AFN — 3ᵉ symbole avant la fin = « a »",
      description: "AFN sur {a, b} : les mots dont le 3ᵉ symbole en partant de la fin est a.",
      tests: [t("abb", true), t("aaa", true), t("abab", true), t("aab", true), t("baa", false), t("ab", false), t("bab", false)],
      make: () =>
        build(
          "3ᵉ avant la fin = a (AFN)",
          ["a", "b"],
          [
            ["n0", true, false, 180, 300],
            ["n1", false, false, 380, 300],
            ["n2", false, false, 580, 300],
            ["n3", false, true, 780, 300],
          ],
          [
            ["n0", "n0", "a"],
            ["n0", "n0", "b"],
            ["n0", "n1", "a"],
            ["n1", "n2", "a"],
            ["n1", "n2", "b"],
            ["n2", "n3", "a"],
            ["n2", "n3", "b"],
          ],
        ),
    },
    {
      id: "abc-order",
      title: "a*b*c* — trois blocs ordonnés",
      description: "AFD sur {a, b, c} : des a, puis des b, puis des c (dans cet ordre).",
      tests: [t("abc", true), t("aabbcc", true), t("", true), t("ac", true), t("bca", false), t("cba", false), t("ba", false)],
      make: () =>
        build(
          "a*b*c*",
          ["a", "b", "c"],
          [
            ["A", true, true, 200, 300],
            ["B", false, true, 430, 300],
            ["C", false, true, 660, 300],
          ],
          [
            ["A", "A", "a"],
            ["A", "B", "b"],
            ["A", "C", "c"],
            ["B", "B", "b"],
            ["B", "C", "c"],
            ["C", "C", "c"],
          ],
        ),
    },
    {
      id: "epsilon-union",
      title: "ε-AFN — (ab)* | (ba)*",
      description: "Automate avec ε-transitions : union de deux boucles via un état initial.",
      tests: [t("", true), t("ab", true), t("abab", true), t("ba", true), t("baba", true), t("aba", false), t("abba", false)],
      make: () =>
        build(
          "(ab)* | (ba)* (ε-AFN)",
          ["a", "b"],
          [
            ["start", true, false, 200, 300],
            ["u0", false, true, 460, 180],
            ["u1", false, false, 700, 180],
            ["v0", false, true, 460, 420],
            ["v1", false, false, 700, 420],
          ],
          [
            ["start", "u0", "ε"],
            ["start", "v0", "ε"],
            ["u0", "u1", "a"],
            ["u1", "u0", "b"],
            ["v0", "v1", "b"],
            ["v1", "v0", "a"],
          ],
        ),
    },
    {
      id: "count-mod",
      title: "Nombre de « a » multiple de 3",
      description: "AFD sur {a, b} reconnaissant les mots dont le nombre de a est multiple de 3.",
      tests: [t("", true), t("aaa", true), t("aaabbb", true), t("aaaaaa", true), t("a", false), t("aa", false), t("baab", false)],
      make: () =>
        build(
          "Nombre de a ≡ 0 (mod 3)",
          ["a", "b"],
          [
            ["m0", true, true, 250, 300],
            ["m1", false, false, 500, 200],
            ["m2", false, false, 500, 420],
          ],
          [
            ["m0", "m1", "a"],
            ["m0", "m0", "b"],
            ["m1", "m2", "a"],
            ["m1", "m1", "b"],
            ["m2", "m0", "a"],
            ["m2", "m2", "b"],
          ],
        ),
    },
    // ----- Nouveaux exemples avancés -----
    {
      id: "parity-both",
      title: "Nombre pair de « a » ET de « b »",
      description: "AFD à 4 états : autant de parité paire sur a que sur b simultanément.",
      tests: [t("", true), t("aabb", true), t("aa", true), t("abab", true), t("ab", false), t("a", false), t("abb", false)],
      make: () =>
        build(
          "a pair ET b pair",
          ["a", "b"],
          [
            ["EE", true, true, 250, 200],
            ["OE", false, false, 550, 200],
            ["EO", false, false, 250, 460],
            ["OO", false, false, 550, 460],
          ],
          [
            ["EE", "OE", "a"],
            ["OE", "EE", "a"],
            ["EO", "OO", "a"],
            ["OO", "EO", "a"],
            ["EE", "EO", "b"],
            ["EO", "EE", "b"],
            ["OE", "OO", "b"],
            ["OO", "OE", "b"],
          ],
        ),
    },
    {
      id: "contains-aba",
      title: "AFN — contient le facteur « aba »",
      description: "Automate non déterministe : les mots contenant aba comme sous-mot contigu.",
      tests: [t("aba", true), t("aaba", true), t("abab", true), t("baba", true), t("ab", false), t("aab", false), t("", false)],
      make: () =>
        build(
          "Contient aba (AFN)",
          ["a", "b"],
          [
            ["c0", true, false, 180, 300],
            ["c1", false, false, 380, 300],
            ["c2", false, false, 580, 300],
            ["c3", false, true, 780, 300],
          ],
          [
            ["c0", "c0", "a"],
            ["c0", "c0", "b"],
            ["c0", "c1", "a"],
            ["c1", "c2", "b"],
            ["c2", "c3", "a"],
            ["c3", "c3", "a"],
            ["c3", "c3", "b"],
          ],
        ),
    },
    {
      id: "len-mod3",
      title: "Longueur multiple de 3",
      description: "AFD sur {a, b} reconnaissant les mots dont la longueur est divisible par 3.",
      tests: [t("", true), t("aba", true), t("ababab", true), t("aaabbb", true), t("a", false), t("ab", false), t("aaaa", false)],
      make: () =>
        build(
          "Longueur ≡ 0 (mod 3)",
          ["a", "b"],
          [
            ["l0", true, true, 250, 300],
            ["l1", false, false, 500, 200],
            ["l2", false, false, 500, 420],
          ],
          [
            ["l0", "l1", "a"],
            ["l0", "l1", "b"],
            ["l1", "l2", "a"],
            ["l1", "l2", "b"],
            ["l2", "l0", "a"],
            ["l2", "l0", "b"],
          ],
        ),
    },
    {
      id: "ends-aa-or-bb",
      title: "Se termine par « aa » ou « bb »",
      description: "AFD sur {a, b} acceptant les mots dont les deux derniers symboles sont égaux.",
      tests: [t("aa", true), t("bb", true), t("abb", true), t("baa", true), t("aabb", true), t("ab", false), t("aba", false), t("a", false)],
      make: () =>
        build(
          "Finit par aa ou bb",
          ["a", "b"],
          [
            ["start", true, false, 180, 300],
            ["a1", false, false, 400, 180],
            ["b1", false, false, 400, 420],
            ["aa", false, true, 640, 180],
            ["bb", false, true, 640, 420],
          ],
          [
            ["start", "a1", "a"],
            ["start", "b1", "b"],
            ["a1", "aa", "a"],
            ["a1", "b1", "b"],
            ["b1", "a1", "a"],
            ["b1", "bb", "b"],
            ["aa", "aa", "a"],
            ["aa", "b1", "b"],
            ["bb", "a1", "a"],
            ["bb", "bb", "b"],
          ],
        ),
    },
    {
      id: "div4-binary",
      title: "Binaire divisible par 4",
      description: "AFD sur {0, 1} suivant la valeur modulo 4 (val ← 2·val + bit).",
      tests: [t("0", true), t("100", true), t("1000", true), t("1100", true), t("1", false), t("10", false), t("110", false)],
      make: () =>
        build(
          "Divisible par 4 (binaire)",
          ["0", "1"],
          [
            ["t0", true, true, 220, 300],
            ["t1", false, false, 460, 180],
            ["t2", false, false, 700, 300],
            ["t3", false, false, 460, 460],
          ],
          [
            ["t0", "t0", "0"],
            ["t0", "t1", "1"],
            ["t1", "t2", "0"],
            ["t1", "t3", "1"],
            ["t2", "t0", "0"],
            ["t2", "t1", "1"],
            ["t3", "t2", "0"],
            ["t3", "t3", "1"],
          ],
        ),
    },
  ];
}
