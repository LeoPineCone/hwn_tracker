# HWN Tracker — Domain Data Model

This document specifies the domain entities behind the Karte (map) and Erfolge (achievements) screens — starting with **Station**, and continuing in later work with **Collection** and the completion rules that turn a hiker's visited stations into badge progress. It is a spec, not an implementation: by design it contains no TypeScript, only plain-word field tables a future implementation should be built against. Source material lives in [`app/design/Harzer Wandernadel.dc.html`](design/Harzer%20Wandernadel.dc.html) (the interactive prototype, including its embedded demo data), [`app/design/stand_alone_app.html`](design/stand_alone_app.html) (the self-contained build), and [`app/design/screenshots/`](design/screenshots/) (static mockups). If a value here and one of those source files ever disagree, the source file wins — update this doc to match.

**Status:** the app is at scaffold stage. [`app/src/models/`](src/models/) currently contains only a backend health-check type (`HealthStatus.ts`) — nothing described in this document is implemented yet. This document defines shapes that future Karte and Erfolge work should build against, not existing code.

---

## Conventions

Every field-table row below carries exactly one confidence marker:

- **Confirmed** — the field exists in the prototype's data and this document reproduces its meaning. The prototype line is cited.
- **Assumed** — the field does not exist in the prototype, but the real Harzer Wandernadel programme or the mockups imply it is needed. The reason is stated. Treat this as a proposal, not a fact.
- **Missing** — the field is required for the MVP to function and is genuinely absent from all source material. Nobody has this data yet; sourcing it is separate work.

**Naming.** Field names in this document are written in `lowerCamelCase` English, even where the prototype used a German or abbreviated name (e.g. `nr`, `alt`, `vis`). Where a name was changed, the prototype's original is given alongside it in the field table. Rationale: the prototype's tuple positions are terse hand-written demo data; a spec should not inherit that terseness, but a reader tracing a field back to the prototype needs the old name to find it.

---

## Station

A **Stempelstelle** (German for "stamp station") is one physical location in the Harz holding a stamp box; the hiker walks there and stamps their book. In the prototype, stations are the tuples in the `S` array (`app/design/Harzer Wandernadel.dc.html:648`), turned into objects by the `stations()` method (`:747`–`752`).

| Field | Type | Confidence | Notes |
|---|---|---|---|
| `number` (prototype `nr`) | integer | **Confirmed** | The official HWN station number; this is the entity's identity field (line 649). It is **not** a dense sequence — the prototype's 36 demo rows carry numbers like 1, 2, 6, 9, 11, 14 … 101, not 1–36 — so code must never treat a station number as an array index. `ARCHITECTURE.md` notes special stations exist alongside numbered ones in the real programme, so a station number may not always be a plain integer in a fixed range; see "Retired and special stations" below. |
| `name` | text | **Confirmed** | E.g. "Kloster Walkenried" (line 649), "Brocken" (line 657). |
| `place` | text | **Confirmed** | The nearest town or trailhead, e.g. "Schierke" (line 657). Used in the detail sheet as "{place}, {region}" (line 977) and, confusingly, relabelled `region` in the Erfolge "recent stamps" list (line 888) — that second usage is a prototype naming quirk, not a second field. |
| `region` | text | **Confirmed** | One of seven values found in the prototype: Nordharz, Ostharz, Südharz, Westharz, Hochharz, Mittelharz, Vorharz. This is the set the prototype happens to use, not a closed enumeration the model depends on. `region` is **display data only** — it appears in the detail sheet as "{place}, {region}" (line 977) and nothing else reads it; there are no region-based completion rules anywhere in the model (covered fully in the later Completion Rules section). |
| `altitude` (prototype `alt`) | integer, metres above sea level | **Confirmed** | Shown on the station detail sheet (line 977, `selAlt`). E.g. Brocken is 1141 (line 657). |
| `visited` (prototype `vis`) | boolean | **Confirmed** | True when the hiker has stamped this station. The prototype's `isOpen` is *derived* (`isOpen = !visited`, line 748) and must **not** be stored as a second independent field — two independent booleans could contradict each other. This is hiker state, not station reference data (see "Which data is shipped, which is the hiker's" below). Visited/open is the complete state space today; see the retirement note below for the one known reason that will change. |
| `stampedOn` (prototype `date`) | date | **Confirmed** as a concept, with caveats | The prototype's value is fabricated — it cycles a fixed `DATES` list and appends the literal `'25'` (line 750), formatted `DD.MM.YY`, empty string when not visited, and carries no time-of-day (the detail sheet's "· 08:42" is hardcoded UI copy, not data — line 979). Recommend an absent/null value rather than an empty string when not visited. Display formatting (German `DD.MM.YY`) is a presentation concern, not part of the stored shape. |
| `latitude`, `longitude` | decimal numbers | **Missing** | The single most important row in this table. The prototype's `x` and `y` fields are percentage offsets (roughly 10–95) for positioning a pin on a decorative fake map (line 649 onward), **not** geographic coordinates — Brocken carries `x=48, y=34` (line 657) while its true position is about 51.80°N, 10.62°E. Real coordinates for all stations are required before the Karte screen can do anything real, and nothing in this repository has them yet. |

### Not part of the model

The prototype attaches a few presentation-only values to stations that this document deliberately does not carry forward as data fields:

- `short` — the name truncated at 15 characters (line 749). This is a rendering concern for narrow layouts, not stored data.
- `rot` — a pseudo-random rotation used to make stamp markers look hand-pressed (line 751). Purely cosmetic.
- `x`, `y` — fake-map placement percentages, already covered under `latitude`/`longitude` above.

See [`app/DESIGN.md`](DESIGN.md) for how stamp markers are actually rendered.

### Retired and special stations — known, deferred

1. Retired stations are **real**: the Harzer Wandernadel programme retires stations over time, and `ARCHITECTURE.md` already notes that special stations and retired/inactive ones exist alongside the ~222 numbered ones in the real programme.
2. They are **not modelled here**. This is a deliberate deferral agreed with the domain owner for later work — not an oversight and not an open question awaiting an answer. Today a station is visited or open, full stop.
3. The consequence, named in advance: because every total is counted from loaded data rather than stored (explained fully in the Collection section that follows), removing a retired station from the all-stations collection shrinks the target of every all-members completion rule, whereas keeping it with a retired flag does not. This decides whether a hiker who already earned the top badge keeps it after a station retires — a product question deliberately deferred, not guessed at.

### Which data is shipped, which is the hiker's

This distinction is an inference of this document, not a prototype fact — the prototype conflates them into one object. `number`, `name`, `place`, `region`, `altitude`, and (once sourced) `latitude`/`longitude` are official reference data, identical for every user, shipped inside the app build (per the offline-first invariant — see `ARCHITECTURE.md`). Whether a station is `visited` and its `stampedOn` value is personal progress, created on the device — the kind of thing a future cross-device transfer feature would need to move. The on-device storage decision (open in `ARCHITECTURE.md`) applies differently to these two categories.

### Evidence: representative prototype rows

Verbatim from the prototype's `S` array (`app/design/Harzer Wandernadel.dc.html:648`) — this is prototype demo data, not real/production data. Tuple schema: `[nr, name, place, region, alt, vis, x, y]`.

```
// line 649
[1,'Kloster Walkenried','Walkenried','Südharz',230,1,18,88],

// line 657
[22,'Brocken','Schierke','Hochharz',1141,1,48,34],

// line 652
[9,'Eichsfelder Warte','Barbis','Südharz',420,0,14,64],
```

The third row (`vis=0`) shows an open/unvisited station; note `x`/`y` are fake-map percentages, not the missing `latitude`/`longitude`.

---

The Collection and Completion Rules / badge-tier sections follow in later work.
