// CompilLab — Panneau des algorithmes (Analyse, Transformations, Propriétés).
import { useState } from "react";
import { useAutomataStore } from "@/lib/automata/store";
import {
  AlgorithmResult,
  accessibility,
  coAccessibility,
  complement,
  complete,
  determinize,
  epsilonClosureReport,
  minimize,
  recognize,
  removeEpsilon,
  trim,
} from "@/lib/automata/algorithms";
import { arden } from "@/lib/automata/regex";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Sparkles, Equal } from "lucide-react";
import { toast } from "sonner";

export function AlgorithmsPanel() {
  const current = useAutomataStore((s) => s.current);
  const setResult = useAutomataStore((s) => s.setResult);
  const setHighlight = useAutomataStore((s) => s.setHighlight);
  const log = useAutomataStore((s) => s.log);
  const [word, setWord] = useState("");

  const run = (title: string, fn: () => AlgorithmResult) => {
    if (current.states.length === 0) {
      toast.error("Ajoutez d'abord des états.");
      return;
    }
    try {
      const r = fn();
      setResult({ title, message: r.message, steps: r.steps, automaton: r.automaton });
      setHighlight([]);
      log(title, r.message);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur lors de l'exécution.");
    }
  };

  const labelToId = (label: string) =>
    current.states.find((s) => s.label === label)?.id;

  const playRecognition = async () => {
    if (current.states.length === 0) {
      toast.error("Ajoutez d'abord des états.");
      return;
    }
    const rec = recognize(current, word);
    setResult({ title: "Reconnaissance d'un mot", message: rec.message, steps: [], recognition: rec });
    log("Reconnaissance", rec.message);
    // Animation pas à pas.
    for (let i = 0; i < rec.configurations.length; i++) {
      const ids = rec.configurations[i]
        .map(labelToId)
        .filter((x): x is string => Boolean(x));
      setHighlight(ids);
      await new Promise((res) => setTimeout(res, 650));
    }
  };

  return (
    <div className="space-y-5">
      <section className="space-y-2">
        <SectionTitle>Reconnaissance d'un mot</SectionTitle>
        <div className="flex gap-2">
          <Input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="ex. aabb (vide = ε)"
            className="font-mono"
            onKeyDown={(e) => e.key === "Enter" && playRecognition()}
          />
          <Button onClick={playRecognition} variant="success">
            <Play className="h-4 w-4" /> Tester
          </Button>
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle>Transformations</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <Algo onClick={() => run("Déterminisation", () => determinize(current))}>Déterminiser</Algo>
          <Algo onClick={() => run("Minimisation", () => minimize(current))}>Minimiser</Algo>
          <Algo onClick={() => run("Suppression des ε", () => removeEpsilon(current))}>
            Supprimer ε
          </Algo>
          <Algo onClick={() => run("Complétion", () => complete(current))}>Compléter</Algo>
          <Algo onClick={() => run("Émondage", () => trim(current))}>Émonder</Algo>
          <Algo onClick={() => run("Complément", () => complement(current))}>Complément</Algo>
        </div>
      </section>

      <section className="space-y-2">
        <SectionTitle>Analyse & propriétés</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          <Algo onClick={() => run("Accessibilité", () => accessibility(current))}>
            Accessibilité
          </Algo>
          <Algo onClick={() => run("Co-accessibilité", () => coAccessibility(current))}>
            Co-accessibilité
          </Algo>
          <Algo onClick={() => run("ε-fermeture", () => epsilonClosureReport(current, current.states.map((s) => s.id)))}>
            ε-fermeture
          </Algo>
        </div>
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      <Sparkles className="h-3.5 w-3.5" /> {children}
    </h4>
  );
}

function Algo({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="justify-start" onClick={onClick}>
      {children}
    </Button>
  );
}
