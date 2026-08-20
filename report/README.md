# Publishing the pilot readout

`public/index.html` is the findings report, as a single self-contained page. It is
served by its own Worker (`defuselab-report`), separate from the participant site.

## Why it is not on `kpop.lbzeng.com`

The report states the hypothesis, the manipulation, the expected direction of the effect
and the actual numbers. A participant who found it mid-study would be unblinded, and the
behavioural measure is the part of the design most exposed to demand characteristics —
two AUG16 participants already guessed they were in an experiment without any help.

So it goes on its own hostname, and the page carries `noindex, nofollow` so search
engines will not surface it. It is **public to anyone with the URL**, not discoverable.

If you would rather it not be reachable at all until data collection finishes, don't
deploy yet — the file is in the repo either way.

## Deploy

```bash
cd report
npx wrangler deploy
```

That publishes to `defuselab-report.<your-subdomain>.workers.dev`.

## Attach the custom domain (once)

`workers.dev` is blocked by the Great Firewall, so mainland readers need a real
hostname. In the Cloudflare dashboard:

1. **Workers & Pages** → **defuselab-report** → **Settings** → **Domains & Routes**
2. **Add** → **Custom Domain**
3. Enter `report.lbzeng.com` (or whatever subdomain you prefer — just not
   `kpop.lbzeng.com`, which is the participant domain)

DNS is created automatically because `lbzeng.com` is already on Cloudflare. It is live
within a minute or two.

## Updating it

Re-run `analysis/analyze_pilot.py`, edit `public/index.html`, then `npx wrangler deploy`
again. The numbers in the page are hard-coded rather than fetched, deliberately: the
report should not need the researcher token to render, and it should not change under a
reader's feet between the meeting and the follow-up.

## Before sharing it widely

Two things worth a decision first:

- The page quotes participant messages verbatim (in Chinese) and names participant
  handles (`blink_rwv0`, `army_pz0q`, …). They are pseudonyms, not real identities, but
  they are participant data and this is pre-IRB.
- Anyone with the link can read it. For an advisor meeting that is the point; for a
  public link on a CV or a repo README, consider redacting the handles and the quotes
  first.
