"use client";

import Image from "next/image";
import Cal from "@calcom/embed-react";
import { Search, Globe, ChevronRight, FileText, CheckCircle2, Factory, Car, Home, Layers, Zap, MapPin } from "lucide-react";
import AngelVisualAnimation from "@/components/AngelVisualAnimation";

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Header - KPMG style (Classic, White, Corporate) */}
      <header className="bg-white border-b border-bc-border sticky top-0 z-50">
        {/* Top small bar */}
        <div className="hidden md:flex justify-end gap-6 px-8 py-2 text-xs text-foreground/70 bg-bc-light">
          <a href="https://wa.me/52553407891" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors flex items-center gap-1.5 focus:outline-none">
            <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" /> 553407891
          </a>
          <a href="#" className="hover:text-bc-blue transition-colors flex items-center gap-1"><Globe className="w-3 h-3" /> Español (MX)</a>
        </div>
        
        {/* Main Nav */}
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-2">
          <div className="flex items-center gap-8">
            {/* Logo - Ampliado para mayor visibilidad */}
            <div className="relative w-48 h-24 sm:w-56 sm:h-32 flex-shrink-0">
              <Image 
                src="/logo-v2.png" 
                alt="TradeHub Consulting Logo" 
                fill 
                className="object-contain object-left" 
                priority 
                quality={100}
              />
            </div>
            
            {/* Nav Links */}
            <nav className="hidden lg:flex items-center gap-7 text-[15px] font-medium text-foreground/80">
              <a href="#" className="hover:text-bc-blue transition-colors">Servicios</a>
              <a href="#" className="hover:text-bc-blue transition-colors">Sectores</a>
              <a href="#" className="hover:text-bc-blue transition-colors">Insights y Normativas</a>
              <a href="#" className="hover:text-bc-blue transition-colors">Nuestra Firma</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-foreground/70 hover:text-bc-blue hidden md:block">
              <Search className="w-5 h-5" />
            </button>
            <a 
              href="#agenda" 
              className="px-6 py-2.5 bg-bc-blue text-white text-sm font-bold rounded hover:bg-bc-dark transition-colors"
            >
              Agendar Sesión
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - Split Screen */}
      <main className="flex-1">
        <section className="relative flex flex-col md:flex-row min-h-[75vh]">
          {/* Left: Solid Blue */}
          <div className="w-full md:w-1/2 bg-bc-blue text-white flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-24 relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6 tracking-tight">
              Excelencia aduanera: redefiniendo su estrategia global
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-lg leading-relaxed">
              Consultoría estratégica en comercio exterior para minimizar riesgos y maximizar la eficiencia de sus operaciones internacionales.
            </p>
            <div>
              <a 
                href="#agenda" 
                className="inline-flex items-center gap-2 bg-white text-bc-blue px-8 py-3.5 rounded font-bold text-[15px] hover:bg-bc-light transition-colors shadow-lg hover:shadow-xl"
              >
                Inicie su auditoría
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
            
            {/* Decorative pattern typical of corporate consulting */}
            <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-bc-dark/40 to-transparent pointer-events-none hidden md:block"></div>
          </div>
          
          {/* Right: Visual Animation */}
          <div className="w-full md:w-1/2 relative min-h-[520px] md:min-h-full bg-[#2335a3]">
            <AngelVisualAnimation />
          </div>
        </section>

        {/* Services Catalog */}
        <section className="py-20 bg-background border-b border-bc-border px-6">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 border-l-4 border-bc-blue pl-4">
              Catálogo de Servicios
            </h2>
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {/* Pillar 1 */}
              <div className="bg-white border border-bc-border rounded-xl shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 p-8 h-full">
                <div className="w-12 h-12 bg-bc-light text-bc-blue rounded-lg flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-6 text-bc-blue leading-snug">
                  Asesoría Logística y Operación de Comercio Exterior
                </h3>
                <ul className="space-y-4 text-sm text-foreground/80">
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Alta y gestión en Padrón de Importadores y Padrones Sectoriales.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Asesoría integral en importaciones y exportaciones (definitivas y temporales).</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Logística internacional end-to-end (terrestre, marítimo, aéreo), FCL, carga consolidada, paquetería, e-commerce (Amazon, ML, Temu, Shein).</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Cadena de frío.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Clasificación arancelaria y contribuciones.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Contratos internacionales e Incoterms.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Certificados de origen, fichas técnicas, certificados de libre venta.</span></li>
                </ul>
              </div>
              
              {/* Pillar 2 */}
              <div className="bg-white border border-bc-border rounded-xl shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 p-8 h-full">
                <div className="w-12 h-12 bg-bc-light text-bc-blue rounded-lg flex items-center justify-center mb-6">
                  <Factory className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-6 text-bc-blue leading-snug">
                  IMMEX y Programas de Fomento
                </h3>
                <ul className="space-y-4 text-sm text-foreground/80">
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Obtención, modificación y ampliación del Programa IMMEX.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Diagnóstico y acompañamiento en el control de importaciones temporales, retornos, cambios de régimen y regularizaciones.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Conciliación de inventarios de Anexo 24 vs ERP.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Estrategia de cumplimiento y defensa aduanera.</span></li>
                </ul>
              </div>

              {/* Pillar 3 */}
              <div className="bg-white border border-bc-border rounded-xl shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 p-8 h-full">
                <div className="w-12 h-12 bg-bc-light text-bc-blue rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-6 text-bc-blue leading-snug">
                  Auditorías y Revisión de Cumplimiento
                </h3>
                <ul className="space-y-4 text-sm text-foreground/80">
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Diseño estructural de estrategia para el cumplimiento de requisitos permanentes y específicos de la CIVA.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Diagnóstico y auditorías preventivas para obtención y mantenimiento de la CIVA.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Apoyo y acompañamiento en visitas de supervisión y auditorías CIVA por parte de la Autoridad.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Atención de requerimientos y preparación de matrices y evidencias de cumplimiento.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Revisión de Activo Fijo y validación de inventarios de materia prima y producto terminado.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Validación de Anexo 30 (SCCCyG) y Anexo 24.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-bc-blue shrink-0" /><span>Evaluación de controles internos y mejoras operativas.</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Sectores Section */}
        <section className="py-20 bg-bc-light border-y border-bc-border px-6">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-12 border-l-4 border-bc-blue pl-4">
              Sectores
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Automotriz */}
              <div className="bg-white rounded-xl p-8 flex flex-col shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 border border-bc-border">
                <div className="w-12 h-12 bg-[#1e3a8a] text-blue-400 rounded-[10px] flex items-center justify-center mb-6 shadow-sm">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-bc-blue mb-4">Automotriz</h3>
                <p className="text-foreground/80 text-[15px] leading-relaxed">
                  Asesoramos a empresas automotrices en cumplimiento IMMEX, importaciones temporales de autopartes y certificaciones para cadenas de suministro globales.
                </p>
              </div>

              {/* Infraestructura */}
              <div className="bg-white rounded-xl p-8 flex flex-col shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 border border-bc-border">
                <div className="w-12 h-12 bg-purple-100 text-purple-900 rounded-[10px] flex items-center justify-center mb-6 shadow-sm">
                  <Home className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-bc-blue mb-4">Infraestructura</h3>
                <p className="text-foreground/80 text-[15px] leading-relaxed">
                  Facilitamos la importación de maquinaria pesada, materiales de construcción y equipo especializado con estrategia arancelaria y logística eficiente.
                </p>
              </div>

              {/* Manufactura y maquila */}
              <div className="bg-white rounded-xl p-8 flex flex-col shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 border border-bc-border">
                <div className="w-12 h-12 bg-[#d1fae5] text-emerald-900 rounded-[10px] flex items-center justify-center mb-6 shadow-sm">
                  <Factory className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-bc-blue mb-4">Manufactura y maquila</h3>
                <p className="text-foreground/80 text-[15px] leading-relaxed">
                  Soluciones integrales para operaciones IMMEX: control de inventarios, retornos, cambios de régimen y cumplimiento de Anexo 24.
                </p>
              </div>

              {/* Industrial */}
              <div className="bg-white rounded-xl p-8 flex flex-col shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 border border-bc-border">
                <div className="w-12 h-12 bg-[#ffedd5] text-[#9a3412] rounded-[10px] flex items-center justify-center mb-6 shadow-sm">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-bc-blue mb-4">Industrial</h3>
                <p className="text-foreground/80 text-[15px] leading-relaxed">
                  Acompañamos al sector industrial en clasificación arancelaria, padrones sectoriales y estrategias de reducción de costos en operaciones aduaneras.
                </p>
              </div>

              {/* Eléctrico */}
              <div className="bg-white rounded-xl p-8 flex flex-col shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 border border-bc-border">
                <div className="w-12 h-12 bg-[#fce7f3] text-[#be185d] rounded-[10px] flex items-center justify-center mb-6 shadow-sm">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-bc-blue mb-4">Eléctrico</h3>
                <p className="text-foreground/80 text-[15px] leading-relaxed">
                  Gestión de importaciones de componentes eléctricos y electrónicos con cumplimiento de NOMs, regulaciones técnicas y certificaciones obligatorias.
                </p>
              </div>

              {/* Alimenticia */}
              <div className="bg-white rounded-xl p-8 flex flex-col shadow-sm hover:shadow-[0_20px_50px_rgba(0,51,160,0.08)] transition-all duration-300 border border-bc-border">
                <div className="w-12 h-12 bg-[#ecfccb] text-[#166534] rounded-[10px] flex items-center justify-center mb-6 shadow-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-bc-blue mb-4">Alimenticia</h3>
                <p className="text-foreground/80 text-[15px] leading-relaxed">
                  Especialistas en importación y exportación de alimentos: permisos SENASICA, cadena de frío, etiquetado NOM-051 y regulaciones sanitarias.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Cal.com Section */}
        <section id="agenda" className="py-24 bg-bc-light px-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bc-blue/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto text-center mb-12 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Agende una evaluación preliminar
            </h2>
            <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
              Nuestros Socios Directores están disponibles para discutir sus retos operativos específicos y trazar una ruta de cumplimiento.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-[0_20px_50px_rgba(0,51,160,0.05)] border border-bc-border overflow-hidden min-h-[600px] p-2 relative z-10">
            <Cal 
              calLink="hector-centeno-cortes-cohkm7/30min"
              style={{width:"100%",height:"100%",overflow:"scroll"}}
              config={{layout: 'month_view', theme: 'light'}}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-bc-dark text-white pt-16 pb-8 px-6">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-3 gap-12 mb-12">
          {/* Logo / Info */}
          <div>
            <div className="relative w-48 h-28 mb-6 bg-white rounded-xl shadow-lg border border-white/10 p-2 overflow-hidden">
              <Image src="/logo-v2.png" alt="TradeHub Consulting Logo" fill quality={100} className="object-contain p-2" />
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Firma experta en asesoría aduanera, logística y cumplimiento de comercio exterior.
            </p>
            <a 
              href="https://wa.me/52553407891" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded hover:bg-[#1EBE5A] transition-colors"
            >
              <WhatsAppIcon className="w-5 h-5" /> 553407891
            </a>
          </div>
          
          {/* Servicios */}
          <div>
            <h4 className="font-bold text-lg mb-4">Servicios</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Auditoría Preventiva</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Defensa Legal Aduanera</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Softwares de Comercio</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Precios de Transferencia</a></li>
            </ul>
          </div>
          
          {/* Firma */}
          <div>
            <h4 className="font-bold text-lg mb-4">La Firma</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Nuestros Socios</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carrera</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Ubicaciones</a></li>
              <li><a href="#" className="hover:text-white transition-colors">ESG</a></li>
            </ul>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="max-w-[1400px] mx-auto border-t border-white/10 pt-8 flex flex-col items-center justify-center gap-4 text-xs text-white/50">
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Términos Legales</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
