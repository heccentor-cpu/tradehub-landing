// Diccionarios de copia ES/EN. Cargados de forma async desde server components
// para que cada idioma se sirva como una respuesta separada.

export type Lang = "es" | "en";

const dictionaries = {
  es: () => import("./dictionaries/es").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
};

export const getDictionary = async (lang: Lang) => dictionaries[lang]();

export type Dict = Awaited<ReturnType<typeof getDictionary>>;

export const LANGS: Lang[] = ["es", "en"];
export const DEFAULT_LANG: Lang = "es";
