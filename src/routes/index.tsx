import { Link, createFileRoute } from "@tanstack/react-router";

import {
  ArrowRight,
  GraduationCap,
  Heart,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { texts } from "@/texts";

import { Button } from "@/components/ui/button";

import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: texts.landing.seo.title },
      { name: "description", content: texts.landing.seo.description },
      { property: "og:title", content: texts.landing.seo.title },
      { property: "og:description", content: texts.landing.seo.ogDescription },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div
              className="grid h-8 w-8 place-items-center rounded-lg text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              {texts.brand.prefix}
              <span className="gradient-text">{texts.brand.accent}</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#filosofia" className="transition-colors hover:text-foreground">
              {texts.landing.nav.philosophy}
            </a>
            <a href="#recursos" className="transition-colors hover:text-foreground">
              {texts.landing.nav.features}
            </a>
            <a href="#comunidade" className="transition-colors hover:text-foreground">
              {texts.landing.nav.community}
            </a>
          </nav>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link to="/entrar" search={{ tab: "login" }}>
              <Button variant="ghost" className="h-8 rounded-full px-3 text-sm">
                {texts.common.enter}
              </Button>
            </Link>
            <Link to="/entrar" search={{ tab: "signup" }}>
              <Button className="h-8 rounded-full px-4 text-sm">{texts.common.createAccount}</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-soft)" }}
        />
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--gradient-primary)" }}
        />
        <div className="mx-auto max-w-4xl px-4 pb-24 pt-20 text-center sm:pb-32 sm:pt-28">
          <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/70 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Sparkles className="h-3 w-3" /> {texts.landing.hero.badge}
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {texts.landing.hero.title}
            <br />
            <span className="gradient-text">{texts.landing.hero.titleAccent}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground">
            {texts.landing.hero.description}
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">{texts.landing.hero.free}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/entrar" search={{ tab: "signup" }}>
              <Button size="lg" className="gap-2 rounded-full px-6">
                {texts.landing.hero.join} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/feed">
              <Button size="lg" variant="outline" className="rounded-full px-6">
                {texts.landing.hero.explore}
              </Button>
            </Link>
          </div>
          <div className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-primary/60" /> {texts.landing.hero.benefits.noVanity}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary/60" /> {texts.landing.hero.benefits.safe}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary/60" /> {texts.landing.hero.benefits.freeForever}
            </span>
          </div>
        </div>
      </section>

      <section id="filosofia" className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              {texts.landing.philosophy.eyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {texts.landing.philosophy.titlePrefix}{" "}
              <span className="gradient-text">{texts.landing.philosophy.titleAccent}</span>
            </h2>
            <p className="mt-4 text-muted-foreground">{texts.landing.philosophy.description}</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {philosophyValues.map((philosophyValue) => {
              const { icon: ValueIcon } = philosophyValue;
              return (
                <div key={philosophyValue.title} className="surface-card p-6 text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                    <ValueIcon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{philosophyValue.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {philosophyValue.description}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-medium text-primary">
              <ShieldCheck className="h-4 w-4" /> {texts.landing.philosophy.alwaysFree}
            </p>
          </div>
        </div>
      </section>

      <section id="recursos" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">
            {texts.landing.features.eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            {texts.landing.features.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{texts.landing.features.description}</p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {landingFeatures.map((feature) => {
            const { icon: FeatureIcon } = feature;
            return (
              <div key={feature.title} className="surface-card p-4 sm:p-6">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <FeatureIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="mx-auto max-w-xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {texts.landing.cta.title}
            </h2>
            <p className="mt-4 text-muted-foreground">{texts.landing.cta.description}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/entrar" search={{ tab: "signup" }}>
                <Button size="lg" className="gap-2 rounded-full px-6">
                  {texts.landing.cta.createAccount} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/entrar" search={{ tab: "login" }}>
                <Button size="lg" variant="outline" className="rounded-full px-6">
                  {texts.landing.cta.existingAccount}
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground/60">
              {texts.landing.cta.finePrint}{" "}
              <strong>{texts.landing.cta.freeForever}</strong>
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-muted-foreground sm:px-6">
          <p>{texts.landing.footer.copyright(new Date().getFullYear())}</p>
          <div className="flex gap-5">
            <Link to="/privacidade" className="transition-colors hover:text-foreground">
              {texts.landing.footer.privacy}
            </Link>
            <Link to="/termos" className="transition-colors hover:text-foreground">
              {texts.landing.footer.terms}
            </Link>
            <a href="#" className="transition-colors hover:text-foreground">
              {texts.landing.footer.contact}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const philosophyValues = [
  {
    icon: Heart,
    title: texts.landing.philosophy.values.authenticity.title,
    description: texts.landing.philosophy.values.authenticity.description,
  },
  {
    icon: Users,
    title: texts.landing.philosophy.values.collaboration.title,
    description: texts.landing.philosophy.values.collaboration.description,
  },
  {
    icon: GraduationCap,
    title: texts.landing.philosophy.values.learning.title,
    description: texts.landing.philosophy.values.learning.description,
  },
  {
    icon: ShieldCheck,
    title: texts.landing.philosophy.values.safety.title,
    description: texts.landing.philosophy.values.safety.description,
  },
];

const landingFeatures = [
  {
    icon: MessageCircle,
    title: texts.landing.features.items.discussions.title,
    description: texts.landing.features.items.discussions.description,
  },
  {
    icon: GraduationCap,
    title: texts.landing.features.items.mentoring.title,
    description: texts.landing.features.items.mentoring.description,
  },
  {
    icon: Heart,
    title: texts.landing.features.items.communities.title,
    description: texts.landing.features.items.communities.description,
  },
  {
    icon: Users,
    title: texts.landing.features.items.connections.title,
    description: texts.landing.features.items.connections.description,
  },
  {
    icon: ShieldCheck,
    title: texts.landing.features.items.recruiting.title,
    description: texts.landing.features.items.recruiting.description,
  },
  {
    icon: Sparkles,
    title: texts.landing.features.items.wellbeing.title,
    description: texts.landing.features.items.wellbeing.description,
  },
];
