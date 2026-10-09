import { describe, expect, it } from "vitest";
import { AGENT_KEYS, AGENTS, getAgent, isAgentKey } from "./index";

describe("IX Team registry", () => {
  it("has the 12 canonical agents with sequential serial IDs", () => {
    expect(AGENTS).toHaveLength(12);
    AGENTS.forEach((agent, i) => {
      expect(agent.id).toBe(`IX-${String(i + 1).padStart(3, "0")}`);
      expect(agent.key).toBe(AGENT_KEYS[i]);
      expect(agent.name).toBe(agent.key.toUpperCase());
    });
  });

  it("limits the MVP slice to ZEUS, ATLAS and HERMES", () => {
    const mvp = AGENTS.filter((a) => a.availability === "mvp").map((a) => a.key);
    expect(mvp.sort()).toEqual(["atlas", "hermes", "zeus"]);
  });

  it("rejects unknown keys", () => {
    expect(isAgentKey("zeus")).toBe(true);
    expect(isAgentKey("robot")).toBe(false);
    expect(isAgentKey(null)).toBe(false);
    expect(getAgent("atlas").id).toBe("IX-010");
  });
});
