import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import {
  ACCOUNT_FIXTURE_IDENTITIES,
  evaluateAccountResolution,
  resolveAccountFixtureId,
} from "../app/work/account-research/account-research-model.mjs";

const routeRoot = new URL("../app/work/account-research/", import.meta.url);

test("AccountBrief ships a complete standalone route and polished local interaction", async () => {
  const pageUrl = new URL("page.tsx", routeRoot);
  const componentUrl = new URL("AccountResearchAssistant.tsx", routeRoot);
  const stylesUrl = new URL("AccountResearch.module.css", routeRoot);

  await Promise.all([access(pageUrl), access(componentUrl), access(stylesUrl)]);
  const [page, component, styles] = await Promise.all([
    readFile(pageUrl, "utf8"),
    readFile(componentUrl, "utf8"),
    readFile(stylesUrl, "utf8"),
  ]);

  assert.match(page, /AccountBrief — Automated Account-Research Assistant/);
  assert.match(page, /canonicalUrl = "https:\/\/prasiddhakarki\.online\/work\/account-research"/);
  assert.match(page, /<AccountResearchAssistant \/>/);

  assert.match(component, /id="prototype"/);
  assert.match(component, /htmlFor="account-company"/);
  assert.match(component, /Company name or domain/);
  assert.match(component, /aria-live="polite"/);
  assert.match(component, /aria-pressed=\{selectedFixture === fixture\.id\}/);
  assert.match(component, /No company or workflow data is sent to an external research service/);
  assert.doesNotMatch(component, /fetch\s*\(/);

  assert.match(component, /northstar-health\.example/);
  assert.match(component, /forgeline\.example/);
  assert.match(component, /civicgrid\.example/);
  assert.match(component, /Synthetic portfolio fixture/);
  assert.match(component, /function unknownResult/);
  assert.match(component, /No curated evidence is available/);
  assert.match(component, /Outreach withheld — evidence required/);
  assert.match(component, /No source was loaded and no external lookup was attempted/);

  assert.match(component, /Possible pain points/);
  assert.match(component, /Decision-maker role hypotheses/);
  assert.match(component, /Buying signals, with evidence attached/);
  assert.match(component, /Questions before conclusions/);
  assert.match(component, /A draft with a human gate/);
  assert.match(component, /Every known-fixture claim points back here/);
  assert.match(component, /confidence: "High"/);
  assert.match(component, /confidence: "Medium"/);
  assert.match(component, /<b>Warning<\/b>/);
  assert.match(component, /No fabricated contacts/);
  assert.match(component, /no individual person or reporting line is asserted/i);

  assert.match(component, /aria-label="AccountBrief processing architecture"/);
  assert.match(component, /Input boundary/);
  assert.match(component, /Fixture resolver/);
  assert.match(component, /Evidence registry/);
  assert.match(component, /Claim guard/);
  assert.match(component, /Human review/);
  assert.match(component, /src="\/demos\/account-research-assistant\.mp4"/);
  assert.match(component, /Read the written video summary/);
  assert.match(component, /Known resolution cases/);
  assert.match(component, /Known claims source-indexed/);
  assert.match(component, /No external APIs in portfolio mode/);
  assert.match(component, /GitHub publishing pending/);
  assert.doesNotMatch(component, /github\.com\/prasiddhakarki-coder\/automated-account-research-assistant/);

  assert.match(styles, /\.architectureDiagram\s*\{/);
  assert.match(styles, /grid-template-columns:\s*repeat\(6,\s*1fr\)/);
  assert.match(styles, /@media \(max-width:\s*720px\)/);
  assert.match(styles, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(styles, /\.page button:focus-visible/);
});

test("AccountBrief fixture-evaluation claims remain measurable and bounded", async () => {
  const component = await readFile(new URL("AccountResearchAssistant.tsx", routeRoot), "utf8");

  for (const fixtureId of ["northstar-health", "forgeline", "civicgrid"]) {
    assert.match(component, new RegExp(`id: "${fixtureId}"`));
  }

  assert.match(component, /const sourceCoverage = fixtureClaimCount === 0 \? 0/);
  assert.match(component, /resolutionEvaluation\.known\.passed/);
  assert.match(component, /<strong>0<\/strong><span>Personal contacts generated<\/span>/);
  assert.match(component, /resolutionEvaluation\.unknown\.passed/);
  assert.match(component, /Each fallback withholds industry, size, pain points, roles, signals, and personalized outreach/);
  assert.match(component, /It does not prove accuracy on live companies/);

  assert.doesNotMatch(component, /@[a-z0-9.-]+\.[a-z]{2,}/i);
  assert.doesNotMatch(component, /\+1[\s().-]*\d{3}/);
  assert.doesNotMatch(component, /guaranteed conversion|guaranteed revenue|verified decision maker/i);
});

test("AccountBrief executes every known resolver and unknown abstention case", () => {
  const evaluation = evaluateAccountResolution();

  assert.equal(ACCOUNT_FIXTURE_IDENTITIES.length, 3);
  assert.deepEqual(evaluation.known, { passed: 6, total: 6 });
  assert.deepEqual(evaluation.unknown, { passed: 2, total: 2 });
  assert.equal(resolveAccountFixtureId("https://www.forgeline.example/about"), "forgeline");
  assert.equal(resolveAccountFixtureId("CivicGrid"), "civicgrid");
  assert.equal(resolveAccountFixtureId("Unknown Horizon Labs"), null);
});
