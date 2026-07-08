// CompilLab — Affichage compact des chaînes de test et de leurs résultats attendus.
import { Check, X } from "lucide-react";
import { EPSILON, TestCase } from "@/lib/automata/types";
import { cn } from "@/lib/utils";

interface Props {
  tests: TestCase[];
  className?: string;
}

/** Rend chaque cas de test comme une puce colorée : vert = accepté, rouge = rejeté. */
export function TestChips({ tests, className }: Props) {
  if (!tests.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {tests.map((t, i) => (
        <span
          key={i}
          title={t.accept ? "Chaîne acceptée" : "Chaîne rejetée"}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[11px] leading-none",
            t.accept
              ? "border-success/40 bg-success/10 text-success"
              : "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          {t.accept ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {t.input === "" ? EPSILON : t.input}
        </span>
      ))}
    </div>
  );
}
