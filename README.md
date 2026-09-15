# Glasfaser für Teach:In

Interaktives Plakat zur WAN-Anschlussart **LWL / Glasfaser** für das
Schulungs- und Testzentrum Teach:In. Zwei Ansichten, alle Details auf Klick.

## Starten

Die Seite ist statisch. `index.html` im Browser öffnen genügt, die
Bibliotheken liegen lokal bei. Für die Web-Schriften wird eine
Internetverbindung gebraucht, sonst greift ein Fallback.

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

- `index.html` — Struktur beider Ansichten, alle Popup-Inhalte als `<template>`
- `css/style.css` — Design-System, ein dunkles Theme
- `js/main.js` — 3D-Raum, Projektion der Klickpunkte, Popups, Widgets
- `js/vendor/` — three.js r158 und GSAP 3.12.5, lokal eingebunden
- `artifact-page.html` — aus `index.html` erzeugte Fassung ohne Dokumentrahmen
  für die gehostete Version. Nicht direkt öffnen.

Stand der Zahlen: 15.09.2026. Belege stehen im Popup "Quellen & Stand".
