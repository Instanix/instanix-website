import nodemailer from "nodemailer";

export class MailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailError";
  }
}

export interface EmailMessage {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly replyTo?: string;
}

export interface Mailer {
  send(message: EmailMessage): Promise<void>;
}

export interface SmtpConfig {
  readonly host: string;
  readonly port: number;
  readonly user: string;
  /** Read from server-side configuration only. */
  readonly password: string;
  /** The address messages are sent from. Usually the same mailbox as `user`. */
  readonly from: string;
}

/** The slice of a nodemailer transport this adapter uses; injected in tests. */
interface Transport {
  sendMail(message: { from: string; to: string; subject: string; text: string; replyTo?: string }): Promise<unknown>;
}

/** Header values come from visitors: a line break in one would let them add their own headers. */
function headerSafe(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

/** Email over SMTP. Port 465 uses implicit TLS; other ports upgrade with STARTTLS. */
export function createSmtpMailer(
  config: SmtpConfig,
  createTransport: (config: SmtpConfig) => Transport = (c) =>
    nodemailer.createTransport({
      host: c.host,
      port: c.port,
      secure: c.port === 465,
      requireTLS: c.port !== 465,
      auth: { user: c.user, pass: c.password },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    }),
): Mailer {
  const transport = createTransport(config);
  return {
    async send(message) {
      try {
        await transport.sendMail({
          from: headerSafe(config.from),
          to: headerSafe(message.to),
          subject: headerSafe(message.subject).slice(0, 200),
          text: message.text,
          ...(message.replyTo ? { replyTo: headerSafe(message.replyTo) } : {}),
        });
      } catch {
        // The underlying error can contain addresses and server banners; keep it out of logs.
        throw new MailError("The mail server did not accept the message");
      }
    },
  };
}

export interface LeadNotification {
  readonly name: string;
  readonly company: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly locale: string;
  readonly industry: string;
  readonly companySize: string;
  readonly country: string;
  readonly problem: string;
  readonly tools: string;
  readonly summary: string;
  /** Recommended agent names, e.g. ["ZEUS", "ATLAS"]. */
  readonly team: readonly string[];
  readonly assessmentId: string;
  /** What ATLAS and HERMES prepared. Absent when the agents did not run. */
  readonly followUp?: {
    readonly priority: string;
    readonly reasons: readonly string[];
    readonly questions: readonly string[];
    /** The full message, greeting and signature included. */
    readonly message: string;
  };
}

/** Plain-text email telling the owner about a new website lead. Plain text avoids any HTML injection. */
export function formatLeadNotification(lead: LeadNotification): { subject: string; text: string } {
  const digits = lead.phone?.replace(/\D/g, "");
  const lines = [
    "New lead from the ZEUS assessment on instanix.ae",
    "",
    `Name:      ${lead.name}`,
    `Company:   ${lead.company ?? "-"}`,
    `WhatsApp:  ${lead.phone ?? "-"}${digits ? `   https://wa.me/${digits}` : ""}`,
    `Email:     ${lead.email ?? "-"}`,
    `Language:  ${lead.locale}`,
    "",
    `Industry:  ${lead.industry}`,
    `Size:      ${lead.companySize}`,
    `Country:   ${lead.country}`,
    `Tools:     ${lead.tools || "-"}`,
    "",
    "What they want to solve:",
    lead.problem,
    "",
    "ZEUS summary:",
    lead.summary,
    "",
    `Recommended IX team: ${lead.team.join(", ") || "-"}`,
    "",
  ];
  const followUp = lead.followUp;
  if (followUp) {
    lines.push(
      `ATLAS priority: ${followUp.priority.toUpperCase()}`,
      ...followUp.reasons.map((reason) => `  - ${reason}`),
      "",
      "Ask on the first call:",
      ...followUp.questions.map((question) => `  - ${question}`),
      "",
      "HERMES draft (nothing was sent; read it, edit it, send it yourself):",
      followUp.message,
      "",
    );
    // One tap opens WhatsApp with the draft in the box, for the owner to review and send.
    if (digits) lines.push(`Open in WhatsApp with this draft: https://wa.me/${digits}?text=${encodeURIComponent(followUp.message)}`, "");
  }
  lines.push(`Assessment ID: ${lead.assessmentId}`, "The full record is in the leads table.");
  const flag = followUp ? `[${followUp.priority.toUpperCase()}] ` : "";
  return { subject: `${flag}New lead: ${lead.name} (${lead.industry}, ${lead.country})`, text: lines.join("\n") };
}
