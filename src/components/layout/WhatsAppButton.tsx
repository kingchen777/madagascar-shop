"use client";

import { MessageCircle } from "lucide-react";

interface WhatsAppButtonProps {
  number: string; // digits only, e.g. "261340000000"
}

export function WhatsAppButton({ number }: WhatsAppButtonProps) {
  if (!number) return null;
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-colors"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
