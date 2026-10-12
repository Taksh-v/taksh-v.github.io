# Smoke test

Verifies the page logic in a headless DOM — no browser needed.

It loads `../index.html` into jsdom, boots the script, and asserts the things that break
silently: the board renders from `#doc`, deep links resolve, the palette opens, keyboard nav
works, the no-JS fallback still shows every project, print rules still print the right thing,
the about copy renders in both places with the right facts, and the résumé PDF served by the
site is **byte-identical to the original upload**.

```bash
cd test
npm install jsdom
timeout 120 node smoke.test.js        # 93 assertions
```

The live IST clock keeps Node's event loop alive, so always run it under `timeout`, or the
process will hang after the summary prints.

## What it covers

| Section | Checks |
|---|---|
| 1–3 | boot, board renders from `#doc`, tabs and deep links (`?p=TKV-03`, `?tab=skills`) |
| 4 | readable mode is gone everywhere; the document survives (noscript + print) |
| 4b | the résumé click: real anchor, embedded-preview fallback, alternate link |
| 5 | contact actions (copy email, mailto, availability line) |
| 6 | ⌘K palette: entries, including the résumé and print |
| 7 | keyboard nav — ↓ focuses a row, ⏎ opens the pass, esc closes it |
| 8 | head / SEO: canonical, og tags, JSON-LD parses |
| 9–10 | the résumé asset exists, is a real PDF, and matches `TAKSH_AI.pdf` byte for byte |
| 11 | the standing line on the board, the origin on Record, GTU Ventures March 2026, AI Algo Builder · Delta, programmes vs certifications, Garry Tan credited, no YC affiliation implied, his own repo linked |

## Editing rule

Run it after any edit to `index.html`. A failing assertion prints the file's expectation next to
what it actually found — fix the file, not the test, unless the behaviour was deliberately changed.
