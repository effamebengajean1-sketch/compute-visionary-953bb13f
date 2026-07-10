import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/landing/Reveal";
import { Counter } from "@/components/landing/Counter";
import heroImg from "@/assets/hero-automata.jpg";
import {
  Workflow,
  Regex,
  ArrowRight,
  Sparkles,
  GitBranch,
  Minimize2,
  CheckCircle2,
  ScanSearch,
  Network,
  GraduationCap,
  Zap,
  ShieldCheck,
  MousePointerClick,
  Github,
  Circle,
  CircleDot,
  Shuffle,
  ArrowLeftRight,
  FileJson,
  Eraser,
  Sigma,
  BookOpen,
  Play,
  Mail,
  Rocket,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Effario Auto — Théorie des automates & langages formels" },
      {
        name: "description",
        content:
          "Effario Auto : plateforme pédagogique pour créer, simuler et transformer automates finis et expressions régulières. Déterminisation, minimisation, Thompson, Arden — avec visualisation interactive.",
      },
      { property: "og:title", content: "Effario Auto — La théorie des automates, en clair" },
      {
        property: "og:description",
        content:
          "Atelier interactif d'automates finis et d'expressions régulières : algorithmes fiables, graphes manipulables et étapes pédagogiques.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

/* ── Data ─────────────────────────────────────────────────── */

const navLinks = [
  { href: "#presentation", label: "Présentation" },
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#algorithmes", label: "Algorithmes" },
  { href: "#pourquoi", label: "Pourquoi" },
];

const audience = [
  {
    icon: GraduationCap,
    title: "Ce que permet la plateforme",
    desc: "Construire des automates état par état, simuler la reconnaissance de mots et appliquer les grandes transformations de la théorie des langages — le tout dans le navigateur.",
  },
  {
    icon: BookOpen,
    title: "À qui elle s'adresse",
    desc: "Étudiants, enseignants et curieux de l'informatique théorique qui veulent comprendre le « comment » des automates et de la compilation, pas seulement le résultat.",
  },
  {
    icon: Sparkles,
    title: "Ses avantages",
    desc: "Chaque algorithme détaille ses étapes, la visualisation est interactive et vos travaux restent sauvegardés localement. Aucun compte, aucune installation.",
  },
];

const features = [
  { icon: Circle, title: "Création d'AFD", desc: "Concevez des automates finis déterministes complets et cohérents." },
  { icon: GitBranch, title: "Création d'AFN", desc: "Modélisez le non-déterminisme et les ε-transitions librement." },
  { icon: Play, title: "Simulation de mots", desc: "Testez un mot et visualisez le chemin parcouru dans l'automate." },
  { icon: Shuffle, title: "Déterminisation", desc: "Transformez un AFN en AFD par construction des sous-ensembles." },
  { icon: Minimize2, title: "Minimisation", desc: "Réduisez au nombre minimal d'états équivalents." },
  { icon: ArrowLeftRight, title: "Conversion AFN → AFD", desc: "Passez du non-déterministe au déterministe en un clic." },
  { icon: Sigma, title: "Automate → Regex", desc: "Générez l'expression régulière via le lemme d'Arden." },
  { icon: Network, title: "Visualisation des graphes", desc: "Graphe manipulable : déplacez les états, zoomez, exportez." },
  { icon: FileJson, title: "Import / Export", desc: "Sauvegardez et partagez vos automates en JSON et PDF." },
  { icon: ShieldCheck, title: "Vérification", desc: "Complétion, émondage et contrôles de cohérence intégrés." },
];

const algorithms = [
  { icon: Shuffle, title: "Déterminisation", desc: "Construction des sous-ensembles pour obtenir un AFD équivalent à l'AFN." },
  { icon: Minimize2, title: "Minimisation", desc: "Fusion des états équivalents pour l'automate minimal canonique." },
  { icon: Workflow, title: "Thompson", desc: "Expression régulière → ε-AFN par composition de fragments." },
  { icon: Sigma, title: "Lemme d'Arden", desc: "Système d'équations des états résolu en expression régulière." },
  { icon: Eraser, title: "Suppression des ε", desc: "Élimination des transitions vides via les ε-fermetures." },
  { icon: ArrowLeftRight, title: "Automate ↔ Regex", desc: "Aller-retour complet entre automates et expressions régulières." },
];

const reasons = [
  { icon: MousePointerClick, title: "Interface intuitive", desc: "Une prise en main immédiate, pensée pour aller à l'essentiel." },
  { icon: Network, title: "Visualisation interactive", desc: "Des graphes vivants qui rendent chaque concept tangible." },
  { icon: ShieldCheck, title: "Algorithmes fiables", desc: "Des transformations vérifiées contre des jeux de tests." },
  { icon: GraduationCap, title: "Conçu pour l'apprentissage", desc: "Chaque résultat s'accompagne de ses étapes détaillées." },
  { icon: Zap, title: "Rapide", desc: "Tout s'exécute côté navigateur, sans latence serveur." },
  { icon: Github, title: "Open Source", desc: "Un projet ouvert, transparent et libre d'inspection." },
];

const stats = [
  { value: 1200, suffix: "+", label: "Automates créés" },
  { value: 12, suffix: "", label: "Algorithmes disponibles" },
  { value: 8500, suffix: "+", label: "Simulations réalisées" },
  { value: 3400, suffix: "+", label: "Expressions générées" },
];

/* ── Helpers ──────────────────────────────────────────────── */

function scrollToHash(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;
  e.preventDefault();
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── Page ─────────────────────────────────────────────────── */

function Home() {
  const [parallax, setParallax] = React.useState({ x: 0, y: 0 });

  const onHeroMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x, y });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Toaster />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/60 glass">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-brand-cyan to-violet text-primary-foreground shadow-soft">
              <Workflow className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold leading-none">Effario Auto</h1>
              <p className="truncate text-xs text-muted-foreground">Théorie des automates</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => scrollToHash(e, l.href)}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/regex">Expressions</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/atelier">
                Commencer <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        onMouseMove={onHeroMove}
        className="relative overflow-hidden"
      >
        {/* Decorative gradient blobs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl animate-float-slow"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-24 h-96 w-96 rounded-full bg-violet/20 blur-3xl animate-float-slower"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:26px_26px] opacity-50"
        />

        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <Reveal className="text-center lg:text-left">
            <Badge variant="secondary" className="mb-5 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Plateforme pédagogique
            </Badge>
            <h2 className="mx-auto max-w-xl font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:mx-0 lg:text-6xl">
              La théorie des automates,{" "}
              <span className="text-gradient">enfin claire</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground lg:mx-0 lg:text-lg">
              Effario Auto vous permet de créer, simuler et transformer automates finis et
              expressions régulières — avec visualisation interactive et étapes détaillées, pour
              comprendre plutôt que subir.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button asChild size="lg" className="group">
                <Link to="/atelier">
                  Commencer
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#algorithmes" onClick={(e) => scrollToHash(e, "#algorithmes")}>
                  <BookOpen className="h-4 w-4" /> Documentation
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground lg:justify-start">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Sans installation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Sauvegarde locale
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" /> Open source
              </span>
            </div>
          </Reveal>

          <Reveal delay={120} className="relative">
            <div
              className="relative"
              style={{
                transform: `perspective(1000px) rotateY(${parallax.x * -6}deg) rotateX(${parallax.y * 6}deg) translate(${parallax.x * 10}px, ${parallax.y * 10}px)`,
                transition: "transform 0.2s ease-out",
              }}
            >
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/30 via-brand-cyan/20 to-violet/30 blur-2xl" />
              <img
                src={heroImg}
                width={1280}
                height={1024}
                alt="Illustration d'un automate fini : états, transitions et graphe"
                className="w-full rounded-3xl border border-border/60 shadow-panel"
              />
              {/* Floating glass chips */}
              <div className="absolute -left-3 top-8 hidden rounded-2xl px-4 py-2 text-sm font-medium glass shadow-soft sm:flex sm:items-center sm:gap-2 animate-float-slow">
                <CircleDot className="h-4 w-4 text-primary" /> État initial
              </div>
              <div className="absolute -right-3 bottom-10 hidden rounded-2xl px-4 py-2 text-sm font-medium glass shadow-soft sm:flex sm:items-center sm:gap-2 animate-float-slower">
                <ShieldCheck className="h-4 w-4 text-success" /> Mot accepté
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Présentation */}
      <section id="presentation" className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">La plateforme</Badge>
          <h3 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Une plateforme pensée pour apprendre en manipulant
          </h3>
          <p className="mt-3 text-muted-foreground">
            Effario Auto réunit la puissance des algorithmes de compilation et la clarté d'une
            interface moderne.
          </p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {audience.map((a, i) => (
            <Reveal
              key={a.title}
              delay={i * 100}
              className="group rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-panel"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-violet/15 text-primary transition-transform group-hover:scale-110">
                <a.icon className="h-6 w-6" />
              </span>
              <h4 className="mt-4 font-display text-lg font-semibold">{a.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="border-y border-border/60 bg-muted/40 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Fonctionnalités</Badge>
            <h3 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
              Tout l'outillage des automates finis
            </h3>
            <p className="mt-3 text-muted-foreground">
              De la création à l'export, chaque étape du workflow est couverte.
            </p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {features.map((f, i) => (
              <Reveal
                key={f.title}
                delay={(i % 5) * 70}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-panel"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </span>
                <h4 className="mt-4 font-display text-base font-semibold">{f.title}</h4>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Algorithmes */}
      <section id="algorithmes" className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Algorithmes</Badge>
          <h3 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Des algorithmes fiables, expliqués pas à pas
          </h3>
          <p className="mt-3 text-muted-foreground">
            Chaque transformation affiche son raisonnement complet, pour comprendre et vérifier.
          </p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {algorithms.map((a, i) => (
            <Reveal
              key={a.title}
              delay={(i % 3) * 100}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-panel"
            >
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-gradient-to-br from-primary/20 to-violet/20 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet text-primary-foreground shadow-soft transition-transform group-hover:scale-110">
                <a.icon className="h-6 w-6" />
              </span>
              <h4 className="mt-4 font-display text-lg font-semibold">{a.title}</h4>
              <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Pourquoi */}
      <section id="pourquoi" className="border-y border-border/60 bg-muted/40 py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">Pourquoi Effario Auto ?</Badge>
            <h3 className="font-display text-3xl font-bold tracking-tight lg:text-4xl">
              Conçu pour la clarté et la confiance
            </h3>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reasons.map((r, i) => (
              <Reveal
                key={r.title}
                delay={(i % 3) * 90}
                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-panel"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-violet/15 text-primary">
                  <r.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h4 className="font-display text-base font-semibold">{r.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-24">
        <Reveal className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary via-primary to-violet p-8 text-primary-foreground shadow-panel lg:p-12">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-4xl font-bold tracking-tight lg:text-5xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </div>
                <p className="mt-2 text-sm font-medium opacity-90">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <Reveal className="relative overflow-hidden rounded-3xl border border-border/60 glass p-10 text-center lg:p-16">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-violet/10" />
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet text-primary-foreground shadow-soft">
            <Rocket className="h-7 w-7" />
          </span>
          <h3 className="mt-6 font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Prêt à construire votre premier automate ?
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Tout fonctionne directement dans le navigateur, sans compte ni installation.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/atelier">
                Ouvrir l'atelier <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/regex">
                <Regex className="h-4 w-4" /> Expressions régulières
              </Link>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-brand-cyan to-violet text-primary-foreground shadow-soft">
                <Workflow className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-bold">Effario Auto</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Atelier pédagogique de théorie des automates et des langages formels.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Modules</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/atelier" className="transition-colors hover:text-foreground">Atelier d'automates</Link></li>
              <li><Link to="/regex" className="transition-colors hover:text-foreground">Expressions régulières</Link></li>
              <li><a href="#algorithmes" onClick={(e) => scrollToHash(e, "#algorithmes")} className="transition-colors hover:text-foreground">Algorithmes</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Liens utiles</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li><a href="#fonctionnalites" onClick={(e) => scrollToHash(e, "#fonctionnalites")} className="transition-colors hover:text-foreground">Fonctionnalités</a></li>
              <li><a href="#pourquoi" onClick={(e) => scrollToHash(e, "#pourquoi")} className="transition-colors hover:text-foreground">Pourquoi Effario Auto ?</a></li>
              <li><a href="#algorithmes" onClick={(e) => scrollToHash(e, "#algorithmes")} className="transition-colors hover:text-foreground">Documentation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Communauté</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                  <Github className="h-4 w-4" /> GitHub
                </a>
              </li>
              <li>
                <a href="mailto:contact@effario.auto" className="inline-flex items-center gap-2 transition-colors hover:text-foreground">
                  <Mail className="h-4 w-4" /> Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Effario Auto — Atelier pédagogique de théorie des automates.
        </div>
      </footer>
    </div>
  );
}
