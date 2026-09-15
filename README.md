# Glasfaser · Lichtgeschwindigkeit

Interaktive Scroll-Präsentation zur WAN-Anschlussart **LWL / Glasfaser** für das
Schulungs- und Testzentrum Teach:In.

## Starten

Die Seite ist statisch – einfach `index.html` im Browser öffnen. Für die
Web-Schriften wird eine Internetverbindung benötigt; ohne sie greift ein
Fallback-Schriftsatz.

```
python3 -m http.server 8000     # optional, dann http://localhost:8000
```

## Steuerung während der Präsentation

| Taste / Geste | Wirkung |
| --- | --- |
| Scrollen | Treibt alle Animationen an |
| ← / → | Ein Kapitel zurück / vor |
| F | Vollbild an/aus |
| Klick auf markierte Begriffe | Glossar-Popup |

## Aufbau

- `index.html` – Inhalt und Struktur aller Kapitel
- `css/style.css` – Design-System (dunkle Neon-Palette, ein Theme)
- `js/main.js` – 3D-Szene, Scroll-Choreografie, Querschnitt, Rechner, Quiz
- `js/vendor/` – three.js r158 und GSAP 3.12.5 mit ScrollTrigger (lokal eingebunden)

## Inhaltliche Kapitel

1. Übertragungsstrecke (Schaubild mit Erläuterung)
2. Medium und seine Eigenschaften (Querschnitt, Singlemode/Multimode)
3. Varianten: FTTC / FTTdp / FTTB / FTTH, PON vs. P2P
4. Funktionsweise: Totalreflexion, Sender/Empfänger, Modulationsverfahren
5. Datenraten, Frequenzen, Bandbreiten, Vor- und Nachteile
6. Download-Rechner im Vergleich der sechs Anschlussarten
7. Verfügbarkeit in Deutschland, Berlin und beim Kunden
8. Kosten
9. Quiz fürs Plenum
10. Glossar
11. Quellen

Stand der Zahlen: 15.09.2026. Quellen stehen am Fuß der Seite.
