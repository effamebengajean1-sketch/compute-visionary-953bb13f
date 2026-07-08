// CompilLab — Barre d'outils (gestion des fichiers et du graphe).
import { useRef } from "react";
import { useAutomataStore } from "@/lib/automata/store";
import { autoLayout } from "@/lib/automata/algorithms";
import { downloadJson } from "@/lib/automata/storage";
import { getExamples } from "@/lib/automata/examples";
import { TestChips } from "@/components/automata/TestChips";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  FilePlus2,
  Upload,
  Download,
  Image,
  BookOpen,
  Copy,
  RotateCcw,
  LayoutGrid,
  Maximize,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  onExportPng: () => void;
  onFit: () => void;
}

export function AutomatonToolbar({ onExportPng, onFit }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const current = useAutomataStore((s) => s.current);
  const { newAutomaton, duplicate, reset, importText, setCurrent } = useAutomataStore.getState();
  const examples = getExamples();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importText(String(reader.result));
        toast.success("Automate importé");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Import impossible");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleFile} />

      <Button size="sm" variant="secondary" onClick={newAutomaton}>
        <FilePlus2 className="h-4 w-4" /> Nouveau
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="secondary">
            <BookOpen className="h-4 w-4" /> Exemples
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-72">
          <DropdownMenuLabel>Charger un exemple</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {examples.map((ex) => (
            <DropdownMenuItem
              key={ex.id}
              onClick={() => {
                setCurrent(ex.make(), "Exemple chargé");
                toast.success(`Exemple : ${ex.title}`);
              }}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="font-medium">{ex.title}</span>
              <span className="text-xs text-muted-foreground">{ex.description}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button size="sm" variant="ghost" onClick={() => fileRef.current?.click()}>
        <Upload className="h-4 w-4" /> Importer
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="ghost">
            <Download className="h-4 w-4" /> Exporter
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => downloadJson(current)}>
            <Download className="h-4 w-4" /> JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportPng}>
            <Image className="h-4 w-4" /> Image PNG
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mx-1 h-5 w-px bg-border" />

      <Button size="sm" variant="ghost" onClick={() => setCurrent(autoLayout(current), "Réorganisation")}>
        <LayoutGrid className="h-4 w-4" /> Réorganiser
      </Button>
      <Button size="sm" variant="ghost" onClick={onFit}>
        <Maximize className="h-4 w-4" /> Recentrer
      </Button>
      <Button size="sm" variant="ghost" onClick={duplicate}>
        <Copy className="h-4 w-4" /> Dupliquer
      </Button>
      <Button size="sm" variant="ghost" className="text-destructive" onClick={reset}>
        <RotateCcw className="h-4 w-4" /> Réinitialiser
      </Button>
    </div>
  );
}
