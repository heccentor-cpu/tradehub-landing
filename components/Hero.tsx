import { ChevronRight } from "lucide-react";
import AngelVisualAnimation from "./AngelVisualAnimation";
import type { Dict } from "@/lib/i18n";

export default function Hero({ dict }: { dict: Dict["hero"] }) {
  return (
    <section className="relative flex flex-col md:flex-row min-h-[75vh]">
      <div className="w-full md:w-1/2 bg-bc-blue text-white flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-24 relative z-10">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
          {dict.title}
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-lg leading-relaxed">{dict.sub}</p>
        <div>
          <a
            href="#agenda"
            className="inline-flex items-center gap-2 bg-white text-bc-blue px-8 py-3.5 rounded font-bold text-[15px] hover:bg-bc-light transition-colors shadow-lg hover:shadow-xl"
          >
            {dict.cta}
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-bc-dark/40 to-transparent pointer-events-none hidden md:block"></div>
      </div>
      <div className="w-full md:w-1/2 relative min-h-[520px] md:min-h-full bg-bc-blue">
        <AngelVisualAnimation />
      </div>
    </section>
  );
}
