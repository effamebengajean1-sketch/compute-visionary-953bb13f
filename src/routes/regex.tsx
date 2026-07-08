import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Automaton } from "@/lib/automata/types";
import {
  RegexBuildResult,
  arden,
  getRegexExamples,
  glushkov,
  thompson,
} from "@/lib/automata/regex";
import { useAutomataStore } from "@/lib/automata/store";
import { exportResultJson, exportResultPdf } from "@/lib/automata/exportResult";
import { AutomatonGraph } from "@/components/automata/AutomatonGraph";
import { ModuleNav } from "@/components/automata/ModuleNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Regex, Sparkles, Wand2, GitBranch, Workflow, Equal, FileJson, FileText } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/regex")({
  head: () => ({
    meta: [
      { title: "CompilLab — Expressions régulières (Thompson, Glushkov, Arden)" },
      {
        name: "description",
        content:
          "Convertissez une expression régulière en automate avec Thompson et Glushkov, ou un automate en expression régulière avec Arden — chaque étape est expliquée.",
      },
      {
        property: "og:title",
        content: "CompilLab — Expressions régulières (Thompson, Glushkov, Arden)",
      },
      {
        property: "og:description",
        content:
          "Thompson, Glushkov et Arden avec affichage des étapes pédagogiques.",
      },
    ],
  }),
  component: RegexModule,
});

function RegexModule() {
  const navigate = useNavigate();
  const setCurrent = useAutomataStore((s) => s.setCurrent);
  const workspace = useAutomataStore((s) => s.current);
  const hydrate = useAutomataStore((s) => s.hydrate);

  const [pattern, setPattern] = useState("(a|b)*ab");
  const [result, setResult] = useState<RegexBuildResult | null>(null);
  const [graph, setGraph] = useState<Automaton | null>(null);

  // Récupère l'automate sauvegardé pour qu'Arden puisse l'utiliser même en accès direct.
  useEffect(() => {
    hydrate();
  }, [hydrate]);


  const [meta, setMeta] = useState<{ method: string; pattern?: string } | null>(null);

  const runBuild = (method: string, label: string, fn: () => RegexBuildResult) => {
    try {
      const r = fn();
      setResult(r);
      setGraph(r.automaton ?? null);
      setMeta({ method, pattern });
      if (r.automaton) toast.success(label);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Expression invalide.");
    }
  };

  const runArden = () => {
    const r = arden(workspace);
    setResult(r);
    setGraph(null);
    setMeta({ method: "Arden" });
    if (r.regex) toast.success("Expression régulière calculée (Arden).");
    else toast.error(r.message);
  };

  const doExport = (kind: "json" | "pdf") => {
    if (!result || !meta) return;
    const payload = { method: meta.method, pattern: meta.pattern, result };
    if (kind === "json") {
      exportResultJson(payload);
      toast.success("Résultat exporté en JSON.");
    } else {
      exportResultPdf(payload);
      toast.success("Résultat exporté en PDF.");
    }
  };

  const applyToWorkspace = () => {
    if (!graph) return;
    setCurrent(graph, "Automate importé du module Regex");
    toast.success("Automate envoyé vers l'atelier d'automates.");
    navigate({ to: "/atelier" });
  };

  const moveState = (id: string, x: number, y: number) =>
    setGraph((g) =>
      g ? { ...g, states: g.states.map((s) => (s.id === id ? { ...s, x, y } : s)) } : g,
    );

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="sticky top-0 z-20 border-b bg-card/80 backdrop-blur">
        <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-soft">
              <Regex className="h-5 w-5" />
            </span>
            <div>
              <h1 className="font-display text-lg font-bold leading-none">CompilLab</h1>
              <p className="text-xs text-muted-foreground">Expressions régulières</p>
            </div>
          </div>
          <ModuleNav />
        </div>
      </header>

      <main className="grid gap-4 p-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* Panneau de contrôle */}
        <aside className="space-y-5 rounded-xl border bg-card p-4 shadow-soft">
          <section className="space-y-2">
            <SectionTitle icon={<Sparkles className="h-3.5 w-3.5" />}>
              Expression régulière
            </SectionTitle>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="ex. (a|b)*ab"
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Opérateurs : <code>|</code> ou <code>+</code> (union), concaténation implicite,{" "}
              <code>*</code> (étoile), <code>( )</code>, <code>ε</code> (mot vide).
            </p>
            <div className="space-y-2">
              {getRegexExamples().map((ex) => (
                <div key={ex.id} className="rounded-lg border bg-muted/30 p-2">
                  <button
                    onClick={() => setPattern(ex.regex)}
                    className="w-full rounded-md border bg-card px-2.5 py-1 text-left font-mono text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                    title={ex.title}
                  >
                    {ex.regex}
                  </button>
                  <TestChips tests={ex.tests} className="pt-1.5" />
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <SectionTitle icon={<GitBranch className="h-3.5 w-3.5" />}>
              Expression → Automate
            </SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="accent" onClick={() => runBuild("Thompson", "Construction de Thompson", () => thompson(pattern))}>
                Thompson
              </Button>
              <Button variant="accent" onClick={() => runBuild("Glushkov", "Construction de Glushkov", () => glushkov(pattern))}>
                Glushkov
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Thompson produit un ε-AFN ; Glushkov un AFN sans ε-transition.
            </p>
          </section>

          <section className="space-y-2">
            <SectionTitle icon={<Equal className="h-3.5 w-3.5" />}>
              Automate → Expression (Arden)
            </SectionTitle>
            <Button variant="outline" className="w-full justify-start" onClick={runArden}>
              <Workflow className="h-4 w-4" /> Convertir l'automate de l'atelier
            </Button>
            <p className="text-xs text-muted-foreground">
              Applique le lemme d'Arden à l'automate courant ({workspace.states.length} état
              {workspace.states.length > 1 ? "s" : ""}) de l'onglet « Automates ».
            </p>
          </section>

          {result && (
            <section className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <SectionTitle icon={<Sparkles className="h-3.5 w-3.5" />}>Résultat</SectionTitle>
              {result.regex && (
                <div className="rounded-md border border-accent/40 bg-accent/10 p-2 font-mono text-sm font-semibold text-accent-foreground">
                  {result.regex}
                </div>
              )}
              <p className="text-sm">{result.message}</p>
              {graph && (
                <Button size="sm" variant="success" className="w-full" onClick={applyToWorkspace}>
                  <Wand2 className="h-3.5 w-3.5" /> Ouvrir dans l'atelier
                </Button>
              )}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => doExport("json")}>
                  <FileJson className="h-3.5 w-3.5" /> JSON
                </Button>
                <Button size="sm" variant="outline" onClick={() => doExport("pdf")}>
                  <FileText className="h-3.5 w-3.5" /> PDF
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Exporte le résultat (regex ou automate) et ses étapes pédagogiques.
              </p>
            </section>
          )}
        </aside>

        {/* Graphe + étapes */}
        <section className="space-y-4">
          <div className="overflow-hidden rounded-xl border bg-card shadow-soft">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <h2 className="font-display text-sm font-semibold">
                {graph ? graph.name : "Automate produit"}
              </h2>
              <span className="text-xs text-muted-foreground">
                Glissez les états · molette pour zoomer
              </span>
            </div>
            <div className="relative h-[58vh] bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:22px_22px]">
              {graph ? (
                <AutomatonGraph
                  automaton={graph}
                  selectedStateId={null}
                  highlightStates={[]}
                  onSelectState={() => {}}
                  onMoveState={moveState}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
                  <p>
                    Saisissez une expression puis lancez <strong>Thompson</strong> ou{" "}
                    <strong>Glushkov</strong>.<br />
                    Arden affiche une expression régulière (sans graphe).
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4 shadow-soft">
            <h3 className="mb-3 flex items-center gap-1.5 font-display text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-accent" /> Étapes pédagogiques
            </h3>
            {result && result.steps.length > 0 ? (
              <ol className="space-y-1.5 rounded-lg border bg-muted/20 p-3 font-mono text-xs leading-relaxed">
                {result.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <Badge variant="outline" className="h-5 shrink-0">
                      {i + 1}
                    </Badge>
                    <span className="whitespace-pre-wrap">{s}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                Les étapes de la construction (ε ∈ L, Premier, Dernier, Suivant, fragments,
                élimination des équations…) s'afficheront ici.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {icon} {children}
    </h4>
  );
}
