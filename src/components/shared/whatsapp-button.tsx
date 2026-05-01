"use client";

import { useContact } from "@/hooks/use-contact";

export default function WhatsAppButton() {
  const { contact, getWhatsappLink } = useContact();

  return (
    <a
      href={getWhatsappLink(contact.whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-4 z-40 h-12 w-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <span className="text-white text-xl">💬</span>
    </a>
  );
}
