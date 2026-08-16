/* DefuseLab — study configuration (edit this one file after you deploy the backend).
 *
 * BACKEND_URL: the deployed Cloudflare Worker base URL, e.g.
 *   "https://defuselab-study.<your-subdomain>.workers.dev"
 * Leave it "" (empty) to run in OFFLINE mode: the tester app logs sessions to the
 * browser's localStorage and simulates the cross-fandom Collab partner, and the
 * researcher dashboard reads localStorage + a seeded demo cohort. Everything works on
 * GitHub Pages with no backend; set BACKEND_URL to turn on real cross-device logging
 * and live cross-fandom pairing. (Same fall-back-on-error pattern as the legacy proxy.)
 */
window.STUDY_CONFIG = {
  // Consumed by study.html (v3 participant app) and dashboard.html. Both also accept a
  // ?backend=https://... query override for staging/local dev (wrangler dev).
  // Same-origin API: kpop.lbzeng.com/api/* is routed to the defuselab-study Worker
  // (Cloudflare Workers route). The workers.dev hostname is blocked outright by the Great
  // Firewall, so mainland participants could load the page but never join — routing the
  // API through the one custom domain they can reach fixes that, and removes CORS from
  // the picture entirely. The workers.dev URL still works for wrangler deploys/secrets.
  BACKEND_URL: "https://kpop.lbzeng.com",

  // Fixed interaction-session length shown to testers (PLAN.md §8 step 5: "e.g. 20–30 min").
  // Kept short here so a walkthrough is quick; the real study uses the full duration.
  SESSION_MINUTES: 6,

  // How long a Collab waits for a real cross-fandom partner before offering a clearly
  // DISCLOSED system-generated sample (PLAN.md §4.3 — never imply a human when it isn't).
  PAIRING_TIMEOUT_MS: 12000,

  // Cosmetic only — the researcher passphrase is verified server-side against the
  // Worker's RESEARCHER_TOKEN secret; this is just the label on the gate.
  DASHBOARD_TITLE: "DefuseLab — Researcher Dashboard",
};
