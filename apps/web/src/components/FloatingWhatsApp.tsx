"use client";

import {
  whatsappFloatByPage,
  type WhatsappFloatPage,
} from "@/lib/social";

interface FloatingWhatsAppProps {
  page: WhatsappFloatPage;
}

export default function FloatingWhatsApp({ page }: FloatingWhatsAppProps) {
  const href = whatsappFloatByPage[page];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-[60] block h-14 w-14 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95 md:h-[3.75rem] md:w-[3.75rem]"
      style={{
        right: "max(1rem, env(safe-area-inset-right))",
        bottom: "max(1rem, env(safe-area-inset-bottom))",
      }}
      aria-label="Falar no WhatsApp"
      title="WhatsApp"
    >
      <span className="animate-wa-float flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-orbit-electric via-sky-400 to-cyan-600 text-white">
        <svg
          className="h-[1.65rem] w-[1.65rem] md:h-7 md:w-7 drop-shadow-sm"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.86L.054 23.25a.75.75 0 00.916.916l5.39-1.478A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.52-5.17-1.426l-.37-.22-3.838 1.052 1.052-3.837-.22-.371A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </span>
    </a>
  );
}
