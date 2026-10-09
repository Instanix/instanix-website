import "server-only";
import { createSmtpMailer, type Mailer } from "@ix/integrations";

interface LeadMail {
  readonly mailer: Mailer;
  /** Where new-lead notifications go. */
  readonly to: string;
}

/**
 * Email notification is optional configuration. Without it leads are still stored;
 * the owner just is not emailed.
 */
export function getLeadMail(): LeadMail | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !user || !password) return null;

  const port = Number(process.env.SMTP_PORT || 465);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a port number, e.g. 465");
  }
  return {
    mailer: createSmtpMailer({ host, port, user, password, from: process.env.SMTP_FROM || `Instanix <${user}>` }),
    to: process.env.LEADS_NOTIFY_TO || user,
  };
}
