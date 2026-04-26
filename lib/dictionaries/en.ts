const dict = {
  meta: {
    title: "TradeHub Consulting · Customs Excellence and Foreign Trade",
    description:
      "Strategic foreign-trade consulting, IMMEX, CIVA audits, and customs compliance for companies operating in Mexico.",
  },
  header: {
    phone: "553407891",
    langLabel: "English (US)",
    nav: [
      { label: "Services", anchor: "servicios" },
      { label: "Sectors", anchor: "sectores" },
      { label: "Insights & Regulations", anchor: "agenda" },
      { label: "Our Firm", page: "nuestra-firma" },
    ],
    cta: "Book a Session",
  },
  hero: {
    title: "Customs excellence: redefining your global strategy",
    sub: "Strategic foreign-trade consulting to minimize risk and maximize the efficiency of your international operations.",
    cta: "Start your audit",
  },
  services: {
    heading: "Service Catalog",
    pillars: [
      {
        icon: "globe",
        title: "Foreign-Trade Advisory & Logistics Operations",
        items: [
          "Registration and management of Importer and Sectoral Registries.",
          "Comprehensive advisory on definitive and temporary imports and exports.",
          "End-to-end international logistics (ground, ocean, air), FCL, consolidated freight, parcel, e-commerce (Amazon, ML, Temu, Shein).",
          "Cold chain.",
          "Tariff classification and duties.",
          "International contracts and Incoterms.",
          "Certificates of origin, technical sheets, free-sale certificates.",
        ],
      },
      {
        icon: "factory",
        title: "IMMEX & Trade-Promotion Programs",
        items: [
          "Obtaining, modifying, and expanding IMMEX Program licenses.",
          "Diagnostics and oversight of temporary-import controls, returns, regime changes, and regularizations.",
          "Annex 24 inventory reconciliation against ERP systems.",
          "Compliance strategy and customs defense.",
        ],
      },
      {
        icon: "file",
        title: "Audits & Compliance Review",
        items: [
          "Structural design of the strategy to meet permanent and specific CIVA requirements.",
          "Diagnostics and preventive audits for obtaining and maintaining CIVA certification.",
          "Support during supervisory visits and CIVA audits by the Authority.",
          "Handling of requirements and preparation of matrices and compliance evidence.",
          "Fixed-asset review and validation of raw-material and finished-product inventories.",
          "Validation of Annex 30 (SCCCyG) and Annex 24.",
          "Assessment of internal controls and operational improvements.",
        ],
      },
    ],
  },
  sectors: {
    heading: "Sectors",
    items: [
      { icon: "car",     title: "Automotive",       body: "We advise automotive companies on IMMEX compliance, temporary auto-parts imports, and certifications for global supply chains." },
      { icon: "home",    title: "Infrastructure",   body: "We facilitate imports of heavy machinery, construction materials, and specialized equipment with efficient tariff and logistics strategy." },
      { icon: "factory", title: "Manufacturing & Maquila", body: "End-to-end solutions for IMMEX operations: inventory control, returns, regime changes, and Annex 24 compliance." },
      { icon: "layers",  title: "Industrial",       body: "We support the industrial sector in tariff classification, sectoral registries, and cost-reduction strategies in customs operations." },
      { icon: "zap",     title: "Electrical",       body: "Imports of electrical and electronic components with NOM compliance, technical regulations, and mandatory certifications." },
      { icon: "pin",     title: "Food & Beverage",  body: "Specialists in food import/export: SENASICA permits, cold chain, NOM-051 labeling, and sanitary regulations." },
    ],
  },
  agenda: {
    heading: "Schedule a preliminary assessment",
    sub: "Our Managing Partners are available to discuss your specific operational challenges and outline a compliance roadmap.",
  },
  footer: {
    blurb: "Expert firm in customs advisory, logistics, and foreign-trade compliance.",
    h1: "Services",
    h2: "The Firm",
    services: [
      "Foreign-Trade Advisory & Logistics Operations",
      "IMMEX & Trade-Promotion Programs",
      "Audits & Compliance Review",
    ],
    firm: ["Our Partners", "Careers"],
    legal: "Legal Terms",
  },
  firm: {
    eyebrow: "Our Firm",
    title: "A Firm founded on technical rigor and customs compliance.",
    sub: "We advise Mexican companies at every stage of their foreign-trade operations, with the discipline and detail demanded by the customs authority.",
    misionEyebrow: "Mission",
    misionTitle: "Strategic advisory with legal certainty.",
    misionBody:
      "To deliver strategic foreign-trade solutions that enable our clients to operate with legal certainty, operational efficiency, and international competitiveness — through specialized advisory in customs regulation, logistics, IMMEX programs, and compliance certifications.",
    misionPillars: ["Legal certainty", "Operational efficiency", "International competitiveness"],
    visionEyebrow: "Vision",
    visionTitle: "The national reference in foreign trade.",
    visionBody:
      "To become the national reference in foreign-trade consulting, driving an ecosystem where Mexican companies compete globally with transparent, efficient, and fully compliant customs operations.",
    visionPillars: ["Transparent operations", "Globally competitive Mexican firms", "Full compliance"],
    closingTitle: "Ready to map your compliance roadmap?",
    closingSub: "Our Managing Partners are available for a complimentary preliminary assessment.",
    closingCta: "Book a Session",
  },
} as const;

export default dict;
