import { ArrowRight, ShieldCheck, Video } from "lucide-react";
import { signIn } from "next-auth/react";

import { Button } from "~/components/ui/button";

const LandingPage = () => (
  <section className="relative overflow-hidden border-b border-border/70">
    <div
      className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full border-[48px] border-accent/70"
      aria-hidden="true"
    />
    <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8">
      <div className="relative">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-primary shadow-sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          Private care, made simpler
        </div>
        <h1 className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
          A calmer way to meet, care, and follow up.
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          One focused workspace for appointments, secure video visits, notes,
          transcripts, and recordings—built on the Zoom Video SDK.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => void signIn()}>
            Open your workspace
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a href="#capabilities">See how it works</a>
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-3xl border border-white/80 bg-[#0c282b] p-3 shadow-2xl shadow-slate-950/15">
          <div className="mb-3 flex items-center justify-between px-2 py-1 text-white/70">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em]">
              Care room preview
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Ready
            </span>
          </div>
          <video
            src="/video.webm"
            controls
            className="aspect-video w-full rounded-2xl bg-slate-950 object-cover"
            poster="/ZoomDevelopers.png"
          />
        </div>
        <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border bg-white p-4 shadow-xl sm:flex">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent text-primary">
            <Video className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Device check</p>
            <p className="text-xs text-muted-foreground">
              Camera and mic, before joining
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default LandingPage;
