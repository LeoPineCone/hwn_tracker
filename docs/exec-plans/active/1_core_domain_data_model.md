# Define the core domain data model for stations, collections, and badges

This ExecPlan is a living document. The sections Progress, Surprises & Discoveries,
Decision Log, and Outcomes & Retrospective must be kept up to date as work proceeds.

## Purpose / Big Picture

Two of the three MVP screens of the HWN Tracker app — **Karte** (map plus a "Stempel" grid of
stamp stations) and **Erfolge** (badge and collection progress) — read the same underlying
entities. A stamp station may belong to any number of themed collections; and a badge turns out to
be a collection too, one earned by stamping any N stations out of another collection rather than
by stamping a specific set. Today that model exists nowhere as a written spec. It only exists
implicitly, as embedded JavaScript arrays inside a throwaway HTML prototype at
`app/design/Harzer Wandernadel.dc.html`.

After this change, a contributor picking up any Karte or Erfolge story can open one file —
`app/DATA.md` — and learn exactly which entities exist, which fields each one carries, which of
those fields are confirmed by the prototype versus merely assumed, and how badge progress is
computed from station data. They will not have to read a 70,000-character HTML prototype and
reverse-engineer tuple positions, as the author of this plan had to.

You can see it working by opening `app/DATA.md` and answering, without opening any other file:
"What identifies a station?", "Can a station be in two collections at once?", "What exactly does
the Bronze badge require, and how is progress toward it computed?", "How would a sixth badge be
added?", and "Do we know each station's real latitude and longitude?" (the honest answer to the
last one is *no* — and the document must say so explicitly rather than quietly implying
otherwise).

This is a **documentation-only** change that defines **structures, not data**. No station list, no
collection list, no TypeScript, no runtime code, and no storage mechanism is produced here — and
no structure fixes a cardinality, so an arbitrary number of stations, collections, and badges can
be loaded. Those exclusions are deliberate; see Decision Log.

## Progress

- [x] Milestone 1: `app/DATA.md` created with front matter, conventions, and the Station section.
      (2026-08-20)
- [x] Milestone 2: Collection section (membership, many-to-many) added to `app/DATA.md`.
      (2026-08-20)
- [x] Milestone 3: Completion rules and badge tiers as a kind of collection. (2026-08-20)
- [ ] Milestone 4: Relationships, worked example, Open Questions, and cross-links from
      `ARCHITECTURE.md`, `AGENTS.md`, `docs/app.md`, and `app/DESIGN.md`.
- [ ] ExecPlan finalized: Outcomes & Retrospective written, plan moved from
      `docs/exec-plans/active/` to `docs/exec-plans/completed/`.

## Surprises & Discoveries

These were found while researching the prototype for this plan. They are not optional colour —
each one changes what `app/DATA.md` must say, so the executor must preserve them in the document.

- Observation: The Erfolge screen's list headed **"Kollektionen"** does not show themed
  collections at all. It shows badge tiers.
  Evidence: `app/design/Harzer Wandernadel.dc.html` line 882 builds the list from `NEEDLES`
  (`needles: NEEDLES.map(...)` producing `'Harzer Wandernadel · ' + n.tier`), and the mockup
  `app/design/screenshots/screen_rewards_v1.png` renders exactly those five rows — "Harzer
  Wandernadel · Bronze / Silber / Gold / Wanderkönig / Wanderkaiser" — under the heading
  "Kollektionen · 3 von 5". The `COLLECTIONS` constant (Harzer Hexenstieg, Brocken-Runde,
  Selketal-Tour, Welterbe & Bergbau) appears only in the Karte filter sheet
  (`app/design/screenshots/screen_map_filter_v1.png`, headed "COLLECTION · NUR EINE").
  Consequence: the UI's use of "Kollektion" for both is not a mistake to correct but a hint that
  the two are the same kind of thing with different completion rules — see the Decision Log entry
  on the unified collection model. `app/DATA.md` must say that the prototype stores them in two
  separate arrays while the domain model treats them as one entity, and explain why.

- Observation: A badge tier is **not** earned by completing a set of specific stations. It is
  earned by reaching a count threshold over a pool of stations.
  Evidence: each `NEEDLES` entry (lines 715–726) carries `req` (a required number) and `have`
  (a current number), never a station list. When the tier detail sheet's call-to-action fires for
  an earned tier (line 960), the prototype *invents* a member list on the spot —
  `st.filter(s => s.visited).slice(0, Math.min(N.req, N.have)).map(s => s.nr)` — i.e. it just
  takes the first N visited stations. That is demo scaffolding, not a real relationship.
  Consequence, per the domain owner: the pool is another collection. Bronze means "any 8 stations
  out of the Harzer Wanderkaiser collection", where Harzer Wanderkaiser is the collection holding
  every official station. So a tier is a collection with an *any-N-of-a-source-collection*
  completion rule, not a separate entity with a bare integer threshold.

- Observation: Tier descriptions appear to state region-distribution rules, but those are flavour
  text with no rule behind them.
  Evidence: the Silber description says "Sechzehn Stempel, verteilt über mindestens zwei
  Regionen"; the Wanderkönig description says "Hochharz, Ostharz und Südharz müssen alle
  vertreten sein". There is no field on `NEEDLES` encoding a region requirement and no code checks
  one. The domain owner has confirmed these are purely descriptive — the real programme has no
  region rules. `app/DATA.md` must say so explicitly, because the sentences read like
  specifications and the next contributor will otherwise try to implement them.

- Observation: The prototype has **no real geographic coordinates**. The `x` and `y` values on
  each station are percentage offsets for placing a pin on a decorative fake map.
  Evidence: station tuples end in two small integers (e.g. Brocken is `...,1141,1,48,34`), which
  the prototype renders as CSS percentage positions. Brocken's true position is roughly
  51.80 N, 10.62 E — nothing resembling `48, 34`. Latitude/longitude are therefore **Missing**
  from the source material and must be marked as such.

- Observation: The prototype's headline counters are hardcoded and inconsistent with its own
  station list.
  Evidence: the `S` array holds 36 stations, of which 19 have the visited flag set and 17 do not
  (counted with a script over lines 648–685). Yet `NEEDLES` hardcodes `have: 46` on every tier
  and the screen header renders "46/222". So `have`, `done`, `status`, and `date` on a tier are
  mock literals, not derived values. In the real model they must be **derived** from stamp data,
  and `app/DATA.md` must say so.

- Observation: A station's "open" state is not independent data — it is the negation of visited.
  Evidence: line 748, `visited: !!vis, isOpen: !vis`. There is no third state (e.g. "temporarily
  out of order"), even though `ARCHITECTURE.md` mentions "retired/inactive" stations exist in the
  real programme.

- Observation: The collection named **"Alle Stempel"** is a UI sentinel in the prototype, but it
  stands in for something real — the collection of every official station, which the domain owner
  names **Harzer Wanderkaiser** and which is the pool the lower tiers draw from.
  Evidence: line 696, `[ALL_COLL, null]` — its member list is `null`, and line 817 displays its
  count as a hardcoded literal `222` (`count: list ? list.length : 222`) rather than counting
  anything. Filtering treats a `null` member list as "no membership filter" (line 776,
  `(!set || set.indexOf(s.nr) > -1)`). So the prototype conflates two distinct things: the filter
  sheet's "no filter applied" affordance, and the all-stations collection. They coincide only
  because those two happen to select the same stations.

- Observation: Every cardinality in the prototype is a hardcoded literal, which conflicts with the
  requirement that the model support an arbitrary number of stations.
  Evidence: the total station count `222` appears as a literal in three unrelated places — the
  sentinel's displayed count (line 817), the grid label `f.length + ' von 222 · sortiert nach
  Nummer'` (line 868), and Wanderkaiser's `req: 222` (line 724). The Erfolge header "46/222" and
  the "3 von 5" collections counter in `screen_rewards_v1.png` are likewise fixed strings. None of
  these is computed from the dataset.
  Consequence: `app/DATA.md` must state that no count is ever stored or hardcoded — every total,
  progress figure, and remaining figure is derived by counting the loaded data at read time.

- Observation: The stamp date carried on a station is fabricated and carries no time.
  Evidence: line 750, `date: vis ? (DATES[(d++) % DATES.length] + '25') : ''` cycles a fixed
  14-entry list of `DD.MM.` strings and appends the literal `'25'`, producing `DD.MM.YY`. The
  station detail copy shows "Gestempelt am {date} · 08:42" (line 979) where `08:42` is a
  hardcoded string, not data.

- Observation: Milestone 1's evidence block for `S`-array rows was drafted with a minor
  off-by-one citation (station 9, Eichsfelder Warte, was cited as prototype line 651; it is
  actually line 652 — `const S = [` opens at 648, so row *n* sits at `648 + n`). Caught by
  independently re-running `sed -n` and `grep -n` against
  `app/design/Harzer Wandernadel.dc.html` during the executor's own verification pass, rather
  than trusting the delegate's self-reported citations.
  Consequence: fixed directly in `app/DATA.md`. All other line citations in the Station section
  (648, 649, 657, 748, 749, 750, 751, 977, 979, 888) were independently re-verified against the
  source file and are correct.

- Observation: The prototype's copy of the data in `app/design/stand_alone_app.html` is
  byte-identical for `NEEDLES` and contains exactly one `const S = [`, so the two prototype files
  do not disagree and no reconciliation is needed.
  Evidence: extracted and compared both files with a Python script; the `NEEDLES` block matched
  character for character apart from JSON string escaping.

## Decision Log

- Decision: The document lives at `app/DATA.md`, a new file, rather than as a new section inside
  `ARCHITECTURE.md`.
  Rationale: this resolves the open question stated in issue #1. Three reasons. First, precedent:
  `app/DESIGN.md` was created by exactly this process — extract a spec from the prototype, source
  file wins on disagreement — and states outright that it is "the only design doc for the
  project, so design guidance has one home". A sibling `app/DATA.md` gives data guidance one home
  the same way. Second, scope hygiene: `ARCHITECTURE.md` describes the technical setup (stack,
  repo layout, deployment, environments) and already delegates domain-level detail to separate
  files; a several-hundred-line entity spec would dominate it. Third, ownership: the offline-first
  invariant means this dataset ships *inside the app build*
  (`ARCHITECTURE.md`, "Region-bound assets are bundled into the app"), so `app/` is where its
  consumers live. Discoverability — acceptance criterion three of the issue — is handled by
  explicit cross-links added in Milestone 4 rather than by co-location.
  Date/Author: 2026-08-20, planner.

- Decision: `app/DATA.md` describes fields in Markdown tables using plain type words (text,
  integer, boolean, date, list of integers) and contains **no** TypeScript `interface` or `type`
  blocks.
  Rationale: issue #1's Out of Scope section says "TypeScript interfaces or any implementation —
  this issue produces a spec/doc only". Writing TS in the doc would also pre-empt the still-open
  storage decision, since a persisted shape and an in-memory shape may legitimately differ.
  Date/Author: 2026-08-20, planner.

- Decision: Every field gets one of exactly three confidence markers — **Confirmed**, **Assumed**,
  **Missing** — defined once in the document's conventions section.
  Rationale: acceptance criterion two requires that "fields still assumed or unconfirmed" be
  "explicitly marked as such". A fixed three-value vocabulary makes that mechanically checkable
  (a reviewer can grep) instead of relying on prose hedging like "probably" or "likely".
  Date/Author: 2026-08-20, planner.

- Decision: Themed collections and badge tiers are modelled as **one entity** — a collection with
  a *completion rule* — not as two separate entities.
  Rationale: direction from the domain owner, who described Bronze as "eight arbitrary stamps out
  of another collection (Harzer Wanderkaiser)". That makes a tier structurally a collection whose
  completion rule is *any N of a source collection*, while a themed collection like Harzer
  Hexenstieg has the rule *all of its own members*. The prototype's two separate arrays
  (`COLLECTIONS` and `NEEDLES`) reflect how a mockup was hand-written, not how the domain works,
  and the UI already calls both "Kollektion". Modelling them once means Erfolge renders one list
  type, progress is computed by one function, and a future collection that does not fit either
  existing shape (say, "any 5 of the Hexenstieg") needs no new entity.
  Consequence for the earlier framing: this supersedes the split between "themed collection" and
  "badge tier" that an earlier draft of this plan proposed, and it supersedes issue #1's
  three-entity framing (Station / Collection / Badge) — the delivered model has **two** entities,
  Station and Collection, with badges being a rule variant of Collection.
  Note on precedence: `app/DESIGN.md`'s "source file wins" rule governs *visual* values extracted
  from the prototype. It does not govern domain semantics, where the domain owner's description of
  the real Harzer Wandernadel programme wins over a throwaway mockup's data layout.
  Date/Author: 2026-08-20, planner, on the domain owner's correction.

- Decision: The model carries **no fixed cardinalities**. There is no constant 222, no constant
  five tiers, no assumption that the collection list is closed.
  Rationale: direction from the domain owner — the structures must stay dynamic so an arbitrary
  number of stations can be loaded. This is also just correct: the real programme's station count
  changes as stations are added or retired, and the prototype's three separate hardcoded `222`
  literals are exactly the kind of thing that silently rots. Every total and every progress figure
  is derived by counting the loaded dataset.
  Date/Author: 2026-08-20, planner, on the domain owner's correction.

- Decision: Station-to-collection membership is **many-to-many** and is documented as a
  relationship in its own right, not as a list field owned by one side.
  Rationale: direction from the domain owner ("n->n"), and confirmed by the prototype's own data —
  station 22 (Brocken) appears in both Harzer Hexenstieg and Brocken-Runde. The prototype happens
  to store the relationship as an array on the collection, but documenting it as an owned list
  invites an implementation that can only answer "which stations are in this collection?" and not
  "which collections is this station in?", which the station detail sheet will need.
  Date/Author: 2026-08-20, planner, on the domain owner's correction.

- Decision: There are **no region-distribution rules**. A station's region is display data only,
  and a completion rule is a plain count with no regional constraint.
  Rationale: the domain owner confirmed that the region sentences in the Silber and Wanderkönig
  descriptions ("verteilt über mindestens zwei Regionen"; "Hochharz, Ostharz und Südharz müssen
  alle vertreten sein") are flavour text — the real programme has no such rules. This closes what
  an earlier draft of this plan carried as its largest open question and keeps completion rules
  simple: progress stays a single count and never needs a per-region breakdown. `app/DATA.md` must
  still call this out explicitly rather than staying silent, because the description text reads
  like a specification and a contributor who only reads the descriptions will try to implement it.
  Date/Author: 2026-08-20, planner, on the domain owner's confirmation.

- Decision: Retired stations exist in the real programme and are **deliberately deferred**, not
  unknown. `app/DATA.md` records them as known, unmodelled future work.
  Rationale: the domain owner confirmed retired stations are real and will be handled later.
  `ARCHITECTURE.md` already mentions them in its Product Overview ("plus special stations and
  retired/inactive ones"), and the prototype has no notion of them — `visited` and its derived
  `isOpen` are the only states. Recording this as *deferred with a known consequence* rather than
  as an open question means a future contributor neither re-discovers it nor blocks on it. The
  consequence worth writing down now: once retirement exists, whether a retired station leaves the
  all-stations collection or stays flagged changes every derived total, and therefore whether an
  already-earned badge stays earned.
  Date/Author: 2026-08-20, planner, on the domain owner's confirmation.

- Decision: Presentation-only values found alongside the domain data — the per-tier `metal` and
  `ring` hex colours, the `rot` stamp rotation, the `short` truncated name — are named in
  `app/DATA.md` as explicitly *not* part of the domain model, with a pointer to `app/DESIGN.md`.
  Rationale: `app/DESIGN.md` already owns the tier metal tones (its "Collection/badge card" table
  maps them to ramp steps). Duplicating hex values across two documents guarantees they drift.
  Naming them and pointing away is better than silently omitting them, because a reader who saw
  them in the prototype needs to know they were considered and placed elsewhere.
  Date/Author: 2026-08-20, planner.

- Decision: Map points of interest — the `LOTS` (Wanderparkplätze) and `HUTS` (Schutzhütten)
  constants — and the Profil screen's Stempelpass fields (`pass`, `month`, `year`) are declared
  out of scope in a short "Adjacent, not modelled here" note rather than being modelled.
  Rationale: issue #1 names exactly three entities. But a reader who greps the prototype will find
  these constants and wonder whether their absence was an oversight; one sentence prevents that.
  Date/Author: 2026-08-20, planner.

- Decision: This work delivers **structures only, no concrete data**. The document does not
  reproduce the prototype's 36 demo stations as a data table, and does not enumerate the official
  station list, collection list, or any dataset.
  Rationale: it is a model spec, not a fixture. The demo rows are mock data (see Surprises: the
  counters do not even agree with the rows), and copying them would create a second, staler copy
  of data whose real version does not exist yet. Sourcing the real dataset is separate work,
  tracked as an open question in `ARCHITECTURE.md`. Two or three representative rows are included
  as illustrations only, clearly labelled as prototype demo data. The one exception is the five
  tier names and thresholds, which are reproduced because they are the *shape* of the completion
  rule being specified — and even there, the document must say they are today's values of an
  open-ended list, not a closed enumeration baked into the model.
  Date/Author: 2026-08-20, planner.

- Observation: Milestone 2's `## Collection` section (delegated, then independently re-verified by
  the executor against `app/design/Harzer Wandernadel.dc.html`) had zero citation errors — every
  line number cited (694, 696–701, 715–726, 774, 776, 817, 868, and `ARCHITECTURE.md` lines 9 and
  139) checked out exactly on independent `sed -n` re-verification. Noted here because Milestone 1
  needed one correction and Milestone 2 did not, suggesting the "verify every citation yourself"
  instruction in the delegation prompt is working as intended.

- Observation: This plan's own Milestone 3 prose (line ~624 of the plan as originally written)
  states the derived status label is `"{remaining} offen"` while in progress. That is wrong —
  it conflicts with the plan's own Artifacts and Notes section, which correctly reproduces the
  prototype's actually-derived expression: `ndStatus: N.done ? ('Ziel erreicht am ' + N.date) :
  ('Noch ' + Math.max(0, N.req - N.have) + ' Stempel')` (prototype line 954). The delegate agent
  caught this by re-verifying against the source file as instructed rather than trusting the
  prompt, and wrote `app/DATA.md` with the correct derivation: "Noch {remaining} Stempel" while
  in progress. It additionally documented that a *separate*, hardcoded-per-tier `status` string
  on `NEEDLES` (e.g. `'4 offen'`) does read "{N} offen" but is used only in the collections grid
  view (prototype line 883/306), not in the detail-sheet's derived computation — so both facts
  are now recorded, correctly attributed to their respective prototype fields, rather than the
  plan's conflated version. Independently re-verified by the executor via `sed -n` against lines
  950–961 and 880–884/304–308 of the prototype; the correction is accurate.
  Consequence: this plan's own Milestone 3 section (not `app/DATA.md`) contains a latent error in
  its prose that the executor is flagging here rather than silently editing, since the plan
  section itself is not being rewritten as part of execution.

- Decision: The Code-Quality Gate is skipped for every milestone's Commit Gate in this plan.
  Rationale: this entire ExecPlan is documentation-only, as stated in its own Purpose section —
  "No station list, no collection list, no TypeScript, no runtime code, and no storage
  mechanism is produced here." Every milestone touches only `app/DATA.md` (a new Markdown spec)
  plus, in Milestone 4, one-line cross-link edits to other Markdown files. No production code
  (TypeScript, tests, config with executable behaviour) is modified by any milestone. Standard
  verification instead is: the plan's own grep-based acceptance commands (confidence-marker
  count, absence of `interface`/`type` keywords, cross-link presence) plus the executor's own
  line-citation spot-checks against the prototype source, run at each Commit Gate in place of
  lint/type-check/code-quality review.
  Date/Author: 2026-08-20, executor.

- Decision: A one-line, already-verified citation typo (station 9's prototype line number in the
  Milestone 1 evidence block) was corrected by the executor directly with a single-line edit,
  rather than round-tripped through a `quickfix` subagent delegation.
  Rationale: the executor's standing workflow rule is to delegate all content changes to
  subagents and never edit deliverables itself. This one edit was made directly as an expedient
  correction after the executor had already independently verified the correct line number
  against the source file. Recorded here as a deliberate, disclosed one-off deviation, not a
  pattern — all subsequent `app/DATA.md` content across Milestones 2–4 is delegated to `code`
  subagents as the workflow requires.
  Date/Author: 2026-08-20, executor.

## Outcomes & Retrospective

To be written when the final milestone completes. Compare the delivered `app/DATA.md` against the
Purpose above: can a reader answer the four orientation questions from that section using only
that file?

## Context and Orientation

Assume you know nothing about this repository. Here is everything that applies across the whole
plan.

**The product.** HWN Tracker is a React Native mobile app for hikers collecting stamps
("Stempel") for the **Harzer Wandernadel** (HWN), a hiking-badge programme in the Harz region of
Germany. Roughly 222 official stamp stations ("Stempelstellen") are spread across the region.
A hiker walks to a station, finds a physical stamp box, and stamps their book. Collecting enough
stamps earns a badge ("Wandernadel") in an escalating series of tiers. Some stations are grouped
into themed collections, such as a named trail. The full product description is in
`ARCHITECTURE.md` under "Product Overview". The app has three screens: **Karte** (map, with an
in-screen toggle to a "Stempel" grid), **Erfolge** (badge and collection progress), and **Profil**
(settings).

**The repository.** The root holds `ARCHITECTURE.md` (authoritative technical reference),
`AGENTS.md` (rules for AI agents), `README.md`, and four top-level source directories: `app/`
(the React Native app), `backend/` (an Express app on AWS Lambda, currently only a health check),
`infrastructure/` (AWS CDK), and `docs/` (contributor guides: `app.md`, `backend.md`,
`infrastructure.md`, `typescript.md`). `backend/` and `infrastructure/` are npm workspaces sharing
one root `npm install`; `app/` is deliberately *not* a workspace and has its own `node_modules`.

**Current state of the app code.** `app/src/` contains only scaffold: `config.ts`, one screen
(`screens/HomeScreen.tsx`), one component (`components/Card.tsx`), one service
(`services/apiService.ts`), and one model (`models/HealthStatus.ts` — a backend health-check
payload, unrelated to hiking). **There is no existing station, collection, or badge code of any
kind.** Nothing in this plan modifies `app/src/`.

**The prototype — the source of truth for this plan.** `app/design/Harzer Wandernadel.dc.html`
(about 70 KB, 992 lines) is a self-contained interactive HTML mockup of all three screens. Its
JavaScript lives at the bottom of the file inside a `<script type="text/x-dc">` block, lines
648–988. `app/design/stand_alone_app.html` is a 1.1 MB self-contained build of the same prototype
with assets inlined; its embedded copy of the data is identical, so **read the smaller
`.dc.html` file** — it is the readable one. `app/design/screenshots/` holds fourteen PNG mockups
of the finished screens; the ones that matter here are `screen_rewards_v1.png`,
`screen_rewards_detailed_collection_view_open_v1.png`,
`screen_rewards_detailed_collection_view_done_v1.png`, `screen_map_filter_v1.png`,
`screen_map_v1.png`, and `screen_map_stamps_v1.png`.

**The precedent to follow.** `app/DESIGN.md` (about 21 KB) was produced by the same method this
plan uses: read the prototype, extract the implicit spec, write it down, mark what is unsettled.
Read it before writing — not for its colour values, but for its voice and structure. Two of its
conventions carry over verbatim and must be restated in `app/DATA.md`:

1. *Source file wins.* `app/DESIGN.md` says: "If a value here and one of those source files ever
   disagree, the source file wins — update this doc to match." `app/DATA.md` needs the same clause.
2. *An explicit "Open Questions — Not Yet Decided" section at the end*, which first lists what
   *is* settled (so readers stop relitigating it) and then what genuinely is not.

**Language conventions.** All documentation, commit messages, issues, and PRs are written in
English (`AGENTS.md`, Key Rule 2). Only in-app UI copy is German. So `app/DATA.md` is written in
English, but it will quote German domain terms — Stempelstelle, Stempel, Wandernadel, Kollektion,
gestempelt, offen — and should gloss each on first use.

**Terms used throughout this plan.**
*Station* / *Stempelstelle* — one physical stamp location. *Stempel* — the stamp itself, or by
extension the act of collecting one. *Collection* / *Kollektion* — a named themed group of
stations, e.g. "Harzer Hexenstieg". *Tier* / *Wandernadel* — a badge level earned at a stamp-count
threshold: Bronze, Silber, Gold, Wanderkönig, Wanderkaiser. *Visited* / *gestempelt* — the hiker
has collected this station's stamp. *Open* / *offen* — they have not.

**What this plan deliberately does not decide.** The on-device storage mechanism (SQLite, bundled
JSON, something else) and how official station data is authored, versioned, and shipped are both
listed as open questions in `ARCHITECTURE.md` and stay open. `AGENTS.md` explicitly requires
flagging to the developer before "introducing a data store (on-device or backend) or any
persistence layer" — writing a spec is not introducing one, but the executor must not drift into
choosing one. Likewise the map rendering library remains unchosen.

## Plan of Work

The work is four milestones, each producing a committable, separately reviewable change to
`app/DATA.md` (Milestone 4 also touches four other files). Milestone 1 is the **reference
milestone**: it establishes the section pattern that Milestones 2 and 3 reuse, so it is described
in full and they describe only their differences.

Before starting, read these in order: `ARCHITECTURE.md` (Product Overview and the Offline-First
invariant), `app/DESIGN.md` (whole file, for voice and for the tier metal-tone table), then
`app/design/Harzer Wandernadel.dc.html` lines 648–730 (the data constants) and 745–760 and
771–790 and 866–890 and 950–986 (how the data is consumed). The Artifacts and Notes section at the
end of this plan reproduces the constants you need, so you can work from this plan alone if
preferred — but reading the prototype yourself is how you will catch anything this plan missed,
and anything you catch belongs in Surprises & Discoveries.

### Milestone 1 (reference): create `app/DATA.md` with conventions and the Station model

**Scope.** Create the file `app/DATA.md` and write everything up to and including the Station
entity. At the end of this milestone a reader can open `app/DATA.md` and learn what a station is,
what identifies it, and which of its fields are trustworthy. Collections and badges are not
covered yet; the file should end with a short note saying those sections follow.

**Structure to write.** The file opens with a title (`# HWN Tracker — Domain Data Model`) and a
lead paragraph, mirroring how `app/DESIGN.md` opens. That paragraph must state four things:
what the document covers (the entities behind the Karte and Erfolge screens); that it is a spec,
not an implementation, and contains no TypeScript by design; where the source material lives
(`app/design/Harzer Wandernadel.dc.html`, `app/design/stand_alone_app.html`,
`app/design/screenshots/`); and the *source file wins* clause quoted in Context and Orientation
above — if this document and the prototype disagree, the prototype is right and this document
must be corrected.

Then a short **Status** note, in the same spirit as `app/DESIGN.md`'s: the app is at scaffold
stage, `app/src/models/` contains only a backend health-check type, and nothing described here is
implemented yet. This document defines the shapes that future Karte and Erfolge work should build
against — it is not describing existing code.

Then a **Conventions** section defining the three confidence markers, which every field table in
the document uses. Define them exactly like this, because Milestones 2 and 3 depend on the same
definitions:

    **Confirmed** — the field exists in the prototype's data and this document reproduces its
    meaning. The prototype line is cited.

    **Assumed** — the field does not exist in the prototype, but the real Harzer Wandernadel
    programme or the mockups imply it is needed. The reason is stated. Treat as a proposal, not
    a fact.

    **Missing** — the field is required for the MVP to function and is genuinely absent from all
    source material. Nobody has this data yet. Sourcing it is separate work.

The conventions section also states the naming rule: field names in this document are written in
`lowerCamelCase` English, even where the prototype used a German or abbreviated name, and where a
name was changed the prototype's original is given alongside it. Rationale to include: the
prototype's tuple positions (`nr`, `alt`, `vis`) are terse because they were hand-written demo
data, and a spec should not inherit that terseness — but a reader tracing a field back to the
prototype needs the old name to find it.

Then the **Station** section, following this pattern (this is the pattern Milestones 2 and 3
repeat):

*One-paragraph definition.* What the entity is in the real world, with its German name glossed.
For Station: a Stempelstelle is one physical location in the Harz holding a stamp box; the hiker
walks there and stamps their book.

*A field table* with columns: Field | Type | Confidence | Notes. Include at minimum the fields
below. Types are plain words — integer, text, boolean, date, list of integers — never TypeScript.

  - `number` (prototype `nr`) — integer, **Confirmed**. The official HWN station number, and the
    entity's identity. Note that it is *not* a dense sequence in the prototype: the 36 demo rows
    carry numbers 1, 2, 6, 9, 11, 14 … 101, so code must never treat a station number as an array
    index. Note also that `ARCHITECTURE.md` mentions special stations exist in the real programme
    alongside the numbered ones, so a station number may not always be a plain integer in the
    1–222 range; see the retirement and special-station note below.
  - `name` — text, **Confirmed**. E.g. "Kloster Walkenried", "Brocken".
  - `place` — text, **Confirmed**. The nearest town or trailhead, e.g. "Schierke". Used in the
    detail sheet as "{place}, {region}" and in the Erfolge "recent stamps" list.
  - `region` — text, **Confirmed**. One of seven values found in the prototype: Nordharz,
    Ostharz, Südharz, Westharz, Hochharz, Mittelharz, Vorharz. State that this is the set the
    prototype happens to use and that the model does not depend on it being closed. State also —
    explicitly, because the tier descriptions imply otherwise — that region is **display data
    only**: it appears in the detail sheet as "{place}, {region}" and nothing else reads it. There
    are no region-based rules anywhere in the model (see Milestone 3).
  - `altitude` (prototype `alt`) — integer, metres above sea level, **Confirmed**. Shown on the
    station detail sheet.
  - `visited` (prototype `vis`) — boolean, **Confirmed**. True when the hiker has stamped this
    station. Critically: record that the prototype's `isOpen` is *derived* (`isOpen = !visited`,
    prototype line 748) and must not be stored as a second independent field, because two
    independent booleans can contradict each other. Record also that this is hiker state, not
    station data — see the "Which data is shipped, which is the hiker's" note below. Note that
    visited/open is the *complete* state space today, and see the retirement note below for the
    one known reason that will change.
  - `stampedOn` (prototype `date`) — date, **Confirmed** as a concept but note the caveats: the
    prototype's value is fabricated (`DATES[(d++) % DATES.length] + '25'`, line 750), formatted
    `DD.MM.YY`, empty string when not visited, and carries no time-of-day. The station detail's
    "· 08:42" is hardcoded UI copy, not data. Recommend an absent value rather than an empty
    string when the station is not visited, and note that display formatting (German `DD.MM.YY`)
    is a presentation concern, not part of the stored shape.
  - `latitude` and `longitude` — decimal numbers, **Missing**. This is the single most important
    entry in the table. Explain plainly: the prototype's `x` and `y` are percentage offsets
    (roughly 10–95) for positioning a pin on a decorative fake map, not geographic coordinates —
    Brocken carries `48, 34` while its true position is about 51.80 N, 10.62 E. Real coordinates
    for all 222 stations are required before the Karte screen can do anything real, and nothing
    in this repository has them.

*A "Not part of the model" note.* Name the presentation-only values the prototype attaches to
stations and say where they belong instead: `short` (name truncated at 15 characters, line 749),
`rot` (a pseudo-random rotation making stamps look hand-pressed, line 751), and `x`/`y`
(fake-map placement). Point to `app/DESIGN.md` for stamp rendering.

*A "Retired and special stations — known, deferred" note.* Give this its own clearly titled
subsection rather than burying it in the field table, because it is the model's one deliberate
known gap and it must be findable by someone grepping for "retired". State three things. First,
retired stations are **real**: the Harzer Wandernadel programme retires stations, and
`ARCHITECTURE.md` already notes that special and retired/inactive stations exist. Second, they are
**not modelled here** — this is a deliberate deferral agreed with the domain owner, to be handled
in later work, not an oversight and not an open question awaiting an answer. Today a station is
visited or open, and that is the whole state space. Third, and most useful to whoever picks this
up: name the consequence in advance, which is that retirement interacts with the derived counts
from Milestone 2. Because every total is counted from the loaded data rather than stored, removing
a station from the all-stations collection shrinks the target of every all-members rule, whereas
keeping it with a retired flag does not. That difference decides whether a hiker who has already
earned Harzer Wanderkaiser still has it after a station retires — which is a product question, not
a technical one, and is exactly why it is being deferred rather than guessed at.

*A "Which data is shipped, which is the hiker's" note.* This distinction is not in the prototype —
it conflates them — but it matters enormously downstream, so state it here and mark it as an
inference of this document rather than a prototype fact. Number, name, place, region, altitude,
and coordinates are *official reference data*, identical for every user, shipped inside the app
build per the offline-first invariant in `ARCHITECTURE.md`. Whether a station is visited and when
it was stamped is *personal progress*, created on the device and, unlike the reference data, the
thing a future cross-device transfer feature would need to move. The storage decision in
`ARCHITECTURE.md`'s open questions applies to these two differently.

*A short evidence block* showing two or three representative prototype rows verbatim as an
indented block, with the tuple positions labelled, so a reader can verify the mapping without
opening the HTML. Label it clearly as prototype demo data that is not real.

**Acceptance.** `app/DATA.md` exists. Reading only that file, you can name a station's identity
field, say whether the app currently knows where any station physically is (no), and tell which
station fields would need to survive a phone upgrade (`visited`, `stampedOn`). Every row of the
Station field table carries exactly one of Confirmed / Assumed / Missing.

**Command to verify** (from the repository root, `/Users/ilja/Documents/Workspaces/hwn_tracker`):

    grep -c -E '\*\*(Confirmed|Assumed|Missing)\*\*' app/DATA.md

Expect a count of at least 10 — one per station field row plus the three definitions in
Conventions. Then read the file top to bottom once, out loud if that helps, checking that no
sentence assumes knowledge from the prototype that the file does not itself supply.

### Milestone 2: add the Collection model and many-to-many membership

**Scope.** Append the Collection section to `app/DATA.md`, following the Milestone 1 section
pattern exactly — definition paragraph, field table with confidence markers, "not part of the
model" note where relevant, evidence block. Only the instance-specific content differs, and it is
given below. This milestone covers the collection's *identity and membership*; its *completion
rule*, which is what makes a badge tier a collection too, is Milestone 3.

**What makes this section different.** Open it with the naming note from Surprises & Discoveries.
A reader who has seen the mockups will notice that the German word "Kollektion" labels two
apparently different lists — themed trails on the Karte filter sheet
(`screen_map_filter_v1.png`), badge tiers on Erfolge (`screen_rewards_v1.png`). State that this
document treats them as **one entity** and that Milestone 3's completion rule is the only thing
that distinguishes them. Cite both screenshots.

Fields to include:

  - `id` — stable identifier, **Assumed**. The prototype has none and looks collections up by
    display name (`COLLECTIONS.find(c => c[0] === collection)`, line 774), which breaks the moment
    a name is corrected or translated. Recommend a stable identifier; mark it as this document's
    proposal, not a prototype fact.
  - `name` — text, **Confirmed**. The display name, e.g. "Harzer Hexenstieg".
  - `description` — text, **Assumed** for themed collections, **Confirmed** for tiers, which carry
    a German `desc` (lines 715–726). Since both are the same entity, the field exists on all
    collections and is simply empty for the themed ones today.
  - Member stations — **Confirmed**, but described as a relationship rather than a field; see
    below.

Then the **membership** subsection, which is the heart of this milestone. State the cardinality
explicitly: a station belongs to **zero or more** collections and a collection contains **zero or
more** stations — a many-to-many relationship. Give the proof from the prototype's own data:
station 22 (Brocken) appears in both Harzer Hexenstieg and Brocken-Runde. Say plainly that this
contradicts the casual phrasing "a station belongs to a collection" used in `ARCHITECTURE.md` and
in issue #1, so that the next reader does not treat that phrasing as authoritative.

Document the consequence for the shape rather than leaving it implicit. The prototype stores
membership as an array hanging off the collection (`['Harzer Hexenstieg', [22,25,27,...]]`), which
answers "which stations are in this collection?" cheaply and "which collections is this station
in?" only by scanning every collection. The station detail sheet will need the second direction.
So describe membership as a relationship in its own right — conceptually a set of
(station, collection) pairs — and note that whether it is physically stored as an embedded list,
a join table, or both is a storage-layer decision deferred to `ARCHITECTURE.md`'s open question.
Membership references a station by its station number, which is that entity's identity.

Then the **dynamic-size rule**, stated once here and relied on for the rest of the document: no
count is ever stored. A collection's station count is derived by counting its members; the
programme's total is derived by counting the loaded stations. Cite the prototype's three hardcoded
`222` literals (lines 817, 868, and `req: 222` on line 724) as exactly what not to do. The model
must support an arbitrary number of stations and an arbitrary number of collections — nothing may
assume 222 stations, five tiers, or four themed collections.

Then a subsection on **"Alle Stempel" and the all-stations collection**, which is the trap in this
entity. In the prototype `COLLECTIONS[0]` is `[ALL_COLL, null]` — a pseudo-collection with a
`null` member list, a hardcoded displayed count of `222`, and a filter that reads `null` as "apply
no membership filter" (line 776). Untangle the two things it conflates. There is a genuine
collection containing every official station — the domain owner calls it **Harzer Wanderkaiser** —
and it is a real collection with real members, which Milestone 3 shows is the pool the other tiers
draw from. Separately there is the filter sheet's "show everything" affordance, which is UI state
meaning *no collection filter selected*, not a collection. Recommend modelling the first as an
ordinary collection and the second as the absence of a filter, and warn against the prototype's
null-member-list hybrid, which forces every consumer of the collection list into a special case.

Finally note that the filter is single-select ("COLLECTION · NUR EINE" in
`screen_map_filter_v1.png`). That is a constraint on the filtering UI, not on the data — the data
permits a station in any number of collections, and a future multi-select filter would need no
model change.

**Acceptance.** Reading only `app/DATA.md`, you can state the cardinality between stations and
collections (many-to-many) and name the station that proves it (22, Brocken, in two collections);
explain why a collection's station count is never stored; and explain the difference between the
Harzer Wanderkaiser collection and the filter sheet's "Alle Stempel" row.

### Milestone 3: add completion rules, and badge tiers as a kind of collection

**Scope.** Append the completion-rule section, again following the Milestone 1 pattern. This is
the section that unifies badge tiers with themed collections, and the one with the most inference
in it, so it carries the most Assumed and open-question content.

**The central idea to convey.** A collection is not complete merely when a hiker has visited its
members. Each collection carries a **completion rule** saying what earns it. Two rule kinds cover
everything known today, and the document should present them as two cases of one mechanism rather
than as two unrelated features:

*All members* — the hiker must visit every station in the collection. This is the themed-trail
case: Harzer Hexenstieg is earned by stamping all ten of its member stations.

*Any N of a source collection* — the hiker must visit any N stations drawn from another
collection's members, with no requirement about *which* ones. This is the badge-tier case, and it
is the domain owner's framing: Bronze means any 8 stations out of the **Harzer Wanderkaiser**
collection, where Harzer Wanderkaiser is the collection holding every official station. Silber,
Gold and Wanderkönig work the same way with different values of N.

Make the mechanism's generality explicit, because it is the payoff for unifying the two entities:
the source collection is *any* collection, not necessarily the all-stations one, so "any 5 of the
Harzer Hexenstieg" is expressible today without inventing anything. And note the pleasing
consistency check — Harzer Wanderkaiser is "all 222 of the all-stations collection", so it can be
written either as an all-members rule over itself or as any-N over itself with N equal to its own
size. Recommend the all-members form and explain why: it needs no number, so it cannot fall out of
step when stations are added or retired.

State the field that carries this: a `completionRule` on every collection, **Assumed** — the
prototype has no such field, since it hardcodes the distinction by keeping tiers in a separate
`NEEDLES` array. The rule needs a kind (all members or any N), and for the any-N kind a required
count and a reference to the source collection.

Today's five tiers and their required counts are reproduced below because they are the shape being
specified. Introduce the table with an explicit warning that this is **today's data, not a closed
enumeration** — the model must not hardcode five tiers, and a sixth tier is a data change, not a
code change:

| Collection | Rule | Source collection | Prototype origin |
|---|---|---|---|
| Bronze | any 8 | Harzer Wanderkaiser | `NEEDLES[0].req` |
| Silber | any 16 | Harzer Wanderkaiser | `NEEDLES[1].req` |
| Gold | any 24 | Harzer Wanderkaiser | `NEEDLES[2].req` |
| Wanderkönig | any 50 | Harzer Wanderkaiser | `NEEDLES[3].req` |
| Harzer Wanderkaiser | all members | — | `NEEDLES[4].req` = 222 |

Note in the table's caption that the prototype writes Wanderkaiser's requirement as the literal
`222` and that the model replaces that literal with an all-members rule, per the no-fixed-
cardinality decision.

Additional fields on a collection that only the tier-shaped ones use today:

  - `earnedOn` (prototype `date`) — date, **Confirmed** as a concept, absent when not yet earned
    (`null` in the prototype). Format `DD.MM.YYYY` — note that this differs from the station stamp
    date's `DD.MM.YY`, an inconsistency in the prototype worth flagging. Being hiker progress
    rather than reference data, it belongs to the same category as a station's `visited` flag —
    cross-reference Milestone 1's "which data is shipped, which is the hiker's" note.

Then a subsection making explicit which values are **derived, not stored** — this is the section's
main practical contribution, because the prototype hardcodes all of them:

  - progress is a count of the hiker's visited stations within the rule's pool: the collection's
    own members for an all-members rule, the source collection's members for an any-N rule. The
    prototype hardcodes `have: 46` on all five entries even though its own station list contains
    only 19 visited of 36, which proves these are mock literals;
  - the target is the collection's member count for an all-members rule, or N for an any-N rule —
    counted, never stored;
  - earned state is progress ≥ target;
  - remaining count is target minus progress, floored at zero (line 953);
  - the percentage on the detail sheet is progress capped at the target, divided by the target
    (line 952) — the cap matters, or an over-achieving hiker sees 400%;
  - the status label is `"{remaining} offen"` while in progress and `"Ziel erreicht am {date}"`
    once earned. Cross-reference `app/DESIGN.md`, which already settled this copy and warns that
    any UI text saying "verliehen" is stale.

Point out that this list is written once and applies to every collection regardless of rule kind —
which is the concrete benefit of the unified model, and worth stating so a future contributor does
not reintroduce a parallel code path for badges.

Then a short but prominent **"the region sentences are flavour text"** note. The Silber
description says sixteen stamps spread over at least two regions, and the Wanderkönig description
says Hochharz, Ostharz and Südharz must all be represented. Both read like specifications and
neither is one: no field encodes them, no prototype code enforces them, and the domain owner has
confirmed the programme has no region rules. State this as **settled**, not as an open question.
Spell out the consequence so nobody re-opens it: an any-N rule is a plain count, progress is a
single number, and no rule anywhere in the model reads a station's region. The note exists purely
to stop a contributor implementing the description text as a constraint — which is a realistic
mistake, since the descriptions are the most prominent German prose in the whole dataset.

Finally a one-line pointer that per-tier metal and ring colours (`metal`, `ring` in `NEEDLES`) are
presentation, already mapped to design tokens in `app/DESIGN.md`'s "Collection/badge card" table,
and deliberately not repeated here.

**Acceptance.** Reading only `app/DATA.md`, you can state what Bronze requires (any 8 stations
from the Harzer Wanderkaiser collection) without the word "tier" needing a separate entity;
compute what Erfolge shows for a hiker with 46 stamps against Wanderkönig ("Noch 4 Stempel", 92%);
explain how a sixth badge would be added (as data, with an any-N rule); and answer "do the Silber
and Wanderkönig descriptions impose region requirements?" with a clear no.

### Milestone 4: relationships, worked example, open questions, and discoverability

**Scope.** Finish the document and make it findable. This milestone satisfies acceptance criterion
three of issue #1 — that the doc "is discoverable as the reference for any future Karte or Erfolge
story".

First, add an **Entity relationships** section to `app/DATA.md` — prose plus a small indented
diagram, not a formal ERD. There are only two entities, Station and Collection, and three
relationships between them. Stations and collections are many-to-many through membership, keyed by
station number. A collection may reference another collection as the source pool of an any-N
completion rule, which is a collection-to-collection relationship — note that it is acyclic in
practice and that the all-stations collection is the root every tier points at. And the hiker's
progress is not a stored relationship at all: it is derived by intersecting the set of visited
stations with a rule's pool.

Say explicitly that issue #1's framing — three entities, with "a collection's progress feeding
into a badge/tier" — did not survive contact with the domain. Badges are not fed by themed
collections; a badge *is* a collection with an any-N rule over the all-stations collection. Record
this so the next reader does not re-derive it, and so the issue's wording is not mistaken for the
authoritative model.

Second, add a **Worked example** — one short walkthrough tying everything together, so the model
can be checked against reality. Use the prototype's own numbers: a hiker has stamped 46 of 222
stations; Erfolge therefore shows Bronze, Silber and Gold as earned with dates, Wanderkönig at
46/50 with "Noch 4 Stempel" and 92%, Wanderkaiser at 46/222 with "176 offen"; the header shows
46/222; the Kollektionen counter shows "3 von 5". Every one of those figures is visible in
`app/design/screenshots/screen_rewards_v1.png`, so the reader can check the model against the
mockup directly.

Third, add **Open Questions — Not Yet Decided**, structured like `app/DESIGN.md`'s, in three
groups rather than two — the middle group is what makes it useful.

*Settled, do not relitigate:* there are two entities and badges are collections with completion
rules; station-to-collection membership is many-to-many; station identity is the official station
number; no cardinality is fixed and every count is derived; and there are **no region rules** —
the region sentences in the tier descriptions are flavour text.

*Known and deliberately deferred:* retired and special stations. Say that they demonstrably exist,
that handling them is planned later work rather than an unanswered question, and restate the
consequence from the Station section — that the choice between removing a retired station and
flagging it changes every derived total and therefore whether an earned badge stays earned. This
group exists so a reader can tell "we know about this and chose to wait" apart from "nobody has
thought about this", which a single Open Questions list cannot express.

*Genuinely open:* where real station coordinates come from; whether themed collections ever have
completion rules other than all-members; whether the real programme has more than four themed
collections and where their definitions come from; and — explicitly deferred with a pointer to
`ARCHITECTURE.md`'s open-questions list rather than an answer — the on-device storage mechanism
and the authoring/versioning pipeline for this dataset.

Fourth, add the cross-links. Four files, one small edit each:

  - `ARCHITECTURE.md` — in the "On-device data storage" open-question bullet, note that the shape
    of the dataset is now specified in `app/DATA.md` and that the storage decision should be made
    against it. This directly answers issue #1's motivation, which says the model should give that
    open question "something concrete to be decided against".
  - `AGENTS.md` — add `app/DATA.md` to the "Domain Guides" list with a one-line description, e.g.
    "[Data Model](./app/DATA.md) — stations, collections, badge tiers".
  - `docs/app.md` — in the "Structure" list, extend the `src/models/` line, which currently reads
    "TypeScript interfaces for backend payloads", to point at `app/DATA.md` as the spec for
    domain entities.
  - `app/DESIGN.md` — in its opening paragraph, where it lists the design source material, add a
    sentence pointing to `app/DATA.md` as the companion document covering *what* the data is,
    while DESIGN.md covers how it looks. Keep it to one sentence; do not restructure that file.

**Acceptance.** From the repository root, `grep -rn "DATA.md" ARCHITECTURE.md AGENTS.md docs/app.md
app/DESIGN.md` returns at least four hits, one per file. Every relative link resolves — check by
opening each in a Markdown previewer or by confirming the target path exists from the linking
file's directory (note that links inside `app/DESIGN.md` and `app/DATA.md` need `../` to reach
root-level files, while links inside root-level files need `./app/`). Reading `app/DATA.md` alone,
you can reproduce every number visible in `screen_rewards_v1.png`.

## Concrete Steps

All commands run from the repository root,
`/Users/ilja/Documents/Workspaces/hwn_tracker`, unless stated otherwise.

Establish the baseline first, so that if anything later looks broken you know it was not this
work. Two test suites exist and they are separate, because `app/` is not an npm workspace:

    npm test
    cd app && npm test

Expected transcript, abbreviated — the root command runs the backend and infrastructure suites in
turn, each reporting one passing test, and the app command reports one passing Jest test:

    Test Files  1 passed (1)
         Tests  1 passed (1)
    ...
    Test Files  1 passed (1)
         Tests  1 passed (1)
    ...
    Test Suites: 1 passed, 1 total
    Tests:       1 passed, 1 total

Read the source material:

    wc -l "app/design/Harzer Wandernadel.dc.html"
    sed -n '648,730p' "app/design/Harzer Wandernadel.dc.html"

The `sed` range prints the whole block of data constants — `S` (stations), `DATES`, `COLLECTIONS`,
`LOTS`, `HUTS`, `NEEDLES` and friends. Then read how they are consumed:

    sed -n '745,760p;771,790p;866,890p;950,986p' "app/design/Harzer Wandernadel.dc.html"

Confirm the station counts independently rather than trusting this plan:

    python3 - <<'PY'
    import re
    p = "app/design/Harzer Wandernadel.dc.html"
    d = open(p, encoding="utf-8").read()
    block = d[d.find("const S = ["):d.find("const DATES")]
    rows = re.findall(r"\[(\d+),(.*?)\],", block)
    visited = [r for r in rows if r[1].split(",")[4].strip() == "1"]
    print("stations", len(rows), "visited", len(visited), "open", len(rows) - len(visited))
    PY

Expected output:

    stations 36 visited 19 open 17

Then write `app/DATA.md` milestone by milestone. After each milestone, re-read the file top to
bottom and commit. Use this repository's `git-commit` skill for the commit itself; commit messages
follow Conventional Commits and are written in English. Stage the updated ExecPlan together with
the documentation change in the same commit — never in a follow-up commit — so the plan and the
work it describes never disagree in history:

    git add app/DATA.md docs/exec-plans/active/1_core_domain_data_model.md
    git status --short

Expected:

    A  app/DATA.md
    M  docs/exec-plans/active/1_core_domain_data_model.md

After Milestone 4, verify discoverability:

    grep -rn "DATA.md" ARCHITECTURE.md AGENTS.md docs/app.md app/DESIGN.md
    grep -c -E '\*\*(Confirmed|Assumed|Missing)\*\*' app/DATA.md

Expect at least four lines from the first command (one per file) and a count of at least 20 from
the second once all three entity tables are present.

Finally, re-run both test suites to confirm nothing changed, write Outcomes & Retrospective in
this plan, and move it:

    git mv docs/exec-plans/active/1_core_domain_data_model.md docs/exec-plans/completed/

## Validation and Acceptance

**Baseline.** Captured on 2026-08-20 before any change, on branch `main` at commit `72e843a`,
with a clean working tree. The project has two independent test entrypoints and both were run in
full — no subset.

`npm test` at the repository root runs the `backend` and `infrastructure` workspace suites in
sequence. Result: backend, 1 test file, 1 test, passed; infrastructure, 1 test file
(`test/backend-stack.test.ts`), 1 test, passed. Total 2 passed, 0 failed, 0 skipped.

`npm test` inside `app/` runs Jest. Result: 1 test suite (`__tests__/App.test.tsx`), 1 test
("renders correctly"), passed. Total 1 passed, 0 failed.

There are **no pre-existing failures**. Two non-fatal warnings appear and are expected, not
caused by this work: infrastructure's run prints "The CJS build of Vite's Node API is deprecated"
and an esbuild bundle-size warning while CDK bundles the Lambda asset.

**Acceptance.** This change adds no code, so the test suites are a regression guard only: after
every milestone, `npm test` at the root and `npm test` inside `app/` must still report 2 passed
and 1 passed respectively, unchanged from the baseline. A change to these numbers means something
outside this plan's scope was touched.

The real acceptance is behavioural and is checked by reading. Open `app/DATA.md` with no other
file open and answer these questions; each must be answerable from the document alone:

Which field identifies a station, and why can it not be used as an array index? (The official
station number; the prototype's own demo rows are numbered 1, 2, 6, 9, 11 … 101, so the sequence
has gaps.) Does the app know where any station physically is? (No — latitude and longitude are
marked Missing; the prototype's `x`/`y` are fake-map percentages.) What is the cardinality between
stations and collections, and which station proves it? (Many-to-many; station 22, Brocken, is in
both Harzer Hexenstieg and Brocken-Runde.) What does Bronze require? (Any 8 stations from the
Harzer Wanderkaiser collection — it is a collection with an any-N completion rule, not a separate
kind of thing.) What is "Alle Stempel" on the filter sheet? (The absence of a collection filter —
distinct from the Harzer Wanderkaiser collection, which is a real collection of every station.)
How would a sixth badge be added? (As data: a new collection with an any-N rule. No code change,
because nothing fixes the number of collections.) Where is the total station count stored?
(Nowhere — it is derived by counting the loaded stations; the model supports any number.) What
does a hiker with 46 stamps see for Wanderkönig? ("Noch 4 Stempel" and 92%.) Do the Silber and
Wanderkönig descriptions impose region requirements? (No — flavour text; there are no region rules
and nothing reads a station's region except the detail sheet's display.) Are retired stations
handled? (No, and deliberately so — they exist, they are known, and they are planned later work.)
Which station fields are the hiker's own data rather than shipped reference data? (`visited` and
`stampedOn`.)

Then check the mechanical properties. Every row of every field table carries exactly one of
**Confirmed**, **Assumed**, or **Missing** — no unmarked rows, no other words. The document
contains no TypeScript `interface` or `type` keyword, per the Out of Scope constraint in issue #1:

    grep -n -E '^\s*(export )?(interface|type) ' app/DATA.md

Expect no output. And `grep -rn "DATA.md" ARCHITECTURE.md AGENTS.md docs/app.md app/DESIGN.md`
returns at least one hit in each of the four files.

Finally, cross-check against the mockup: open
`app/design/screenshots/screen_rewards_v1.png` next to the document's Worked example section.
Every number on that screen — 46/222, "3 von 5", 8/16/24/50 Stempel, "4 offen", "176 offen" —
must be either present in or derivable from the document.

## Idempotence and Recovery

Every step is safe to repeat. The only new file is `app/DATA.md`; re-running a milestone means
rewriting a section of it, which is harmless. The four cross-link edits in Milestone 4 are
one-line insertions — if applied twice you get a duplicate line, which
`grep -rn "DATA.md" ARCHITECTURE.md AGENTS.md docs/app.md app/DESIGN.md` will reveal as more than
one hit in the same file; delete the extra.

Nothing here touches `app/src/`, `backend/`, `infrastructure/`, or any AWS resource, so there is
no deploy or migration to roll back. `AGENTS.md` forbids running `cdk deploy` under any
circumstances and this plan never needs it. To abandon the work entirely at any point:

    git checkout -- ARCHITECTURE.md AGENTS.md docs/app.md app/DESIGN.md
    rm -f app/DATA.md

The one genuinely irreversible-feeling risk is subtler: writing something into `app/DATA.md` as
fact when the prototype does not actually support it, which would then be trusted by every future
story. Guard against it by citing a prototype line number for every **Confirmed** row. If you
cannot cite a line, the row is **Assumed** or **Missing** — downgrade it rather than reasoning
your way to confidence.

## Artifacts and Notes

The prototype's data constants, reproduced here so this plan is usable without opening the HTML.
All from `app/design/Harzer Wandernadel.dc.html`.

Station tuples, lines 648–685 — 36 rows, of which three are shown. The positional schema is
`[nr, name, place, region, alt, vis, x, y]`, where `vis` is 1 for visited and 0 for open, and
`x`/`y` are fake-map percentage offsets, **not** geographic coordinates:

    const S = [
      [1,'Kloster Walkenried','Walkenried','Südharz',230,1,18,88],
      [22,'Brocken','Schierke','Hochharz',1141,1,48,34],
      [41,'Hexentanzplatz','Thale','Ostharz',454,1,80,44],
      ...
    ];

How stations are derived for rendering, lines 745–753 — note `isOpen: !vis`, the fabricated date,
and the presentation-only `short` and `rot`:

    stations() {
      let d = 0;
      return S.map(([nr,name,place,region,alt,vis,x,y],i) => ({
        nr, name, place, region, alt, visited: !!vis, isOpen: !vis,
        short: name.length > 15 ? name.slice(0,14) + '.' : name,
        date: vis ? (DATES[(d++) % DATES.length] + '25') : '',
        rot: ([-7,-3,4,8,-5,2,6,-2][i % 8] * (0.25 + this.wear() * 1.5)).toFixed(1), x, y,
      }));
    }

Collections, lines 694–701 — the first entry is the sentinel, whose member list is `null`:

    const ALL_COLL = 'Alle Stempel';
    const COLLECTIONS = [
      [ALL_COLL, null],
      ['Harzer Hexenstieg', [22,25,27,30,33,59,62,89,92,101]],
      ['Brocken-Runde', [22,25,33,35,92,95,98]],
      ['Selketal-Tour', [14,41,44,47,53,56]],
      ['Welterbe & Bergbau', [1,11,68,71,80,83]],
    ];

Badge tiers, lines 715–726, complete — German descriptions abbreviated here, but reproduce them in
full in `app/DATA.md`, since the Silber and Wanderkönig ones carry the unconfirmed region rules:

    const NEEDLES = [
      { tier:'Bronze', req:8, have:8, done:1, status:'ziel erreicht', date:'02.05.2025',
        metal:'#b2622d', ring:'#ffc6a5', desc:'Die erste Stufe: acht beliebige …' },
      { tier:'Silber', req:16, have:16, done:1, status:'ziel erreicht', date:'19.06.2025',
        metal:'#a19786', ring:'#dcd3c4',
        desc:'Sechzehn Stempel, verteilt über mindestens zwei Regionen. …' },
      { tier:'Gold', req:24, have:24, done:1, status:'ziel erreicht', date:'30.07.2025',
        metal:'#d67f48', ring:'#ffe1d0', desc:'Vierundzwanzig Stempel — …' },
      { tier:'Wanderkönig', req:50, have:46, done:0, status:'4 offen', date:null,
        metal:'#728157', ring:'#e1eecc',
        desc:'Fünfzig Stempelstellen. … Hochharz, Ostharz und Südharz müssen alle vertreten sein.' },
      { tier:'Wanderkaiser', req:222, have:46, done:0, status:'176 offen', date:null,
        metal:'#3d472b', ring:'#ccdbb2', desc:'Alle 222 Stempelstellen … Rund 2.000 Wanderkilometer.' },
    ];

Filtering, lines 774–777 — shows that a `null` member list means "no membership filter", and that
`needleSet` is a temporary UI state used by the fabricated tier→stations jump, not stored data:

    const set = (COLLECTIONS.find(c => c[0] === collection) || [])[1];
    const f = st.filter(s => (filter === 'alle' || (filter === 'besucht' ? s.visited : s.isOpen))
      && (!set || set.indexOf(s.nr) > -1)
      && (!needleSet || needleSet.indexOf(s.nr) > -1));

Tier progress derivations, lines 952–957 — every one of these is a computation over `req` and
`have`, which is the evidence that progress is derived rather than stored:

    ndReq: N.req, ndHave: Math.min(N.have, N.req),
    ndPct: Math.round(Math.min(N.have, N.req) / N.req * 100) + '%',
    ndDone: !!N.done, ndOpen: !N.done, ndLeft: Math.max(0, N.req - N.have),
    ndStatus: N.done ? ('Ziel erreicht am ' + N.date) : ('Noch ' + Math.max(0, N.req - N.have) + ' Stempel'),

The fabricated tier membership, lines 959–961 — demo scaffolding that must not be copied:

    if (N.done) {
      const belong = st.filter(s => s.visited).slice(0, Math.min(N.req, N.have)).map(s => s.nr);
      this.setState({ sheet:null, tab:'karte', view:'karte', filter:'besucht',
                      collection:N.tier, needleSet:belong });
    }

## Interfaces and Dependencies

No libraries, packages, services, or runtime dependencies are added or changed. Nothing is
installed. `app/package.json`, the root `package.json`, and both lockfiles must be untouched at
the end of this work — if `git status` shows either lockfile modified, something went wrong.

The "interface" this plan delivers is a set of stable Markdown heading anchors in `app/DATA.md`
that future Karte and Erfolge stories will link to. Keep these exact headings, spelled exactly as
below, because renaming one later breaks inbound links from issues and from the four files edited
in Milestone 4:

    # HWN Tracker — Domain Data Model
    ## Conventions
    ## Station
    ## Collection
    ### Membership
    ## Completion Rules and Badges
    ## Entity Relationships
    ## Worked Example
    ## Open Questions — Not Yet Decided

The files this plan is allowed to touch, and nothing else: `app/DATA.md` (new), `ARCHITECTURE.md`,
`AGENTS.md`, `docs/app.md`, `app/DESIGN.md` (one-line edits each), and this plan file itself.
`app/design/Harzer Wandernadel.dc.html` and `app/design/stand_alone_app.html` are read-only source
material — they are a snapshot of an external design tool's output and must never be edited to
match the documentation. If they disagree with `app/DATA.md`, the prototype is right.
