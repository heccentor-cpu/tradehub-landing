import { CheckCircle2, Globe, Factory, FileText } from "lucide-react";
import type { Dict } from "@/lib/i18n";

const ICONS = {
  globe: Globe,
  factory: Factory,
  file: FileText,
} as const;

export default function ServicesGrid({ dict }: { dict: Dict["services"] }) {
  return (
    <section id="servicios" className="py-20 bg-background border-b border-bc-border px-6 scroll-mt-32">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-12 border-l-4 border-bc-blue pl-4">
          {dict.heading}
        </h2>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {dict.pillars.map((p) => {
            const Icon = ICONS[p.icon as keyof typeof ICONS] ?? Globe;
            return (
              <div
                key={p.title}
                className="bg-white border border-bc-border rounded-xl shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 p-8 h-full"
              >
                <div className="w-12 h-12 bg-bc-light text-bc-blue rounded-lg flex items-center justify-center mb-6">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-6 text-bc-blue leading-snug">{p.title}</h3>
                <ul className="space-y-4 text-sm text-foreground/80">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
