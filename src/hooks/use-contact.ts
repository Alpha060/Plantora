"use client";

import { useState, useEffect } from "react";

export interface ContactInfo {
  phone: string;
  whatsapp: string;
  email: string;
}

const DEFAULT_CONTACT: ContactInfo = {
  phone: "9304612345",
  whatsapp: "9304612345",
  email: "hello@plantora.in",
};

let cachedContact: ContactInfo | null = null;
let fetchPromise: Promise<ContactInfo> | null = null;

export function useContact() {
  const [contact, setContact] = useState<ContactInfo>(cachedContact || DEFAULT_CONTACT);
  const [isLoading, setIsLoading] = useState(!cachedContact);

  useEffect(() => {
    if (cachedContact) {
      setContact(cachedContact);
      setIsLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetch("/api/settings/contact")
        .then((res) => res.json())
        .then((data) => {
          if (data.contact) {
            cachedContact = data.contact;
          }
          return cachedContact || DEFAULT_CONTACT;
        })
        .catch(() => DEFAULT_CONTACT);
    }

    fetchPromise.then((data) => {
      setContact(data);
      setIsLoading(false);
    });
  }, []);

  const formatPhone = (number: string) => {
    const cleaned = (number || "").replace(/\D/g, "");
    if (cleaned.startsWith("91") && cleaned.length > 10) {
      return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return number ? `+91 ${number}` : "";
  };

  const getWhatsappLink = (number: string) => {
    const cleaned = (number || "").replace(/\D/g, "");
    const finalNumber = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
    return `https://wa.me/${finalNumber}`;
  };

  return {
    contact,
    isLoading,
    formatPhone,
    getWhatsappLink,
  };
}
