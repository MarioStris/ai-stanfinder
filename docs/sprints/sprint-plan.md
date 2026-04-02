# Sprint Plan — AI StanFinder MVP
**Datum**: 01.04.2026
**Agent**: Engineering Manager
**Status**: Faza 4 — Sprint planiranje
**Dependency**: CTO arhitektura (F3), CPO product definicija (F2), Solution Architect (F3)

---

## Pregled

### Tim i kapacitet

| Uloga | FTE | Sati/dan | Sati/sprint (10 radnih dana) | Efektivni kapacitet (80%) |
|-------|-----|----------|------------------------------|---------------------------|
| Senior Full-Stack Dev | 1.0 | 8h | 80h | 64h |
| Junior Dev | 1.0 | 6h | 60h | 48h |
| Dizajner | 0.5 | 4h | 40h | 32h |
| **UKUPNO** | | | **180h** | **144h/sprint** |

> Kapacitet 80% = 20% buffer za code review, deploje, bugfixeve, koordinaciju i neplanirane zadatke.

### MVP scope
Must Have (M1-M11): registracija, filteri, AI matching, TOP 10 lista, AI komentari, detalji oglasa, push notifikacije, Apify CSV ingest, Grok API engine, FREE/PREMIUM gating, postavke/profil + GDPR.

### Pregled sprintova

| Sprint | Teme | Trajanje | Kumulativno |
|--------|------|----------|-------------|
| Sprint 1 | Infrastruktura, monorepo, auth, DB setup | 2 tjedna | T+2 tj |
| Sprint 2 | Scraping ingest, core API, filter modul | 2 tjedna | T+4 tj |
| Sprint 3 | AI matching engine, Grok API, caching | 2 tjedna | T+6 tj |
| Sprint 4 | Mobile app — auth, filteri, match lista, detalji | 2 tjedna | T+8 tj |
| Sprint 5 | Push notifikacije, billing, PREMIUM gating, GDPR | 2 tjedna | T+10 tj |

**Ukupno trajanje MVP-a**: 10 tjedana (2.5 mjeseca)
**Procijenjeni launch**: kraj lipnja 2026 (uz start 01.04.2026 + 2 tjedna rezerve za App Store review)

---

## Sprint 1 — Infrastruktura i temelji

**Trajanje**: 01.04. – 14.04.2026
**Sprint goal**: Monorepo podignut, CI/CD funkcionalan, baza definirana, auth integriran — tim može kodirat bez blokatora.

### Taskovi

#### Backend / Infrastruktura

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S1-B01 | Monorepo setup (pnpm + Turborepo) s workspace konfiguracijama za `apps/api`, `apps/mobile`, `packages/shared-types` | Senior | 8 | `pnpm install` radi; `turbo build` prolazi; shared-types paket dostupan u oba projekta | 5 |
| S1-B02 | Hono API projekt scaffolding: folder struktura `/modules/`, middleware (CORS, rate-limit, error handler), health check `/api/health` | Senior | 6 | `GET /api/health` vraca `{ status: "ok" }`; request logiranje radi; TypeScript strict mode prolazi | 3 |
| S1-B03 | PostgreSQL schema — Prisma migracije za entitete: `User`, `Filter`, `Listing`, `MatchResult`, `Favorite`, `Subscription`, `ApiUsageLog` | Senior | 10 | `prisma migrate dev` prolazi; svi indeksi definirani; seed skript s 10 test listinga radi | 8 |
| S1-B04 | Clerk webhook handler: `user.created`, `user.deleted` eventi sinkroniziraju lokalnu `User` tablicu | Junior | 6 | Webhook prima Clerk event, upisuje/brise korisnika u PostgreSQL; Svix signature verifikacija prolazi | 3 |
| S1-B05 | GitHub Actions CI pipeline: lint (ESLint), type-check, unit test, Railway deploy na `staging` branch push | Senior | 8 | PR na `main` pokrece pipeline; deploy na Railway staging je automatski u < 5 min; neuspjeli test blokira merge | 5 |
| S1-B06 | Railway okruzenja: staging + production konfiguracija, environment varijable, Railway managed PostgreSQL i Upstash Redis setup | Junior | 4 | Oba okruzenja imaju zasebne DB instance; `.env.example` dokumentiran; secrets su u Railway env, ne u kodu | 2 |
| S1-B07 | Vitest setup: testni runner, `@testcontainers/postgresql` za integration testove, primjer unit testa za health check modul | Junior | 6 | `pnpm test` radi; 1 unit test + 1 integration test prolaze; coverage report generiran | 3 |

**Backend ukupno**: 48h (Senior: 32h / Junior: 16h)

#### Dizajn

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S1-D01 | Design system u Figmi: boje, tipografija, spacing, ikone, primarne komponente (Button, Input, Card, Badge) | Dizajner | 16 | Figma file s auto-layout komponentama; sve varijante (primary/secondary/disabled); exportable assets | 8 |
| S1-D02 | Wireframes — Auth ekrani: Landing/Demo, Register, Login, Onboarding (filter setup) | Dizajner | 8 | 4 ekrana u Figmi na mobilnoj razlucivosti (375x812); annotacije za AC; Developer handoff spreman | 5 |

**Dizajn ukupno**: 24h

**Sprint 1 ukupno**: 72h od 144h kapaciteta (50% — namjerno nizak udio jer setup nosi skrivenu kompleksnost)

### Dependencies Sprint 1
- Nema eksternih dependencija — ovo je nulti sprint
- S1-B03 mora biti gotov PRIJE S1-B04 (Clerk webhook treba `User` tablicu)
- S1-B06 mora biti gotov PRIJE S1-B05 (CI pipeline treba Railway okruzenja)
- S1-D01 mora biti gotov PRIJE S1-D02 (wireframes koriste design system)

### Sprint 1 rizici
- Railway onboarding i billing setup moze kasniti 1-2 dana — mitigacija: pokreni odmah prvog dana
- Clerk free tier limit provjeri kompatibilnost s Expo SDK — validirati u S1-B04

---

## Sprint 2 — Podaci i core API

**Trajanje**: 15.04. – 28.04.2026
**Sprint goal**: Apify ingest prima CSV podatke, BullMQ worker procesira oglase, i korisnik se moze registrirati te kreirati filter — end-to-end bez AI matchinga.

### Taskovi

#### Backend

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S2-B01 | `scraping` modul: `POST /api/v1/ingest` endpoint prima multipart CSV (stanovi, kuce, zemljista), validira API key, enqueue-a job na `scraping:ingest` queue | Senior | 10 | Endpoint prima CSV datoteku; odbija nevalidan API key (401); enqueue-a BullMQ job; vraca `202 Accepted` | 5 |
| S2-B02 | Ingest worker: parsira CSV (papaparse), deduplikacija po `externalId` (SHA-256 hash), upsert u `Listing` tablicu, oznacava neaktivne oglase | Senior | 12 | 1.000 redaka CSV procesira se bez gresaka; duplikati se ne upisuju; promjena cijene azurira postojeci listing; neaktivni oglasi imaju `isActive: false` | 8 |
| S2-B03 | `listings` modul: `GET /api/v1/listings` s filterima (grad, cijena, m², tip), paginacija, sortiranje | Junior | 8 | Upiti vracaju korektne rezultate za sve kombinacije filtera; paginacija radi (cursor-based); response < 500ms na 10k redova | 5 |
| S2-B04 | `auth` modul: middleware za Clerk JWT verifikaciju na zasticenim rutama; `GET /api/v1/me` vraca korisnicki profil s tier statusom | Junior | 6 | Zahtjevi bez valjanog JWT dobivaju 401; `/me` vraca `{ id, email, tier, createdAt }`; unit testovi prolaze | 3 |
| S2-B05 | `listings` modul — filter CRUD: `POST/GET/PUT/DELETE /api/v1/filters`; validacija Zod schema; FREE limit (max 1 filter) | Senior | 8 | FREE korisnik dobiva 429 na drugi filter; PREMIUM nema limita; filteri su vezani uz korisnika; svi CRUD scenariji imaju testove | 5 |
| S2-B06 | BullMQ setup: Worker process, Redis konekcija, retry s exponential backoff (3 pokusaja), dead letter queue, job monitoring endpoint `/api/v1/admin/queues` | Junior | 8 | Failed job se retry-a 3x; after 3 neuspjeha ide u DLQ; admin endpoint prikazuje queue status; Redis AOF persistence ukljucen | 5 |
| S2-B07 | Integration testovi za ingest pipeline: testni CSV fixtures, mock Redis, assert na DB stanje nakon procesiranja | Junior | 6 | Testovi pokrivaju: happy path, duplikat, nevalidan CSV, Redis nedostupan (graceful degradation) | 3 |

**Backend ukupno**: 58h (Senior: 30h / Junior: 28h)

#### Mobile

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S2-M01 | Expo projekt scaffolding: React Native s Expo Router (file-based routing), NativeWind (Tailwind za RN), TypeScript strict, Sentry SDK | Junior | 8 | App se pokrece na iOS i Android simulatoru; navigacija s 3 placeholder ekrana radi; Sentry event se salje na test error | 5 |
| S2-M02 | Shared types paket (`packages/shared-types`): TypeScript interfejsi za `Listing`, `Filter`, `MatchResult`, `User`, API response omotaci | Junior | 4 | Paket se importira u oba `apps/api` i `apps/mobile`; TypeScript build bez gresaka; verzioniranje u `package.json` | 2 |

**Mobile ukupno**: 12h (Junior: 12h)

#### Dizajn

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S2-D01 | Wireframes — Filter ekran, TOP 10 lista (loading/empty/filled stanje), detalji oglasa | Dizajner | 16 | 5 ekrana u Figmi; sva stanja pokrivena; handoff sa spacing vrijednostima | 8 |

**Dizajn ukupno**: 16h

**Sprint 2 ukupno**: 86h od 144h kapaciteta (60%)

### Dependencies Sprint 2
- S2-B01 ovisi o S1-B03 (Listing schema mora postojati)
- S2-B06 ovisi o S1-B06 (Redis konekcija mora biti konfigurirana)
- S2-B04 ovisi o S1-B04 (Clerk korisnici moraju biti u lokalnoj bazi)
- S2-M01 moze poceti paralelno s backend taskovima

---

## Sprint 3 — AI Matching Engine

**Trajanje**: 29.04. – 12.05.2026
**Sprint goal**: Grok API matching engine radi end-to-end — unos filtera → TOP 10 lista s postotcima i AI komentarima, s cachingom i cost trackingom.

### Taskovi

#### Backend

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S3-B01 | `matching` modul — Grok API klijent: HTTP wrapper oko xAI API-ja, prompt template za matching, parsiranje structured JSON response-a | Senior | 12 | API poziv vraca `[{ listingId, score: 0-100, comment: string }]` u < 10s; retry na 429/503; unit test s mock API-jem | 8 |
| S3-B02 | Prompt engineering: optimizacija match prompta za HR nekretnine — kombinirani strukturirani filteri + semanticki upit → rangirani TOP 10 | Senior | 10 | Prompt vraca konzistentne rezultate na 20 testnih scenarija; score korelira s ocekivanom relevantnoscu; AI komentar je na hrvatskom | 8 |
| S3-B03 | Matching worker: BullMQ consumer za `matching:run` queue, procesira korisnike u batchevima (concurrency: 10), sprema `MatchResult` u PostgreSQL | Senior | 10 | 100 korisnika procesira se u < 2 min; MatchResult je upisana u DB; failed job ide u DLQ s error logom | 8 |
| S3-B04 | Redis caching za matching: `match:{filterId}:{dataVersion}` kljuc, TTL 15min (PREMIUM) / 12h (FREE), invalidacija na novom ingest ciklusu | Junior | 8 | Cache hit rate > 60% na testu s 50 korisnika s identicnim filterima; Grok API se NE poziva na cache hit; TTL je korektan po tieru | 5 |
| S3-B05 | Grok API cost tracking: logging u `ApiUsageLog`, rate limiting (max 50 poziva/korisnik/dan), alert ako trosak > €0.50/korisnik/mj | Junior | 8 | Svaki API poziv je loggiran; korisnik s > 50 poziva dobiva 429; Sentry alert okida na threshold | 5 |
| S3-B06 | Scheduler setup: BullMQ repeatable jobs — FREE tier `0 8,18 * * *` (2x/dan), PREMIUM tier svaki 15min; scheduler se registrira na app startup | Junior | 6 | FREE korisnici se matchaju u 08:00 i 18:00; PREMIUM svakih 15min (provjeriti s integration testom); scheduler je idempotent na restart | 5 |
| S3-B07 | `GET /api/v1/matches` endpoint: vraca TOP 10 (PREMIUM) ili TOP 5 (FREE) za aktivni filter; koristi Redis cache, fallback na DB | Senior | 8 | FREE dobiva max 5 rezultata; PREMIUM dobiva max 10; cached odgovor je u < 100ms; fallback na DB radi ako Redis nije dostupan | 5 |
| S3-B08 | Integration testovi za matching pipeline: fixture listings u DB, mock Grok API, assert na MatchResult i cache stanje | Junior | 6 | End-to-end test: filter → matching → MatchResult u DB → GET /matches vraca korektan response | 5 |

**Backend ukupno**: 68h (Senior: 40h / Junior: 28h)

#### Dizajn

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S3-D01 | Wireframes — Premium upgrade ekran (paywall), settings ekran, profil ekran | Dizajner | 12 | 3 ekrana u Figmi; paywall jasno komunicira FREE vs PREMIUM razliku; handoff s animacijama | 5 |
| S3-D02 | UX revizija filter + lista ekrana temeljem S2-D01 feedback-a; prilagodbe za edge case-ove (prazna lista, greska, loading) | Dizajner | 8 | Updated Figma frames; sva loading/empty/error stanja su pokrivena | 3 |

**Dizajn ukupno**: 20h

**Sprint 3 ukupno**: 88h od 144h kapaciteta (61%)

### Dependencies Sprint 3
- S3-B01 ovisi o S2-B03 (listings moraju biti u bazi za matching)
- S3-B03 ovisi o S3-B01 i S3-B02 (klijent i prompt moraju biti gotovi)
- S3-B04 ovisi o S3-B03 (cachiramo rezultate matchinga)
- S3-B06 ovisi o S3-B03 (scheduler poziva matching worker)
- S3-B07 ovisi o S3-B04 (API endpoint cita iz cache-a)

---

## Sprint 4 — Mobile App (Core Ekrani)

**Trajanje**: 13.05. – 26.05.2026
**Sprint goal**: Korisnik moze preuzeti app, registrirati se, postaviti filter i pregledati TOP 10 matcheva s detaljima oglasa.

### Taskovi

#### Mobile

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S4-M01 | Auth ekrani: Landing (demo podaci), Register, Login s Clerk SDK (`@clerk/clerk-expo`); JWT pohrana u SecureStore | Senior | 10 | Registracija u < 1 min; auto-login na ponovnom otvaranju app-a; greske (krivi password, zauzet email) prikazane korisniku | 5 |
| S4-M02 | Filter ekran: grad (dropdown), cijena (RangeSlider), m² (RangeSlider), tip (toggle), semanticki tekst input; sprema filter pozivom na `/api/v1/filters` | Senior | 12 | Sve vrijednosti validiraju se klijentski; uspjesno spremanje prikazuje confirmation; filter se ucitava s API-ja na ponovnom otvaranju | 8 |
| S4-M03 | TOP 10 lista: FlatList komponenta, match kartica (% relevantnost, cijena, lokacija, m², slika, AI komentar), pull-to-refresh, loading/empty/error stanja | Senior | 12 | Lista se ucitava u < 3s na realnom uredaju; pull-to-refresh osvjezava bez cijelog re-rendera; empty state ima CTA; greska prikazuje retry button | 8 |
| S4-M04 | Detalji oglasa ekran: image carousel, puni opis, cijena/m² izracun, kontakt agent (tel + email), "Spremi u favorite" (lokalno za MVP, sinkronizacija u Sprint 5) | Junior | 10 | Slike se ucitavaju lazy (expo-image); cijena/m² je izracunata; kontakt tel otvara native dialer; email otvara mail app | 5 |
| S4-M05 | API klijent sloj: `packages/api-client` — React Query v5 hooks za sve endpointe, error handling, retry logika, optimistic updates za favorite | Junior | 8 | Svi API pozivi su wrapani u React Query; error state propagira do UI; 401 automatski logout korisnika | 5 |
| S4-M06 | Offline/cache strategija: WatermelonDB ili React Query persistence za caching prethodnih matcheva; prikaz cached podataka s "Posljednji update" labelom | Junior | 8 | App prikazuje stare matcheve kad nema interneta; "Nema konekcije" banner je prikazan; svjezi podaci se ucitavaju automatski kad konekcija vrati | 5 |
| S4-M07 | Expo EAS Build konfiguracija: `eas.json` za development/staging/production profile; GitHub Actions trigger za EAS Build na release tag | Junior | 6 | `eas build --profile staging` uspjesno gradi iOS i Android; GH Action okida na `v*` tag; build artefakt dostupan za testiranje | 3 |
| S4-M08 | Detox E2E testovi: registracija → kreiranje filtera → pregled liste → otvaranje detalja oglasa | Junior | 8 | E2E flow prolazi na iOS simulator; < 90s ukupno; neuspjeli koraci su jasno loggani | 5 |

**Mobile ukupno**: 74h (Senior: 34h / Junior: 40h)

#### Backend (podrska za mobile)

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S4-B01 | `listings` modul — favoriti: `POST/DELETE /api/v1/favorites/{listingId}`, `GET /api/v1/favorites` | Junior | 6 | Dodavanje/uklanjanje favorita radi; lista favorita je paginirana; foreign key constraint sprecava duple vnose | 3 |

**Backend ukupno**: 6h (Junior: 6h)

**Sprint 4 ukupno**: 80h od 144h kapaciteta (55%)

### Dependencies Sprint 4
- S4-M01 ovisi o S1-B04 (Clerk sync mora biti u produkciji)
- S4-M02 ovisi o S2-B05 (filter CRUD API mora biti dostupan)
- S4-M03 ovisi o S3-B07 (`GET /matches` endpoint mora biti dostupan)
- S4-M04 ovisi o S2-B03 (listing details endpoint)
- S4-M05 mora biti gotov PRIJE S4-M03 i S4-M04 (svi ekrani koriste API klijent)

---

## Sprint 5 — Push Notifikacije, Billing i Launch Prep

**Trajanje**: 27.05. – 09.06.2026
**Sprint goal**: Push notifikacije rade na iOS i Android, PREMIUM pretplata je funkcionalna kroz RevenueCat, GDPR compliance je zadovoljen — app je spreman za App Store submission.

### Taskovi

#### Backend

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S5-B01 | `notifications` modul: Expo Push API integracija, `POST /api/v1/notifications/register` za push token, notifikacija worker cita iz `notifications:push` queue | Senior | 10 | Push token se sprema u DB vezan uz korisnika; notifikacija worker salje batch push; Expo SDK error (invalid token) se gracefully handla | 5 |
| S5-B02 | Matching worker → notification trigger: nakon novog matching ciklusa, worker usporeduje novi TOP match s prethodnim i enqueue-a push notifikaciju samo za nove unike | Senior | 8 | Korisnik dobiva notifikaciju SAMO za NOVE matcheve (ne iste); frekvencija je postovana (odmah/dnevno/iskljuceno); unit testovi prolaze | 5 |
| S5-B03 | `billing` modul: RevenueCat webhook handler za evente `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`; aurira `Subscription` i `User.tier` | Senior | 8 | Svaki webhook event korektan aurira tier u DB; Redis cache za `user:{id}:tier` se invalidira; idempotency (duplikat webhookova ne stvara duple zapise) | 5 |
| S5-B04 | GDPR compliance: `DELETE /api/v1/me` — kaskadno brisanje svih korisnikovih podataka (User, Filter, MatchResult, Favorite, Subscription, ApiUsageLog); Clerk account deletion | Junior | 8 | Brisanje uklanja SVE podatke korisnika; Clerk account se brise; response 204; DB foreign key constrainti ne blokiru brisanje (CASCADE) | 5 |
| S5-B05 | Privacy policy i Terms of Service static endpointi + deployment u Railway production okruzenje | Junior | 4 | `GET /api/v1/legal/privacy-policy` i `/terms` vracaju HTML; Railway production deployment uspjesan; health check zeleni | 2 |

**Backend ukupno**: 38h (Senior: 26h / Junior: 12h)

#### Mobile

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S5-M01 | Push notifikacije u Expo: `expo-notifications` SDK, trazenje dozvole pri onboardingu, registracija push tokena na backend, deep link na notifikaciju otvara detalje oglasa | Senior | 10 | Notifikacija se primlja na iOS i Android; tap otvara korektan oglas; dozvola se trazi jednom s jasnim obrazlozenjem | 8 |
| S5-M02 | RevenueCat integracija u app: `react-native-purchases` SDK, paywall ekran (FREE vs PREMIUM), Apple Pay / Google Pay flow, `Purchases.purchaseStoreProduct` | Senior | 12 | Korisnik moze kupiti PREMIUM kroz app store; RevenueCat dashboard pokazuje transakciju; tier se azurira u < 30s; greske (cancelled, network) su handled | 8 |
| S5-M03 | Postavke ekran: push notifikacije on/off, frekvencija (odmah/dnevno/iskljuceno), email notifikacije on/off | Junior | 6 | Promjene se sinkroniziraju s backendom; lokalni preference su persisted; UI tocno odrazava DB stanje | 3 |
| S5-M04 | Profil ekran: prikaz emaila, tier statusa (FREE/PREMIUM s expiry datumom), "Upravljaj pretplatom" link (deep link na store), "Izbriši račun" s potvrdom | Junior | 6 | "Izbriši račun" poziva `DELETE /api/v1/me`; korisnik dobiva confirmation dialog; nakon brisanja app je resetiran na Landing | 5 |
| S5-M05 | App Store i Play Store listing priprema: screenshots (6.7" iPhone, Pixel 8), app icon, opis na HR i EN, age rating, privacy manifests (Apple ATT) | Junior | 8 | Svi materijali su uploadani u App Store Connect i Google Play Console; privacy manifest je compliant s Apple zahtjevima 2026 | 3 |
| S5-M06 | Finalano E2E Detox testiranje: push notifikacija primanje, paywall flow, brisanje racuna | Junior | 6 | E2E suite od 8 scenarija prolazi; 0 critical greska | 5 |
| S5-M07 | Performance audit: React Native Flipper/Expo DevTools profiling, FlatList optimizacija (getItemLayout, keyExtractor), image caching | Junior | 6 | Lista 10 items rendera u < 100ms; scrollanje je 60fps; app size < 50MB | 3 |

**Mobile ukupno**: 54h (Senior: 22h / Junior: 32h)

#### Dizajn

| ID | Task | Nositelj | Procjena (h) | Acceptance Criteria | SP |
|----|------|----------|:---:|---|:---:|
| S5-D01 | App Store marketinski materijali: screenshots, feature grafike, app ikona finalana verzija | Dizajner | 16 | 10 screenshotova u ispravnim dimenzijama za oba storea; ikona prolazi App Store smijernice | 8 |

**Dizajn ukupno**: 16h

**Sprint 5 ukupno**: 108h od 144h kapaciteta (75%)

### Dependencies Sprint 5
- S5-B01 ovisi o S3-B03 (matching worker mora biti u produkciji)
- S5-B02 ovisi o S5-B01 (notification worker mora biti registriran)
- S5-B03 ovisi o S1-B03 (Subscription schema mora postojati)
- S5-M01 ovisi o S5-B01 (backend mora primati push tokene)
- S5-M02 ovisi o S5-B03 (billing webhook mora azurirati tier)
- S5-M04 ovisi o S5-B04 (GDPR brisanje mora biti funkcionalno)

---

## Dependency Graf

```
SPRINT 1 (Temelji)
├── S1-B01: Monorepo setup
│     └─► S2-M01 (mobile scaffolding koristi workspace)
│     └─► S2-M02 (shared-types paket)
├── S1-B02: Hono scaffolding
│     └─► sve backend module (S2+)
├── S1-B03: Prisma schema
│     └─► S1-B04 (Clerk webhook treba User tablicu)
│     └─► S2-B01 (ingest treba Listing tablicu)
│     └─► S2-B05 (filteri trebaju Filter tablicu)
│     └─► S5-B04 (GDPR treba sve tablice)
├── S1-B04: Clerk webhook
│     └─► S2-B04 (auth middleware treba lokalnog User-a)
│     └─► S4-M01 (mobile auth ovisi o sync)
├── S1-B05: CI/CD
│     └─► sve buduće deploye (S2-S5)
└── S1-B06: Railway environments
      └─► S1-B05 (CI treba destinations)

SPRINT 2 (Podaci)
├── S2-B01: Ingest endpoint
│     └─► S2-B02 (worker procesira sto endpoint enqueue-a)
├── S2-B02: Ingest worker
│     └─► S3-B01 (matchamo listings koji su u bazi)
├── S2-B03: Listings API
│     └─► S3-B07 (matches endpoint poziva listings)
│     └─► S4-M04 (detalji oglasa)
├── S2-B05: Filter CRUD
│     └─► S3-B06 (scheduler treba filtere korisnika)
│     └─► S4-M02 (filter ekran u mobilu)
└── S2-B06: BullMQ setup
      └─► S3-B03 (matching worker)
      └─► S3-B06 (scheduler)
      └─► S5-B01 (notification worker)

SPRINT 3 (AI Engine)
├── S3-B01 + S3-B02: Grok klijent + prompt
│     └─► S3-B03 (matching worker koristi klijent)
├── S3-B03: Matching worker
│     └─► S3-B04 (cache matching rezultata)
│     └─► S3-B06 (scheduler okida worker)
│     └─► S3-B07 (API endpoint cita rezultate)
│     └─► S5-B02 (notification trigger)
└── S3-B07: GET /matches endpoint
      └─► S4-M03 (lista u mobilu)

SPRINT 4 (Mobile)
├── S4-M05: API klijent (React Query)
│     └─► S4-M03 (lista)
│     └─► S4-M04 (detalji)
│     └─► S4-M02 (filter ekran)
└── S4-M07: EAS Build
      └─► S5-M05 (App Store listing)
      └─► S5-M06 (E2E testiranje)

SPRINT 5 (Launch)
├── S5-B01: Push backend
│     └─► S5-B02 (trigger za notifikacije)
│     └─► S5-M01 (mobile registracija tokena)
├── S5-B03: Billing webhook
│     └─► S5-M02 (paywall flow)
└── S5-B04: GDPR delete
      └─► S5-M04 (profil ekran s "Izbriši račun")
```

**Kritični put** (najduži lanac dependencija):
```
S1-B03 → S2-B02 → S3-B01 → S3-B02 → S3-B03 → S3-B07 → S4-M03 → S5-M01
(Prisma schema → Ingest worker → Grok klijent → Prompt → Matching worker → Matches API → Match lista → Push)
```
Ukupno: 8 sekvencijalnih koraka koji određuju minimalni rok za launch.

---

## Risk Register

### R01 — Grok API relevantnost nije zadovoljavajuća

| Atribut | Vrijednost |
|---------|-----------|
| **Kategorija** | Tehnički / Product |
| **Vjerojatnost** | Srednja (40%) |
| **Impact** | Kritičan — bez kvalitetnog matchinga nema product-market fit |
| **Detektabilnost** | Visoka — vidljivo u internom testiranju (Sprint 3) |
| **Trigger** | Prosječni AI komentar score < 3.0/5 na internom pilot testu s 20 korisnika |

**Contingency plan**:
1. Sprint 3 rezervirat 10h za prompt iteration (S3-B02 procjena je konzervativna)
2. Ako Grok API nije dovoljno precizno za HR nekretnine, fallback: OpenAI GPT-4o (ista API surface, swap u klijentu u < 4h)
3. Ako niti jedan LLM nije precizan bez fine-tuninga, MVP se isporučuje s rule-based ranking algoritmom (ponderirani filteri) — prodaje se kao "AI-asisted" umjesto "AI-driven"

---

### R02 — Njuskalo blokira Apify scraping

| Atribut | Vrijednost |
|---------|-----------|
| **Kategorija** | Poslovni / Pravni |
| **Vjerojatnost** | Visoka (60%) |
| **Impact** | Kritičan — bez podataka nema matcheva |
| **Detektabilnost** | Visoka — Apify actor počne vraćati prazne CSV-ove |
| **Trigger** | Apify ingest vraća < 10% normalnog volumena 2 uzastopna dana |

**Contingency plan**:
1. Adapter pattern je ugrađen od Sprint 2 — novi izvor podataka = novi adapter (ne mijenja poslovnu logiku)
2. Identificirati i ugovoriti alternativni izvor PRIJE launcha (Index Oglasi, Crozilla, direktni feed od agencija)
3. Pravna analiza web scrapinga u HR je Faza 1 zadatak (CEO/pravnik) — ne smije čekati launch
4. Fallback: kupovina podataka od agregatorskih servisa (Reag.hr, Burza nekretnina)

---

### R03 — App Store Review odbijanje ili kašnjenje

| Atribut | Vrijednost |
|---------|-----------|
| **Kategorija** | Operativni |
| **Vjerojatnost** | Srednja (35%) |
| **Impact** | Visok — kasni launch za 1-4 tjedna |
| **Detektabilnost** | Visoka — App Store Connect daje jasnu povratnu informaciju |
| **Trigger** | Apple/Google odbija app due na compliance issue |

**Contingency plan**:
1. Predati app Review 2 tjedna PRIJE planiranog launch datuma (sredinom Sprint 5)
2. Implementirati Apple Privacy Manifest (ATT) u S5-M05 — čest razlog odbijanja u 2026
3. Imati Android (Play Store) kao primaran launch kanal ako iOS kasni — Google review je brži (1-3 dana)
4. TestFlight/Firebase App Distribution za beta testiranje prije store submissiona

---

### R04 — RevenueCat / billing integracija kompleksnija od procijenjene

| Atribut | Vrijednost |
|---------|-----------|
| **Kategorija** | Tehnički |
| **Vjerojatnost** | Srednja (30%) |
| **Impact** | Visok — bez billing-a nema prihoda; PREMIUM tier ne radi |
| **Detektabilnost** | Srednja — vidljivo tek u sandbox testiranju (Sprint 5) |
| **Trigger** | S5-M02 kasni > 3 dana zbog StoreKit / Google Play edge caseova |

**Contingency plan**:
1. Koristiti RevenueCat dokumentirani "Quick Start" vodič s Expo — postoji gotov primjer za oba storea
2. Sandbox testiranje početi u Sprint 4 (paralelno) — ne čekati Sprint 5
3. Worst case: launch bez in-app purchasea, s manuanom naplatom putem Stripe payment linka — privremeno rješenje za prvih 30 dana

---

### R05 — Junior developer bottleneck / learning curve

| Atribut | Vrijednost |
|---------|-----------|
| **Kategorija** | Kadrovski |
| **Vjerojatnost** | Srednja (40%) |
| **Impact** | Srednji — kašnjenje 1-2 tjedna po sprintu ako Senior treba "rescuati" zadatke |
| **Detektabilnost** | Visoka — vidljivo u sprint review-u |
| **Trigger** | Junior završi < 70% preuzetih taskova u sprintu |

**Contingency plan**:
1. Junior taskovi su svjesno izabrani kao manje kritični za kritični put (S1-B06, S2-B06, S2-B07, S4-M04...)
2. Svaki Junior task ima Senior kao "buddy" za pair programming — max 2h/tjedan
3. Ako kašnjenje prijeti milestonu, Senior preuzima Junior task — Junior prebacuje na dokumentaciju/testove
4. Sprint 1 je namjerno "lagani" sprint upravo zbog onboarding perioda Junior developera

---

## Definition of Done — Cijeli projekt

Svi sljedeći kriteriji moraju biti zadovoljeni PRIJE App Store i Play Store submissiona:

### Funkcionalni zahtjevi
- [ ] Svih 11 Must Have featurea (M1-M11) implementirano i prošlo Acceptance Criteria
- [ ] Sve User Stories US-01, US-03, US-05, US-06, US-07, US-09, US-13, US-14, US-17, US-18, US-19 prolaze manuel provjeru
- [ ] Core loop radi end-to-end: Registracija → Filter → Matching → TOP 10 → Push notifikacija
- [ ] FREE tier je točno limitiran (1 filter, TOP 5, 2x/dan)
- [ ] PREMIUM tier je funkcionalan (RevenueCat transakcija → DB update → UI refresh < 30s)

### Kvaliteta koda
- [ ] 0 TypeScript compiler errora (`tsc --strict --noEmit`)
- [ ] 0 ESLint errora (warnings su OK)
- [ ] Testna pokrivenost backend modula: > 70% line coverage (Vitest)
- [ ] Sve kritične putanje pokrivene integration testovima (ingest, matching, billing webhook)
- [ ] E2E Detox suite prolazi na iOS i Android (min 6 scenarija)
- [ ] Code review: svaki PR ima najmanje 1 approval od drugog člana tima

### Performanse
- [ ] GET /api/v1/matches < 500ms (cache hit) ili < 3s (cache miss) na staging (mjereno k6)
- [ ] App startup time < 3s na iPhone 12 i mid-range Android (Pixel 6a)
- [ ] FlatList scroll 60fps (Flipper performance profiler)
- [ ] Lighthouse mobile score za API dokumentaciju > 85 (ako postoji web interfejs)
- [ ] App size < 50MB (iOS IPA), < 40MB (Android APK)

### Sigurnost
- [ ] Svi API endpointi imaju autentifikaciju (osim `/health`, `/ingest` s API key-em, `/legal`)
- [ ] Clerk JWT verifikacija na svakom zahtjevu
- [ ] Input validacija s Zod na svim API rutama
- [ ] Rate limiting aktivno na svim javnim endpointima
- [ ] Nema hardcodiranih secretsa u kodu (provjera: `git grep -r "sk-" .`)
- [ ] HTTPS enforced na production (Railway automatski)

### GDPR i Compliance
- [ ] Privacy Policy dostupna na URL-u koji Apple/Google zahtijevaju
- [ ] Terms of Service dostupni
- [ ] "Izbriši račun" briše SVE korisnikove podatke (verificirano u testiranju)
- [ ] Push notifikacije zahtijevaju eksplicitnu dozvolu
- [ ] Apple Privacy Manifest (PrivacyInfo.xcprivacy) ispunjen i valjan

### Operativno
- [ ] Sentry error tracking aktivan na backend i mobile
- [ ] Railway health check zeleni 48h bez interupcija na staging okruženju
- [ ] Disaster recovery plan: Railway PostgreSQL automated backup verificiran (restore test)
- [ ] ApiUsageLog bilježi svaki Grok API poziv; cost alert konfiguriran
- [ ] App Store listing spreman (screenshoti, opis, kategorija, rating)
- [ ] Play Store listing spreman
- [ ] TestFlight beta test s 5+ eksternih korisnika bez critical bugovaCompleted

---

## Milestone Checkpoints

### M1 — Infrastructure Ready (kraj Sprint 1, 14.04.2026)
**Kriterij prolaza**: Monorepo se builda bez greški; `GET /api/health` vraca 200 na staging; CI/CD pipeline deploy za < 5 min; Prisma migration prolazi na staging DB; Figma design system ima sve primarne komponente.

**Go/No-Go decision**: Engineering Manager + Senior Dev 15-minutni sync. Ako CI nije stabilan, Sprint 2 počinje tek nakon fixa.

---

### M2 — Data Pipeline Live (kraj Sprint 2, 28.04.2026)
**Kriterij prolaza**: Testni Apify CSV (1.000 redaka) uspješno ingestiran u PostgreSQL; BullMQ worker procesira bez DLQ-a; filter CRUD API prolazi sve testove; mobile app scaffolding se pokreće na simulatoru.

**Go/No-Go decision**: Ako ingest pipeline nije stabilan, Sprint 3 (Grok AI) ne počinje — nema smisla matchati bez podataka.

---

### M3 — AI Matching Functional (kraj Sprint 3, 12.05.2026)
**Kriterij prolaza**: Grok API vraca TOP 10 matcheva za testni filter s prosječnim score > 65/100; caching smanjuje API pozive za > 50%; scheduler je aktivan i pokreće jobs u zadanom vremenu; interni A/B test s 3 različita prompta je završen.

**Go/No-Go decision**: Ako AI komentar kvaliteta nije zadovoljavajuća (< 3.0/5 interni ocjena), Sprint 4 se odgađa 1 tjedan za prompt iteraciju. Ako Grok API nije adekvatan, prebacujemo na GPT-4o (max 1 tjedan implementacije).

---

### M4 — Mobile Alpha (kraj Sprint 4, 26.05.2026)
**Kriterij prolaza**: Core loop radi end-to-end na realnom uredaju (iPhone ili Android); registracija, filter, TOP 10 lista i detalji oglasa su funkcionalni; Detox E2E prolazi bez crasheva; EAS Build generira instalabilni APK/IPA.

**Go/No-Go decision**: Interno testiranje s 3 kolege koji nisu developeri na projektu. Svaki critical bug blokira launch. Feedback se inkorporira u Sprint 5.

---

### M5 — Launch Ready (kraj Sprint 5, 09.06.2026)
**Kriterij prolaza**: Svi DoD kriteriji zadovoljeni; push notifikacije rade na iOS i Android; RevenueCat sandbox transakcija uspješna; GDPR delete verificiran; App Store i Play Store submission predani.

**Launch date**: 23.06.2026 (uz 2 tjedna rezerve za App Store review + hotfixeve)

**Post-launch monitoring plan**: 48h on-call dežurstvo (Senior Dev), Sentry alert thresholds postavljeni, RevenueCat webhook monitoring aktivan, Railway autoscaling konfiguriran.

---

## Kapacitet i opterećenje po sprintu

| Sprint | Senior (64h kap) | Junior (48h kap) | Dizajner (32h kap) | Ukupno iskorišteno | Iskorištenost |
|--------|:-:|:-:|:-:|:-:|:-:|
| Sprint 1 | 32h (50%) | 16h (33%) | 24h (75%) | 72h | 50% |
| Sprint 2 | 30h (47%) | 40h (83%) | 16h (50%) | 86h | 60% |
| Sprint 3 | 40h (63%) | 28h (58%) | 20h (63%) | 88h | 61% |
| Sprint 4 | 34h (53%) | 46h (96%) | 0h | 80h | 56% |
| Sprint 5 | 26h (41%) | 44h (92%) | 16h (50%) | 108h* | 75% |

> *Sprint 5 Junior je blizu gornje granice — ako se pojave neočekivani problemi (App Store rejection, billing bug), Senior preuzima 1-2 zadatka od Juniora.

**Ukupne procijenjene radne sate za MVP**: 434h neto (od 720h teorijskog kapaciteta = 60% efektivna iskorištenost — zdravo za projekt s 20% bufferom)

---

*Engineering Manager Agent | AI StanFinder | Faza 4 — Sprint planiranje*
*Dokument je input za: Backend Agent (F5), Frontend/Mobile Agent (F5), QA Agent (F6)*
*Verzija: 1.0 | Status: Finalan*
