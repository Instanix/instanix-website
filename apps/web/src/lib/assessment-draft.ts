/** Where interactive sections hand a first draft of the visitor's problem to the assessment form. */
export const ASSESSMENT_DRAFT_KEY = "ix-assessment-draft";

/** Keeps a draft for the assessment form. Storage can be blocked; then the form just starts empty. */
export function saveAssessmentDraft(text: string): void {
  try {
    const draft = text.trim();
    if (draft) window.sessionStorage.setItem(ASSESSMENT_DRAFT_KEY, draft);
  } catch {
    // Nothing to do: the visitor fills the form themselves.
  }
}

/** Fills `{name}` placeholders in a dictionary string. */
export function fill(template: string, values: Readonly<Record<string, string | number>>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}
