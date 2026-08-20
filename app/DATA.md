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

## Collection

**A naming note first, because it matters for everything below.** The prototype's UI uses the German word "Kollektion" for two lists that look different at first glance: themed trails offered as a filter on the Karte filter sheet (screenshot `screen_map_filter_v1.png`, headed "COLLECTION · NUR EINE" — "collection, choose only one"), and badge tiers shown on the Erfolge screen (screenshot `screen_rewards_v1.png`, headed "Kollektionen · 3 von 5" — "collections, 3 of 5"). This document treats these as **one entity** — Collection — rather than two. The only thing that actually distinguishes a themed collection (e.g. "Harzer Hexenstieg") from a badge tier (e.g. "Gold") is *how completion is judged*: fixed membership vs. an any-N-of-pool rule. That distinction is covered in the Completion Rules section that follows in later work; this section only covers what a Collection *is* and which stations belong to it.

A **Collection** (Kollektion) is a named group of stations. It is the shape behind both the Karte screen's themed-trail filters and the Erfolge screen's badge tiers.

| Field | Type | Confidence | Notes |
|---|---|---|---|
| `id` | text/identifier | **Assumed** | The prototype has no id — it looks a collection up by its display name (`COLLECTIONS.find(c => c[0] === collection)`, line 774). Looking up by name breaks if a name is ever corrected or translated. This row is this document's own recommendation — a proposal, not a prototype fact. |
| `name` | text | **Confirmed** | The display name, e.g. `'Harzer Hexenstieg'`, `'Brocken-Runde'` (line 697–698), or a badge tier's `tier` value, e.g. `'Bronze'`, `'Wanderkaiser'` (lines 716, 724). |
| `description` (themed collections) | text | **Assumed** | The prototype's `COLLECTIONS` array (lines 695–701) carries only a name and a member list — no description field for the themed trails. Since this document treats themed collections and badge tiers as the same entity, the field is defined on every collection and is simply empty today for the themed ones. |
| `description` (badge tiers) | text | **Confirmed** | Badge tiers carry a German `desc` field in the `NEEDLES` array, e.g. Bronze's "Die erste Stufe: acht beliebige Stempelstellen im Harz…" (line 717) and Wanderkaiser's "Alle 222 Stempelstellen der Harzer Wandernadel…" (line 725). Verified across the full `NEEDLES` array, lines 715–726. |
| Member stations | relationship | **Confirmed** | The prototype confirms membership exists and is a list of station numbers (line 697 onward), but it is documented here as a *relationship between Station and Collection*, not a plain field owned by either side — see Membership below. |

### Membership

Membership is many-to-many: a station belongs to **zero or more** collections, and a collection contains **zero or more** stations.

Proof from the prototype's own demo data: station 22 (Brocken) appears in the member list of both `'Harzer Hexenstieg'` (`[22,25,27,30,33,59,62,89,92,101]`, line 697) and `'Brocken-Runde'` (`[22,25,33,35,92,95,98]`, line 698) — verified by reading both arrays directly. One station, two collections, simultaneously.

This plainly contradicts the casual singular phrasing "a station can belong to a **collection**" in `ARCHITECTURE.md` (line 9) and in the originating GitHub issue #1. That phrasing should not be read as authoritative about cardinality — it describes the common case, not the rule.

**Storage-shape consequence.** The prototype stores membership as an array hanging off the collection — `['Harzer Hexenstieg', [22,25,27,30,33,59,62,89,92,101]]` (line 697) is literally `[name, stationNumbers]`. That shape answers "which stations are in this collection?" cheaply (read the array), but answers "which collections is this station in?" only by scanning every collection's member list looking for a match. The station detail sheet will need that second direction (to show, on a station's own page, which collections it belongs to), so a single embedded list is not sufficient as the only representation.

Because of this, this document describes membership as a **relationship in its own right** — conceptually a set of `(station, collection)` pairs — rather than as a field owned by the station or the collection. Whether it is physically stored as an embedded list, a join table, or some combination of both is a storage-layer decision explicitly deferred to `ARCHITECTURE.md`'s open questions about on-device storage (`ARCHITECTURE.md` line 139); this document does not decide it. What this document does fix is the identity side: membership references a station by its `number` field, the identity field established in the Station section above.

### Counts are derived, not stored

No collection ever stores its own size. A collection's station count is derived by counting its members at read time; the programme's total station count is derived by counting the loaded stations, not stored anywhere as a constant.

The prototype does the opposite, and it is exactly what not to do: the literal `222` is hardcoded independently in at least two places — the all-stations collection's displayed count, `count: list ? list.length : 222` (line 817), and the station grid's label, `gridLabel: f.length + ' von 222 · sortiert nach Nummer'` (line 868). These two hardcoded literals aren't even guaranteed to agree with each other, let alone with the real number of loaded stations. The model must support an arbitrary number of stations and an arbitrary number of collections; nothing in the model may assume any fixed total.

### "Alle Stempel" and the all-stations collection

This is the trap in this entity, so it earns its own explanation. In the prototype, `COLLECTIONS[0]` is `[ALL_COLL, null]` (line 696, with `ALL_COLL = 'Alle Stempel'` defined at line 694) — a pseudo-collection whose member list is `null` rather than an array of station numbers. Its displayed count falls back to the hardcoded literal `222` (`count: list ? list.length : 222`, line 817), and the filtering logic treats a `null` member list as "apply no membership filter at all": `(!set || set.indexOf(s.nr) > -1)` (line 776), where `set` is looked up from `COLLECTIONS` by name (line 774) and is `null` for `'Alle Stempel'`.

This conflates two genuinely different things:

1. There is a real collection containing every official station. The domain owner names it **Harzer Wanderkaiser**. It is an ordinary collection with real membership — a later Completion Rules section shows it is the pool the lower badge tiers (Bronze, Silber, Gold, Wanderkönig) draw their any-N rules from.
2. Separately, there is the filter sheet's "show everything" affordance — meaning *no collection filter is currently selected*. That is UI state, not a collection at all.

The prototype's `[ALL_COLL, null]` entry hybridizes these two into one row of one array, using `null` as a sentinel for "no filter." This document recommends modelling them separately: the first as an ordinary collection with real membership like any other, and the second purely as the absence of a filter selection in UI state (e.g. an unset/null selected-collection field on the Karte screen, not a collection record at all). The prototype's approach is explicitly not recommended, because a `null` member list forces every future consumer of the collection list into a special case for entry zero — a hazard a plain, complete collection record avoids entirely.

### Filtering is single-select today; the model is not

The Karte filter sheet currently allows selecting at most one collection at a time (`screen_map_filter_v1.png`, headed "COLLECTION · NUR EINE"). This is a constraint on the *filtering UI*, not on the data: the underlying model permits a station to belong to any number of collections simultaneously (see Membership above), so a future multi-select filter would require no change to this model — only to the filter UI and its query logic.

---

Completion Rules — including how a badge tier's collection is distinguished from a themed collection's — follow in later work.
