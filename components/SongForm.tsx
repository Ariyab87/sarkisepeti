"use client";

import { useMemo, useState } from "react";
import { getTranslatedQuestions, getProductOptions } from "@/lib/products";
import { useLang } from "./LanguageProvider";
import LanguageSelect from "./LanguageSelect";

type FieldValue = string | File | File[] | undefined;

export default function SongForm() {
  const [productId, setProductId] = useState<string>("");
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const { t, lang } = useLang() as any;

  const questions = useMemo(() => getTranslatedQuestions(productId, t, lang), [productId, t, lang]);

  function updateValue(id: string, value: FieldValue) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("Sending...");
    setSubmitting(true);
    setError(null);

    try {
      const name = (values.name as string)?.trim() || "";
      const email = (values.email as string)?.trim() || "";
      
      // Validate required fields
      if (!name || !email) {
        setStatus("❌ Please fill in your name and email");
        setSubmitting(false);
        return;
      }

      if (!email.includes("@")) {
        setStatus("❌ Please enter a valid email address");
        setSubmitting(false);
        return;
      }
      
      // Build message from all form fields
      const currentOptions = getProductOptions(lang);
      const productLabel = currentOptions.find((o) => o.value === productId)?.label || productId;
      const messageParts: string[] = [`Product: ${productLabel}`];
      
      for (const q of questions) {
        const v = values[q.id];
        if (q.type === "file" && v) {
          const files = Array.isArray(v) ? v : v instanceof File ? [v] : [];
          if (files.length > 0) {
            messageParts.push(`${q.label}: ${files.length} file(s) uploaded`);
          }
        } else if (typeof v === "string" && v.trim() && q.id !== "name" && q.id !== "email") {
          messageParts.push(`${q.label}: ${v}`);
        }
      }
      
      const message = messageParts.join("\n\n");

      console.log("📤 Submitting form:", { name, email, messageLength: message.length });

      const res = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, message }),
      });

      console.log("📥 Response status:", res.status);

      const result = await res.json();
      console.log("📊 Response data:", result);
      
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to send email");
      }
      
      setStatus("✅ Sent successfully!");
      setTimeout(() => {
        window.location.href = "/thank-you";
      }, 1500);
    } catch (error: any) {
      console.error("❌ Error sending form:", error);
      setStatus("❌ Failed: " + (error.message || "Network error"));
      setError(error.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">{t("formTitle")}</h2>
        <p className="text-white/70 mt-2">{t("formSubtitle")}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-white/90">{t("productLabel")}</label>
          <select
            className="input-base w-full bg-black/70"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setValues({});
            }}
            required
          >
            <option value="" disabled>
              {t("chooseProduct")}
            </option>
            {getProductOptions(lang).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {productId && (
          <div className="space-y-5">
            {questions.map((q) => (
              <div key={q.id}>
                <label className="block mb-2 text-white/90">{q.label}</label>
                {q.type === "text" && (
                  <input
                    type={q.id === "email" ? "email" : "text"}
                    className="input-base w-full"
                    placeholder={q.placeholder}
                    required={(q as any).required}
                    value={(values[q.id] as string) || ""}
                    onChange={(e) => updateValue(q.id, e.target.value)}
                  />
                )}
                {q.type === "textarea" && (
                  <textarea
                    rows={4}
                    className="input-base w-full"
                    placeholder={q.placeholder}
                    required={(q as any).required}
                    value={(values[q.id] as string) || ""}
                    onChange={(e) => updateValue(q.id, e.target.value)}
                  />
                )}
                {q.type === "select" && q.id !== "language" && (
                  <select
                    className="input-base w-full bg-black/70"
                    required={(q as any).required}
                    value={(values[q.id] as string) || ""}
                    onChange={(e) => updateValue(q.id, e.target.value)}
                  >
                    <option value="" disabled>
                      {t("selectAnOption")}
                    </option>
                    {q.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                )}
                {q.type === "select" && q.id === "language" && (
                  <LanguageSelect
                    value={(values[q.id] as string) || ""}
                    onChange={(v) => updateValue(q.id, v)}
                    placeholder={t("selectAnOption")}
                  />
                )}
                {q.type === "radio" && (
                  <div className="flex flex-wrap gap-3">
                    {q.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 gold-border px-3 py-2 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          onChange={(e) => updateValue(q.id, e.target.value)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === "file" && (
                  <input
                    type="file"
                    className="input-base w-full"
                    multiple={(q as any).multiple}
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      updateValue(q.id, files);
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {status && <p className={`${status.includes("❌") ? "text-red-400" : status.includes("✅") ? "text-green-400" : "text-yellow-400"}`}>{status}</p>}
        {error && <p className="text-red-400">{error}</p>}

        <button type="submit" disabled={!productId || submitting} className="gold-button">
          {submitting ? t("submitting") : t("submit")}
        </button>
      </form>
    </div>
  );
}


