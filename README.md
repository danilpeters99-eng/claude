# Glasfaser für Teach:In

Interaktives Plakat zur WAN-Anschlussart **LWL / Glasfaser** für das
Schulungs- und Testzentrum Teach:In. Zwei Ansichten, alle Details auf Klick.

## Starten

**`index.html` ist eine einzige, vollständig eigenständige Datei.** CSS und
JavaScript (inklusive three.js und GSAP) sind direkt eingebettet. Ein
Doppelklick auf `index.html` genügt — unabhängig davon, ob nur diese eine
Datei kopiert, per Mail verschickt oder aus dem Repository heruntergeladen
wurde. Kein `css/`- oder `js/`-Ordner daneben nötig, kein lokaler Server.

Einzige Ausnahme: die Schriften werden von Google Fonts nachgeladen und
brauchen dafür eine Internetverbindung. Ohne Verbindung greift automatisch
ein Systemschrift-Fallback, die Seite bleibt voll funktionsfähig.

```
python3 -m http.server 8000     # optional, dann http://localhost:8000
```

## Aufbau

**Ansicht 1 — Strecke.** Eine 3D-Szene, in der die Kamera in einem dunklen
Netzraum steht und den Gang entlangfährt. Die Faser läuft an der rechten
Wand entlang, sechs beleuchtete Schränke stehen an beiden Seiten: Router
mit ONT, Gf-AP, Netzverteiler, Splitter, PoP mit OLT und Backbone. Jede
Station trägt einen Klickpunkt, der im Raum verankert ist und beim Scrollen
mitwandert. Rechts zeigt eine Stationsleiste die zurückgelegte Entfernung
von 0 m bis 20 km; ein Klick auf einen Eintrag springt zu dieser Station.

**Ansicht 2 — Plakat.** Zehn Kacheln zu Medium, FTTx-Varianten,
Funktionsweise, Kennzahlen, Vor- und Nachteilen, Verfügbarkeit, Kosten,
Download-Rechner, Quiz und Glossar. Jede Kachel öffnet ein Popup mit dem
vollständigen Inhalt. Die Quellen liegen als Leiste am unteren Rand.

## Steuerung

| Eingabe | Wirkung |
| --- | --- |
| Scrollen | Kamera fährt den ganzen Korridor ab, danach zur Plakatansicht |
| Klick auf die Stationsleiste | Direkt zu einer Station springen |
| Strecke / Plakat oben | Direkt zwischen den Ansichten springen |
| ← / → | Ansicht wechseln |
| Klick auf Punkt oder Kachel | Popup mit Details |
| Esc | Popup schließen |
| F | Vollbild |

## Dateien

- `index.html` — **ausgeliefertes Ergebnis.** Einzelne, eigenständige Datei
  mit eingebettetem CSS und JavaScript. Diese Datei weitergeben oder öffnen.
- `index.template.html` — bearbeitbare Quelle: Struktur beider Ansichten,
  alle Popup-Inhalte als `<template>`, verweist noch auf externe `css/`- und
  `js/`-Dateien. Hier Änderungen an Text und Struktur vornehmen.
- `css/style.css` — Design-System, ein dunkles Theme (Quelle)
- `js/main.js` — 3D-Raum, Projektion der Klickpunkte, Popups, Widgets (Quelle)
- `js/vendor/` — three.js r158 und GSAP 3.12.5, lokal eingebunden (Quelle)
- `build.py` — bettet CSS und JavaScript aus den Quelldateien in
  `index.template.html` ein und schreibt das Ergebnis nach `index.html`.
  **Nach jeder Änderung an `index.template.html`, `css/style.css` oder
  `js/main.js` erneut ausführen:** `python3 build.py`
- `artifact-page.html` — aus `index.template.html` erzeugte Fassung ohne
  Dokumentrahmen für die gehostete Version. Nicht direkt öffnen.

Stand der Zahlen: 15.09.2026. Belege stehen im Popup "Quellen & Stand".
