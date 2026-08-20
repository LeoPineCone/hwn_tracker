# Harzer Wandernadel App — Design Spec

Basis: **Organic** design system (`_ds/organic/styles.css`). Alle Werte unten sind Tokens aus diesem System — bei Implementierung immer `var(--*)` verwenden, keine Hex-/px-Werte hart codieren.

## Farben

| Rolle | Token | Wert |
|---|---|---|
| Hintergrund | `--color-bg` | `#f5ead8` |
| Fläche/Card | `--color-surface` | `#ebddc5` |
| Text | `--color-text` | `#201e1d` |
| Akzent (Terrakotta) | `--color-accent` | `#c67139` |
| Akzent 2 (Salbei) | `--color-accent-2` | `#7a8a5e` |
| Trennlinie | `--color-divider` | `color-mix(text 16%, transparent)` |

Jede Rolle hat eine 100–900-Tonwertskala (`--color-neutral-*`, `--color-accent-*`, `--color-accent-2-*`). Konvention in der App:
- **Akzent (Terrakotta)** = "offen"/aktiv/Handlungsaufforderung — offene Stempelstellen, Filter "offen", Primärbuttons.
- **Akzent 2 (Salbei)** = "besucht/erreicht" — gestempelte Stellen, abgeschlossene Nadel-Kollektionen, Wanderweg-Bezug.
- Helle Stufen (100–200) für Tint-Flächen/Badges, 700–900 für Text auf Tint-Flächen.

## Typografie

- **Headings**: `--font-heading` (Caprasimo) — Nadel-Namen, Screen-Titel, Sheet-Überschriften. Nie für Fließtext.
- **Body**: `--font-body` (Figtree) — alle UI-Labels, Beschreibungen, Badges.
- Größen aus der App: 24px (Sheet-Titel), 20px (Profilname), 18px (Card-Titel), 14–15.5px (Body/Beschreibung), 11–13px (Labels, Meta, Badges).
- Section-Kicker: 11px, 600, `letter-spacing: .12em`, `text-transform: uppercase`, `--color-neutral-600`.

## Radius & Elevation

- `--radius-lg` (28px): große Sheets/Container.
- `--radius-md` (16px): Cards, Listenzeilen, Buttons in Listen.
- Pill (`999px`): Buttons, Filter-Chips, Tab-Badges, Stempel-Icons.
- Schatten: `--shadow-sm` für Listenkarten, `--shadow-md` für Icon-Kreise/Coins, `--shadow-lg` für Bottom-Sheets.

## Layout-Grundmuster

- **Bottom Sheet**: `position:absolute;inset:0` Backdrop `rgba(32,30,29,.42–.5)`, Panel `border-radius: var(--radius-lg) var(--radius-lg) 0 0`, Drag-Handle 44×4px pill `--color-neutral-400`, `animation: popIn .22s ease-out`.
- **Tab-Bar**: 3 Tabs (Karte, Erfolge, Profil), Icons aus eigenem Lucide-artigem Pfad-Set (Stroke-Width 2.75, siehe `ICONS`-Konstante).
- **Filter-Chips**: pill, aktiv = `--color-accent-2-800`/Tint, inaktiv = `--color-neutral-100` + `--color-divider`-Border.
- **Stempel-Marker** (Karte & Grid): Kreis mit einer abgeschnittenen Ecke (Pin-Form, `rotate(-45deg)`, eine Ecke `border-radius:4px`) — besucht = gefüllt in Ink-Farbe, offen = gestrichelter Outline-Kreis.
- **Kollektions-/Nadel-Cards**: Icon-Kreis (36px) mit Ring in Metallfarbe, Titel + Meta links, Status-Badge rechts.

## Domänen-Konzepte

- **Stempelstellen** (`stations()`): `visited` (gestempelt) vs. `isOpen` (offen) — nie "erledigt/fehlt".
- **Kollektionen** (früher "Nadeln"): Bronze/Silber/Gold/Wanderkönig/Wanderkaiser, Fortschritt als `have/req` + Balken in Metallfarbe. Status-Text bei Erreichen: **„ziel erreicht"** (nicht "verliehen"). CTA im Detail-Sheet ist immer eine Kartenverknüpfung: erreicht → „Besuchte Stempel dieser Kollektion" (öffnet Karte, gefiltert auf die zugehörigen besuchten Stempel), offen → „Fehlende Stempel auf der Karte".
- **Themen-Collections** (Harzer Hexenstieg, Brocken-Runde, …): fester Filter-Chip-Satz, exklusiv wählbar, badge mit Clear-Button oben auf der Karte.
- Beschreibungstexte (Nadel-Detail) bekommen immer eine eigene Fläche (`--color-surface`, `--radius-md`, `padding: 18px`), nicht nackter Fließtext — Lesbarkeit priorisieren, Schriftgröße mind. 15px.

## Sprache/Ton

- Deutsch, direkt, wanderfreundlich-warm. Keine Anglizismen wo ein deutsches Wort passt. Zahlenformate mit Komma (`2,4 km`).
- Statuslabels kurz und aktiv formuliert: „Noch 4 Stempel", „Ziel erreicht am …", „X von Y".

## Icons

Lucide-Stil, Stroke-Width **2.75**, `stroke-linecap: round`. Keine gefüllten Icons außer auf farbigen Kreisflächen (weißer Fill für Kontrast).

## No-Gos

- Keine scharfen Ecken, keine Sättigungsreduktion ins Grau.
- Keine zweite Display-Schrift neben Caprasimo.
- Keine Browser-Default-Fokusringe (immer `--color-accent`-Outline).
- Keine hartcodierten Farben/Radien — immer Tokens.
