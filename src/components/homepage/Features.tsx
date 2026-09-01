import {
  CalendarCheck,
  Captions,
  FileText,
  ShieldCheck,
  UsersRound,
  Video,
} from "lucide-react";

const features = [
  {
    icon: CalendarCheck,
    title: "Appointment timeline",
    description: "Schedule, invite, and see what is next without digging.",
  },
  {
    icon: Video,
    title: "Reliable care rooms",
    description: "Check devices first, then enter a focused video visit.",
  },
  {
    icon: UsersRound,
    title: "Role-aware workspaces",
    description: "Doctors and patients each see the tools they actually need.",
  },
  {
    icon: Captions,
    title: "Live transcription",
    description: "Follow the conversation with clear in-call captions.",
  },
  {
    icon: FileText,
    title: "Visit context",
    description: "Keep notes and relevant patient details close to the call.",
  },
  {
    icon: ShieldCheck,
    title: "Purposeful access",
    description: "Appointment rooms are tied to invited, signed-in users.",
  },
];

const Features = () => (
  <section id="capabilities" className="bg-[#102e31] text-white">
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
          The care flow
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          The essentials, kept within reach.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/65 sm:text-base">
          Each part of the experience is designed to reduce decisions before,
          during, and after an appointment.
        </p>
      </div>

      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div key={title} className="bg-[#102e31] p-6 sm:p-7">
            <Icon className="h-5 w-5 text-emerald-300" />
            <h3 className="mt-5 font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
