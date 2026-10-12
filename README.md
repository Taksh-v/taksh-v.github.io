# site-v2 — "Departures" (the board)

**`index.html` is the portfolio.** One self-contained file, ~72 KB, no framework, no external requests, no tracking.
Nothing to build, nothing to install, nothing that can break a deploy.

```
site-v2/
├─ index.html                 ← THE SITE
├─ assets/
│   └─ taksh-vadaliya-resume.pdf   ← YOUR RÉSUMÉ, verbatim (TAKSH_AI.pdf)
├─ 404.html                   ← branded "Gate closed" page
├─ robots.txt  sitemap.xml    ← search-engine plumbing
├─ test/smoke.test.js         ← 36 headless assertions (see test/README.md)
├─ archive/
│   ├─ editorial-v2.html      ← the earlier editorial version, kept only for reference
│   └─ resume-html-not-used.html  ← the résumé page you rejected; unlinked, do not deploy
└─ README.md
```

---

## ✅ What works right now — every button

**Top rail**
| Control | Behaviour |
|---|---|
| Logo | scrolls to top of the board |
| Live IST clock | real split-flap digits, flips every second |
| Departures / Arrivals / Record / Skills | switches the board content; scrolls horizontally on small phones |
| **Résumé** | opens `assets/taksh-vadaliya-resume.pdf` (your own file) in a new tab |
| **Email me** | opens a pre-filled mail to you |

**The board**
| Control | Behaviour |
|---|---|
| ↑ ↓ | move between rows (focus follows) |
| ⏎ | open the focused row's boarding pass |
| Row click / tap | open that pass |
| **⌘K / Ctrl-K** | command palette — 18 entries: all four passes, all four views, the résumé, print, copy email, email, business email, and every external link |
| esc | close whatever is open |

**The pass (gate)**
| Control | Behaviour |
|---|---|
| ← All departures | close and return to the board |
| **Share** | native share sheet on mobile; otherwise copies a deep link like `?p=TKV-02` |
| **Print** | prints *just that pass* (gate-aware print stylesheet) |
| **Print pass** | prints *only that project's pass* — useful for sending a client one write-up |
| Evidence links | open the repo file / live product in a new tab |
| **Email me about TKV-0x →** | mailto with the flight code in the subject, so you know which project arrived |
| esc / browser Back | closes the pass, restores focus to the row you came from |

**Footer rail** — email, business enquiries, GitHub, LinkedIn, Reddit, the live product, a **Copy email** button (with toast confirmation), and an auto-updating "Updated <month year>" stamp read from the file's last-modified date.

**Keyboard & accessibility**
- Focus trap inside the pass, so Tab can't wander into the board behind it
- Focus returns to the originating row when a pass closes
- Flap animation is `aria-hidden`; rows announce as *"Open TKV-02: Assest — agentic company brain"*
- Silent `aria-live` region announces view changes and pass opens
- `prefers-reduced-motion` renders everything settled instantly

**URLs you can share**
| URL | Opens |
|---|---|
| `/` | the board |
| `?p=TKV-02` | that passing's page directly — **this is the link to paste into WhatsApp or LinkedIn** |
| `?tab=arr` · `?tab=rec` · `?tab=skills` | a specific board view |
| `/anything-else` | the 404 page |

Browser **Back** works throughout: it closes a pass instead of leaving the site.

**No readable mode.** The old "Readable" toggle is gone — the rail, the pass toolbar, ⌘K and the `R`
key have all dropped it, and `?view=plain` no longer does anything. The document that view used to
show still exists as `#doc`, and is now reached automatically instead of by button: `<noscript>`
reveals it when JavaScript is off, and `@media print` reveals it when you print from the board. One
copy of the content, no toggle, nothing to maintain twice.

**Search & metadata** — canonical URL, `og:title`/`og:description`, `Person` JSON-LD (skills, location, same-as links), `robots.txt`, `sitemap.xml`, and a themed 404.

---

## Before you publish

**About Taksh, the two places it lives** — and both read from `#doc`:

| Piece | Where it renders | Written where |
|---|---|---|
| **The standing line** (*AI engineer & founder. Four systems in the open…*) | a quiet strip above the board rows, on every tab, inside the shell so print ignores it | `<p id="docIntro">` in `#doc` |
| **The origin** (*Where this started* — DDAS → Linux → CS50 → a year of RAG → the bootcamp → Garry Tan's company-brain idea credited, linked to his own `Assert` repo → proof of work) | above the timeline on the **Record** tab | `<div id="docOrigin">` in `#doc` |

Change the words in `#doc` and both the board and the no-JS/print document follow. Nothing about the
about copy is hardcoded in the script — `renderRecord()` copies `#docOrigin` in, and boot copies
`#docIntro` onto the strip.

**One slot left** — search `SLOT:` in `index.html`:

| Slot | What |
|---|---|
| `SLOT:4` | `og:url` is already set to `https://taksh-v.github.io/`. Change it plus the canonical link if you buy a domain. |
| — | `SLOT:5` (the fellowship) is **filled**: GTU Ventures / Gujarat Fellowship, March 2026. |

### The résumé is your own file — verbatim

`assets/taksh-vadaliya-resume.pdf` is **byte-identical to `TAKSH_AI.pdf`**, the file you uploaded
(sha1/size verified in the test suite — section 10 fails the build if either ever changes).
Nothing in it has been rewritten, reformatted or "improved". It is the résumé the site serves from
every entry point: the rail **Résumé** button, the document contact line, the ⌘K palette, and the
`<link rel="alternate">` in the head.

To update it: drop a new file in with the same filename. No code change needed.

**Print still exists, and is still separate from the résumé:** **Print pass** inside a project prints
just that one write-up; **Print this page** (⌘K) prints the whole document. Neither pretends to be a CV.

### If the Résumé button seems to do nothing

The link is correct and the file is there — this is almost always the container, not the site.

| Situation | What happens | What to do |
|---|---|---|
| **In-app preview pane** | the pane is a sandboxed iframe, so `target="_blank"` (a new tab) is blocked. The site now detects this and falls back to opening the PDF in place, with a toast explaining it | open the preview URL in its own browser tab |
| **Opened as a downloaded file** | works normally, but only if the `assets/` folder came with `index.html` | keep the folder structure — `index.html` + `assets/taksh-vadaliya-resume.pdf` |
| **On GitHub Pages** | path is case-sensitive and must be committed | `assets/taksh-vadaliya-resume.pdf` has to exist in the repo, not just locally |
| **Mobile** | the PDF downloads instead of opening in a tab | expected |

Verify from a terminal at any time:

```bash
curl -I https://taksh-v.github.io/assets/taksh-vadaliya-resume.pdf   # expect 200, application/pdf
```

> ⚠️ **Heads-up, not an action item.** Your uploaded PDF still carries the audit's findings: the
> missing-space rendering bugs (`VoiceAI`, `Aivoice-agentsystems`, `Multi-agentsystems`), `Qdrant`
> listed against Qual (the repo uses FAISS — Qdrant is Assest), SolidExposure reading as an employer
> rather than your own venture, and "from weeks to days" with no baseline. You've chosen to ship it
> as-is, which is a perfectly valid call for a PDF you already send people — just be aware a sharp
> reviewer can stop on any of those four lines. If you later want a corrected export, ask and I'll
> rebuild it in whatever format you want.

**Analytics** is parked as a commented slot in `<head>`. When you want it, use a cookie-less tool (Plausible, Umami) or a counter on your own API — keep it third-party-free so the footer's *"no tracking"* claim stays literally true.

**Then, in priority order:**
1. **Latency numbers** for TKV-01 → follow `../06_INSTRUMENTATION.md`. The pass currently says *"I can't yet show a latency number"*; that should become real data, not a permanent confession.
2. **Fix the résumé PDF** — it's now the site's main CTA, so the rendering bugs and the Qdrant/FAISS mismatch are on the critical path.
3. **Assest guest demo** — replace the seeded-login link with a domain + guest mode, or a Loom walkthrough.

## Deploy (GitHub Pages)

```bash
# in the repo that serves taksh-v.github.io — copy the site to the root
cp index.html 404.html robots.txt sitemap.xml /path/to/taksh-v.github.io/
cd /path/to/taksh-v.github.io && git add . && git commit -m "Portfolio: departure board" && git push
# Settings → Pages → Source: main / root → Save   (HTTPS is on by default)
```

Vercel/Netlify: drag the folder in. No build step, no environment variables.

While you're in GitHub: delete the old self-describing repo text (*"My portfolio does define very less of what i know…"*) and pin the repos the board links to.

## Testing after edits

```bash
cd test && npm install jsdom && timeout 90 node smoke.test.js
```
93 assertions covering rendering, deep links, tabs, the palette, keyboard nav, the no-JS document fallback, the print rules, the SEO head, that no readable-mode code survives, that the served résumé is byte-identical to the original upload, and that the about copy renders in both places with the right facts (GTU Ventures March 2026, AI Algo Builder · Delta, programmes vs certifications, Garry Tan credited, no YC affiliation implied, his own repo linked).

## Editing rules

1. **Content lives once**, inside `#doc` in `index.html`. The board is rendered *from* that document — edit the document, never the board markup.
2. **Marigold is the only action colour.** Moss means LIVE and nothing else.
3. **Every project keeps** a flight code, an honest status, a "what I'd do differently", and at least one evidence link.
4. **New status?** Add it to `STATUS_LABEL`, `STATUS_CLASS` and `STATUS_COLOR` in the script.
5. **New tab?** Add the button, a `tabCopy` entry, and a `render…()` function reading from `#doc`.
