import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NuestraFirma from "@/components/NuestraFirma";
import { getDictionary, type Lang } from "@/lib/i18n";

export default async function FirmPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header lang={lang} dict={dict.header} page="firm" />
      <NuestraFirma lang={lang} dict={dict.firm} />
      <Footer dict={dict.footer} />
    </div>
  );
}
