/* Glasfaser für Teach:In — PowerPoint-Fassung der interaktiven Präsentation */
const Pptx = require("pptxgenjs");

const pres = new Pptx();
pres.layout = "LAYOUT_WIDE";            // 13.333 x 7.5 Zoll
pres.author = "Teach:In · WAN-Anbindung";
pres.title = "Glasfaser für Teach:In";
pres.subject = "Anschlussart LWL / Glasfaser";

const W = 13.333, H = 7.5;
const M = 0.62;                          // Seitenrand

/* ── Farben: dunkler Netzraum, ein scharfer Cyan-Akzent ── */
const BG      = "04060F";
const CARD    = "111A36";
const CARD_HI = "16224A";
const TXT     = "E9EFFA";
const MUTED   = "8E9BB8";
const CYAN    = "2EE6FF";
const MAGENTA = "FF4FB0";
const AMBER   = "FFB43C";
const MINT    = "5CF2A6";
const CORAL   = "FF7A59";
const LILAC   = "8AA4FF";
const COPPER  = "C97B3A";

const HEAD = "Calibri";
const BODY = "Calibri";
const MONO = "Courier New";

const S = pres.ShapeType;

/* ═══════ Bausteine ═══════ */

function slide() {
  const s = pres.addSlide();
  s.background = { color: BG };
  return s;
}

/** Kopfzeile: Kapitelnummer, Titel, optionaler Untertitel */
function head(s, num, title, sub) {
  s.addText(num, {
    x: M, y: 0.38, w: 1.0, h: 0.3, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 12, color: CYAN, charSpacing: 2, bold: true
  });
  s.addText(title, {
    x: M, y: 0.68, w: W - 2 * M, h: 0.72, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 34, bold: true, color: TXT
  });
  if (sub) {
    s.addText(sub, {
      x: M, y: 1.42, w: W - 2 * M - 0.4, h: 0.42, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 13.5, color: MUTED, lineSpacingMultiple: 1.15
    });
  }
}

/** Karte mit dezentem Fond — keine Akzentstreifen */
function card(s, x, y, w, h, opts) {
  const o = opts || {};
  s.addShape(S.roundRect, {
    x, y, w, h, rectRadius: 0.1,
    fill: { color: o.fill || CARD },
    line: { color: o.line || (o.fill === CARD_HI ? CYAN : "26335C"), width: o.lw || 0.75 }
  });
}

/** Kreis nur mit Rand plus zentriertem Text (für nummerierte Schritte) */
function stepDot(s, x, y, d, color, label) {
  s.addShape(S.ellipse, {
    x, y, w: d, h: d,
    fill: { color: CARD }, line: { color, width: 2 }
  });
  s.addText(label, {
    x, y, w: d, h: d, isTextBox: true, margin: 0,
    align: "center", valign: "middle",
    fontFace: MONO, fontSize: 11, bold: true, color
  });
}

/** Zeile aus farbigem Punkt, fetter Überschrift und Fließtext */
function iconRow(s, x, y, w, color, glyph, title, text, opts) {
  const o = opts || {};
  const d = o.d || 0.3;
  s.addShape(S.ellipse, { x, y: y + 0.03, w: d, h: d, fill: { color }, line: { color, width: 0 } });
  if (glyph) {
    s.addText(glyph, {
      x, y: y + 0.03, w: d, h: d, isTextBox: true, margin: 0,
      align: "center", valign: "middle", fontFace: HEAD, fontSize: 11, bold: true, color: BG
    });
  }
  s.addText(
    [
      { text: title, options: { bold: true, color: TXT, fontSize: o.ts || 13, breakLine: true } },
      { text: text, options: { color: MUTED, fontSize: o.bs || 11.5 } }
    ],
    {
      x: x + d + 0.16, y, w: w - d - 0.16, h: o.h || 0.62, isTextBox: true, margin: 0,
      fontFace: BODY, lineSpacingMultiple: 1.06, valign: "top"
    }
  );
}

/** Große Kennzahl mit Beschriftung darunter */
function stat(s, x, y, w, value, label, color) {
  s.addText(value, {
    x, y, w, h: 0.62, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 30, bold: true, color: color || CYAN
  });
  s.addText(label, {
    x, y: y + 0.6, w, h: 0.72, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.05
  });
}

/* ═══════ 1 · Titel ═══════ */
{
  const s = slide();

  s.addText("ANSCHLUSSART 3 VON 6", {
    x: M, y: 1.5, w: 6, h: 0.3, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 12, color: CYAN, charSpacing: 3, bold: true
  });
  s.addText("DSL · KABEL · LWL · RICHTFUNK · LTE/5G · SATELLIT", {
    x: M, y: 1.82, w: 8, h: 0.3, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 10.5, color: MUTED, charSpacing: 1.5
  });

  s.addText(
    [
      { text: "GLAS", options: { color: TXT } },
      { text: "FASER", options: { color: CYAN } }
    ],
    {
      x: M, y: 2.35, w: 8.4, h: 1.5, isTextBox: true, margin: 0,
      fontFace: HEAD, fontSize: 88, bold: true, charSpacing: -1
    }
  );

  s.addText(
    "Ein Haar aus Quarzglas, in dem Licht die Daten trägt.\n" +
    "WAN-Anbindung für das Schulungs- und Testzentrum Teach:In.",
    {
      x: M, y: 3.95, w: 7.4, h: 0.9, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 16, color: "C9D4E8", lineSpacingMultiple: 1.2
    }
  );

  // Drei Kennzahlen als Auftakt
  const statsY = 5.35;
  [
    ["10 Gbit/s", "symmetrisch, XGS-PON", CYAN],
    ["0,2 dB/km", "Dämpfung bei 1550 nm", MINT],
    ["62 %", "der Haushalte in DE erschlossen", AMBER]
  ].forEach((it, i) => stat(s, M + i * 3.15, statsY, 2.95, it[0], it[1], it[2]));

  // Faserquerschnitt als Blickfang rechts
  const cx = 11.0, cy = 2.98;
  [[1.75, AMBER], [1.3, MAGENTA], [0.92, LILAC], [0.58, "BFEFFF"], [0.26, CYAN]].forEach(([r, c]) => {
    s.addShape(S.ellipse, {
      x: cx - r, y: cy - r, w: r * 2, h: r * 2,
      fill: { type: "none" }, line: { color: c, width: r < 0.3 ? 3 : 1.6 }
    });
  });
  s.addShape(S.ellipse, { x: cx - 0.12, y: cy - 0.12, w: 0.24, h: 0.24, fill: { color: CYAN }, line: { width: 0 } });
  s.addText("QUERSCHNITT · NICHT MASSSTABSGETREU", {
    x: cx - 1.6, y: cy + 1.94, w: 3.2, h: 0.25, isTextBox: true, margin: 0,
    align: "center", fontFace: MONO, fontSize: 8, color: MUTED, charSpacing: 1
  });

  s.addText("Modul WAN-Anbindung Teach:In · Stand 15.09.2026", {
    x: M, y: H - 0.62, w: 8, h: 0.3, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 9.5, color: "6A7799"
  });

  s.addNotes(
    "Einstieg: Glasfaser ist eine von sechs Anschlussarten, die wir für Teach:In vergleichen. " +
    "Kernaussage: Daten reisen als Lichtpulse durch Quarzglas — symmetrisch, gigabitschnell, praktisch " +
    "unbegrenzt ausbaubar. Die drei Zahlen unten sind der rote Faden: Rate, Dämpfung, Verfügbarkeit."
  );
}

/* ═══════ 2 · Übertragungsstrecke (Anforderung 1) ═══════ */
{
  const s = slide();
  head(s, "01", "Die Übertragungsstrecke",
    "Vom Router im Teach:In bis zum Internet-Knoten liegt bei FTTH durchgehend Glas — kein einziges Stück Kupfer.");

  const stations = [
    ["Router + ONT", "Teach:In", "0 m", CYAN],
    ["Gf-AP", "Hausanschluss", "20 m", MINT],
    ["Netzverteiler", "Gehweg", "300 m", LILAC],
    ["Splitter", "passiv 1:32", "2 km", MAGENTA],
    ["PoP mit OLT", "Vermittlung", "12 km", AMBER],
    ["Backbone", "DE-CIX", "20 km+", CORAL]
  ];

  const lineY = 2.62, d = 0.52, lw = 1.55;
  const x0 = 1.05, span = 10.7;
  const gap = span / (stations.length - 1);

  // Verbindungslinie hinter den Knoten
  s.addShape(S.rect, {
    x: x0 + d / 2, y: lineY + d / 2 - 0.025, w: span, h: 0.05,
    fill: { color: "26406B" }, line: { width: 0 }
  });

  stations.forEach((st, i) => {
    const x = x0 + i * gap;
    stepDot(s, x, lineY, d, st[3], String(i + 1));
    s.addText(st[0], {
      x: x + d / 2 - lw / 2, y: lineY + d + 0.14, w: lw, h: 0.28, isTextBox: true, margin: 0,
      align: "center", fontFace: HEAD, fontSize: 12, bold: true, color: TXT
    });
    s.addText(st[1], {
      x: x + d / 2 - lw / 2, y: lineY + d + 0.42, w: lw, h: 0.24, isTextBox: true, margin: 0,
      align: "center", fontFace: BODY, fontSize: 10, color: MUTED
    });
    s.addText(st[2], {
      x: x + d / 2 - lw / 2, y: lineY - 0.34, w: lw, h: 0.24, isTextBox: true, margin: 0,
      align: "center", fontFace: MONO, fontSize: 9.5, color: st[3]
    });
  });

  // Erläuterung in zwei Spalten
  const ey = 4.1, cw = (W - 2 * M - 0.4) / 2;
  card(s, M, ey, cw, 2.42);
  card(s, M + cw + 0.4, ey, cw, 2.42);

  const left = [
    [CYAN, "1", "Router und ONT.", "Der ONT wandelt Ethernet-Frames in Lichtpulse. Ab hier ist die Strecke Glas."],
    [MINT, "2", "Gf-AP im Keller.", "Übergabepunkt zwischen Anbieternetz und Inhouse-Verkabelung."],
    [LILAC, "3", "Netzverteiler.", "Grauer Kasten am Gehweg, hier werden hunderte Fasern gespleißt."]
  ];
  const right = [
    [MAGENTA, "4", "Passiver Splitter.", "Teilt eine Faser stromlos auf 32 bis 128 Teilnehmer auf."],
    [AMBER, "5", "PoP mit OLT.", "Gegenstück zum ONT, bündelt alle Teilnehmer und übergibt ans Kernnetz."],
    [CORAL, "6", "Backbone.", "Über DWDM mit vielen Wellenlängen pro Faser bis zum Internet-Knoten."]
  ];
  left.forEach((r, i) => iconRow(s, M + 0.3, ey + 0.28 + i * 0.72, cw - 0.6, r[0], r[1], r[2], r[3], { h: 0.66 }));
  right.forEach((r, i) => iconRow(s, M + cw + 0.7, ey + 0.28 + i * 0.72, cw - 0.6, r[0], r[1], r[2], r[3], { h: 0.66 }));

  s.addNotes(
    "Schaubild der Übertragungsstrecke. Wichtig zu betonen: Bei FTTH endet das Glas erst im Büro. " +
    "Der Splitter ist rein optisch und braucht keinen Strom — das macht den Massenausbau bezahlbar. " +
    "Die Entfernungen oben zeigen die Größenordnung: vom Keller bis zur Vermittlungsstelle sind es maximal 20 km."
  );
}

/* ═══════ 3 · Medium (Anforderung 2) ═══════ */
{
  const s = slide();
  head(s, "02", "Das Medium: ein Haar aus Glas",
    "Der eigentliche Lichtleiter ist dünner als ein zehntel Haar. Alles darum herum ist Schutz.");

  // Querschnitt links
  const cx = 3.05, cy = 4.25;
  const rings = [
    [1.62, AMBER, "Außenmantel", "2–3 mm"],
    [1.24, MAGENTA, "Buffer + Aramid", "900 µm"],
    [0.9, LILAC, "Coating", "250 µm"],
    [0.58, "BFEFFF", "Mantel", "125 µm"],
    [0.26, CYAN, "Kern", "9 µm"]
  ];
  rings.forEach(([r, c]) => {
    s.addShape(S.ellipse, {
      x: cx - r, y: cy - r, w: r * 2, h: r * 2,
      fill: { type: "none" }, line: { color: c, width: r < 0.3 ? 3.5 : 1.8 }
    });
  });
  s.addShape(S.ellipse, { x: cx - 0.13, y: cy - 0.13, w: 0.26, h: 0.26, fill: { color: CYAN }, line: { width: 0 } });
  s.addText("QUERSCHNITT · NICHT MASSSTABSGETREU", {
    x: cx - 1.9, y: cy + 1.78, w: 3.8, h: 0.24, isTextBox: true, margin: 0,
    align: "center", fontFace: MONO, fontSize: 8, color: MUTED, charSpacing: 1
  });

  // Schichten rechts daneben
  const lx = 5.35, lw = 3.5;
  s.addText("SCHICHTEN VON AUSSEN NACH INNEN", {
    x: lx, y: 2.12, w: lw, h: 0.24, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 8.5, color: CYAN, charSpacing: 1
  });
  rings.forEach((r, i) => {
    iconRow(s, lx, 2.46 + i * 0.66, lw, r[1], null,
      r[2], r[3] + (i === 4 ? " · dotiertes Quarzglas, n ≈ 1,48" :
        i === 3 ? " · Quarzglas, n ≈ 1,46" :
        i === 2 ? " · Acrylat gegen Mikrorisse" :
        i === 1 ? " · Zugentlastung aus Aramid" : " · PE oder LSZH, Schutz"),
      { d: 0.22, ts: 12, bs: 10.5, h: 0.6 });
  });

  // Eigenschaften rechts
  const px = 9.2, pw = W - M - px;
  card(s, px, 2.05, pw, 2.55);
  s.addText("EIGENSCHAFTEN", {
    x: px + 0.28, y: 2.26, w: pw - 0.56, h: 0.24, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 8.5, color: CYAN, charSpacing: 1
  });
  const props = [
    ["Material", "Quarzglas, dielektrisch — kein Metall"],
    ["Dämpfung", "0,35 dB/km @ 1310 nm · 0,2 dB/km @ 1550 nm"],
    ["Ausbreitung", "rund 200 000 km/s im Glas"],
    ["Störfestigkeit", "immun gegen EMV, kein Übersprechen"],
    ["Grenze", "Biegeradius ab 30 mm, Staub am Stecker"]
  ];
  props.forEach((p, i) => {
    s.addText(
      [
        { text: p[0], options: { color: MUTED, fontFace: MONO, fontSize: 9, breakLine: true } },
        { text: p[1], options: { color: TXT, fontSize: 10.5 } }
      ],
      {
        x: px + 0.28, y: 2.56 + i * 0.4, w: pw - 0.56, h: 0.38, isTextBox: true, margin: 0,
        fontFace: BODY, lineSpacingMultiple: 1.0
      }
    );
  });

  // Singlemode / Multimode
  const my = 4.78, mw = (W - M - px);
  card(s, px, my, mw, 0.82, { fill: CARD_HI });
  s.addText("Singlemode OS2", {
    x: px + 0.28, y: my + 0.12, w: mw - 0.56, h: 0.26, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 12, bold: true, color: CYAN
  });
  s.addText("9 µm Kern · ein Lichtweg · Laser · bis 80 km · Standard für FTTH", {
    x: px + 0.28, y: my + 0.38, w: mw - 0.56, h: 0.4, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.05
  });
  card(s, px, my + 0.95, mw, 0.82);
  s.addText("Multimode OM3–OM5", {
    x: px + 0.28, y: my + 1.07, w: mw - 0.56, h: 0.26, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 12, bold: true, color: TXT
  });
  s.addText("50 µm Kern · viele Lichtwege · LED/VCSEL · bis 550 m · Gebäude-LAN", {
    x: px + 0.28, y: my + 1.33, w: mw - 0.56, h: 0.4, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.05
  });

  s.addNotes(
    "Das Medium und seine Eigenschaften. Kernaussage: Nur der 9-µm-Kern leitet Licht, alles andere ist " +
    "mechanischer Schutz. Der Unterschied zwischen Kern (n ≈ 1,48) und Mantel (n ≈ 1,46) beträgt rund 1 Prozent " +
    "und genügt für die Totalreflexion. Für FTTH wird immer Singlemode verlegt, Multimode nur im Gebäude."
  );
}

/* ═══════ 4 · Varianten (Anforderung 3) ═══════ */
{
  const s = slide();
  head(s, "03", "Wie weit reicht das Glas?",
    "FTTx sagt, wo die Glasfaser endet und ab wo wieder Kupfer übernimmt. Je näher am Endgerät, desto höher die mögliche Rate.");

  const variants = [
    ["FTTC", "Fiber to the Curb", 0.25, "Glas bis zum Kabelverzweiger, dann VDSL", "bis 250 Mbit/s"],
    ["FTTdp", "to the distribution point", 0.50, "Glas bis kurz vors Haus, letzte Meter G.fast", "bis 500 Mbit/s"],
    ["FTTB", "Fiber to the Building", 0.78, "Glas bis in den Keller, im Haus Kupfer", "bis 1 Gbit/s"],
    ["FTTH", "Fiber to the Home", 1.00, "Glas bis ins Büro — Ziel für Teach:In", "10 Gbit/s"]
  ];

  const bx = M + 2.05, bw = 5.15, by = 2.20, rowH = 0.58;

  // Skalenbeschriftung
  ["PoP", "Kabelverzweiger", "Keller", "Büro"].forEach((t, i) => {
    s.addText(t, {
      x: bx + (bw / 3) * i - 0.7, y: by - 0.3, w: 1.4, h: 0.22, isTextBox: true, margin: 0,
      align: "center", fontFace: MONO, fontSize: 8, color: MUTED
    });
  });

  variants.forEach((v, i) => {
    const y = by + i * rowH;
    const on = v[2] === 1;
    s.addText(v[0], {
      x: M, y: y + 0.02, w: 1.9, h: 0.26, isTextBox: true, margin: 0,
      fontFace: HEAD, fontSize: 15, bold: true, color: on ? CYAN : TXT
    });
    s.addText(v[1], {
      x: M, y: y + 0.28, w: 1.9, h: 0.22, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 9, color: MUTED
    });
    // Balken aus Glas- und Kupferanteil
    s.addShape(S.roundRect, {
      x: bx, y: y + 0.1, w: bw * v[2], h: 0.2, rectRadius: 0.1,
      fill: { color: on ? CYAN : "1FA8C4" }, line: { width: 0 }
    });
    if (v[2] < 1) {
      s.addShape(S.roundRect, {
        x: bx + bw * v[2], y: y + 0.1, w: bw * (1 - v[2]), h: 0.2, rectRadius: 0.1,
        fill: { color: COPPER }, line: { width: 0 }
      });
    }
    s.addText(v[4], {
      x: bx + bw + 0.18, y: y + 0.08, w: 1.25, h: 0.24, isTextBox: true, margin: 0,
      fontFace: MONO, fontSize: 10, bold: on, color: on ? CYAN : MUTED
    });
    s.addText(v[3], {
      x: bx, y: y + 0.32, w: bw, h: 0.22, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 9.5, color: MUTED
    });
  });

  // Legende
  s.addShape(S.rect, { x: M, y: by + 4 * rowH + 0.12, w: 0.22, h: 0.12, fill: { color: CYAN }, line: { width: 0 } });
  s.addText("Glasfaser", {
    x: M + 0.3, y: by + 4 * rowH + 0.04, w: 1.0, h: 0.24, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 9, color: MUTED
  });
  s.addShape(S.rect, { x: M + 1.3, y: by + 4 * rowH + 0.12, w: 0.22, h: 0.12, fill: { color: COPPER }, line: { width: 0 } });
  s.addText("Kupfer", {
    x: M + 1.6, y: by + 4 * rowH + 0.04, w: 1.0, h: 0.24, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 9, color: MUTED
  });

  // PON gegen P2P
  const py = 4.85, pw2 = (W - 2 * M - 0.4) / 2;
  card(s, M, py, pw2, 2.15);
  s.addText("PON — geteilt und passiv", {
    x: M + 0.3, y: py + 0.2, w: pw2 - 0.6, h: 0.28, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 14, bold: true, color: CYAN
  });
  s.addText("Eine Faser vom OLT, per Splitter auf viele Teilnehmer verteilt. Günstig und stromlos im Feld, deshalb Standard im Massenausbau.", {
    x: M + 0.3, y: py + 0.5, w: pw2 - 0.6, h: 0.5, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.08
  });
  const ponRows = [["GPON", "2,5 G", "1,25 G", "1490 / 1310 nm"],
                   ["XGS-PON", "10 G", "10 G", "1577 / 1270 nm"],
                   ["50G-PON", "50 G", "25 G", "1342 / 1286 nm"]];
  s.addTable(
    [[
      { text: "Standard", options: { color: MUTED } },
      { text: "Down", options: { color: MUTED } },
      { text: "Up", options: { color: MUTED } },
      { text: "Wellenlängen", options: { color: MUTED } }
    ]].concat(ponRows.map(r => r.map((c, ci) => ({
      text: c, options: { color: ci === 0 ? TXT : (r[0] === "XGS-PON" ? CYAN : "C9D4E8") }
    })))),
    {
      x: M + 0.3, y: py + 1.0, w: pw2 - 0.6, colW: [1.25, 0.85, 0.85, 2.3],
      fontFace: MONO, fontSize: 9.5, border: { type: "solid", color: "26335C", pt: 0.5 },
      fill: { color: CARD }, rowH: 0.22, valign: "middle"
    }
  );

  card(s, M + pw2 + 0.4, py, pw2, 2.15);
  s.addText("P2P — exklusiv und aktiv", {
    x: M + pw2 + 0.7, y: py + 0.2, w: pw2 - 0.6, h: 0.28, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 14, bold: true, color: MAGENTA
  });
  s.addText(
    "Eigene Faser bis zum PoP. Garantierte symmetrische Bandbreite, beliebig aufrüstbar von 1 bis 100 GbE. " +
    "Typisch für Geschäftskunden mit Service-Level-Vereinbarung — und die Option, wenn Teach:In feste Zusagen braucht.",
    {
      x: M + pw2 + 0.7, y: py + 0.5, w: pw2 - 0.6, h: 0.95, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.1
    }
  );
  ["Dark Fiber", "Ethernet-Standleitung", "SLA 99,9 %"].forEach((t, i) => {
    const cw2 = 1.72;
    s.addShape(S.roundRect, {
      x: M + pw2 + 0.7 + i * (cw2 + 0.1), y: py + 1.58, w: cw2, h: 0.3, rectRadius: 0.15,
      fill: { type: "none" }, line: { color: "3A4A78", width: 0.75 }
    });
    s.addText(t, {
      x: M + pw2 + 0.7 + i * (cw2 + 0.1), y: py + 1.58, w: cw2, h: 0.3, isTextBox: true, margin: 0,
      align: "center", valign: "middle", fontFace: MONO, fontSize: 8.5, color: MUTED
    });
  });

  s.addNotes(
    "Die FTTx-Varianten. Kernaussage: Nur bei FTTH liegt Glas bis ins Gebäude, bei allen anderen übernimmt " +
    "irgendwann Kupfer und begrenzt die Rate. Für Teach:In ist FTTH das Ziel. " +
    "PON versus P2P ist die zweite Entscheidung: PON ist günstig und geteilt, P2P garantiert Bandbreite, kostet aber deutlich mehr."
  );
}

/* ═══════ 5 · Funktionsweise (Anforderung 4) ═══════ */
{
  const s = slide();
  head(s, "04", "Licht, das nicht entkommt",
    "Ein Laser schaltet Licht ein und aus, Milliarden Mal pro Sekunde. Der dichtere Kern hält es durch Totalreflexion gefangen.");

  // Totalreflexion links
  const dx = M, dy = 2.15, dw = 6.1, dh = 1.95;
  card(s, dx, dy, dw, dh);
  s.addText("TOTALREFLEXION", {
    x: dx + 0.28, y: dy + 0.18, w: dw - 0.56, h: 0.24, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 8.5, color: CYAN, charSpacing: 1
  });

  const chX = dx + 0.35, chY = dy + 0.76, chW = dw - 0.7, chH = 0.72;
  s.addShape(S.rect, { x: chX, y: chY, w: chW, h: chH, fill: { color: "0C2044" }, line: { width: 0 } });
  s.addShape(S.rect, { x: chX, y: chY - 0.02, w: chW, h: 0.03, fill: { color: "BFEFFF" }, line: { width: 0 } });
  s.addShape(S.rect, { x: chX, y: chY + chH, w: chW, h: 0.03, fill: { color: "BFEFFF" }, line: { width: 0 } });

  // Zickzack des Strahls
  const bounces = 4, seg = chW / bounces;
  for (let i = 0; i < bounces; i++) {
    const up = i % 2 === 0;
    s.addShape(S.line, {
      x: chX + i * seg, y: up ? chY + chH : chY, w: seg, h: chH,
      line: { color: CYAN, width: 2, endArrowType: i === bounces - 1 ? "triangle" : "none" },
      flipV: !up
    });
  }
  s.addText("Mantel  n₂ = 1,46", {
    x: chX + 0.08, y: chY - 0.26, w: 2.2, h: 0.22, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 8.5, color: MUTED
  });
  s.addText("Kern  n₁ = 1,48", {
    x: chX + 0.08, y: chY + 0.06, w: 2.2, h: 0.22, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 8.5, color: "9FC7E8"
  });
  s.addText("Unterhalb des Grenzwinkels von 9,4° zur Faserachse wird das Licht vollständig zurückgeworfen und bleibt im Kern.", {
    x: dx + 0.35, y: dy + 1.56, w: dw - 0.7, h: 0.32, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 10, color: MUTED
  });

  // Sender und Empfänger rechts
  const sx = M + dw + 0.4, sw = W - M - sx;
  card(s, sx, dy, sw, dh);
  s.addText("SENDER UND EMPFÄNGER", {
    x: sx + 0.28, y: dy + 0.18, w: sw - 0.56, h: 0.24, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 8.5, color: CYAN, charSpacing: 1
  });
  [
    ["Sender", "Laserdiode bei Singlemode, LED oder VCSEL bei Multimode"],
    ["Fenster", "850 nm im LAN, 1310 nm im O-Band, 1550 nm im C-Band"],
    ["Empfänger", "Photodiode, optisch zurück nach elektrisch"],
    ["Budget", "bei GPON rund 28 dB für Faser, Spleiße und Splitter"]
  ].forEach((r, i) => {
    s.addText(
      [
        { text: r[0], options: { color: MUTED, fontFace: MONO, fontSize: 9, breakLine: true } },
        { text: r[1], options: { color: TXT, fontSize: 10.5 } }
      ],
      {
        x: sx + 0.28, y: dy + 0.52 + i * 0.36, w: sw - 0.56, h: 0.34, isTextBox: true, margin: 0,
        fontFace: BODY, lineSpacingMultiple: 1.0
      }
    );
  });

  // Modulationsverfahren als Raster
  s.addText("ÜBERTRAGUNGS- UND MODULATIONSVERFAHREN", {
    x: M, y: 4.32, w: 8, h: 0.26, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 9, color: CYAN, charSpacing: 1.5
  });
  const mods = [
    ["NRZ / OOK", CYAN, "Licht an ist 1, aus ist 0. Einfach und robust, genutzt bis 10 Gbit/s."],
    ["PAM4", MAGENTA, "Vier Helligkeitsstufen, 2 Bit pro Symbol. Für 50G-PON und 400G-Ethernet."],
    ["Kohärent QAM", AMBER, "Phase und Amplitude tragen Bits. 400 bis 800 Gbit/s je Wellenlänge."],
    ["WDM / DWDM", MINT, "Mehrere Farben auf einer Faser, bei DWDM bis 96 Kanäle."],
    ["TDMA im PON", LILAC, "Der OLT teilt jedem ONT einen Zeitschlitz für den Upstream zu."],
    ["Duplex je λ", CORAL, "Hin- und Rückweg auf einer Faser, getrennt durch Filter."]
  ];
  const mw2 = (W - 2 * M - 2 * 0.28) / 3, mh = 0.88;
  mods.forEach((m, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = M + col * (mw2 + 0.28), y = 4.66 + row * (mh + 0.2);
    card(s, x, y, mw2, mh);
    s.addShape(S.ellipse, { x: x + 0.24, y: y + 0.22, w: 0.18, h: 0.18, fill: { color: m[1] }, line: { width: 0 } });
    s.addText(m[0], {
      x: x + 0.5, y: y + 0.16, w: mw2 - 0.74, h: 0.26, isTextBox: true, margin: 0,
      fontFace: HEAD, fontSize: 12, bold: true, color: TXT
    });
    s.addText(m[2], {
      x: x + 0.24, y: y + 0.44, w: mw2 - 0.48, h: 0.4, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.05
    });
  });

  s.addNotes(
    "Funktionsweise. Kern der Erklärung: Der Kern ist optisch dichter als der Mantel, deshalb wird flach " +
    "auftreffendes Licht vollständig reflektiert — es gibt keinen Verlust an der Grenzfläche. " +
    "Bei den Modulationsverfahren reicht es, NRZ (an/aus) und WDM (mehrere Farben gleichzeitig) zu erklären, " +
    "der Rest ist Vertiefung für Nachfragen."
  );
}

/* ═══════ 6 · Kennzahlen (Anforderung 5, Teil 1) ═══════ */
{
  const s = slide();
  head(s, "05", "Raten, Frequenzen, Bandbreiten",
    "Typische Maximalwerte der sechs Anschlussarten im Vergleich. Glasfaser ist die einzige symmetrische Technik.");

  s.addChart(
    pres.ChartType.bar,
    [
      {
        name: "Download",
        labels: ["Glasfaser", "Richtfunk", "Kabel", "5G", "DSL", "Satellit"],
        values: [10000, 1000, 1000, 500, 250, 200]
      },
      {
        name: "Upload",
        labels: ["Glasfaser", "Richtfunk", "Kabel", "5G", "DSL", "Satellit"],
        values: [10000, 1000, 50, 100, 40, 20]
      }
    ],
    {
      x: M, y: 2.15, w: 7.7, h: 4.35,
      barDir: "bar", barGrouping: "clustered", barGapWidthPct: 45,
      chartColors: [CYAN, MAGENTA],
      showTitle: false, showLegend: true, legendPos: "t", legendColor: MUTED, legendFontFace: BODY, legendFontSize: 11,
      showValue: true, dataLabelPosition: "outEnd", dataLabelColor: TXT,
      dataLabelFontFace: MONO, dataLabelFontSize: 9, dataLabelFormatCode: '#,##0" Mbit/s"',
      catAxisLabelColor: TXT, catAxisLabelFontFace: BODY, catAxisLabelFontSize: 11.5,
      valAxisLabelColor: MUTED, valAxisLabelFontFace: MONO, valAxisLabelFontSize: 9,
      valAxisMaxVal: 12500,
      valGridLine: { color: "1C2749", size: 0.5 },
      catGridLine: { style: "none" },
      valAxisLineColor: "26335C", catAxisLineColor: "26335C",
      plotArea: { fill: { color: BG } }, chartArea: { fill: { color: BG } }
    }
  );

  const px = M + 7.7 + 0.4, pw = W - M - px;
  card(s, px, 2.15, pw, 2.35);
  s.addText("FREQUENZEN UND BANDBREITE", {
    x: px + 0.28, y: 2.36, w: pw - 0.56, h: 0.24, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 8.5, color: CYAN, charSpacing: 1
  });
  [
    ["Wellenlängen", "850 · 1310 · 1490 · 1550 · 1577 nm"],
    ["Frequenz", "rund 190 bis 230 THz, also Infrarot"],
    ["Nutzbare Bandbreite", "O- bis L-Band, zusammen etwa 50 THz"],
    ["Je Wellenlänge", "10 Gbit/s im PON, 400–800 Gbit/s kohärent"],
    ["Latenz", "1 bis 5 ms im Zugangsnetz"]
  ].forEach((r, i) => {
    s.addText(
      [
        { text: r[0], options: { color: MUTED, fontFace: MONO, fontSize: 8.5, breakLine: true } },
        { text: r[1], options: { color: TXT, fontSize: 10.5 } }
      ],
      {
        x: px + 0.28, y: 2.66 + i * 0.36, w: pw - 0.56, h: 0.34, isTextBox: true, margin: 0,
        fontFace: BODY, lineSpacingMultiple: 1.0
      }
    );
  });

  card(s, px, 4.68, pw, 1.82, { fill: CARD_HI });
  s.addText("Warum Glasfaser vorn liegt", {
    x: px + 0.28, y: 4.88, w: pw - 0.56, h: 0.28, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 13, bold: true, color: CYAN
  });
  s.addText(
    "Kupfer und Funk teilen sich ein schmales Band, das mit der Entfernung schnell schlechter wird. " +
    "Im Glas stehen rund 50 THz zur Verfügung, und 20 km gehen ohne Verstärker. " +
    "Ein Upgrade von 1 auf 10 Gbit/s bedeutet deshalb nur neue Endgeräte — die Faser im Boden bleibt dieselbe.",
    {
      x: px + 0.28, y: 5.2, w: pw - 0.56, h: 1.16, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 10.5, color: "C9D4E8", lineSpacingMultiple: 1.12
    }
  );

  s.addNotes(
    "Der zentrale Vergleich. Wichtigster Punkt: Nur Glasfaser und Richtfunk sind symmetrisch. " +
    "Kabel liefert zwar 1 Gbit/s im Download, aber nur 50 Mbit/s zurück — für ein Testzentrum mit Backups " +
    "und Videokonferenzen ist genau das der Engpass. Die Skala ist linear, deshalb sieht man sofort, " +
    "wie weit Glasfaser vorn liegt."
  );
}

/* ═══════ 7 · Vor- und Nachteile (Anforderung 5, Teil 2) ═══════ */
{
  const s = slide();
  head(s, "06", "Vor- und Nachteile",
    "Technisch ist Glasfaser allen Alternativen überlegen. Der Engpass ist nicht die Technik, sondern der Bau.");

  const cw = (W - 2 * M - 0.4) / 2;

  card(s, M, 2.12, cw, 2.90);
  s.addText("VORTEILE", {
    x: M + 0.3, y: 2.32, w: cw - 0.6, h: 0.26, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 9, color: MINT, charSpacing: 1.5
  });
  [
    ["Symmetrische Gigabit-Raten", "später per Gerätetausch aufrüstbar, Faser bleibt liegen"],
    ["Geringe Dämpfung", "große Reichweite ohne Verstärker, bis 20 km im PON"],
    ["Immun gegen Störungen", "keine EMV-Probleme, kein Übersprechen, kein Blitzweg"],
    ["Passiv und langlebig", "wenig Strom im Netz, Lebensdauer über 30 Jahre"]
  ].forEach((r, i) => iconRow(s, M + 0.3, 2.66 + i * 0.55, cw - 0.6, MINT, "✓", r[0], r[1], { d: 0.24, ts: 12, bs: 10, h: 0.52 }));

  card(s, M + cw + 0.4, 2.12, cw, 2.90);
  s.addText("NACHTEILE", {
    x: M + cw + 0.7, y: 2.32, w: cw - 0.6, h: 0.26, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 9, color: CORAL, charSpacing: 1.5
  });
  [
    ["Tiefbau ist teuer und langsam", "die Verfügbarkeit hängt an der einzelnen Adresse"],
    ["Lange Wartezeit", "bis zum Hausanschluss oft mehrere Monate"],
    ["Empfindliches Medium", "Biegeradius, Staub am Stecker, Spleißen braucht Spezialgerät"],
    ["ONT braucht Strom", "ohne USV bei Stromausfall kein Anschluss"]
  ].forEach((r, i) => iconRow(s, M + cw + 0.7, 2.66 + i * 0.55, cw - 0.6, CORAL, "✕", r[0], r[1], { d: 0.24, ts: 12, bs: 10, h: 0.52 }));

  card(s, M, 5.18, W - 2 * M, 1.5, { fill: CARD_HI });
  s.addText("Einordnung für Teach:In", {
    x: M + 0.35, y: 5.38, w: W - 2 * M - 0.7, h: 0.28, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 14, bold: true, color: CYAN
  });
  s.addText(
    "Ein Schulungs- und Testzentrum lädt große VM-Images, spielt Backups zurück und hält Videokonferenzen. " +
    "Genau dort zählt der Upload, und da hängt Glasfaser alle anderen Anschlussarten ab. " +
    "Das Risiko liegt nicht in der Technik, sondern im Termin: Wenn am Standort noch kein Glas liegt, entscheidet die " +
    "Ausbauplanung. Ein Kabel- oder 5G-Anschluss als Rückfallebene ist deshalb sinnvoll.",
    {
      x: M + 0.35, y: 5.70, w: W - 2 * M - 0.7, h: 0.82, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 11.5, color: "C9D4E8", lineSpacingMultiple: 1.12
    }
  );

  s.addNotes(
    "Bewertung. Ehrlich bleiben: Die Nachteile sind real, aber fast alle organisatorisch, nicht technisch. " +
    "Der Punkt, den die Klasse mitnehmen soll: Der Upload entscheidet für ein Testzentrum, " +
    "und die Rückfallebene über Kabel oder 5G gehört in die Planung."
  );
}

/* ═══════ 8 · Verfügbarkeit (Anforderung 6) ═══════ */
{
  const s = slide();
  head(s, "07", "Wo liegt schon Glas?",
    "Deutschland holt schnell auf, Berlin liegt über dem Bundesschnitt. Entscheidend bleibt aber die einzelne Adresse.");

  const sw = (W - 2 * M - 3 * 0.3) / 4;
  [
    ["62 %", "der Haushalte in Deutschland erschlossen, Homes Passed im Juni 2026", CYAN],
    ["27 %", "davon tatsächlich gebucht — 7,9 Mio. aktive Anschlüsse", MAGENTA],
    ["53,4 %", "der Berliner Haushalte versorgt, plus 12,6 Punkte in einem Jahr", MINT],
    ["96,2 %", "Gigabit-Abdeckung in Berlin, überwiegend noch über Kabel", AMBER]
  ].forEach((it, i) => {
    const x = M + i * (sw + 0.3);
    card(s, x, 2.12, sw, 1.6);
    s.addText(it[0], {
      x: x + 0.26, y: 2.3, w: sw - 0.52, h: 0.55, isTextBox: true, margin: 0,
      fontFace: MONO, fontSize: 28, bold: true, color: it[2]
    });
    s.addText(it[1], {
      x: x + 0.26, y: 2.86, w: sw - 0.52, h: 0.75, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.08
    });
  });

  const cw = (W - 2 * M - 0.4) / 2;

  card(s, M, 3.95, cw, 2.6);
  s.addText("Berlin", {
    x: M + 0.32, y: 4.16, w: cw - 0.64, h: 0.3, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 15, bold: true, color: TXT
  });
  s.addText(
    "Die Innenstadtbezirke sind gut versorgt, die Randbezirke im Ausbau. Die Telekom hat im Mai 2026 " +
    "eine Million Anschlüsse erreicht und will bis 2030 auf zwei Millionen kommen. Daneben bauen OXG, " +
    "GlasfaserPlus und DNS:NET.\n\n" +
    "In derselben Straße kann ein Haus FTTH haben und das Nachbarhaus nicht.",
    {
      x: M + 0.32, y: 4.5, w: cw - 0.64, h: 1.85, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 11.5, color: MUTED, lineSpacingMultiple: 1.14
    }
  );

  card(s, M + cw + 0.4, 3.95, cw, 2.6, { fill: CARD_HI });
  s.addText("Beim Kunden Teach:In prüfen", {
    x: M + cw + 0.72, y: 4.16, w: cw - 0.64, h: 0.3, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 15, bold: true, color: CYAN
  });
  [
    "Adresse im Gigabit-Grundbuch des Bundes und bei Telekom, Vodafone und DNS:NET abfragen.",
    "Hausverwaltung fragen, ob im Keller schon ein Gf-AP sitzt.",
    "Ohne FTTH: Geschäftskunden bekommen meist eine Direktanbindung gegen Baukostenzuschuss."
  ].forEach((t, i) => {
    const y = 4.56 + i * 0.62;
    stepDot(s, M + cw + 0.72, y, 0.3, CYAN, String(i + 1));
    s.addText(t, {
      x: M + cw + 1.14, y: y - 0.02, w: cw - 1.1, h: 0.56, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 11, color: "C9D4E8", lineSpacingMultiple: 1.1
    });
  });

  s.addNotes(
    "Verfügbarkeit. Die spannende Zahl ist die Lücke zwischen 62 Prozent erschlossen und 27 Prozent gebucht — " +
    "es liegt viel mehr Glas, als genutzt wird. Für Teach:In ist nur die konkrete Adresse relevant, " +
    "deshalb die drei Prüfschritte rechts."
  );
}

/* ═══════ 9 · Kosten (Anforderung 7) ═══════ */
{
  const s = slide();
  head(s, "08", "Was kostet der Anschluss?",
    "Richtwerte vom September 2026. Aktionspreise für die ersten Monate sind nicht eingerechnet.");

  const cw = (W - 2 * M - 2 * 0.32) / 3;
  const prices = [
    ["Privat / SoHo", "46–71 €", "pro Monat", TXT, false,
      ["Glasfaser 150 für 45,95 €", "Glasfaser 300 für 50,95 €", "Glasfaser 1000 für 70,95 €", "Bereitstellung einmalig 69,95 €"]],
    ["Business, feste IP", "50–120 €", "pro Monat netto", CYAN, true,
      ["300 bis 1000 Mbit/s, symmetrisch möglich", "Feste IPv4, Entstörung am Folgetag", "Passend für Schulungsräume und Testlabor"]],
    ["Standleitung mit SLA", "ab 300 €", "pro Monat, oft vierstellig", MAGENTA, false,
      ["Garantierte 1 bis 10 Gbit/s", "Entstörung in 4 bis 8 Stunden", "Zusätzlich Baukostenzuschuss"]]
  ];

  prices.forEach((p, i) => {
    const x = M + i * (cw + 0.32);
    card(s, x, 2.12, cw, 2.72, p[4] ? { fill: CARD_HI } : {});
    s.addShape(S.roundRect, {
      x: x + 0.3, y: 2.34, w: 2.2, h: 0.3, rectRadius: 0.15,
      fill: { type: "none" }, line: { color: p[4] ? CYAN : "3A4A78", width: 0.75 }
    });
    s.addText(p[0], {
      x: x + 0.3, y: 2.34, w: 2.2, h: 0.3, isTextBox: true, margin: 0,
      align: "center", valign: "middle", fontFace: MONO, fontSize: 8.5, color: p[4] ? CYAN : MUTED
    });
    s.addText(p[1], {
      x: x + 0.3, y: 2.76, w: cw - 0.6, h: 0.5, isTextBox: true, margin: 0,
      fontFace: MONO, fontSize: 26, bold: true, color: p[3]
    });
    s.addText(p[2], {
      x: x + 0.3, y: 3.26, w: cw - 0.6, h: 0.24, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 10, color: MUTED
    });
    s.addText(p[5].map((t, j) => ({
      text: t,
      options: { bullet: true, breakLine: j < p[5].length - 1 }
    })), {
      x: x + 0.3, y: 3.58, w: cw - 0.6, h: 1.1, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 10.5, color: MUTED, paraSpaceAfter: 5
    });
  });

  card(s, M, 5.04, W - 2 * M, 1.5);
  s.addText("Einmalig: der Hausanschluss", {
    x: M + 0.35, y: 5.22, w: 5, h: 0.28, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 14, bold: true, color: TXT
  });
  const hw = (W - 2 * M - 0.7 - 2 * 0.4) / 3;
  [
    ["0 €", "während Vorvermarktung und Nachfragebündelung — fast alle Anbieter übernehmen den Tiefbau", MINT],
    ["800–2 500 €", "nachträglich, wenn die Straße schon fertig ist: Grabung, Hauseinführung, Gf-AP", CORAL],
    ["Empfehlung", "Ausbauphase für die Teach:In-Adresse verfolgen und im richtigen Zeitfenster bestellen", CYAN]
  ].forEach((it, i) => {
    const x = M + 0.35 + i * (hw + 0.4);
    s.addText(it[0], {
      x, y: 5.56, w: hw, h: 0.34, isTextBox: true, margin: 0,
      fontFace: MONO, fontSize: 17, bold: true, color: it[2]
    });
    s.addText(it[1], {
      x, y: 5.92, w: hw, h: 0.52, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 9.5, color: MUTED, lineSpacingMultiple: 1.06
    });
  });

  s.addNotes(
    "Kosten. Der wichtigste Satz steht unten links: Wer während der Vorvermarktung bestellt, zahlt für den " +
    "Hausanschluss nichts. Wer zu spät kommt, zahlt bis zu 2 500 Euro. Für Teach:In heißt das: Ausbauphase " +
    "beobachten und im richtigen Fenster unterschreiben. Der mittlere Tarif ist der realistische für das Zentrum."
  );
}

/* ═══════ 10 · Quiz fürs Plenum ═══════ */
{
  const s = slide();
  head(s, "09", "Quiz fürs Plenum", "Fünf Fragen zum Mitdenken. Auflösung im Gespräch.");

  const qs = [
    ["Warum bleibt das Licht im Kern der Faser?",
      ["Der Mantel ist verspiegelt", "Totalreflexion an der Grenze Kern zu Mantel", "Der Kern ist ein Vakuum"]],
    ["Was unterscheidet FTTH von FTTC?",
      ["FTTH nutzt Multimode-Fasern", "Bei FTTH endet das Glas im Büro, bei FTTC am Kabelverzweiger", "FTTC ist schneller"]],
    ["Wie viele Teilnehmer teilen sich im PON eine Faser?",
      ["2 bis 4", "32 bis 128", "genau einer"]],
    ["Welche Wellenlänge hat die geringste Dämpfung?",
      ["850 nm", "1310 nm", "1550 nm"]],
    ["Was ist der größte praktische Nachteil?",
      ["Hohe Latenz", "Störanfälligkeit gegen Elektromagnetik", "Teurer, langsamer Tiefbau"]]
  ];

  const cw = (W - 2 * M - 0.4) / 2;
  qs.forEach((q, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const x = M + col * (cw + 0.4);
    const y = 2.18 + row * 1.42;
    card(s, x, y, cw, 1.24);
    stepDot(s, x + 0.28, y + 0.24, 0.3, CYAN, String(i + 1));
    s.addText(q[0], {
      x: x + 0.7, y: y + 0.2, w: cw - 1.0, h: 0.38, isTextBox: true, margin: 0,
      fontFace: HEAD, fontSize: 12.5, bold: true, color: TXT, lineSpacingMultiple: 1.05
    });
    s.addText(q[1].map((a, j) => ({
      text: String.fromCharCode(97 + j) + ")  " + a,
      options: { breakLine: j < q[1].length - 1 }
    })), {
      x: x + 0.7, y: y + 0.62, w: cw - 1.0, h: 0.56, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.08
    });
  });

  card(s, M + cw + 0.4, 2.18 + 2 * 1.42, cw, 1.24, { fill: CARD_HI });
  s.addText("Auflösung", {
    x: M + cw + 0.72, y: 2.18 + 2 * 1.42 + 0.2, w: cw - 0.64, h: 0.28, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 13, bold: true, color: CYAN
  });
  s.addText("1 b   ·   2 b   ·   3 b   ·   4 c   ·   5 c", {
    x: M + cw + 0.72, y: 2.18 + 2 * 1.42 + 0.56, w: cw - 0.64, h: 0.32, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 14, bold: true, color: TXT, charSpacing: 1
  });
  s.addText("Diese Karte beim Präsentieren erst am Ende zeigen.", {
    x: M + cw + 0.72, y: 2.18 + 2 * 1.42 + 0.94, w: cw - 0.64, h: 0.24, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 9.5, color: MUTED
  });

  s.addNotes(
    "Quiz für das Plenum. Fragen einzeln vorlesen, kurz abstimmen lassen, dann auflösen. " +
    "Die Auflösung steht unten rechts: 1b, 2b, 3b, 4c, 5c."
  );
}

/* ═══════ 11+12 · Glossar (Anforderung 8) ═══════ */
{
  const GLOSSAR = [
    ["LWL", "Lichtwellenleiter — Glasfaserkabel, in dem Licht statt Strom das Signal trägt."],
    ["FTTH", "Fiber to the Home — die Glasfaser endet in der Wohnung oder im Büro."],
    ["FTTB / FTTC", "Glas endet im Keller beziehungsweise am Kabelverzweiger, Rest über Kupfer."],
    ["ONT", "Optical Network Termination — das Glasfaser-Modem beim Kunden."],
    ["OLT", "Optical Line Termination — Gegenstelle im PoP, bündelt viele hundert ONTs."],
    ["PON", "Passive Optical Network — eine Faser per Splitter auf 32 bis 128 Teilnehmer."],
    ["P2P / AON", "Punkt zu Punkt — eigene Faser je Kunde mit garantierter Bandbreite."],
    ["Splitter", "Passiver Glaskörper, teilt ein Signal ohne Strom auf mehrere Fasern."],
    ["Gf-AP / APL", "Glasfaser-Abschlusspunkt — die Übergabedose im Keller."],
    ["Singlemode", "9 µm Kern, nur ein Lichtweg, Reichweiten bis 80 km. Standard für FTTH."],
    ["Multimode", "50 µm Kern, viele Lichtwege, billigere Sender, nur bis etwa 550 m."],
    ["Totalreflexion", "Licht wird an der Grenze zum dünneren Mantel vollständig zurückgeworfen."],
    ["Brechzahl (n)", "Maß dafür, wie stark ein Material Licht bremst. Kern 1,48, Mantel 1,46."],
    ["Dämpfung", "Signalverlust in Dezibel pro Kilometer. Bei 1550 nm rund 0,2 dB/km."],
    ["nm / Wellenlänge", "Nanometer, das Farbmaß des Lichts. 1310 und 1550 nm liegen im Infrarot."],
    ["DWDM", "Dense Wavelength Division Multiplexing — bis 96 Wellenlängen auf einer Faser."],
    ["TDMA", "Time Division Multiple Access — jedes ONT bekommt feste Zeitschlitze."],
    ["NRZ / OOK", "On-Off-Keying: Licht an ist 1, Licht aus ist 0."],
    ["PAM4", "Vier Helligkeitsstufen, 2 Bit pro Symbol, doppelte Rate je Symbolrate."],
    ["XGS-PON", "PON-Generation mit symmetrisch 10 Gbit/s, löst GPON ab."],
    ["Symmetrisch", "Upload so schnell wie Download — der Vorteil gegenüber DSL und Kabel."],
    ["Latenz", "Signallaufzeit. Im Glas etwa 5 µs pro Kilometer, FTTH bei 1 bis 5 ms."],
    ["Spleißen", "Verschweißen zweier Fasern im Lichtbogen, Verlust unter 0,1 dB."],
    ["Homes Passed", "Adressen, an denen Glasfaser bis vor die Tür liegt, noch ohne Vertrag."],
    ["Take-up-Rate", "Anteil der erschlossenen Haushalte mit gebuchtem Vertrag, in DE rund 27 %."],
    ["BKZ", "Baukostenzuschuss — Beteiligung an den Tiefbaukosten außerhalb der Ausbauphase."]
  ];

  for (let part = 0; part < 2; part++) {
    const s = slide();
    head(s, "10", part === 0 ? "Glossar" : "Glossar (Fortsetzung)",
      part === 0 ? "Die Grundbegriffe, die in dieser Präsentation vorkommen." : null);

    const items = GLOSSAR.slice(part * 13, part * 13 + 13);
    const cw = (W - 2 * M - 0.35) / 2;
    const y0 = part === 0 ? 2.05 : 1.62;

    items.forEach((g, i) => {
      const col = i < 7 ? 0 : 1;
      const row = i < 7 ? i : i - 7;
      const x = M + col * (cw + 0.35);
      const y = y0 + row * 0.7;
      s.addText(g[0], {
        x, y, w: cw, h: 0.24, isTextBox: true, margin: 0,
        fontFace: MONO, fontSize: 11, bold: true, color: CYAN
      });
      s.addText(g[1], {
        x, y: y + 0.24, w: cw, h: 0.42, isTextBox: true, margin: 0,
        fontFace: BODY, fontSize: 10.5, color: MUTED, lineSpacingMultiple: 1.06
      });
    });

    s.addNotes(part === 0
      ? "Glossar Teil 1. Nicht vorlesen — als Nachschlagefolie für Rückfragen und zum Ausdrucken gedacht."
      : "Glossar Teil 2. Ebenfalls Nachschlagefolie.");
  }
}

/* ═══════ 13 · Quellen (Anforderung 9) ═══════ */
{
  const s = slide();
  head(s, "11", "Quellen", "Stand aller Zahlen: 15. September 2026.");

  const src = [
    ["BREKO Bundesverband Breitbandkommunikation", "BREKO Marktanalyse 2026, 02.09.2026 · brekoverband.de"],
    ["Senatsverwaltung für Wirtschaft, Energie und Betriebe Berlin", "Gigabit-Strategie: 53,4 % der Haushalte versorgt, PM 04.03.2026 · berlin.de"],
    ["Deutsche Telekom AG", "Telekom knackt 1-Million-Marke beim Glasfaserausbau in Berlin, Mai 2026 · telekom.com"],
    ["dslweb.de", "Telekom Glasfaser Tarife im Vergleich, abgerufen 15.09.2026"],
    ["kostenlupe.de", "Glasfaseranschluss Kosten 2026: Hausanschluss, Tarife, Mieter, abgerufen 15.09.2026"],
    ["ITU-T", "G.984 (GPON), G.9807.1 (XGS-PON), G.9804 (50G-PON), G.652 (Singlemode) · itu.int"],
    ["BMDV / Gigabitbüro des Bundes", "Gigabit-Grundbuch und Breitbandatlas · gigabitgrundbuch.bund.de"],
    ["FTTH Council Europe", "Market Panorama 2026 · ftthcouncil.eu"],
    ["Elektronik-Kompendium", "Lichtwellenleiter, Glasfaser, FTTx · elektronik-kompendium.de"]
  ];

  const cw = (W - 2 * M - 0.4) / 2;
  src.forEach((q, i) => {
    const col = i < 5 ? 0 : 1;
    const row = i < 5 ? i : i - 5;
    const x = M + col * (cw + 0.4);
    const y = 2.05 + row * 0.78;
    s.addText(String(i + 1).padStart(2, "0"), {
      x, y, w: 0.4, h: 0.24, isTextBox: true, margin: 0,
      fontFace: MONO, fontSize: 10, bold: true, color: CYAN
    });
    s.addText(q[0], {
      x: x + 0.45, y, w: cw - 0.45, h: 0.26, isTextBox: true, margin: 0,
      fontFace: HEAD, fontSize: 11.5, bold: true, color: TXT
    });
    s.addText(q[1], {
      x: x + 0.45, y: y + 0.26, w: cw - 0.45, h: 0.44, isTextBox: true, margin: 0,
      fontFace: BODY, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.06
    });
  });

  card(s, M + cw + 0.4, 2.05 + 4 * 0.78, cw, 1.0, { fill: CARD_HI });
  s.addText("Interaktive Fassung", {
    x: M + cw + 0.72, y: 2.05 + 4 * 0.78 + 0.16, w: cw - 0.64, h: 0.26, isTextBox: true, margin: 0,
    fontFace: HEAD, fontSize: 12, bold: true, color: CYAN
  });
  s.addText("Begehbarer 3D-Netzraum mit Klickpunkten, Download-Rechner und Glossar-Suche als eigenständige HTML-Datei.", {
    x: M + cw + 0.72, y: 2.05 + 4 * 0.78 + 0.44, w: cw - 0.64, h: 0.48, isTextBox: true, margin: 0,
    fontFace: BODY, fontSize: 10, color: MUTED, lineSpacingMultiple: 1.06
  });

  s.addText("Erstellt für das Modul WAN-Anbindung Teach:In · Anschlussart LWL / Glasfaser", {
    x: M, y: H - 0.62, w: W - 2 * M, h: 0.3, isTextBox: true, margin: 0,
    fontFace: MONO, fontSize: 9, color: "6A7799"
  });

  s.addNotes("Quellen. Kurz zeigen, nicht vorlesen. Bei Rückfragen zu Zahlen auf diese Folie zurückspringen.");
}

pres.writeFile({ fileName: "Glasfaser-Teach-In.pptx" })
  .then(f => console.log("geschrieben:", f));
