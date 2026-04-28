"use client";

import { useState } from "react";
import { ChevronRight, Check, Loader2 } from "lucide-react";
import type { Dict } from "@/lib/i18n";

const WEBHOOK_URL = "/api/contact";

type Props = {
  dict: Dict["agenda"];
  lang: "es" | "en";
};

const FORM_COPY = {
  es: {
    nombre: "Nombre completo",
    empresa: "Empresa",
    email: "Correo corporativo",
    reto: "Reto operativo",
    submit: "Solicitar evaluación",
    sending: "Enviando...",
    successTitle: "Su solicitud fue recibida",
    successBody: "Un Socio Director se pondrá en contacto en las próximas 24 horas hábiles.",
    errorBody: "Ocurrió un error al enviar. Escríbenos directamente a danieljimenez@tradehubconsulting.com.mx",
  },
  en: {
    nombre: "Full name",
    empresa: "Company",
    email: "Corporate email",
    reto: "Operational challenge",
    submit: "Request assessment",
    sending: "Sending...",
    successTitle: "Your request was received",
    successBody: "A Managing Partner will contact you within the next 24 business hours.",
    errorBody: "Something went wrong. Please write to us directly at danieljimenez@tradehubconsulting.com.mx",
  },
} as const;

export default function AgendaSection({ dict, lang }: Props) {
  const t = FORM_COPY[lang];
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [form, setForm] = useState({ nombre: "", empresa: "", email: "", reto: "" });
  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: form.nombre, empresa: form.empresa, email: form.email, reto: form.reto }),
      });
      if (!res.ok) throw new Error("webhook error");
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="agenda" className="py-24 bg-bc-blue text-white px-6 relative overflow-hidden scroll-mt-32">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-x-1/4 -translate-y-1/2 pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{dict.heading}</h2>
          <p className="text-white/85 text-lg max-w-2xl mx-auto leading-relaxed">{dict.sub}</p>
        </div>

        <div className="bg-white text-foreground rounded-xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.20)]">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 bg-bc-light text-bc-blue rounded-full grid place-items-center mx-auto mb-4">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-bc-blue mb-2">{t.successTitle}</h3>
              <p className="text-foreground/70">{t.successBody}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <Field label={t.nombre} value={form.nombre} onChange={update("nombre")} required />
                <Field label={t.empresa} value={form.empresa} onChange={update("empresa")} required />
              </div>
              <div className="mb-5">
                <Field label={t.email} value={form.email} onChange={update("email")} type="email" required />
              </div>
              <div className="mb-7">
                <Field label={t.reto} value={form.reto} onChange={update("reto")} textarea />
              </div>
              {error && (
                <p className="text-red-500 text-sm mb-4 text-right">{t.errorBody}</p>
              )}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 bg-bc-blue text-white px-7 py-3.5 rounded font-bold text-sm hover:bg-bc-dark transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.sending}
                    </>
                  ) : (
                    <>
                      {t.submit}
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  textarea,
  required,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  const cls =
    "w-full px-3.5 py-3 rounded border border-slate-300 text-[15px] text-foreground outline-none focus:border-bc-blue focus:ring-2 focus:ring-bc-blue/20 transition";
  return (
    <label className="block">
      <span className="block text-xs font-semibold tracking-[0.08em] uppercase text-foreground/60 mb-2">
        {label}
      </span>
      {textarea ? (
        <textarea id={label} name={label} value={value} onChange={onChange} rows={3} className={`${cls} resize-y font-sans`} />
      ) : (
        <input id={label} name={label} type={type} value={value} onChange={onChange} required={required} className={cls} />
      )}
    </label>
  );
}
