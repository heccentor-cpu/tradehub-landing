// Per-language layout: sets <html lang> and emits localized <title>/description
// metadata. Every locale lives under /[lang]/... so the URL itself is the
// single source of truth for the active language.
import type { Metadata } from "next";
import { getDictionary, LANGS, type Lang } from "@/lib/i18n";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!LANGS.includes(lang as Lang)) return {};
  const dict = await getDictionary(lang as Lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: { es: "/es", en: "/en" },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `https://tradehubconsulting.com/${lang}`,
      siteName: "TradeHub Consulting",
      locale: lang === "es" ? "es_MX" : "en_US",
      images: [{ url: "/logo-v2.png", width: 1200, height: 630, alt: "TradeHub Consulting" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/logo-v2.png"],
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!LANGS.includes(lang as Lang)) notFound();
  // The root layout sets <html>; here we just pass through.
  return <>{children}</>;
}
