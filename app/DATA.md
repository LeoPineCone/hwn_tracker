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

## Completion Rules and Badges

A Collection is not complete merely because a hiker has visited its members — each Collection carries a **completion rule** that says what actually earns it. Everything known today is covered by two kinds of rule, and they should be read as two cases of one mechanism rather than as two unrelated features bolted together:

- **All members** — the hiker must visit every station in the collection. This is the themed-trail case: Harzer Hexenstieg is earned by stamping all ten of its member stations (`[22,25,27,30,33,59,62,89,92,101]`, line 697).
- **Any N of a source collection** — the hiker must visit any N stations drawn from another collection's members, with no requirement about *which* ones. This is the badge-tier case, per the domain owner's framing: Bronze means any 8 stations out of the **Harzer Wanderkaiser** collection, where Harzer Wanderkaiser is the collection holding every official station. Silber, Gold, and Wanderkönig work the same way, each with a different value of N.

### The mechanism generalizes

The payoff of treating badge tiers and themed trails as one entity is that the source collection for an any-N rule can be *any* collection, not necessarily the all-stations one. "Any 5 of the Harzer Hexenstieg" is expressible today without inventing anything new — it is the same rule shape as Bronze, just pointed at a different source collection.

This generality creates one consistency choice worth naming: Harzer Wanderkaiser itself could be described either as "all members of itself" or as "any N of itself, where N equals its own size." This document recommends the all-members form, because it needs no number and so cannot fall out of step with reality when stations are added or retired — an any-N form pinned to a hardcoded count would silently stop meaning "everything" the moment the source collection's membership changed.

### The `completionRule` field

| Field | Type | Confidence | Notes |
|---|---|---|---|
| `completionRule` | structured value | **Assumed** | The prototype has no such field. It hardcodes the all-members/any-N distinction structurally instead, by keeping badge tiers in a separate `NEEDLES` array (line 715 onward) rather than as entries in `COLLECTIONS` (line 695 onward) — two parallel arrays standing in for what this document treats as one field on one entity. |

In plain words, a completion rule has a *kind* — all-members or any-N — and, only for the any-N kind, it additionally carries a required count and a reference to a source collection (by that collection's `id`, per the Collection section's identity field). An all-members rule needs nothing beyond its kind: its target is always "however many stations this collection currently has," per "Counts are derived, not stored" above.

### Today's five tiers — illustrative data, not a schema constraint

The table below reproduces what the prototype currently encodes as `NEEDLES`. It is today's data, nothing more: the model must not hardcode "there are five tiers" anywhere, and adding a sixth tier — or a themed collection with an any-N rule of its own — is a data change, not a code change.

| Collection | Rule | Source collection | Prototype origin |
|---|---|---|---|
| Bronze | any 8 | Harzer Wanderkaiser | `NEEDLES[0]`, `req:8` (line 716) |
| Silber | any 16 | Harzer Wanderkaiser | `NEEDLES[1]`, `req:16` (line 718) |
| Gold | any 24 | Harzer Wanderkaiser | `NEEDLES[2]`, `req:24` (line 720) |
| Wanderkönig | any 50 | Harzer Wanderkaiser | `NEEDLES[3]`, `req:50` (line 722) |
| Harzer Wanderkaiser | all members | — | `NEEDLES[4]`, `req:222` (line 724) — the prototype writes this requirement as a hardcoded literal integer, the same `222` that recurs elsewhere in the prototype's station-count literals (see "Counts are derived, not stored" above) |

This model replaces that hardcoded `222` literal with an all-members rule instead, per the no-fixed-cardinality principle already established in the Collection section: nothing in the model may assume any fixed total, and Wanderkaiser's target should be counted from loaded stations, never stored as a number.

### `earnedOn` and hiker progress

| Field | Type | Confidence | Notes |
|---|---|---|---|
| `earnedOn` (prototype `date`) | date | **Confirmed** as a concept | The prototype's `NEEDLES` entries carry a `date` value that is a literal string when a tier is earned (e.g. Bronze's `'02.05.2025'`, line 716) and `null` when it is not (Wanderkönig and Wanderkaiser, lines 722 and 724). This confirms the absent/null-when-unearned shape this document recommends generally. |

One inconsistency worth flagging explicitly: the date format used here is `DD.MM.YYYY` (four-digit year — e.g. `'02.05.2025'`, line 716), which differs from the station's `stampedOn` format `DD.MM.YY` established in the Station section (two-digit year, e.g. the prototype appending the literal `'25'`). Both are prototype presentation formatting, not part of the stored shape, but the two disagree with each other within the same prototype — a detail a future implementation should pick one convention for, not inherit both.

Being hiker progress rather than reference data, `earnedOn` belongs in the same category as a station's `visited` flag — see "Which data is shipped, which is the hiker's" in the Station section above: this is on-device state created by the hiker's own progress, not shipped reference data.

### Derived, not stored

This is this section's main practical contribution: every value below is something the prototype hardcodes as a mock literal in `NEEDLES`, and none of them should be stored in the real model. All of them are derived at read time, for **every** Collection regardless of rule kind — an all-members collection and an any-N collection are computed the same way, just with a different pool and a different target:

- **Progress** is a count of the hiker's visited stations within the rule's pool: the collection's own members for an all-members rule, the source collection's members for an any-N rule.
- **Target** is the collection's own member count for an all-members rule, or N for an any-N rule — counted, never stored.
- **Earned state** is progress ≥ target.
- **Remaining count** is target minus progress, floored at zero. The prototype's own expression: `Math.max(0, N.req - N.have)` (line 953).
- **Percentage**, shown on the detail sheet's progress bar, is progress *capped at the target*, divided by the target: `Math.round(Math.min(N.have, N.req) / N.req * 100) + '%'` (line 952). The cap matters — without it, an over-achieving hiker (one whose `have` exceeds `req`, which the underlying count could produce for an any-N rule) could show a percentage past 100%.
- **Status label**: the detail sheet's actually-derived label (`ndStatus`, rendered at line 578) is built as `N.done ? ('Ziel erreicht am ' + N.date) : ('Noch ' + Math.max(0, N.req - N.have) + ' Stempel')` (line 954) — i.e. "Noch {remaining} Stempel" while in progress, "Ziel erreicht am {date}" once earned. Note this is a correction to an assumption worth naming explicitly: `NEEDLES` also carries its own separate, hardcoded `status` string per tier (e.g. `'4 offen'`, `'176 offen'`, `'ziel erreicht'` — lines 716–724), used only in the collections grid view (`n.status`, line 883, rendered line 306). That field reads "{N} offen", not the detail sheet's "Noch {N} Stempel" — the two are different fields in the prototype and happen to disagree in wording despite describing the same fact. `app/DESIGN.md` (line 222) documents the "Ziel erreicht am {date}" copy as settled and is the copy-of-record for it; treat its "{reqLeft} offen" phrasing there as inherited from the same grid-view literal rather than as a second, independently-derived expression.

A future contributor should not reintroduce a separate or parallel code path just for badges: this derivation list applies identically to every Collection, whatever its rule kind, and that uniformity is the concrete benefit of treating tiers and themed trails as one entity.

### The region sentences are flavour text

The Silber tier's description reads "Sechzehn Stempel, verteilt über mindestens zwei Regionen" ("sixteen stamps, spread over at least two regions" — `NEEDLES[1].desc`, line 719), and the Wanderkönig description reads "…Hochharz, Ostharz und Südharz müssen alle vertreten sein" ("…Hochharz, Ostharz, and Südharz must all be represented" — `NEEDLES[3].desc`, line 723).

Both sentences read like specifications. Neither is one. No field encodes a region requirement, no prototype code enforces one, and this is confirmed settled by the domain owner — not an open question awaiting an answer. An any-N rule is a plain count; progress is a single number; no rule anywhere in this model reads a station's `region` field (which, per the Station section, is display data only). This subsection exists specifically to stop a future contributor from implementing the description text as a literal region constraint — it is a realistic mistake to make, since the copy strongly implies otherwise.

### Presentation values, deliberately not repeated here

Per-tier metal and ring colours (`metal` and `ring` fields in `NEEDLES`, e.g. Bronze's `metal:'#b2622d'`, `ring:'#ffc6a5'`, line 716) are presentation values, not domain data. They are already mapped to design tokens in `app/DESIGN.md`'s "Collection/badge card" table (line 212 onward, Fill/Ring per tier) and are deliberately not repeated here.

---

## Entity Relationships

This model has exactly **two entities**: Station and Collection. Everything else this document describes — badge tiers, themed trails, "3 of 5 collections earned," a hiker's progress bar — is a shape built out of those two, not a third or fourth entity. There are three relationships between them, and the third one is not really a relationship at all, in the sense of something stored.

1. **Station ↔ Collection, many-to-many, keyed by station `number`.** A station belongs to zero or more collections and a collection has zero or more member stations. This is the Membership relationship described in the Collection section above; see "Membership" for the proof (station 22 / Brocken belongs to both Harzer Hexenstieg and Brocken-Runde simultaneously) and for why it is modelled as a relationship in its own right rather than a field on either side.
2. **Collection → Collection, an any-N rule's source pool.** A collection whose completion rule is any-N does not point at stations directly for its target — it points at another collection, and the rule is judged against that collection's members. This is a relationship between two Collection records. In today's data it is acyclic (nothing points back at something that, transitively, points at it), and every single any-N rule in the prototype's data — Bronze, Silber, Gold, and Wanderkönig — points at the same root: Harzer Wanderkaiser, the all-stations collection (see "Alle Stempel and the all-stations collection" and "Today's five tiers" above). Nothing in the model requires a single root or forbids a deeper chain — "The mechanism generalizes" above already covers that a themed collection could just as well be a source pool — but as observed today, it is one root with four direct any-N children.
3. **Hiker ↔ progress: not stored.** A hiker's progress toward a collection is not an edge in this model at all. It is derived at read time by intersecting the set of stations the hiker has visited with the rule's pool (the collection's own members for an all-members rule, the source collection's members for an any-N rule) and counting — exactly what "Derived, not stored" under Completion Rules and Badges describes for progress, target, earned state, remaining count, and percentage alike. There is no `(hiker, collection)` record anywhere in this model; asking "has this hiker earned Gold?" is a computation over `visited` flags, not a lookup.

    Station ──── membership (M:N, keyed by station `number`) ──── Collection
                                                                        │
                                                                        │ any-N rule's source pool
                                                                        │ (collection → collection, acyclic)
                                                                        ▼
                                                                  Collection
                                                         (today: always Harzer Wanderkaiser,
                                                          the all-stations collection)

    hiker progress toward any Collection = count(visited Stations ∩ rule's pool)
    — computed at read time; not a stored edge, not a third entity

**On the originating framing.** GitHub issue #1 that started this work framed the domain as three entities — Station, Collection, and **Badge** — with a collection's progress *feeding into* a badge or tier, as though a badge were a separate record downstream of a collection. That framing did not survive contact with the domain: badges are not fed by themed collections, and there is no separate Badge entity or Badge-feeds-from-Collection relationship anywhere in the model this document arrived at. A badge/tier *is* a Collection, distinguished from a themed trail only by its completion rule (any-N over the all-stations collection instead of all-members over its own list) — see "A naming note first" at the top of the Collection section and "Today's five tiers" under Completion Rules and Badges. This is written down explicitly here so a future reader does not re-derive it from scratch, and so issue #1's original three-entity wording is not mistaken for the authoritative model — the two-entity model in this document supersedes it.

---

## Worked Example

This walks one hiker through the whole model, using the prototype's own demo numbers, so the model can be checked directly against the mockup rather than taken on faith. Every figure below is visible in `app/design/screenshots/screen_rewards_v1.png` (the Erfolge screen) and was independently verified against the prototype source, `app/design/Harzer Wandernadel.dc.html`, before being written down here.

The hiker has stamped **46 of 222** stations.

- **App header.** The header badge on every screen (not just Erfolge) reads "46/222" — a literal string in the markup (line 49), and visible top-right in the screenshot.
- **Gesamtfortschritt card.** The second Erfolge carousel card shows "46" over "von 222 Stempelstellen" (lines 255–256), matching the header.
- **Bronze, Silber, and Gold read as earned, with dates.** Their targets are 8, 16, and 24 respectively (the same values already recorded in "Today's five tiers" above, re-verified here directly against `NEEDLES[0]`, `NEEDLES[1]`, `NEEDLES[2]` — lines 716, 718, 720). Since progress toward any of them is the count of visited stations within their shared pool, Harzer Wanderkaiser, and 46 ≥ 8, 46 ≥ 16, and 46 ≥ 24, all three are earned: the prototype records `done:1` with dates `'02.05.2025'`, `'19.06.2025'`, and `'30.07.2025'` for Bronze, Silber, and Gold respectively (same lines), and the screenshot shows all three rows as "ziel erreicht".
- **Wanderkönig sits at 46/50.** `NEEDLES[3]` records `req:50, have:46, done:0` (line 722), matching the ring card's "46" over "von 50" (lines 238–239) and the screenshot. Its status text reads "Noch **4 Stempel** bis zur Nadel in Silber-Gold" (line 243) — the derived detail-sheet wording established in "Derived, not stored" above, not the grid view's separate `status:'4 offen'` field also present at line 722 (that field is real, but it is the other, non-derived label the Completion Rules section already distinguishes — the grid view in the screenshot's lower list does show "4 offen" next to Wanderkönig, and both wordings describe the same fact via two different fields).

  Its percentage, per the Completion Rules formula `Math.round(Math.min(N.have, N.req) / N.req * 100) + '%'` (cited there at line 952): `Math.min(46, 50) = 46`, `46 / 50 = 0.92`, `0.92 * 100 = 92`, rounded is `92`. So Wanderkönig shows **92%**. This is independently confirmed by the ring itself — the card's `conic-gradient` is hardcoded to fill to exactly `92%` before the track colour takes over (line 236), agreeing with the computed value without needing to trust either number alone. (The card also carries a second, unrelated percentage, "21%," labelled "gesammelt" — that is `Math.round(46 / 222 * 100)`, the hiker's overall share of all 222 stations, not a completion-rule percentage for any one collection. It is worth naming so a reader comparing the screenshot against this document does not conflate the two 90-odd-vs-20-odd percentages on the same card.)
- **Wanderkaiser sits at 46/222.** `NEEDLES[4]` records `req:222, have:46, done:0` (line 724). Remaining is `222 - 46 = 176`, matching `Math.max(0, 222 - 46) = 176`. Following the same corrected wording as Wanderkönig above, the derived status label is **"Noch 176 Stempel"** — not the grid view's separate `status:'176 offen'` field (also at line 724, and also visible in the screenshot's bottom row), for the same reason: that field is the other, non-derived label, not the one this document's derived model produces.
- **Kollektionen counter reads "3 von 5."** Three tiers earned (Bronze, Silber, Gold) out of five tiers total (Bronze, Silber, Gold, Wanderkönig, Wanderkaiser) — literally "3 von 5" in the markup (line 294) and in the screenshot's "Kollektionen" row header. Per "Counts are derived, not stored" above, this "3" and "5" are themselves both counts taken over loaded data (tiers with `done` true, and tiers total), not stored anywhere as their own fields.

**A note on the prototype's own inconsistency, worth calling out because it is exactly what this document's model is designed to prevent:** `NEEDLES` hardcodes each tier's `have` independently — `8` for Bronze, `16` for Silber, `24` for Gold, `46` for Wanderkönig and Wanderkaiser (lines 716, 718, 720, 722, 724). Under this document's derived model, all five of those tiers draw progress from the *same* pool — Harzer Wanderkaiser, whose membership is exactly the same 46 visited stations regardless of which tier is asking. A correct derivation would read `have = 46` for every one of the five tiers, capped only where the percentage or earned-state calculation caps it — not a different, tier-specific `have` for Bronze/Silber/Gold that happens to land exactly on their own target. The prototype's mock data getting this "right" for Bronze/Silber/Gold (by luck of hand-authored numbers landing on the target) is not evidence the approach is sound; it is precisely the kind of hand-maintained-per-record total that "Counts are derived, not stored" above says to stop doing.

---

## Open Questions — Not Yet Decided

**Settled, do not relitigate:**

- There are two entities, Station and Collection; badges are collections with completion rules, not a third entity (see "Entity Relationships" above).
- Station-to-collection membership is many-to-many.
- Station identity is the official station `number`.
- No cardinality is fixed anywhere in the model; every count — station totals, collection sizes, tier counts, the "3 von 5" Kollektionen counter — is derived by counting loaded data, never stored as its own number.
- There are **no region rules.** The region sentences in the Silber and Wanderkönig tier descriptions are flavour text, confirmed settled by the domain owner — see "The region sentences are flavour text" under Completion Rules and Badges.

**Known and deliberately deferred:**

- **Retired and special stations.** These demonstrably exist in the real programme: `ARCHITECTURE.md` states the programme has "currently ~222 official stations, plus special stations and retired/inactive ones" (`ARCHITECTURE.md:9`, verified by grep). Handling them is planned later work, not an unanswered question sitting idle — see "Retired and special stations" under the Station section above for the full deferral note. The consequence stated there bears repeating because it is easy to underestimate: because every total in this model is counted from loaded data rather than stored, the choice between removing a retired station from a collection outright versus keeping it with a retired flag changes every derived total that station feeds into — and therefore can change whether a hiker who already earned a badge keeps it once a station the badge's rule counted retires.

**Genuinely open:**

- Where real station coordinates (`latitude`/`longitude`) come from — see the Station section's field table; this is called out there as the single most important missing row in this document.
- Whether themed collections will ever have completion rules other than all-members — today every themed collection (Harzer Hexenstieg, Brocken-Runde, Selketal-Tour, Welterbe & Bergbau) is all-members and only the five tiers use any-N, but "The mechanism generalizes" above notes nothing in the model prevents a themed collection from carrying an any-N rule too.
- Whether the real programme has more than the four themed collections seen in the prototype's `COLLECTIONS` array (`app/design/Harzer Wandernadel.dc.html:695`–701), and, if so, where their definitions would come from.
- The on-device storage mechanism and the authoring/versioning pipeline for this dataset. This is explicitly **not** answered here — it is deferred to `ARCHITECTURE.md`'s "Open Questions / Not Yet Decided" list, which already names both "On-device data storage" and "How official station/collection/badge data is authored, versioned, and shipped" as open. This document describes shapes, not where those shapes live on disk.
