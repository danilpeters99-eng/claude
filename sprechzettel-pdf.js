/*
 * Erzeugt Sprechzettel-Glasfaser.pdf aus sprechzettel.html.
 *
 * Die Seitenränder stehen bewusst NICHT im CSS, sondern hier unten in den
 * PDF-Optionen. Chromium addiert sonst seine eigenen Druckränder auf die
 * CSS-Ränder, dann bleiben statt 280 mm nur 255 mm nutzbare Höhe und der
 * Zettel läuft auf drei Seiten statt auf zwei.
 *
 * Aufruf:  npm install playwright && node sprechzettel-pdf.js
 */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + require('path').resolve('sprechzettel.html') + '', { waitUntil: 'networkidle' });
  await p.emulateMedia({ media: 'print' });
  await p.pdf({
    path: '/home/user/claude/Sprechzettel-Glasfaser.pdf',
    format: 'A4', printBackground: true,
    margin: { top: '12mm', bottom: '10mm', left: '13mm', right: '13mm' }
  });
  console.log('PDF geschrieben. Fehler:', JSON.stringify(errs));
  await b.close();
})();
