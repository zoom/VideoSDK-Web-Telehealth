import { HeartPulse } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/80 bg-white/70">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-8 text-sm text-muted-foreground sm:flex-row sm:items-end sm:justify-between lg:px-8">
        <div className="max-w-xl">
          <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <HeartPulse className="h-4 w-4 text-primary" />
            Care Rooms
          </div>
          <p className="text-xs leading-relaxed">
            A reference implementation of Zoom Video SDK for telehealth.
            Review your clinical, privacy, and compliance requirements before
            using it in patient care.
          </p>
        </div>
        <nav className="flex shrink-0 gap-4 text-xs" aria-label="Legal">
          <Link className="hover:text-foreground" href="/privacy">
            Privacy
          </Link>
          <Link className="hover:text-foreground" href="/terms">
            Terms
          </Link>
        </nav>
      </div>
    </footer>
  );
}
