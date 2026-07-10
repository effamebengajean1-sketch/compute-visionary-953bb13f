// CompilLab — Panneau de résultat des algorithmes.
import { ResultData, useAutomataStore } from "@/lib/automata/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  result: ResultData | null;
}

export function ResultPanel({ result }: Props) {
  const setCurrent = useAutomataStore((s) => s.setCurrent);

  if (!result) {
    return (
      <p className="px-1 py-4 text-sm text-muted-foreground">
        Lancez un algorithme pour afficher ici le résultat, les étapes et l'automate produit.
      </p>
    );
  }

  const rec = result.recognition;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold">{result.title}</h3>
        {result.automaton && (
          <Button
            size="sm"
            variant="accent"
            onClick={() => {
              setCurrent(result.automaton!, "Application du résultat");
              toast.success("Automate appliqué à l'espace de travail");
            }}
          >
            <Wand2 className="h-3.5 w-3.5" /> Appliquer
          </Button>
        )}
      </div>

      {result.regex && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Expression régulière obtenue</p>
          <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 font-mono text-sm font-semibold text-accent-foreground">
            {result.regex}
          </div>
        </div>
      )}

      {rec ? (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium ${
            rec.accepted
              ? "border-success/40 bg-success/10 text-success"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {rec.accepted ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          {result.message}
        </div>
      ) : (
        <p className="rounded-lg border bg-muted/30 p-3 text-sm">{result.message}</p>
      )}

      {rec && rec.steps.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Trace de lecture</p>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            {rec.configurations.map((cfg, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <Badge variant="outline">{`{${cfg.join(",") || "∅"}}`}</Badge>
                {i < rec.steps.length && (
                  <span className="text-accent-foreground">
                    —{rec.steps[i].symbol}→
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.steps.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Étapes</p>
          <ol className="space-y-1 rounded-lg border bg-card p-3 font-mono text-xs">
            {result.steps.map((s, i) => (
              <li key={i} className="text-muted-foreground">
                <span className="mr-2 text-primary">{i + 1}.</span>
                {s}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
