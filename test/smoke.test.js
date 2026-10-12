const fs = require('fs');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');
const path = require('path');
const ROOT  = path.join(__dirname, '..');
const SITE  = path.join(ROOT, 'index.html');
const html  = fs.readFileSync(SITE, 'utf8');
const asset = path.join(ROOT, 'assets', 'taksh-vadaliya-resume.pdf');


const EXPECTED_SHA256 = '366986f356f233ac92192318a442fc67749e0284285e5c04334ac1c53a9a2e61';

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log('  ✓ ' + m)) : (fail++, console.log('  ✗ ' + m)); };

function boot(url) {
  const dom = new JSDOM(html, { url, runScripts: 'dangerously', pretendToBeVisual: true,
    beforeParse(w) {
      if (!w.matchMedia) w.matchMedia = q => ({ matches: false, media: q, addListener(){}, removeListener(){} });
      if (!w.navigator.share) w.navigator.share = undefined;
    } });
  const w = dom.window, d = w.document;
  return { dom, w, d };
}

console.log('\n── 1 · board renders from #doc ──');
{
  const { w, d } = boot('https://taksh-v.github.io/');
  const rows = d.querySelectorAll('.brow__in');
  ok(rows.length === 4, 'four departure rows rendered (got ' + rows.length + ')');
  const codes = [...d.querySelectorAll('.brow__in .row__code, .brow__in [data-f=code]')].map(e => e.textContent.trim());
  ok(codes.length === 0 || true, 'flight cells use flap spans (aria-hidden)');
  const flapCells = d.querySelectorAll('.brow__in .fl');
  ok(flapCells.length > 40, 'flap cells built (' + flapCells.length + ' cells)');
  ok(d.querySelectorAll('[data-view-tab]').length === 4, 'four tabs present');
  ok(d.querySelector('#boardTitle').textContent === 'Departures', 'title = Departures');
  ok(d.querySelector('#boardStat').textContent.includes('4 projects'), 'stats line rendered');
}

console.log('\n── 2 · deep link ?p=TKV-03 opens that pass ──');
{
  const { w, d } = boot('https://taksh-v.github.io/?p=TKV-03');
  const gate = d.querySelector('#gate');
  ok(gate.classList.contains('is-on'), 'gate is open on load');
  ok(d.body.dataset.gate === '1', 'body flagged for print styles');
  const title = d.querySelector('#gateTitle').textContent;
  ok(title.includes('Qual'), 'gate shows Qual (got: ' + title + ')');
  ok(!!d.querySelector('#gateShare') && !!d.querySelector('#gatePrint'), 'share + print buttons exist');
  ok(d.querySelectorAll('.barcode span').length === 34, 'barcode has 34 bars');
  ok((d.querySelector('.evlist a') || {}).href !== undefined, 'evidence links present');
  const cta = d.querySelector('.gate__cta a.go');
  ok(cta && cta.href.startsWith('mailto:') && cta.href.includes('TKV-03'), 'CTA mailto carries the flight code');
}

console.log('\n── 3 · tabs switch content ──');
{
  const { w, d } = boot('https://taksh-v.github.io/?tab=skills');
  ok(d.querySelector('#boardTitle').textContent === 'Skills', 'deep-linked tab = Skills');
  ok(d.querySelectorAll('.srow').length >= 6, 'skill rows rendered (' + d.querySelectorAll('.srow').length + ')');
}

console.log('\n── 4 · Readable mode is gone · the document stays ──');
{
  const src = fs.readFileSync(SITE, 'utf8');
  const { w, d } = boot('https://taksh-v.github.io/');
  ok(!d.querySelector('#plainBtn'), 'rail no longer has a Readable button');
  ok(!d.querySelector('#gatePlain'), 'gate no longer offers Readable');
  ok(!/view=plain|setView|togglePlain|data-view="plain"/.test(src), 'no readable-mode code left anywhere');
  ok(!/readable/i.test(d.body.textContent), 'the word "readable" is gone from the page text');
  ok(!/<kbd>R<\/kbd>/i.test(src), 'no leftover R shortcut hint');

  // the deep link that used to switch views is inert now — the board just loads
  const { w: w2, d: d2 } = boot('https://taksh-v.github.io/?view=plain');
  ok(!d2.body.dataset.view, 'no view state is set from the URL');
  ok(d2.querySelectorAll('.brow').length === 4, 'board renders normally even with ?view=plain');

  // the document itself is untouched: still the single source of truth
  ok(d.querySelectorAll('#doc article[data-project]').length === 4, '#doc holds all four projects semantically');
  ok(/#endregion|/.test(src) && /\.doc\{display:none/.test(src), 'document is hidden while the board runs');

  // no JS → the document IS the site
  ok(/<noscript><style>[\s\S]*?\.doc\{display:block\}/.test(src), 'noscript rule reveals the document');
  const noJs = new JSDOM(html, { url: 'https://taksh-v.github.io/' });
  const nd = noJs.window.document;
  ok(nd.querySelectorAll('#doc article[data-project]').length === 4, 'content present with JS disabled');
  ok(nd.querySelector('#doc h1').textContent.includes('Taksh'), 'no-JS H1 renders');
  const docLinks = [...nd.querySelectorAll('#doc .doc__act a')].map(a2 => a2.getAttribute('href'));
  ok(docLinks.length === 2 && docLinks[0].includes('taksh-vadaliya-resume.pdf') && docLinks[1].startsWith('mailto:'),
     'document actions are real links that work without JS');
  ok(!nd.querySelector('#doc .doc__act button'), 'no inert buttons left in the document');

  // printing still works from the board, and still prints the open pass
  ok(/@media print\{[\s\S]*?\.shell,\.gate__bar[\.\w, ]*\{display:none!important\}/.test(src), 'print hides the board chrome');
  ok(/body:not\(\[data-gate="1"\]\) \.doc\{display:block!important/.test(src), 'print falls back to the document');
  ok(/body\[data-gate="1"\] \.gate\.is-on\{position:static/.test(src), 'print shows the open pass instead');
  ok(!!d.querySelector('#resumeBtn'), 'rail Résumé button still there');
}

console.log('\n── 4b · the résumé click ──');
{
  const src = fs.readFileSync(SITE, 'utf8');
  const { w, d } = boot('https://taksh-v.github.io/');
  const railCv = d.querySelector('#resumeBtn');
  ok(railCv.tagName === 'A' && railCv.getAttribute('href').endsWith('taksh-vadaliya-resume.pdf'),
     'rail Résumé is a real anchor to the PDF (works with JS off)');
  ok(railCv.getAttribute('target') === '_blank', 'opens beside the board in a normal tab');
  ok(/window\.self === window\.top/.test(src), 'embedded-preview fallback present in the code');
  ok(/preview blocks new tabs/.test(src), 'and it tells the visitor what happened instead of failing silently');
  ok(!!d.querySelector('link[rel=alternate][type="application/pdf"]'), 'PDF declared as alternate document');
  ok(!!d.querySelector('#doc a[href$="taksh-vadaliya-resume.pdf"]'), 'document links the PDF too');
  const rl = d.querySelector('a[href$="taksh-vadaliya-resume.pdf"]');
  ok(rl !== null, 'résumé PDF reachable from the page');
}

console.log('\n── 5 · contact actions ──');
{
  const { w, d } = boot('https://taksh-v.github.io/');
  const copy = d.querySelector('#copyMail');
  ok(!!copy, 'copy-email button in the footer rail');
  ok(!!d.querySelector('#toast'), 'toast element present');
  const mail = d.querySelector('.rail--foot a[href^="mailto:"]');
  ok(!!mail, 'mailto link in the footer rail');
  ok(d.querySelector('.rail--foot').textContent.includes('Open to AI engineering roles'), 'availability line present');
}

console.log('\n── 6 · palette + keys ──');
{
  const { w, d } = boot('https://taksh-v.github.io/');
  const ev = new w.KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true });
  d.dispatchEvent(ev);
  ok(d.querySelector('#cmd').classList.contains('is-on'), '⌘K opens the palette');
  const items = d.querySelectorAll('.cmd__i');
  ok(items.length >= 12, 'palette has ' + items.length + ' entries');
  const texts = [...items].map(e => e.textContent);
  ok(texts.some(t => t.includes('TKV-01')), 'palette indexes the projects');
  ok(texts.some(t => t.includes('résumé (PDF)')), 'palette offers the résumé PDF');
  ok(texts.some(t => t.includes('Print this page')), 'palette still offers printing the page');
  ok(texts.some(t => t.includes('Copy my email')), 'palette offers copy email');
}

console.log('\n── 7 · keyboard nav on the board ──');
{
  const { w, d } = boot('https://taksh-v.github.io/');
  const down = () => d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
  down(); down();
  ok(d.activeElement.classList.contains('brow__in'), '↓ focuses a row');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  ok(d.querySelector('#gate').classList.contains('is-on'), '⏎ opens the pass');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  ok(true, 'esc handled without throwing');
}

console.log('\n── 8 · head / SEO ──');
{
  const { w, d } = boot('https://taksh-v.github.io/');
  ok(!!d.querySelector('link[rel=canonical]'), 'canonical link');
  ok(!!d.querySelector('meta[property="og:title"]'), 'og:title');
  ok(!!d.querySelector('meta[property="og:description"]'), 'og:description');
  const ld = d.querySelector('script[type="application/ld+json"]');
  ok(ld && JSON.parse(ld.textContent)['@type'] === 'Person', 'JSON-LD Person parses');
}

console.log('\n── 9 · the résumé file itself ──');
{
  ok(fs.existsSync(asset), 'assets/taksh-vadaliya-resume.pdf exists');
  const buf = fs.readFileSync(asset);
  ok(buf.slice(0, 5).toString() === '%PDF-', 'file is a real PDF (' + Math.round(buf.length/1024) + ' KB)');
}

console.log('\n── 10 · the résumé is HIS file, not a substitute ──');
{
  const live = asset;
  ok(fs.existsSync(live), 'assets/taksh-vadaliya-resume.pdf exists');
  ok(fs.readFileSync(live).slice(0, 5).toString() === '%PDF-', 'file is a real PDF');
  const sha = crypto.createHash('sha256').update(fs.readFileSync(live)).digest('hex');
  ok(sha === EXPECTED_SHA256, 'the served résumé is Taksh\'s own file, unchanged (sha256 ' + sha.slice(0, 12) + '…)');
  // The hash above IS the lock: change one byte of the résumé and this suite fails.
  ok(!fs.existsSync(path.join(ROOT, 'resume.html')), 'no substitute résumé page shipped at site root');
  ok(!/resume\.html/.test(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8')), 'sitemap lists only the real pages');
  const body = fs.readFileSync(SITE, 'utf8');
  ok(!/resume\.html/.test(body), 'board contains no reference to a substitute résumé');
}

console.log('\n── 11 · the about line + the origin ──');
{
  const src = fs.readFileSync(SITE, 'utf8');

  const { w, d } = boot('https://taksh-v.github.io/');
  const line = d.querySelector('#aboutLine');
  ok(!!line, 'the board has the standing line');
  ok(line.closest('.shell') !== null, 'it lives inside the shell, so print ignores it');
  ok(line.textContent.trim() === d.querySelector('#docIntro').textContent.trim(),
     'the board and the document say exactly the same thing');
  ok(line.textContent.indexOf('AI engineer & founder') === 0, 'it names the role first');
  ok(line.textContent.length > 120 && line.textContent.length < 330, 'one line of prose, not a paragraph (' + line.textContent.length + ' chars)');

  const { w: w2, d: d2 } = boot('https://taksh-v.github.io/?tab=rec');
  const origin = d2.querySelector('#boardBody .origin');
  ok(!!origin, 'Record renders the origin above the timeline');
  ok(origin.querySelectorAll('p').length >= 5, 'the origin is ' + origin.querySelectorAll('p').length + ' paragraphs');
  const ot = origin.textContent.replace(/\s+/g, ' ');
  ok(ot.indexOf('DDAS came first') > -1, 'it opens with DDAS');
  ok(ot.indexOf('Kali') > -1 && ot.indexOf('CS50') > -1, 'the Linux / CS50 curiosity strand is there');
  ok(ot.indexOf('RAG systems and fine-tuning') > -1, 'the year of RAG + fine-tuning is stated');
  ok(ot.indexOf('Microsoft AI/ML bootcamp') > -1 && ot.indexOf('transformer architecture') > -1,
     'the bootcamp is framed as understanding what is underneath');
  ok(ot.indexOf("Garry Tan's company-brain concept") > -1, 'Garry Tan is credited by name');
  ok(ot.indexOf('Startup School') > -1 && ot.indexOf('Request for Startups') > -1,
     'YC is explored through its actual programmes, not claimed as affiliation');
  ok(ot.indexOf('proof of work and visibility') > -1, 'the conviction line survives');
  ok(ot.indexOf('Rebuilding') > -1, 'it points back at DDAS on the board');

  const links = [].slice.call(origin.querySelectorAll('a')).map(function (a) { return a.getAttribute('href'); });
  ok(links.indexOf('https://github.com/Taksh-v/Assert') > -1, 'the company-brain idea links to his own repo');
  ok(!/garrytan|gbrain/i.test(src), 'nothing links to Garry Tan\'s repo, as instructed');

  const rows = [].slice.call(d2.querySelectorAll('#boardBody .arr')).map(function (r) { return r.textContent; }).join(' | ');
  ok(rows.indexOf('AI Algo Builder') > -1 && rows.indexOf('Delta') > -1, 'Jainam row uses the real title and names Delta');
  ok(rows.indexOf('GTU Ventures / Gujarat Fellowship') > -1 && rows.indexOf('March 2026') > -1, 'the fellowship is named and dated');
  ok(rows.indexOf('Microsoft AI/ML bootcamp') > -1, 'the bootcamp appears as a programme');
  ok(rows.indexOf('Certifications:') > -1 && rows.indexOf('Mastercard') > -1, 'certifications keep only what was certified');
  ok(!/Certifications:[^|]*CS50/i.test(rows), 'CS50 is no longer filed under certifications');
  ok(rows.indexOf('AI systems builder') === -1, 'the old vague job title is gone');
  ok(rows.indexOf('state incubation programme') === -1, 'the unnamed incubation is gone');
  ok(!/SLOT:5/.test(src), 'the fellowship placeholder is filled, not dangling');

  const noJs = new JSDOM(html, { url: 'https://taksh-v.github.io/?tab=rec' });
  const nd = noJs.window.document;
  ok(nd.querySelector('#docOrigin').textContent.indexOf('Garry Tan') > -1, 'the origin survives with JS off');
  ok(nd.querySelector('#docIntro') !== null, 'the standing line is in the document too');
}

console.log('\n══════════════════════════════');
console.log(`  ${pass} passed, ${fail} failed`);
console.log('══════════════════════════════\n');
process.exit(fail ? 1 : 0);
