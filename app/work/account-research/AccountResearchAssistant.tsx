"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { evaluateAccountResolution, resolveAccountFixtureId } from "./account-research-model.mjs";
import styles from "./AccountResearch.module.css";

type Confidence = "High" | "Medium" | "Low" | "Unavailable";

type Source = {
  id: string;
  label: string;
  kind: string;
  note: string;
};

type Claim = {
  id: string;
  kicker: string;
  title: string;
  detail: string;
  confidence: Confidence;
  sources: string[];
  warning: string;
};

type Outreach = {
  subject: string;
  body: string;
  warning: string;
};

type OrganizationFixture = {
  kind: "fixture";
  id: string;
  name: string;
  domain: string;
  aliases: string[];
  summary: Claim;
  industry: Claim;
  estimatedSize: Claim;
  painPoints: Claim[];
  decisionRoles: Claim[];
  buyingSignals: Claim[];
  discoveryQuestions: string[];
  outreach: Outreach;
  sources: Source[];
};

type UnknownResult = Omit<OrganizationFixture, "kind" | "id" | "aliases"> & {
  kind: "unknown";
  id: "unknown";
};

type ResearchResult = OrganizationFixture | UnknownResult;

const fixtures: OrganizationFixture[] = [
  {
    kind: "fixture",
    id: "northstar-health",
    name: "Northstar Health Systems",
    domain: "northstar-health.example",
    aliases: ["northstar health systems", "northstar-health.example", "www.northstar-health.example"],
    summary: {
      id: "northstar-summary",
      kicker: "Organization summary",
      title: "Multi-site outpatient care network",
      detail: "This fictional fixture represents a regional healthcare operator coordinating patient access, referral intake, and revenue-cycle work across a growing clinic footprint.",
      confidence: "High",
      sources: ["NS-01", "NS-02"],
      warning: "Synthetic portfolio fixture; it does not describe a real organization.",
    },
    industry: {
      id: "northstar-industry",
      kicker: "Industry",
      title: "Healthcare operations",
      detail: "The fixture consistently describes outpatient services, patient-access workflows, and revenue-cycle operations.",
      confidence: "High",
      sources: ["NS-01"],
      warning: "Classification is valid only inside this synthetic scenario.",
    },
    estimatedSize: {
      id: "northstar-size",
      kicker: "Estimated size",
      title: "500–1,000 employees",
      detail: "A fictional careers snapshot and clinic directory support a range rather than an exact headcount.",
      confidence: "Medium",
      sources: ["NS-02", "NS-03"],
      warning: "Estimated range, not a verified employee count.",
    },
    painPoints: [
      {
        id: "northstar-pain-1",
        kicker: "Pain-point hypothesis",
        title: "Referral intake may require duplicate entry",
        detail: "The fixture’s operations note describes fax, portal, and phone referrals converging into one central team, suggesting avoidable re-keying and status follow-up.",
        confidence: "Medium",
        sources: ["NS-01", "NS-04"],
        warning: "Workflow hypothesis; validate volume and rework in discovery.",
      },
      {
        id: "northstar-pain-2",
        kicker: "Pain-point hypothesis",
        title: "Eligibility checks may constrain scheduling",
        detail: "A synthetic job description emphasizes manual benefit verification before appointments and escalation of incomplete records.",
        confidence: "Medium",
        sources: ["NS-03"],
        warning: "A job description signals responsibility, not measured delay or cost.",
      },
    ],
    decisionRoles: [
      {
        id: "northstar-role-1",
        kicker: "Role hypothesis",
        title: "VP, Patient Access",
        detail: "Likely workflow owner for referral intake, scheduling quality, and access-center performance.",
        confidence: "High",
        sources: ["NS-03", "NS-04"],
        warning: "Role hypothesis only; no individual person or reporting line is asserted.",
      },
      {
        id: "northstar-role-2",
        kicker: "Role hypothesis",
        title: "Chief Information Officer",
        detail: "Likely technical stakeholder for integration, security review, identity, and clinical-system constraints.",
        confidence: "Medium",
        sources: ["NS-02"],
        warning: "Influence and purchasing authority require confirmation.",
      },
    ],
    buyingSignals: [
      {
        id: "northstar-signal-1",
        kicker: "Buying-signal evidence",
        title: "Patient-access automation role opened",
        detail: "The synthetic careers snapshot includes a newly listed director role responsible for workflow standardization and automation pilots.",
        confidence: "High",
        sources: ["NS-03"],
        warning: "Fixture evidence only; not a live hiring signal.",
      },
      {
        id: "northstar-signal-2",
        kicker: "Buying-signal evidence",
        title: "Two clinics added to the network",
        detail: "The fictional organization update describes expansion that could increase intake volume and process variance.",
        confidence: "Medium",
        sources: ["NS-02"],
        warning: "Expansion suggests possible need; it does not prove budget or purchase intent.",
      },
    ],
    discoveryQuestions: [
      "How many referrals arrive through each channel, and where is the same information entered more than once?",
      "Which eligibility exceptions consume the most staff time before an appointment can be confirmed?",
      "What accuracy, privacy, and human-review thresholds would an automation pilot have to meet?",
      "How would recovered capacity be measured without assuming it becomes immediate payroll savings?",
    ],
    outreach: {
      subject: "A measured referral-intake pilot for Northstar",
      body: "Hello Northstar Health Systems team,\n\nYour synthetic account fixture points to a practical question: could referral and eligibility work be standardized without hiding exceptions from patient-access staff? I would begin with a bounded workflow study—channel volume, duplicate entry, exception categories, and review requirements—then test one narrow automation against the current baseline.\n\nIf those priorities resemble the real operating environment, would a 20-minute discovery conversation be useful?",
      warning: "Drafted only from synthetic evidence. A human must verify every premise, recipient, tone, and claim before sending.",
    },
    sources: [
      { id: "NS-01", label: "Synthetic service-line profile", kind: "Company fixture", note: "Fictional description of services and operating model." },
      { id: "NS-02", label: "Synthetic clinic-network update", kind: "Company fixture", note: "Fictional footprint and expansion update." },
      { id: "NS-03", label: "Synthetic careers snapshot", kind: "Hiring fixture", note: "Fictional roles and responsibilities; not a live job board." },
      { id: "NS-04", label: "Synthetic operations interview", kind: "Research fixture", note: "Fictional workflow notes created for evaluation." },
    ],
  },
  {
    kind: "fixture",
    id: "forgeline",
    name: "ForgeLine Manufacturing",
    domain: "forgeline.example",
    aliases: ["forgeline manufacturing", "forgeline.example", "www.forgeline.example"],
    summary: {
      id: "forgeline-summary",
      kicker: "Organization summary",
      title: "Specialty industrial components producer",
      detail: "This fictional fixture represents a multi-plant manufacturer balancing production scheduling, quality documentation, and preventive maintenance.",
      confidence: "High",
      sources: ["FL-01", "FL-02"],
      warning: "Synthetic portfolio fixture; it does not describe a real organization.",
    },
    industry: {
      id: "forgeline-industry",
      kicker: "Industry",
      title: "Discrete manufacturing",
      detail: "Product, plant, and quality-system references consistently place the fixture in industrial manufacturing.",
      confidence: "High",
      sources: ["FL-01"],
      warning: "Classification is valid only inside this synthetic scenario.",
    },
    estimatedSize: {
      id: "forgeline-size",
      kicker: "Estimated size",
      title: "200–500 employees",
      detail: "Three fictional plants and the staffing bands in the fixture support a directional range.",
      confidence: "Medium",
      sources: ["FL-01", "FL-03"],
      warning: "Estimated range, not a verified employee count.",
    },
    painPoints: [
      {
        id: "forgeline-pain-1",
        kicker: "Pain-point hypothesis",
        title: "Quality records may be slow to reconcile",
        detail: "The fixture describes inspection notes moving between paper travelers, spreadsheets, and the ERP before shipment release.",
        confidence: "High",
        sources: ["FL-02"],
        warning: "Process description does not establish defect rate or financial impact.",
      },
      {
        id: "forgeline-pain-2",
        kicker: "Pain-point hypothesis",
        title: "Maintenance knowledge may remain reactive",
        detail: "A synthetic maintenance brief notes repeated searches across manuals and prior work orders during downtime events.",
        confidence: "Medium",
        sources: ["FL-04"],
        warning: "Validate event frequency, available data, and safety constraints before proposing automation.",
      },
    ],
    decisionRoles: [
      {
        id: "forgeline-role-1",
        kicker: "Role hypothesis",
        title: "VP, Operations",
        detail: "Likely economic owner for throughput, plant consistency, and downtime reduction.",
        confidence: "Medium",
        sources: ["FL-01", "FL-04"],
        warning: "Role hypothesis only; authority and priorities require confirmation.",
      },
      {
        id: "forgeline-role-2",
        kicker: "Role hypothesis",
        title: "Director, Quality Systems",
        detail: "Likely process owner for inspection evidence, release controls, auditability, and exception review.",
        confidence: "High",
        sources: ["FL-02", "FL-03"],
        warning: "No personal contact or reporting relationship is inferred.",
      },
    ],
    buyingSignals: [
      {
        id: "forgeline-signal-1",
        kicker: "Buying-signal evidence",
        title: "ERP modernization is in discovery",
        detail: "A fictional project brief requests workflow inventory and integration requirements before vendor selection.",
        confidence: "High",
        sources: ["FL-03"],
        warning: "Fixture evidence only; it does not establish an active procurement cycle.",
      },
      {
        id: "forgeline-signal-2",
        kicker: "Buying-signal evidence",
        title: "Quality engineering team is expanding",
        detail: "Two synthetic role descriptions emphasize traceability, digital work instructions, and root-cause data.",
        confidence: "Medium",
        sources: ["FL-03"],
        warning: "Hiring themes suggest attention, not approved automation spend.",
      },
    ],
    discoveryQuestions: [
      "Where does inspection evidence change format between the line, quality review, and shipment release?",
      "Which maintenance questions recur often enough to justify a governed retrieval assistant?",
      "What plant, safety, and quality approvals must remain explicit human decisions?",
      "Which baseline—release time, search time, rework, or downtime—would make a pilot measurable?",
    ],
    outreach: {
      subject: "A bounded quality-record workflow study for ForgeLine",
      body: "Hello ForgeLine Manufacturing team,\n\nThe synthetic fixture suggests that inspection evidence crosses paper, spreadsheet, and ERP steps before release. Rather than promise broad automation, I would map one product family, quantify handoffs and exception work, and test a traceable review assistant against today’s release process.\n\nIf that workflow is genuinely relevant, would it be useful to compare the current evidence path with a small, human-approved pilot?",
      warning: "Drafted only from synthetic evidence. Verify the workflow, recipient, and business context before sending.",
    },
    sources: [
      { id: "FL-01", label: "Synthetic plant profile", kind: "Company fixture", note: "Fictional product and plant summary." },
      { id: "FL-02", label: "Synthetic quality-workflow map", kind: "Operations fixture", note: "Fictional inspection and release handoffs." },
      { id: "FL-03", label: "Synthetic modernization brief", kind: "Project fixture", note: "Fictional hiring and systems-planning evidence." },
      { id: "FL-04", label: "Synthetic maintenance retrospective", kind: "Research fixture", note: "Fictional recurring knowledge-search observations." },
    ],
  },
  {
    kind: "fixture",
    id: "civicgrid",
    name: "CivicGrid Energy Cooperative",
    domain: "civicgrid.example",
    aliases: ["civicgrid energy cooperative", "civicgrid", "civicgrid.example", "www.civicgrid.example"],
    summary: {
      id: "civicgrid-summary",
      kicker: "Organization summary",
      title: "Member-owned regional energy cooperative",
      detail: "This fictional fixture represents a utility cooperative modernizing member service, outage communication, and energy-program operations across a mixed rural territory.",
      confidence: "High",
      sources: ["CG-01", "CG-02"],
      warning: "Synthetic portfolio fixture; it does not describe a real utility or service territory.",
    },
    industry: {
      id: "civicgrid-industry",
      kicker: "Industry",
      title: "Electric utility services",
      detail: "The fixture consistently describes cooperative governance, distribution operations, and member programs.",
      confidence: "High",
      sources: ["CG-01"],
      warning: "Classification is valid only inside this synthetic scenario.",
    },
    estimatedSize: {
      id: "civicgrid-size",
      kicker: "Estimated size",
      title: "100–250 employees",
      detail: "A fictional annual profile provides staffing and service-territory bands rather than exact totals.",
      confidence: "Medium",
      sources: ["CG-01"],
      warning: "Estimated range, not a verified employee count.",
    },
    painPoints: [
      {
        id: "civicgrid-pain-1",
        kicker: "Pain-point hypothesis",
        title: "Member inquiries may spike during outages",
        detail: "The fixture notes repeated status questions reaching phone and digital channels while operations updates change quickly.",
        confidence: "High",
        sources: ["CG-02", "CG-03"],
        warning: "Communication pressure does not justify autonomous safety or restoration guidance.",
      },
      {
        id: "civicgrid-pain-2",
        kicker: "Pain-point hypothesis",
        title: "Program eligibility may be hard to navigate",
        detail: "Synthetic member-service notes show staff comparing multiple rebate rules and document requirements.",
        confidence: "Medium",
        sources: ["CG-04"],
        warning: "Validate rule ownership, update frequency, and appeal pathways.",
      },
    ],
    decisionRoles: [
      {
        id: "civicgrid-role-1",
        kicker: "Role hypothesis",
        title: "Chief Member Experience Officer",
        detail: "Likely business owner for service consistency, channel volume, and member communication quality.",
        confidence: "Medium",
        sources: ["CG-03", "CG-04"],
        warning: "The exact title and purchasing role must be confirmed.",
      },
      {
        id: "civicgrid-role-2",
        kicker: "Role hypothesis",
        title: "Director, Information Technology",
        detail: "Likely technical stakeholder for data access, identity, integration, security, and operational boundaries.",
        confidence: "High",
        sources: ["CG-02"],
        warning: "No individual identity or contact detail is generated.",
      },
    ],
    buyingSignals: [
      {
        id: "civicgrid-signal-1",
        kicker: "Buying-signal evidence",
        title: "Member portal redesign entered planning",
        detail: "A synthetic board brief authorizes discovery for clearer outage and energy-program information.",
        confidence: "High",
        sources: ["CG-02"],
        warning: "Fixture evidence only; scope, timing, and budget remain unknown.",
      },
      {
        id: "civicgrid-signal-2",
        kicker: "Buying-signal evidence",
        title: "Knowledge-management role proposed",
        detail: "The fictional staffing plan includes ownership for governed member-service content and update workflows.",
        confidence: "Medium",
        sources: ["CG-03"],
        warning: "A proposed role is not proof of an approved purchase.",
      },
    ],
    discoveryQuestions: [
      "Which outage questions can be answered from approved status data, and which must remain with operations staff?",
      "How are rebate rules versioned, reviewed, and escalated when a member’s case does not fit?",
      "What channels and events create the largest avoidable inquiry volume?",
      "Which safety, regulatory, and member-privacy constraints define an acceptable pilot?",
    ],
    outreach: {
      subject: "A governed member-service research pilot for CivicGrid",
      body: "Hello CivicGrid Energy Cooperative team,\n\nThe synthetic fixture highlights two evidence-heavy service moments: fast-changing outage questions and program-eligibility research. A safe starting point would separate approved information retrieval from operational or safety decisions, then measure resolution time and escalation quality on one bounded question set.\n\nIf those themes match current priorities, would a short discovery session help identify a useful, reviewable pilot?",
      warning: "Drafted only from synthetic evidence. Confirm priorities, governance, recipient, and approved language before sending.",
    },
    sources: [
      { id: "CG-01", label: "Synthetic cooperative profile", kind: "Company fixture", note: "Fictional organization and service-territory summary." },
      { id: "CG-02", label: "Synthetic board planning brief", kind: "Strategy fixture", note: "Fictional portal and systems-planning evidence." },
      { id: "CG-03", label: "Synthetic member-service review", kind: "Operations fixture", note: "Fictional inquiry and staffing observations." },
      { id: "CG-04", label: "Synthetic program desk guide", kind: "Knowledge fixture", note: "Fictional eligibility and document rules." },
    ],
  },
];

const architecture = [
  ["01", "Input boundary", "Accept a company name or domain; strip URL noise; never accept credentials, files, or private records."],
  ["02", "Fixture resolver", "Match exact curated aliases. Unknown organizations stop at an explicit abstention path."],
  ["03", "Evidence registry", "Keep every synthetic source in a stable index and attach source IDs to each supported claim."],
  ["04", "Deterministic synthesis", "Assemble summaries, hypotheses, questions, and draft outreach from authored fixture content—not a live model call."],
  ["05", "Claim guard", "Expose confidence, warnings, missing evidence, and unsupported fields instead of filling gaps."],
  ["06", "Human review", "A person verifies the company, evidence, recipient, tone, and proposed next step before any outreach."],
] as const;

const safeguards = [
  ["No fabricated contacts", "The prototype never invents names, email addresses, phone numbers, or reporting relationships."],
  ["No live enrichment", "Portfolio mode performs no external lookup, scraping, tracking, or background profiling."],
  ["Unknown means unknown", "An unmatched organization receives no inferred industry, size, pain points, buying signals, or decision-maker claims."],
  ["Claims stay inspectable", "Known-fixture claims include confidence, source IDs, and a warning about what still needs verification."],
  ["Outreach is a draft", "The interface withholds personalized outreach when source-backed personalization is unavailable."],
  ["Human approval is final", "Nothing is sent, saved to an account, or acted on automatically."],
] as const;

const technologies = [
  "Next.js App Router",
  "React + TypeScript",
  "CSS Modules",
  "Deterministic fixture resolver",
  "Source-indexed claim schema",
  "Browser Clipboard API",
  "Node test runner",
  "No external APIs in portfolio mode",
];

function resolveFixture(value: string) {
  const fixtureId = resolveAccountFixtureId(value);
  return fixtures.find((fixture) => fixture.id === fixtureId) ?? null;
}

function unavailableClaim(id: string, kicker: string, title: string): Claim {
  return {
    id,
    kicker,
    title,
    detail: "No curated evidence is available for this field, so AccountBrief does not infer an answer.",
    confidence: "Unavailable",
    sources: [],
    warning: "Research paused. Add verified sources before turning this field into a claim.",
  };
}

function unknownResult(query: string): UnknownResult {
  const name = query.trim() || "Unknown organization";
  return {
    kind: "unknown",
    id: "unknown",
    name,
    domain: "Domain not resolved",
    summary: unavailableClaim("unknown-summary", "Organization summary", "No curated company match"),
    industry: unavailableClaim("unknown-industry", "Industry", "Unknown"),
    estimatedSize: unavailableClaim("unknown-size", "Estimated size", "Unknown"),
    painPoints: [],
    decisionRoles: [],
    buyingSignals: [],
    discoveryQuestions: [
      "Which first-party company page or verified filing should establish the organization’s identity and operating scope?",
      "What recent, attributable evidence supports a workflow problem rather than a generic industry assumption?",
      "Which role owns the workflow, and how can that ownership be verified without identifying a person prematurely?",
      "What evidence would justify outreach—and what finding should stop it?",
    ],
    outreach: {
      subject: "Outreach withheld — evidence required",
      body: "AccountBrief did not generate personalized outreach because no curated, source-backed company fixture matched this input.",
      warning: "Do not send. Resolve the organization and verify relevant evidence first.",
    },
    sources: [],
  };
}

function allFixtureClaims(fixture: OrganizationFixture) {
  return [fixture.summary, fixture.industry, fixture.estimatedSize, ...fixture.painPoints, ...fixture.decisionRoles, ...fixture.buyingSignals];
}

const fixtureClaimCount = fixtures.reduce((total, fixture) => total + allFixtureClaims(fixture).length, 0);
const sourcedFixtureClaimCount = fixtures.reduce(
  (total, fixture) => {
    const sourceIds = new Set(fixture.sources.map((source) => source.id));
    const validClaims = allFixtureClaims(fixture).filter((claim) => {
      return claim.sources.length > 0 && claim.sources.every((sourceId) => sourceIds.has(sourceId)) && claim.warning;
    });
    return total + validClaims.length;
  },
  0,
);
const sourceCoverage = fixtureClaimCount === 0 ? 0 : Math.round(sourcedFixtureClaimCount / fixtureClaimCount * 100);
const resolutionEvaluation = evaluateAccountResolution();

function confidenceClass(confidence: Confidence) {
  if (confidence === "High") return styles.high;
  if (confidence === "Medium") return styles.medium;
  if (confidence === "Low") return styles.low;
  return styles.unavailable;
}

function ClaimCard({ claim, prominent = false }: { claim: Claim; prominent?: boolean }) {
  return (
    <article className={`${styles.claimCard} ${prominent ? styles.prominentClaim : ""}`}>
      <header>
        <span>{claim.kicker}</span>
        <strong className={`${styles.confidence} ${confidenceClass(claim.confidence)}`}>{claim.confidence} confidence</strong>
      </header>
      <h4>{claim.title}</h4>
      <p>{claim.detail}</p>
      <footer>
        <span><b>Evidence</b>{claim.sources.length ? claim.sources.join(" · ") : "No source attached"}</span>
        <span><b>Warning</b>{claim.warning}</span>
      </footer>
    </article>
  );
}

function EmptyEvidence({ children }: { children: React.ReactNode }) {
  return <div className={styles.emptyEvidence}><strong>Not inferred</strong><p>{children}</p></div>;
}

export default function AccountResearchAssistant() {
  const [query, setQuery] = useState(fixtures[0].name);
  const [result, setResult] = useState<ResearchResult>(fixtures[0]);
  const [selectedFixture, setSelectedFixture] = useState(fixtures[0].id);
  const [status, setStatus] = useState(`Loaded the synthetic ${fixtures[0].name} fixture.`);

  const sourceById = useMemo(
    () => new Map(result.sources.map((source) => [source.id, source])),
    [result.sources],
  );

  function runResearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setResult(unknownResult(""));
      setSelectedFixture("");
      setStatus("Research paused because no organization was entered.");
      return;
    }

    const fixture = resolveFixture(trimmed);
    if (fixture) {
      setResult(fixture);
      setSelectedFixture(fixture.id);
      setStatus(`Loaded the synthetic ${fixture.name} fixture. No live company lookup was performed.`);
    } else {
      setResult(unknownResult(trimmed));
      setSelectedFixture("");
      setStatus(`No curated fixture matched ${trimmed}. Unsupported claims were withheld.`);
    }
  }

  function chooseFixture(fixture: OrganizationFixture) {
    setQuery(fixture.name);
    setResult(fixture);
    setSelectedFixture(fixture.id);
    setStatus(`Loaded the synthetic ${fixture.name} fixture. No live company lookup was performed.`);
  }

  async function copyOutreach() {
    if (result.kind === "unknown") {
      setStatus("Outreach was not copied because the company has no source-backed fixture.");
      return;
    }

    try {
      await navigator.clipboard.writeText(`Subject: ${result.outreach.subject}\n\n${result.outreach.body}`);
      setStatus("Draft outreach copied. Verify every premise and recipient before using it.");
    } catch {
      setStatus("The browser blocked copying. Select the draft text manually instead.");
    }
  }

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#account-research-content">Skip to the interactive prototype</a>

      <header className={styles.siteHeader}>
        <Link className={styles.brand} href="/">PK® <span>/ AccountBrief</span></Link>
        <nav aria-label="AccountBrief navigation">
          <a href="#prototype">Prototype</a>
          <a href="#architecture">Architecture</a>
          <a href="#evaluation">Evaluation</a>
          <span className={styles.repoPending}>GitHub · publishing</span>
        </nav>
      </header>

      <main id="account-research-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="account-research-title">
          <div>
            <p className={styles.eyebrow}><i />Portfolio project / Evidence-first sales research</p>
            <h1 id="account-research-title">AccountBrief<span>Automated account-research assistant.</span></h1>
            <p className={styles.heroLead}>Turn a company name or domain into a reviewable account brief—without turning weak evidence into confident outreach.</p>
          </div>
          <aside>
            <p>The prototype uses fictional organizations on reserved <code>.example</code> domains. It demonstrates resolution, evidence linking, confidence, abstention, and human review without profiling a real business or person.</p>
            <dl>
              <div><dt>03</dt><dd>Synthetic fixtures</dd></div>
              <div><dt>00</dt><dd>Personal contacts generated</dd></div>
              <div><dt>01</dt><dd>Required human approval</dd></div>
            </dl>
          </aside>
        </section>

        <section className={styles.positioning} aria-label="Project positioning">
          <span>Research</span><i aria-hidden="true" />
          <span>Evidence</span><i aria-hidden="true" />
          <span>Hypotheses</span><i aria-hidden="true" />
          <span>Review</span><i aria-hidden="true" />
          <span>Outreach draft</span>
        </section>

        <section id="prototype" className={styles.prototype} aria-labelledby="prototype-title">
          <header className={styles.sectionHeader}>
            <div><p>01 / Interactive system</p><h2 id="prototype-title">Research with a visible evidence boundary.</h2></div>
            <span>Browser-local fixture mode</span>
          </header>

          <div className={styles.fixtureNotice}>
            <strong>Synthetic data only</strong>
            <p>Choose a fixture or enter its fictional name/domain. Any other company follows the safe unknown-company path. No company or workflow data is sent to an external research service.</p>
          </div>

          <form className={styles.researchForm} onSubmit={runResearch}>
            <label htmlFor="account-company">
              <span>Company name or domain</span>
              <small id="account-company-help">Try Northstar Health Systems, forgeline.example, CivicGrid, or an unknown company.</small>
            </label>
            <div>
              <input
                id="account-company"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Company name or example.com"
                maxLength={120}
                autoComplete="off"
                spellCheck={false}
                aria-describedby="account-company-help"
              />
              <button type="submit">Build account brief <span aria-hidden="true">↘</span></button>
            </div>
          </form>

          <div className={styles.fixturePicker} aria-label="Synthetic account fixtures">
            {fixtures.map((fixture) => (
              <button
                type="button"
                key={fixture.id}
                className={selectedFixture === fixture.id ? styles.selectedFixture : ""}
                aria-pressed={selectedFixture === fixture.id}
                onClick={() => chooseFixture(fixture)}
              >
                <span>{fixture.name}</span><small>{fixture.domain}</small>
              </button>
            ))}
          </div>

          <p className={styles.status} role="status" aria-live="polite">{status}</p>

          <div className={styles.researchResult}>
            <header className={styles.resultHeader}>
              <div>
                <span>{result.kind === "fixture" ? "Curated synthetic fixture" : "Safe abstention"}</span>
                <h3>{result.name}</h3>
                <p>{result.domain}</p>
              </div>
              <strong className={result.kind === "fixture" ? styles.fixtureMode : styles.unknownMode}>
                {result.kind === "fixture" ? "Evidence loaded" : "Unknowns preserved"}
              </strong>
            </header>

            <ClaimCard claim={result.summary} prominent />

            <div className={styles.factGrid}>
              <ClaimCard claim={result.industry} />
              <ClaimCard claim={result.estimatedSize} />
            </div>

            <div className={styles.researchColumns}>
              <section aria-labelledby="pain-points-title">
                <header><span>02 / Account hypotheses</span><h3 id="pain-points-title">Possible pain points</h3></header>
                <div className={styles.claimList}>
                  {result.painPoints.length
                    ? result.painPoints.map((claim) => <ClaimCard claim={claim} key={claim.id} />)
                    : <EmptyEvidence>Pain points require attributable company evidence and are not inferred from the name alone.</EmptyEvidence>}
                </div>
              </section>

              <section aria-labelledby="decision-roles-title">
                <header><span>03 / Buying group</span><h3 id="decision-roles-title">Decision-maker role hypotheses</h3></header>
                <div className={styles.claimList}>
                  {result.decisionRoles.length
                    ? result.decisionRoles.map((claim) => <ClaimCard claim={claim} key={claim.id} />)
                    : <EmptyEvidence>Role ownership remains unknown; AccountBrief never invents an individual or contact detail.</EmptyEvidence>}
                </div>
              </section>
            </div>

            <section className={styles.signalSection} aria-labelledby="buying-signals-title">
              <header><span>04 / Timing evidence</span><h3 id="buying-signals-title">Buying signals, with evidence attached</h3></header>
              <div className={styles.signalGrid}>
                {result.buyingSignals.length
                  ? result.buyingSignals.map((claim) => <ClaimCard claim={claim} key={claim.id} />)
                  : <EmptyEvidence>No verified change, hiring, initiative, or procurement evidence is available.</EmptyEvidence>}
              </div>
            </section>

            <section className={styles.discoverySection} aria-labelledby="discovery-title">
              <div><span>05 / Human discovery</span><h3 id="discovery-title">Questions before conclusions</h3><p>These are questions—not assertions. They turn hypotheses into a measurable discovery conversation.</p></div>
              <ol>{result.discoveryQuestions.map((question, index) => <li key={question}><span>0{index + 1}</span><p>{question}</p></li>)}</ol>
            </section>

            <section className={styles.outreachSection} aria-labelledby="outreach-title">
              <header>
                <div><span>06 / Personalized outreach</span><h3 id="outreach-title">A draft with a human gate.</h3></div>
                <button type="button" onClick={() => void copyOutreach()} disabled={result.kind === "unknown"}>Copy draft for review</button>
              </header>
              <div className={styles.messageFrame}>
                <p><b>Subject</b>{result.outreach.subject}</p>
                <div>{result.outreach.body.split("\n").map((line, index) => line ? <p key={`${line}-${index}`}>{line}</p> : <br key={`break-${index}`} />)}</div>
                <footer><strong>Review warning</strong><span>{result.outreach.warning}</span></footer>
              </div>
            </section>

            <section className={styles.sourcesSection} aria-labelledby="sources-title">
              <header><span>07 / Source registry</span><h3 id="sources-title">Every known-fixture claim points back here.</h3></header>
              {result.sources.length ? (
                <div className={styles.sourceGrid}>
                  {result.sources.map((source) => (
                    <article key={source.id} id={`source-${source.id.toLowerCase()}`}>
                      <span>{source.id}</span><small>{source.kind}</small><h4>{source.label}</h4><p>{source.note}</p>
                    </article>
                  ))}
                </div>
              ) : <EmptyEvidence>No source was loaded and no external lookup was attempted.</EmptyEvidence>}
              <p className={styles.sourceIntegrity}>Loaded source IDs: {sourceById.size ? [...sourceById.keys()].join(" · ") : "none"}. Fixture content is fictional and exists only to demonstrate product behavior.</p>
            </section>
          </div>
        </section>

        <section id="architecture" className={styles.architectureSection} aria-labelledby="architecture-title">
          <header className={styles.sectionHeader}>
            <div><p>02 / Accessible architecture</p><h2 id="architecture-title">A pipeline built to stop unsupported claims.</h2></div>
            <span>Semantic HTML · CSS diagram</span>
          </header>
          <p className={styles.diagramIntro}>Read left to right on larger screens or top to bottom on mobile. The ordered list remains understandable without its visual connectors.</p>
          <ol className={styles.architectureDiagram} aria-label="AccountBrief processing architecture">
            {architecture.map(([number, title, copy]) => (
              <li key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></li>
            ))}
          </ol>
        </section>

        <section className={styles.videoSection} aria-labelledby="video-title">
          <div>
            <p>03 / Product walkthrough</p>
            <h2 id="video-title">See the research boundary in motion.</h2>
            <p>The walkthrough demonstrates a known fixture, claim-level evidence, outreach review, and the unknown-company abstention path.</p>
            <div className={styles.videoMeta}><span>MP4 demonstration</span><span>Written summary below</span></div>
          </div>
          <div className={styles.videoFrame}>
            <video controls preload="metadata" playsInline poster="https://prasiddhakarki.online/demos/account-research-assistant-poster.png" aria-label="AccountBrief product walkthrough" aria-describedby="video-transcript">
              <source src="https://prasiddhakarki.online/demos/account-research-assistant.mp4" type="video/mp4" />
              Your browser does not support embedded video. Use the written summary below.
            </video>
            <details id="video-transcript">
              <summary>Read the written video summary</summary>
              <p>The demonstration opens a synthetic account fixture, reviews the organization summary and source IDs, checks pain-point and decision-role hypotheses, reads buying-signal warnings, copies a draft for human review, then searches an unmatched company to show that unsupported claims are withheld.</p>
            </details>
          </div>
        </section>

        <section id="evaluation" className={styles.evaluationSection} aria-labelledby="evaluation-title">
          <header className={styles.sectionHeader}>
            <div><p>04 / Fixture evaluation</p><h2 id="evaluation-title">Measure the behavior that earns trust.</h2></div>
            <span>Deterministic evaluation set</span>
          </header>
          <div className={styles.outcomeGrid}>
            <article><strong>{resolutionEvaluation.known.passed}/{resolutionEvaluation.known.total}</strong><span>Known resolution cases</span><p>Each fixture resolves through its exact company name and canonical domain.</p></article>
            <article><strong>{sourceCoverage}%</strong><span>Known claims source-indexed</span><p>Every known-fixture claim carries confidence, at least one source ID, and a verification warning.</p></article>
            <article><strong>0</strong><span>Personal contacts generated</span><p>No fixture or fallback contains an invented person, email address, or phone number.</p></article>
            <article><strong>{resolutionEvaluation.unknown.passed}/{resolutionEvaluation.unknown.total}</strong><span>Unknown-company abstention cases</span><p>Each fallback withholds industry, size, pain points, roles, signals, and personalized outreach.</p></article>
          </div>
          <div className={styles.evaluationNote}><strong>What this proves</strong><p>The fixture suite verifies deterministic portfolio behavior. It does not prove accuracy on live companies, data-provider coverage, sales conversion, or production readiness.</p></div>
        </section>

        <section className={styles.buildSection} aria-labelledby="build-title">
          <div>
            <p>05 / Technology</p><h2 id="build-title">Small architecture.<br />Strong boundaries.</h2>
            <ul className={styles.techList}>{technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
          </div>
          <div>
            <p>06 / Safeguards</p><h2>What the system<br />refuses to do.</h2>
            <div className={styles.safeguardList}>{safeguards.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}</div>
          </div>
        </section>

        <section className={styles.closing} aria-label="AccountBrief project links">
          <div><p>Project handoff</p><h2>Evidence first.<br />Outreach second.</h2></div>
          <div>
            <span className={styles.repoPending}>GitHub publishing pending</span>
            <Link href="/#work">Back to all projects ↑</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© Prasiddha K. 2026</span><span>AccountBrief / Synthetic portfolio mode</span><Link href="/">Portfolio</Link>
      </footer>
    </div>
  );
}
