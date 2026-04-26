import Link from "next/link";
import { ChevronRight, Target, Eye } from "lucide-react";
import type { Dict } from "@/lib/i18n";

export default function NuestraFirma({ lang, dict }: { lang: "es" | "en"; dict: Dict["firm"] }) {
  return (
    <main>
      <section className="bg-bc-blue text-white py-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/[0.04] rounded-full blur-3xl translate-x-[30%] -translate-y-[40%] pointer-events-none"></div>
        <div className="max-w-[1100px] mx-auto relative">
          <div className="text-xs font-semibold tracking-[0.16em] uppercase text-white/70 mb-4">
            {dict.eyebrow}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6 max-w-[880px]">
            {dict.title}
          </h1>
          <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-[640px]">{dict.sub}</p>
        </div>
      </section>

      <section className="py-24 bg-background border-b border-bc-border px-6">
        <div className="max-w-[1100px] mx-auto grid md:grid-cols-2 gap-8">
          <FirmCard
            icon={<Target className="w-7 h-7" />}
            eyebrow={dict.misionEyebrow}
            title={dict.misionTitle}
            body={dict.misionBody}
            pillars={[...dict.misionPillars]}
          />
          <FirmCard
            icon={<Eye className="w-7 h-7" />}
            eyebrow={dict.visionEyebrow}
            title={dict.visionTitle}
            body={dict.visionBody}
            pillars={[...dict.visionPillars]}
          />
        </div>
      </section>

      <section className="py-20 bg-bc-blue text-white px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-4">{dict.closingTitle}</h3>
          <p className="text-base md:text-lg text-white/85 mb-8 max-w-[640px] mx-auto">{dict.closingSub}</p>
          <Link
            href={`/${lang}#agenda`}
            className="inline-flex items-center gap-2 bg-white text-bc-blue px-7 py-3.5 rounded font-bold text-sm shadow-lg hover:shadow-xl transition-shadow"
          >
            {dict.closingCta}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}

function FirmCard({
  icon,
  eyebrow,
  title,
  body,
  pillars,
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  pillars: string[];
}) {
  return (
    <article className="bg-white border border-bc-border rounded-xl p-10 shadow-[0_20px_50px_rgba(0,51,160,0.05)] relative">
      <div className="w-14 h-14 rounded-xl bg-bc-light text-bc-blue grid place-items-center mb-5">{icon}</div>
      <div className="text-xs font-bold tracking-[0.16em] uppercase text-bc-blue mb-3">{eyebrow}</div>
      <h2 className="text-[26px] font-bold text-foreground leading-tight tracking-tight mb-4 border-l-4 border-bc-blue pl-4">
        {title}
      </h2>
      <p className="text-base leading-relaxed text-foreground/80 mb-6">{body}</p>
      <ul className="flex flex-wrap gap-2.5 text-[13px] font-semibold text-bc-blue list-none p-0 m-0">
        {pillars.map((p) => (
          <li key={p} className="flex items-center">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-bc-blue mr-2"></span>
            {p}
          </li>
        ))}
      </ul>
    </article>
  );
}
