import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesGrid from "@/components/ServicesGrid";
import SectorsGrid from "@/components/SectorsGrid";
import AgendaSection from "@/components/AgendaSection";
import Footer from "@/components/Footer";
import { getDictionary, type Lang } from "@/lib/i18n";

export default async function HomePage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header lang={lang} dict={dict.header} page="home" />
      <main className="flex-1">
        <Hero dict={dict.hero} />
        <ServicesGrid dict={dict.services} />
        <SectorsGrid dict={dict.sectors} />
        <AgendaSection dict={dict.agenda} lang={lang} />
      </main>
      <Footer dict={dict.footer} />
    </div>
  );
}
