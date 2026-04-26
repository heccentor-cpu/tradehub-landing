"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Lang = "es" | "en";

const LABELS: Record<Lang, string> = {
  es: "Español (MX)",
  en: "English (US)",
};

export default function LangSwitch({ current }: { current: Lang }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname() || "/";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Mapea la ruta actual a la versión en el otro idioma.
  // /es/nuestra-firma → /en/nuestra-firma, etc.
  const buildHref = (target: Lang) => {
    const segs = pathname.split("/").filter(Boolean);
    if (segs.length === 0) return `/${target}`;
    segs[0] = target;
    return "/" + segs.join("/");
  };

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-transparent hover:bg-bc-blue/10 hover:border-bc-blue/20 text-xs transition-colors"
      >
        <Globe className="w-3.5 h-3.5" />
        <span>{LABELS[current]}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <ul className="absolute top-[calc(100%+6px)] right-0 bg-white border border-bc-border rounded-lg shadow-[0_12px_30px_rgba(15,23,42,0.10)] list-none p-1.5 m-0 min-w-[160px] z-[60]">
          {(Object.keys(LABELS) as Lang[]).map((code) => {
            const active = code === current;
            return (
              <li key={code}>
                <Link
                  href={buildHref(code)}
                  className={`flex items-center justify-between px-2.5 py-2 rounded text-[13px] no-underline ${
                    active ? "bg-bc-light text-bc-blue font-bold" : "text-foreground font-medium"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  <span>{LABELS[code]}</span>
                  {active && <Check className="w-3.5 h-3.5" />}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
