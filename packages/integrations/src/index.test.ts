import { describe, expect, it } from "vitest";
import { createSmtpMailer, formatLeadNotification, MailError, type LeadNotification, type SmtpConfig } from "./index";

const config: SmtpConfig = { host: "smtp.example.com", port: 465, user: "info@example.com", password: "secret", from: "Instanix <info@example.com>" };

const lead: LeadNotification = {
  name: "Sara Ali",
  company: null,
  phone: "+971501234567",
  email: null,
  locale: "en",
  industry: "real_estate",
  companySize: "small",
  country: "AE",
  problem: "Leads are not followed up.",
  tools: "",
  summary: "Lead follow-up is manual.",
  team: ["ZEUS", "ATLAS"],
  assessmentId: "7f0c2f6e-5a53-4b0e-9d0a-0f0b6a2f6c11",
};

describe("SMTP mailer", () => {
  it("sends the message from the configured mailbox", async () => {
    const sent: unknown[] = [];
    const mailer = createSmtpMailer(config, () => ({
      async sendMail(message) {
        sent.push(message);
      },
    }));
    await mailer.send({ to: "owner@example.com", subject: "Hello", text: "Body", replyTo: "lead@example.com" });
    expect(sent).toEqual([{ from: "Instanix <info@example.com>", to: "owner@example.com", subject: "Hello", text: "Body", replyTo: "lead@example.com" }]);
  });

  it("strips line breaks from header fields so a visitor cannot inject headers", async () => {
    let subject = "";
    let replyTo: string | undefined;
    const mailer = createSmtpMailer(config, () => ({
      async sendMail(message) {
        subject = message.subject;
        replyTo = message.replyTo;
      },
    }));
    await mailer.send({ to: "owner@example.com", subject: "New lead: Eve\r\nBcc: attacker@example.com", text: "x", replyTo: "a@b.co\nBcc: x@y.z" });
    expect(subject).not.toMatch(/[\r\n]/);
    expect(replyTo).not.toMatch(/[\r\n]/);
  });

  it("raises MailError without leaking the server's error or the password", async () => {
    const mailer = createSmtpMailer(config, () => ({
      async sendMail() {
        throw new Error("535 auth failed for info@example.com with secret");
      },
    }));
    const error = await mailer.send({ to: "o@example.com", subject: "s", text: "t" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(MailError);
    expect((error as Error).message).not.toContain("secret");
  });
});

describe("lead notification", () => {
  it("includes the contact details, a WhatsApp link and the assessment", () => {
    const { subject, text } = formatLeadNotification(lead);
    expect(subject).toBe("New lead: Sara Ali (real_estate, AE)");
    expect(text).toContain("https://wa.me/971501234567");
    expect(text).toContain("Leads are not followed up.");
    expect(text).toContain("Recommended IX team: ZEUS, ATLAS");
  });

  it("handles a lead with email only", () => {
    const { text } = formatLeadNotification({ ...lead, phone: null, email: "sara@example.com" });
    expect(text).toContain("Email:     sara@example.com");
    expect(text).not.toContain("wa.me");
  });

  it("adds what the agents prepared, with a WhatsApp link that carries the draft", () => {
    const message = "Hi Sara,\nYou mentioned leads going unanswered. Could we talk this week?\n\nAmir Diab, Instanix";
    const { subject, text } = formatLeadNotification({
      ...lead,
      followUp: { priority: "high", reasons: ["Concrete problem"], questions: ["How many leads a week?"], message },
    });
    expect(subject).toBe("[HIGH] New lead: Sara Ali (real_estate, AE)");
    expect(text).toContain("ATLAS priority: HIGH");
    expect(text).toContain("  - How many leads a week?");
    expect(text).toContain("nothing was sent");
    expect(text).toContain(`https://wa.me/971501234567?text=${encodeURIComponent(message)}`);
  });

  it("offers no WhatsApp draft link when the lead left only an email", () => {
    const { text } = formatLeadNotification({
      ...lead,
      phone: null,
      email: "sara@example.com",
      followUp: { priority: "low", reasons: ["Vague"], questions: ["What is the goal?"], message: "Hi Sara,\nBody." },
    });
    expect(text).toContain("HERMES draft");
    expect(text).not.toContain("wa.me");
  });
});
