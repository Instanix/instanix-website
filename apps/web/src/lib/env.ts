function readSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://instanix.ae";
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL is not a valid URL: "${raw}"`);
  }
  return url.origin;
}

/** Public origin of the marketing site, used for canonical URLs, the sitemap and structured data. */
export const SITE_URL = readSiteUrl();

function readBookingUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_BOOKING_URL;
  if (!raw) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_BOOKING_URL is not a valid URL: "${raw}"`);
  }
  if (url.protocol !== "https:") throw new Error("NEXT_PUBLIC_BOOKING_URL must be https");
  return url.toString();
}

function readWhatsAppNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!raw) return null;
  const digits = raw.replace(/[\s+()-]/g, "");
  if (!/^\d{8,15}$/.test(digits)) {
    throw new Error("NEXT_PUBLIC_WHATSAPP_NUMBER must be a phone number in international format, e.g. 9715XXXXXXXX");
  }
  return digits;
}

/** Calendly (or similar) link for booking a consultation. Null until configured. */
export const BOOKING_URL = readBookingUrl();

/** WhatsApp number in international digits. Null until configured. */
export const WHATSAPP_NUMBER = readWhatsAppNumber();

/** Public company contact address shown on the site. */
export const CONTACT_EMAIL = "info@instanix.ae";
