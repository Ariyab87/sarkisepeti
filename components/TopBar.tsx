"use client";

import { useEffect, useState } from "react";
import { useLang } from "./LanguageProvider";
import { useCart } from "./CartContext";

// Shopping Cart Icon
const CartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const languageLabels: Record<string, { en: string; tr: string; nl: string }> = {
  en: { en: "English", tr: "İngilizce", nl: "Engels" },
  tr: { en: "Turkish", tr: "Türkçe", nl: "Turks" },
  nl: { en: "Dutch", tr: "Felemenkçe", nl: "Nederlands" },
};

export default function TopBar() {
  const { lang, setLang, t } = useLang();
  const { totalItems, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 flex justify-between items-center px-12 py-4 bg-transparent transition-all duration-500 ${
        scrolled ? "bg-black/70 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <a href="/" className="hover:opacity-80 transition-opacity">
        {!logoError ? (
          <img
            src="/logo/logo.png"
            alt="SarkıSepeti Logo"
            className="h-36 w-auto object-contain"
            onError={() => setLogoError(true)}
            onLoad={() => setLogoError(false)}
          />
        ) : (
          <div className="h-36 flex items-center justify-center text-[#D4AF37] font-bold text-xl">
            SarkıSepeti
          </div>
        )}
      </a>
      <div className="hidden md:flex items-center space-x-10 text-sm tracking-widest uppercase font-medium text-white">
        <a
          href="#order"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("order")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="hover:border-b-2 hover:border-[#D4AF37] pb-1 transition-all duration-300 cursor-pointer"
        >
          {t("navOrder")}
        </a>
        <a
          href="#pricing"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="hover:border-b-2 hover:border-[#D4AF37] pb-1 transition-all duration-300 cursor-pointer"
        >
          {t("navPricing")}
        </a>
        <a
          href="#about"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("about")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="hover:border-b-2 hover:border-[#D4AF37] pb-1 transition-all duration-300 cursor-pointer"
        >
          {t("navAbout")}
        </a>
        
        {/* Shopping Cart Icon */}
        <button
          onClick={openCart}
          className="relative p-2 hover:opacity-80 transition-all duration-300"
          aria-label="Open shopping cart"
        >
          <CartIcon className="w-6 h-6 text-white" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>

        <div
          className="relative"
          onMouseEnter={() => setShowLangDropdown(true)}
          onMouseLeave={() => setShowLangDropdown(false)}
        >
          <button className="uppercase pb-1 hover:border-b-2 hover:border-[#D4AF37] transition-all duration-300">
            {lang === "en" ? "Language" : lang === "tr" ? "Dil" : "Taal"} ▼
          </button>
          <div
            className={`absolute right-0 top-full pt-2 z-50 transition-opacity duration-200 ${
              showLangDropdown ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
            }`}
          >
            <div className="bg-white rounded-md shadow-lg px-4 py-2 space-y-2 min-w-[140px]">
              {([
                { id: "en", label: languageLabels.en[lang] || "English" },
                { id: "tr", label: languageLabels.tr[lang] || "Türkçe" },
                { id: "nl", label: languageLabels.nl[lang] || "Nederlands" },
              ] as const).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setLang(opt.id);
                    setShowLangDropdown(false);
                  }}
                  className={`w-full text-left text-black hover:text-[#D4AF37] hover:bg-[#f5f0e6] rounded px-2 py-1 transition-all duration-300 ${
                    lang === opt.id ? "text-[#D4AF37] font-semibold" : ""
                  }`}
                  aria-label={`Switch language to ${opt.label}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Icon */}
      <div className="md:hidden">
        <button
          onClick={openCart}
          className="relative p-2 hover:opacity-80 transition-all duration-300"
          aria-label="Open shopping cart"
        >
          <CartIcon className="w-6 h-6 text-white" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}


