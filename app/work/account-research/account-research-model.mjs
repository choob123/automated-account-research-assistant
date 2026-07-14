// Deterministic fixture resolution shared by the interactive prototype and its evaluation tests.

export const ACCOUNT_FIXTURE_IDENTITIES = Object.freeze([
  Object.freeze({
    id: "northstar-health",
    name: "Northstar Health Systems",
    domain: "northstar-health.example",
    aliases: Object.freeze(["northstar health systems", "northstar-health.example", "www.northstar-health.example"]),
  }),
  Object.freeze({
    id: "forgeline",
    name: "Forgeline Manufacturing",
    domain: "forgeline.example",
    aliases: Object.freeze(["forgeline manufacturing", "forgeline.example", "www.forgeline.example"]),
  }),
  Object.freeze({
    id: "civicgrid",
    name: "CivicGrid Energy Cooperative",
    domain: "civicgrid.example",
    aliases: Object.freeze(["civicgrid energy cooperative", "civicgrid", "civicgrid.example", "www.civicgrid.example"]),
  }),
]);

export function normalizeAccountQuery(value) {
  const normalized = String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  if (!/^https?:\/\//.test(normalized) && !/^www\./.test(normalized)) return normalized;

  return normalized
    .replace(/^https?:\/\//, "")
    .split(/[/?#]/, 1)[0]
    .replace(/\.$/, "");
}

export function resolveAccountFixtureId(value) {
  const normalized = normalizeAccountQuery(value);
  return ACCOUNT_FIXTURE_IDENTITIES.find((fixture) => fixture.aliases.includes(normalized))?.id ?? null;
}

export function evaluateAccountResolution() {
  const knownCases = ACCOUNT_FIXTURE_IDENTITIES.flatMap((fixture) => [
    { input: fixture.name, expected: fixture.id },
    { input: fixture.domain, expected: fixture.id },
  ]);
  const unknownCases = ["Unknown Horizon Labs", "unknown-horizon.example"];

  return {
    known: {
      passed: knownCases.filter(({ input, expected }) => resolveAccountFixtureId(input) === expected).length,
      total: knownCases.length,
    },
    unknown: {
      passed: unknownCases.filter((input) => resolveAccountFixtureId(input) === null).length,
      total: unknownCases.length,
    },
  };
}
