import { Car, Home, Factory, Layers, Zap, MapPin } from "lucide-react";
import type { Dict } from "@/lib/i18n";

const ICONS = { car: Car, home: Home, factory: Factory, layers: Layers, zap: Zap, pin: MapPin } as const;

const CHIPS: Record<string, { bg: string; fg: string }> = {
  car:     { bg: "bg-[#1e3a8a]", fg: "text-blue-400" },
  home:    { bg: "bg-purple-100", fg: "text-purple-900" },
  factory: { bg: "bg-[#d1fae5]", fg: "text-emerald-900" },
  layers:  { bg: "bg-[#ffedd5]", fg: "text-[#9a3412]" },
  zap:     { bg: "bg-[#fce7f3]", fg: "text-[#be185d]" },
  pin:     { bg: "bg-[#ecfccb]", fg: "text-[#166534]" },
};

export default function SectorsGrid({ dict }: { dict: Dict["sectors"] }) {
  return (
    <section id="sectores" className="py-20 bg-bc-light border-y border-bc-border px-6 scroll-mt-32">
      <div className="max-w-[1400px] mx-auto">
        <h2 className="text-3xl font-bold text-foreground mb-12 border-l-4 border-bc-blue pl-4">
          {dict.heading}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dict.items.map((s) => {
            const Icon = ICONS[s.icon as keyof typeof ICONS] ?? Layers;
            const chip = CHIPS[s.icon] ?? { bg: "bg-bc-light", fg: "text-bc-blue" };
            return (
              <div
                key={s.title}
                className="bg-white rounded-xl p-8 flex flex-col shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 border border-bc-border"
              >
                <div className={`w-12 h-12 ${chip.bg} ${chip.fg} rounded-[10px] flex items-center justify-center mb-6 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-bc-blue mb-4">{s.title}</h3>
                <p className="text-foreground/80 text-[15px] leading-relaxed">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
