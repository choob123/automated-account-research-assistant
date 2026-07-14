import type { Metadata } from "next";
import AccountResearchAssistant from "./AccountResearchAssistant";

const canonicalUrl = "https://prasiddhakarki.online/work/account-research";

export const metadata: Metadata = {
  title: "AccountBrief — Automated Account-Research Assistant | Prasiddha K.",
  description: "An evidence-first account research workflow with synthetic company fixtures, claim-level confidence, explicit unknowns, and human-review-gated outreach.",
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: "AccountBrief — Automated Account-Research Assistant",
    description: "See how source-indexed evidence becomes a reviewable account brief without fabricated company claims or personal contacts.",
    type: "article",
    url: canonicalUrl,
    images: [{
      url: "https://prasiddhakarki.online/og-trust-signals.png",
      width: 1200,
      height: 630,
      alt: "Automated Account Research Assistant case study",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AccountBrief — Automated Account-Research Assistant",
    description: "A transparent, human-review-gated account research workflow built around evidence and abstention.",
    images: ["https://prasiddhakarki.online/og-trust-signals.png"],
  },
};

export default function AccountResearchPage() {
  return <AccountResearchAssistant />;
}
