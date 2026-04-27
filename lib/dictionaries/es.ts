const dict = {
  meta: {
    title: "TradeHub Consulting · Excelencia aduanera y comercio exterior",
    description:
      "Consultoría estratégica en comercio exterior, IMMEX, auditorías CIVA y cumplimiento aduanero para empresas en México.",
  },
  header: {
    phone: "5534087891",
    langLabel: "Español (MX)",
    nav: [
      { label: "Servicios", anchor: "servicios" },
      { label: "Sectores", anchor: "sectores" },
      { label: "Insights y Normativas", anchor: "agenda" },
      { label: "Nuestra Firma", page: "nuestra-firma" },
    ],
    cta: "Agendar Sesión",
  },
  hero: {
    title: "Excelencia aduanera: redefiniendo su estrategia global",
    sub: "Consultoría estratégica en comercio exterior para minimizar riesgos y maximizar la eficiencia de sus operaciones internacionales.",
    cta: "Inicie su auditoría",
  },
  services: {
    heading: "Catálogo de Servicios",
    pillars: [
      {
        icon: "globe",
        title: "Asesoría Logística y Operación de Comercio Exterior",
        items: [
          "Alta y gestión en Padrón de Importadores y Padrones Sectoriales.",
          "Asesoría integral en importaciones y exportaciones (definitivas y temporales).",
          "Logística internacional end-to-end (terrestre, marítimo, aéreo), FCL, carga consolidada, paquetería, e-commerce (Amazon, ML, Temu, Shein).",
          "Cadena de frío.",
          "Clasificación arancelaria y contribuciones.",
          "Contratos internacionales e Incoterms.",
          "Certificados de origen, fichas técnicas, certificados de libre venta.",
        ],
      },
      {
        icon: "factory",
        title: "IMMEX y Programas de Fomento",
        items: [
          "Obtención, modificación y ampliación del Programa IMMEX.",
          "Diagnóstico y acompañamiento en el control de importaciones temporales, retornos, cambios de régimen y regularizaciones.",
          "Estrategia de cumplimiento y defensa aduanera.",
          "Diagnóstico, implementación y mantenimiento de certificaciones OEA (Operador Económico Autorizado).",
          "Evaluación de riesgos y preparación para certificación CTPAT, incluyendo auditorías internas y fortalecimiento de seguridad en la cadena de suministro.",
        ],
      },
      {
        icon: "file",
        title: "Auditorías y Revisión de Cumplimiento",
        items: [
          "Diseño estructural de estrategia para el cumplimiento de requisitos permanentes y específicos de la CIVA.",
          "Diagnóstico y auditorías preventivas para obtención y mantenimiento de la CIVA.",
          "Apoyo y acompañamiento en visitas de supervisión y auditorías CIVA por parte de la Autoridad.",
          "Atención de requerimientos y preparación de matrices y evidencias de cumplimiento.",
          "Revisión de Activo Fijo y validación de inventarios de materia prima y producto terminado.",
          "Validación de Anexo 30 (SCCCyG) y Anexo 24.",
          "Evaluación de controles internos y mejoras operativas.",
        ],
      },
    ],
  },
  sectors: {
    heading: "Sectores",
    items: [
      { icon: "car",     title: "Automotriz",            body: "Asesoramos a empresas automotrices en cumplimiento IMMEX, importaciones temporales de autopartes y certificaciones para cadenas de suministro globales." },
      { icon: "home",    title: "Infraestructura",       body: "Facilitamos la importación de maquinaria pesada, materiales de construcción y equipo especializado con estrategia arancelaria y logística eficiente." },
      { icon: "factory", title: "Manufactura y maquila", body: "Soluciones integrales para operaciones IMMEX: control de inventarios, retornos, cambios de régimen y cumplimiento de Anexo 24." },
      { icon: "layers",  title: "Industrial",            body: "Acompañamos al sector industrial en clasificación arancelaria, padrones sectoriales y estrategias de reducción de costos en operaciones aduaneras." },
      { icon: "zap",     title: "Eléctrico",             body: "Gestión de importaciones de componentes eléctricos y electrónicos con cumplimiento de NOMs, regulaciones técnicas y certificaciones obligatorias." },
      { icon: "pin",     title: "Alimenticia",           body: "Especialistas en importación y exportación de alimentos: permisos SENASICA, cadena de frío, etiquetado NOM-051 y regulaciones sanitarias." },
    ],
  },
  agenda: {
    heading: "Agende una evaluación preliminar",
    sub: "Nuestros Socios Directores están disponibles para discutir sus retos operativos específicos y trazar una ruta de cumplimiento.",
  },
  footer: {
    blurb: "Firma experta en asesoría aduanera, logística y cumplimiento de comercio exterior.",
    h1: "Servicios",
    h2: "La Firma",
    services: [
      "Asesoría Logística y Operación de Comercio Exterior",
      "IMMEX y Programas de Fomento",
      "Auditorías y Revisión de Cumplimiento",
    ],
    firm: ["Nuestros Socios", "Carrera"],
    legal: "Términos Legales",
  },
  firm: {
    eyebrow: "Nuestra Firma",
    title: "Una Firma fundada sobre el rigor técnico y el cumplimiento aduanero.",
    sub: "Asesoramos a empresas mexicanas en cada etapa de sus operaciones de comercio exterior, con la disciplina y el detalle que exige la autoridad aduanera.",
    misionEyebrow: "Misión",
    misionTitle: "Asesoría estratégica con certeza jurídica.",
    misionBody:
      "Brindar soluciones estratégicas en comercio exterior que permitan a nuestros clientes operar con certeza jurídica, eficiencia operativa y competitividad internacional, a través de asesoría especializada en regulación aduanera, logística, programas IMMEX y certificaciones de cumplimiento.",
    misionPillars: ["Certeza jurídica", "Eficiencia operativa", "Competitividad internacional"],
    visionEyebrow: "Visión",
    visionTitle: "El referente nacional en comercio exterior.",
    visionBody:
      "Convertirnos en el referente nacional de consultoría en comercio exterior, impulsando un ecosistema donde las empresas mexicanas compitan globalmente con operaciones aduaneras transparentes, eficientes y plenamente cumplidas.",
    visionPillars: ["Operaciones transparentes", "Empresas mexicanas globales", "Cumplimiento pleno"],
    closingTitle: "¿Listo para trazar su ruta de cumplimiento?",
    closingSub: "Nuestros Socios Directores están disponibles para una evaluación preliminar sin costo.",
    closingCta: "Agendar Sesión",
  },
} as const;

export default dict;
