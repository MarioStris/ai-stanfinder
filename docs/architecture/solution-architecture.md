# Solution Architecture — AI StanFinder

**Datum**: 01.04.2026
**Agent**: Solution Architect
**Status**: Faza 3 — Tehnicka arhitektura
**Dependency**: CEO vizija, CFO analiza, CPO product definicija

---

## Sazetak

Ovaj dokument definira kompletnu solution arhitekturu za AI StanFinder — mobilnu aplikaciju za AI matching nekretnina u Hrvatskoj. Arhitektura je dizajnirana za MVP scope (M1-M11 user stories), s ugradjenim tockami prosirenja za regionalnu ekspanziju (multi-source adapter pattern) i skaliranje do 15.000 korisnika u 12 mjeseci.

Kljucne arhitekturne odluke:
- **Modularni monolith** — jedan deployable, jasno odvojeni moduli
- **REST sync** za sve klijent-server komunikacije, **BullMQ** za async poslove (scraping, matching)
- **PostgreSQL** + **Redis** kao data layer
- **Railway** kao hosting platforma
- **Multi-source adapter pattern** za izvore podataka od prvog dana

---

## 1. Arhitekturni stil — ADR-001

### ADR-001: Modularni monolith kao arhitekturni stil

**Status**: Prihvacen

**Context**:
AI StanFinder je MVP projekt s malim timom (2 developera), jednim deployable-om, i 15.000 korisnika kao 12-mjesecni target. CEO zahtijeva multi-source adapter pattern, ali to je interni dizajn pattern — ne zahtijeva microservices. CFO zahtijeva nisku infrastrukturnu kompleksnost (infra trosak < 0.50 EUR/korisnik/mj). Projekt ima jasne domene (auth, scraping, matching, notifikacije, billing), ali nijedna od njih nema nezavisan scaling zahtjev u MVP fazi.

**Decision**:
Koristimo **modularni monolith** — jedan Node.js/Hono server s jasno odvojenim modulima po domeni. Svaki modul ima vlastiti direktorij, vlastite tipove, i komunikaciju iskljucivo kroz definirane interfaces (ne direktan pristup bazi drugog modula).

Struktura modula:
```
src/server/
  modules/
    auth/           -- registracija, login, JWT
    scraping/       -- Apify integracija, adapter pattern
    matching/       -- Grok API, ranking, caching
    notifications/  -- push (Expo), email
    billing/        -- RevenueCat webhook handler
    listings/       -- CRUD nekretnina, favoriti, filteri
    admin/          -- cost tracking, monitoring endpoints
```

**Consequences**:
- **Pozitivno**: Jednostavan deploy (1 Railway servis), nema network latencije izmedju modula, laksi debugging, nizi infra trosak, brzi development
- **Pozitivno**: Modularizacija omogucava buduci izvlacenje modula u zasebne servise ako zatreba (npr. matching engine)
- **Negativno**: Svi moduli dijele isti proces — bug u jednom modulu moze srusiti cijeli sustav
- **Negativno**: Vertikalno skaliranje ima gornju granicu — ali za 15.000 korisnika je vise nego dovoljno
- **Mitigacija**: Zdravstvene provjere (health checks) i automatski restart (Railway auto-restart). Matching engine se moze izdvojiti u zasebni servis kad/ako load zahtijeva (procjena: > 50.000 korisnika)

**Alternativne razmatrane**:
| Opcija | Zasto NE |
|--------|----------|
| Microservices | 2 developera, 1 deploy target, nema nezavisnih scaling potreba. Overhead (service mesh, distributed tracing, API gateway) ne opravdava benefit na ovoj skali. |
| Serverless (Lambda) | Matching engine zahtijeva stanje (cache, DB konekcije). Cold start je neprihvatljiv za API response < 3s. Apify cron jobs su bolji kao BullMQ worker nego kao Lambda. |
| Cisti monolith | Bez modularne separacije, kod brzo postaje spaghetti. Multi-source adapter pattern zahtijeva jasne granice izmedju modula. |

---

## 2. Communication Patterns — ADR-002

### ADR-002: Messaging i komunikacijski obrasci

**Status**: Prihvacen

**Context**:
Sustav ima dva razlicita komunikacijska obrasca:
1. **Korisnik <-> API**: zahtijeva odgovor u < 3 sekunde (sync)
2. **Pozadinski poslovi**: scraping ingest, AI matching, push notifikacije — ne zahtijevaju instant odgovor (async)

**Decision**:
Koristimo **REST (sync)** za sve klijent-server komunikacije i **BullMQ (Redis)** za async pozadinske poslove. Ne koristimo Kafka, event streaming, niti CQRS.

### 2.1 Sync komunikacija — REST/JSON

| Kanal | Protokol | Zasto |
|-------|----------|-------|
| Mobile app <-> API | REST/JSON over HTTPS | Standardno za React Native/Expo. gRPC nema smisla za mobilne klijente. |
| Apify webhook -> API | REST/JSON webhook | Apify salje POST webhook kad scraping zavrsi. |
| RevenueCat -> API | REST/JSON webhook | RevenueCat salje subscription events. |

**Fallback**: Ako API ne odgovori u 10s, mobilna app prikazuje cached podatke iz lokalne SQLite baze (Expo SecureStore za auth, WatermelonDB ili AsyncStorage za listings cache).

### 2.2 Async komunikacija — BullMQ (Redis)

| Queue | Producer | Consumer | Opis |
|-------|----------|----------|------|
| `scraping:ingest` | Apify webhook handler | Ingest worker | Parsira CSV, deduplikacija, upsert u PostgreSQL |
| `matching:run` | Scheduler (cron) | Matching worker | Pokrece Grok API matching za korisnike. FREE: 2x/dan, PREMIUM: svakih 15min |
| `notifications:push` | Matching worker | Notification worker | Salje push notifikacije za nove TOP matcheve |
| `notifications:email` | Scheduler (dnevno) | Email worker | Dnevni email sazetak (Should Have, Sprint 2) |

**Zasto BullMQ, ne Kafka**:
- Imamo < 100 events/sec u peak-u (2.000 korisnika x matching svakih 15min = ~2.2 events/sec)
- BullMQ je vec na Redis-u koji koristimo za caching — nema novog servisa
- Ne trebamo event replay, audit log, niti multi-consumer pub/sub
- Kafka je overkill za < 1.000 events/sec i dodaje operativnu kompleksnost

**Zasto ne "nista" (cisti cron)**:
- Matching moze trajati 5-30s po korisniku (Grok API latencija). Sekvencijalno procesiranje 2.000 korisnika bi trajalo satima.
- BullMQ omogucava concurrency control (npr. 10 concurrent matching worker-a), retry s exponential backoff, i dead letter queue za failed jobs.

**Fallback ako Redis padne**:
- BullMQ jobovi se gube (Redis nije persistent po defaultu). Koristimo Redis s AOF persistence na Railway.
- Ako Redis padne, matching se ne izvrsava — korisnici vide stare rezultate iz PostgreSQL-a. Nije kriticno jer podaci su i dalje u bazi.
- Alert na Sentry/PagerDuty ako Redis health check pada > 5 min.

### 2.3 Komunikacijski dijagram

```
[Mobile App (Expo/RN)]
        |
        | REST/HTTPS (sync)
        v
[Hono API Server] -----> [PostgreSQL]
        |       \
        |        \---> [Redis] (cache + BullMQ queues)
        |
        |--- webhook ---> [scraping:ingest queue] ---> [Ingest Worker] ---> [PostgreSQL]
        |--- cron ------> [matching:run queue] -----> [Matching Worker] --> [Grok API]
        |                                                    |
        |                                                    v
        |                                          [notifications:push queue]
        |                                                    |
        |                                                    v
        |                                          [Notification Worker] --> [Expo Push API]
        |
[Apify] ---webhook--->
[RevenueCat] ---webhook--->
```

---

## 3. Data Architecture — ADR-003 & ADR-005

### 3.1 Primarna baza podataka — PostgreSQL

**Odluka**: PostgreSQL na Railway (managed).

**Zasto PostgreSQL**:
- Strukturirani podaci s jasnim relacijama (korisnici, filteri, nekretnine, matchevi, favoriti)
- Full-text search na opisu nekretnina (PostgreSQL `tsvector` je dovoljan za MVP — nema potrebe za Elasticsearch)
- JSON polja za fleksibilne atribute nekretnina (razliciti izvori imaju razlicita polja)
- Prisma ORM — type-safe queries, migracije, seeding
- Railway managed PostgreSQL — automatski backupi, SSL, zero-config

**Kljucni entiteti**:
```
User (id, email, passwordHash, tier, createdAt)
  |-- Filter (id, userId, name, city, priceMin, priceMax, areaMin, areaMax, propertyType, semanticQuery, isActive)
  |-- Favorite (id, userId, listingId, status: new|contacted|rejected)
  |-- MatchResult (id, filterId, listingId, score, aiComment, createdAt)

Listing (id, sourceId, sourceType, externalId, title, description, price, area, city, district, propertyType, rooms, imageUrls[], rawData:jsonb, firstSeen, lastSeen, isActive)

Subscription (id, userId, revenueCatId, tier, status, expiresAt)

ApiUsageLog (id, userId, provider, tokensUsed, costEstimate, createdAt)
```

**Skaliranje baze**:
| Faza | Korisnici | Listings | Strategija |
|------|-----------|----------|------------|
| Launch (M7) | 200 | ~10.000 | Railway Starter ($5/mj), single instance |
| Rast (M9) | 750 | ~30.000 | Railway Pro ($20/mj), connection pooling (PgBouncer) |
| Scale (M12) | 2.000 | ~50.000 | Railway Pro, read replica za analytics queries |
| Target (M18) | 4.000 | ~100.000 | Razmotriti dediciranu instancu ili Supabase Pro |

**Connection pooling**: Prisma ima ugradjeni connection pool (max 10 konekcija po defaultu). Za > 1.000 concurrent korisnika, dodati PgBouncer ispred PostgreSQL-a.

### 3.2 Caching — Redis (ADR-005)

**ADR-005: Caching strategija**

**Status**: Prihvacen

**Context**:
Grok API pozivi su najskuplji dio sustava (~0.005-0.015 USD po pozivu). CFO zahtijeva caching identicnih query-ja i cost cap po korisniku. Takodjer, TOP 10 match lista se ne mijenja izmedju matching ciklusa — nema smisla svaki put citati iz baze.

**Decision**:
Redis kao caching layer s jasno definiranom TTL strategijom po tipu podataka.

| Sto se cache-ira | Cache key pattern | TTL | Invalidation |
|-------------------|-------------------|-----|-------------|
| TOP 10 match rezultati | `match:{filterId}:{dataVersion}` | 15 min (PREMIUM), 12h (FREE) | Novi matching ciklus overwrite-a |
| Listing detalji | `listing:{id}` | 1 sat | Novi ingest overwrite-a |
| Grok API response | `grok:{hash(filterParams+listingIds)}` | 30 min | TTL expire (nikad rucna invalidacija) |
| User session/tier | `user:{id}:tier` | 5 min | RevenueCat webhook invalidira |
| API cost tracking | `cost:{userId}:{date}` | 24h | Inkrementira se s svakim API pozivom |

**Invalidation pattern**: TTL-based (time-to-live). Nema complex invalidation logike. Razlog: podaci o nekretninama se azuriraju svakih 15 min (scraping ciklus), pa TTL od 15-60 min je dovoljno svjez.

**Cost kontrola kroz cache**:
```
Bez cachea: 2.000 korisnika x 96 matching/dan (svakih 15min) = 192.000 API poziva/dan
S cacheom: Slicni filteri (isti grad, slican range) share-aju cache = procjena 60% cache hit rate
S cacheom: 192.000 x 0.4 = 76.800 API poziva/dan
S tieringom: FREE 2x/dan = 2.000 x 0.85 x 2 = 3.400 + PREMIUM svakih 15min = 2.000 x 0.15 x 96 = 28.800
Ukupno s tiering + cache: (3.400 + 28.800) x 0.4 = ~12.880 API poziva/dan
Usteda: 93% manje API poziva nego naivna implementacija
```

### 3.3 Search

**Odluka**: PostgreSQL full-text search (tsvector/tsquery) za MVP. NE koristimo Elasticsearch/Meilisearch.

**Zasto**:
- MVP ima ~50.000 listings — PostgreSQL FTS je brz do 500k redova s GIN indeksom
- Semantic search (prirodni jezik) ide kroz Grok API, ne kroz FTS — FTS je samo za basic keyword pretragu
- Nema potrebe za faceted search, autocomplete, fuzzy matching u MVP
- Dodavanje Elasticsearch za 50k dokumenata je overkill i kosta extra $20-50/mj

**Migracija**: Ako listings prerastu 500k ili trebamo napredni search (autocomplete, fuzzy, facete), migrirat cemo na Meilisearch (self-hosted na Railway, laksi od ES-a).

### 3.4 File Storage — Slike nekretnina

**Odluka**: NE pohranjujemo slike lokalno. Koristimo direktne URL-ove s Njuskalo.hr (i buducih izvora).

**Zasto**:
- Njuskalo hosting slike na CDN-u — brze su nego sto bismo mi servirati
- Pohranjivanje 50.000 x 10 slika = 500.000 slika x ~200KB = ~100GB = ogroman trosak i kompleksnost
- Pravno je sigurnije linkati nego kopirati (copyright)

**Fallback**: Ako Njuskalo promijeni URL strukturu ili blokira hotlinking:
- Spremiti thumbnail verzije (200x150) na Cloudflare R2 ($0.015/GB/mj)
- Lifecycle policy: brisanje thumbnails-a za neaktivne oglase starije od 30 dana
- R2 budget: ~5GB = ~$0.08/mj (zanemarivo)

---

## 4. Deployment Architecture — ADR-003

### ADR-003: Railway kao hosting platforma

**Status**: Prihvacen

**Context**:
CFO zahtijeva nisku pocetnu cijenu s mogucnoscu skaliranja. Tim je mali (2 devova), nema DevOps specijalistu. Projekt je MVP — brzi deploy vazniji od pune kontrole.

**Decision**:
Railway kao primarni hosting za sve komponente.

| Komponenta | Railway servis | Plan | Cijena (procjena) |
|-----------|---------------|------|-------------------|
| Hono API server | Web service | Pro ($5 base + usage) | ~$20-50/mj |
| BullMQ workers | Worker service | Pro | ~$10-20/mj |
| PostgreSQL | Managed DB | Pro | ~$10-25/mj |
| Redis | Managed Redis | Pro | ~$10-15/mj |
| **UKUPNO** | | | **~$50-110/mj** |

**Hosting matrica — zasto Railway**:
| Opcija | Cost | Complexity | Scaling | Lock-in | Odluka |
|--------|------|-----------|---------|---------|--------|
| Railway | $$ | Nizak | Semi-auto | Nizak | **ODABRANO** — balans cijene i jednostavnosti |
| Vercel | $ | Nizak | Auto | Srednji | Ne — Vercel nije za long-running workers (matching, scraping) |
| Render | $$ | Nizak | Semi-auto | Nizak | Alternativa — slicne mogucnosti, Railway ima bolji DX |
| AWS ECS/Fargate | $$$ | Visok | Manual/Auto | Visok | Nepotrebna kompleksnost za 2 developera |
| Kubernetes | $$$$ | Vrlo visok | Full control | Nizak | Apsolutni overkill za MVP s 4 servisa |

**Scaling plan na Railway**:
- Railway automatski skalira CPU/RAM po upotrebi (vertical)
- Za horizontal scaling (> 1 API instanca): Railway podrzava multiple replicas s built-in load balancing
- Procjena: 1 API instanca podnosi ~500 concurrent connections. Za 2.000 korisnika, peak concurrent je ~200 — jedna instanca je dovoljna.
- Trigger za horizontal scaling: response time > 500ms sustained na 95. percentilu

**CDN**:
- Cloudflare Free tier ispred Railway domene
- Cache: staticke slike, API odgovori s `Cache-Control: public, max-age=300` za listing detalje
- DDoS zastita ukljucena u Cloudflare Free

**Multi-region**:
- NE u MVP fazi. Railway deployi u eu-west (Njemacka) — dovoljno niska latencija za HR korisnicke (< 30ms).
- Razmotriti multi-region tek za regionalnu ekspanziju (Faza B, M12+).

### Deployment flow

```
GitHub (main branch)
    |
    | push / merge PR
    v
GitHub Actions (CI)
    |-- lint + type-check (Biome)
    |-- unit tests (Vitest)
    |-- build
    v
Railway (CD)
    |-- auto-deploy iz main brancha
    |-- zero-downtime deploy (rolling update)
    |-- health check: GET /health -> 200
    v
[Production]
    |-- Cloudflare CDN (ispred)
    |-- Railway API (iza)
    |-- Railway PostgreSQL + Redis
```

---

## 5. Integracije s vanjskim sustavima

### 5.1 Apify — Web Scraping

| Atribut | Vrijednost |
|---------|-----------|
| **Sto radi** | Scrape-a nekretnine s Njuskalo.hr (stanovi, kuce, zemljista) |
| **Kako se integrira** | Apify Actor zavrsava run -> salje webhook POST na `/api/webhooks/apify` -> payload sadrzi dataset ID -> worker skida CSV s Apify API-ja |
| **Frekvencija** | Svakih 15 min (3 actora paralelno — stanovi, kuce, zemljista) |
| **Error handling** | Retry 3x s exponential backoff (1min, 5min, 15min). Ako sve 3 retry-a fail-aju, alert na Sentry + email admin-u. Stale data (> 1h stari) prikazuje se korisniku s oznakom "Podaci od HH:MM". |
| **Fallback** | Ako Apify padne > 1h: prikazuj postojece podatke iz PostgreSQL-a. Korisnik vidi "Zadnje azuriranje: prije X min". |
| **Rate limiting** | Apify ima vlastiti rate limit po planu. Nas budget: max 500 actor run-ova/dan. |
| **Cost control** | CFO limit: max $150/mj za Apify. Alert na $120 (80%). |

### 5.2 Grok API (xAI) — AI Matching

| Atribut | Vrijednost |
|---------|-----------|
| **Sto radi** | Prima korisnikov filter + opis + listu nekretnina, vraca rangirane TOP 10 s % relevantnosti i AI komentarom |
| **Kako se integrira** | BullMQ `matching:run` worker poziva Grok API (REST). Request: system prompt + user filter JSON + listing batch (max 50 listings). Response: ranked array s score i comment. |
| **Error handling** | Retry 2x s exponential backoff (2s, 10s). Ako fail-a: koristi zadnji cached rezultat iz Redis-a. Ako nema cache-a: koristi basic PostgreSQL ranking (ORDER BY price proximity, area proximity) kao degraded fallback. |
| **Fallback LLM** | Ako Grok API postane nedostupan > 30 min ili drasticno podigne cijene: pripremljen adapter za OpenAI GPT-4o-mini ili Anthropic Haiku. Prompt format je apstrahiran kroz `LLMProvider` interface (vidi sekciju 7). |
| **Rate limiting** | Max 50 API poziva/korisnik/dan (hard limit). Soft limit: alert na 30 poziva/dan. |
| **Cost control** | Redis cost tracker: `cost:{userId}:{date}`. Ako korisnik prijede $0.50/mj -> throttle na 2x/dan matching (cak i PREMIUM). Global budget: $180/mj, alert na $140. |

### 5.3 Push notifikacije — Expo Notifications

| Atribut | Vrijednost |
|---------|-----------|
| **Sto radi** | Salje push notifikacije kad se pojavi novi TOP match |
| **Kako se integrira** | Expo Push API (REST). BullMQ `notifications:push` worker batcha notifikacije (max 100 po request-u) i salje na Expo push endpoint. |
| **Error handling** | Expo vraca per-ticket status. Failed ticketi se retry-aju 1x nakon 5 min. Permanently failed (invalid token) -> oznaci user device token kao invalid, ne salji vise. |
| **Fallback** | Ako Expo Push padne: queue-aj notifikacije u BullMQ, retry svakih 15 min do 2h. Nakon toga: discard (push notifikacije su ephemeral, nema smisla slati sat vremena staru). |
| **Rate limiting** | Max 3 push-a/korisnik/dan (smart batching). Korisnik bira: "odmah" / "dnevni sazetak" / "iskljuceno". |
| **Cost** | Besplatno do 1M notifikacija/mj. Dovoljno do ~50.000 korisnika. |

### 5.4 Payments — RevenueCat

| Atribut | Vrijednost |
|---------|-----------|
| **Sto radi** | Upravlja in-app pretplatama (Apple Pay, Google Pay) |
| **Kako se integrira** | RevenueCat SDK u React Native (Expo plugin). Backend prima webhooks za subscription events (new, renewed, cancelled, expired) na `/api/webhooks/revenuecat`. |
| **Error handling** | Webhook handler je idempotent (deduplicira po event ID-u). Ako webhook ne stigne: RevenueCat retry-a automatski. Backend periodno sync-a subscription status putem RevenueCat REST API-ja (svakih 6h). |
| **Fallback** | Ako RevenueCat padne: korisnik zadrzava zadnji poznati tier status iz PostgreSQL-a. Grace period: 24h — korisnik ne gubi pristup odmah. |
| **Cost** | RevenueCat Free tier do $2.5k MRR. Dovoljno za prvih 12+ mjeseci. |

### 5.5 Email — Resend

| Atribut | Vrijednost |
|---------|-----------|
| **Sto radi** | Transakcijski emailovi (welcome, password reset) + dnevni sazetak matcheva (Sprint 2) |
| **Provider** | Resend (alternativa: SendGrid). Zasto Resend: bolji DX, React Email za template-e, besplatan do 100 emailova/dan. |
| **Kako se integrira** | Resend REST API iz notification workera. React Email template-i kompajlirani u HTML. |
| **Error handling** | Retry 2x. Ako fail-a: log u Sentry, korisnik ne dobije email ali app nastavlja raditi. |
| **Fallback** | Ako Resend padne: emailovi su "nice to have", ne blokiraju core funkcionalnost. Queue-aj i retry nakon 1h. |
| **Cost** | Free tier: 100 emails/dan = 3.000/mj. Pro ($20/mj) za > 3.000/mj. |

### Integracija mapa

```
[Apify] --webhook--> [API] --queue--> [Ingest Worker] ---> [PostgreSQL]
                                                               |
[Scheduler/Cron] ---------------------> [Matching Worker] <----+
                                             |
                                             v
                                        [Grok API]
                                             |
                                             v
                                    [Notification Worker]
                                        /          \
                                       v            v
                               [Expo Push]    [Resend Email]

[Mobile App] <--REST--> [API] <--webhook-- [RevenueCat]
```

---

## 6. Security Architecture

### 6.1 Auth Flow — ADR-004

**ADR-004: Authentication strategija**

**Status**: Prihvacen

**Decision**: Custom JWT auth (ne NextAuth, ne Clerk). Razlog: Hono backend (ne Next.js), mobilna app, i minimalan scope (samo email/password u MVP).

**Auth flow**:
```
SIGNUP:
  1. POST /api/auth/signup { email, password }
  2. Hash password (bcrypt, 12 rounds)
  3. Insert user u PostgreSQL
  4. Generiraj JWT access token (15 min TTL) + refresh token (30 dana TTL)
  5. Vrati { accessToken, refreshToken, user }

LOGIN:
  1. POST /api/auth/login { email, password }
  2. Verificiraj bcrypt hash
  3. Generiraj JWT + refresh token
  4. Vrati { accessToken, refreshToken, user }

REFRESH:
  1. POST /api/auth/refresh { refreshToken }
  2. Verificiraj refresh token (potpis + expiry + nije revociran)
  3. Generiraj novi access token
  4. Rotiraj refresh token (stari se invalidira)
  5. Vrati { accessToken, refreshToken }

LOGOUT:
  1. POST /api/auth/logout (Authorization header)
  2. Dodaj refresh token u blacklist (Redis, TTL = remaining expiry)
  3. Klijent brise tokene iz secure storage
```

### 6.2 Authorization

**Model**: RBAC (Role-Based Access Control) s 3 role:
- `free` — pristup FREE tier funkcionalnostima
- `premium` — pristup svemu
- `agent` — pristup agentskom dashboardu + premium features

Middleware provjera na svakom API endpointu:
```typescript
// Primjer middleware chain
app.get('/api/matches/:filterId', authMiddleware, tierGuard('premium'), getMatches)
```

Row-level security nije potreban u MVP — Prisma queries uvijek filtriraju po `userId`.

### 6.3 API Security

| Mjera | Implementacija |
|-------|---------------|
| Rate limiting | `hono-rate-limiter` — 100 req/min po IP (global), 30 req/min po user (auth) |
| CORS | Samo mobilna app origin (Expo) + admin dashboard |
| Input validation | Zod schema validation na svakom endpointu |
| SQL injection | Prisma ORM (parameterized queries) |
| HTTPS | Railway auto-SSL + Cloudflare SSL |
| Helmet headers | `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` |

### 6.4 Data Encryption

| Vrsta | Implementacija |
|-------|---------------|
| In transit | TLS 1.3 (Railway + Cloudflare) |
| At rest (DB) | Railway managed PostgreSQL ima encryption at rest |
| Passwords | bcrypt (12 rounds) |
| API keys | Pohranjene kao environment variables na Railway (ne u kodu) |
| Secrets management | Railway environment variables (encrypted). Ako tim raste: migracija na Doppler ili Infisical. |

---

## 7. Multi-Source Adapter Pattern (detaljno)

### Arhitekturna odluka

CEO zahtijeva multi-source adapter pattern od prvog dana. Ovo je kljucna arhitekturna odluka koja omogucava:
1. Dodavanje novih izvora podataka (Index Oglasi, Crozilla) bez promjene core logike
2. Regionalnu ekspanziju (Nepremicnine.net za SLO, 4zida.rs za SRB)
3. Zamjenu izvora ako Njuskalo blokira scraping

### TypeScript Interface definicija

```typescript
// src/server/modules/scraping/types.ts

/**
 * Standardizirani format nekretnine — svi adapteri moraju transformirati
 * sirove podatke u ovaj format.
 */
interface StandardizedListing {
  externalId: string;            // ID na izvornom portalu
  sourceType: SourceType;        // 'njuskalo' | 'index_oglasi' | 'crozilla' | ...
  title: string;
  description: string;
  price: number;                 // EUR
  currency: 'EUR' | 'HRK';      // normaliziramo u EUR
  area: number;                  // m2
  rooms: number | null;
  propertyType: 'apartment' | 'house' | 'land';
  city: string;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrls: string[];
  contactPhone: string | null;
  contactEmail: string | null;
  agentName: string | null;
  agencyName: string | null;
  originalUrl: string;
  publishedAt: Date | null;
  rawData: Record<string, unknown>;  // Originalni podaci za debugging
}

/**
 * Registrirani izvori podataka.
 * Dodavanje novog izvora = dodavanje novog enum value + adapter klase.
 */
type SourceType = 'njuskalo' | 'index_oglasi' | 'crozilla' | 'nepremicnine_net' | 'halooglasi';

/**
 * Adapter interface — svaki izvor podataka mora implementirati ovo.
 */
interface ListingSourceAdapter {
  /** Jedinstveni identifikator izvora */
  readonly sourceType: SourceType;

  /** Ljudski citljivo ime za admin dashboard */
  readonly displayName: string;

  /** Drzava kojoj pripada ovaj izvor */
  readonly country: 'HR' | 'SI' | 'RS';

  /**
   * Parsira sirove podatke (CSV, JSON, HTML) u standardizirani format.
   * @param rawData - Sirovi podaci iz Apify actor-a ili drugog izvora
   * @returns Niz standardiziranih nekretnina
   */
  parse(rawData: Buffer | string): Promise<StandardizedListing[]>;

  /**
   * Validira pojedinacnu nekretninu — provjerava obavezna polja,
   * format cijena, validnost URL-ova.
   * @returns true ako je listing validan, false ako treba preskociti
   */
  validate(listing: StandardizedListing): boolean;

  /**
   * Generira deduplikacijski kljuc za ovu nekretninu.
   * Format: `{sourceType}:{externalId}`
   */
  deduplicationKey(listing: StandardizedListing): string;

  /**
   * Opciono: transformira cijenu u EUR ako je izvor u drugoj valuti.
   */
  normalizePrice?(price: number, currency: string): number;
}
```

### Registracija adaptera

```typescript
// src/server/modules/scraping/adapter-registry.ts

class AdapterRegistry {
  private adapters = new Map<SourceType, ListingSourceAdapter>();

  register(adapter: ListingSourceAdapter): void {
    if (this.adapters.has(adapter.sourceType)) {
      throw new Error(`Adapter za ${adapter.sourceType} vec registriran`);
    }
    this.adapters.set(adapter.sourceType, adapter);
  }

  get(sourceType: SourceType): ListingSourceAdapter {
    const adapter = this.adapters.get(sourceType);
    if (!adapter) {
      throw new Error(`Nema adaptera za izvor: ${sourceType}`);
    }
    return adapter;
  }

  listRegistered(): SourceType[] {
    return Array.from(this.adapters.keys());
  }
}

// Singleton
export const adapterRegistry = new AdapterRegistry();
```

### Primjer: Njuskalo adapter

```typescript
// src/server/modules/scraping/adapters/njuskalo.adapter.ts

import { parse as csvParse } from 'csv-parse/sync';

class NjuskaloAdapter implements ListingSourceAdapter {
  readonly sourceType = 'njuskalo' as const;
  readonly displayName = 'Njuskalo.hr';
  readonly country = 'HR' as const;

  async parse(rawData: Buffer | string): Promise<StandardizedListing[]> {
    const records = csvParse(rawData, {
      columns: true,
      skip_empty_lines: true,
    });

    return records.map((row: NjuskaloCSVRow) => ({
      externalId: row.id,
      sourceType: this.sourceType,
      title: row.naslov,
      description: row.opis || '',
      price: parseFloat(row.cijena),
      currency: 'EUR',
      area: parseFloat(row.kvadratura),
      rooms: row.sobe ? parseInt(row.sobe) : null,
      propertyType: this.mapPropertyType(row.tip),
      city: row.grad,
      district: row.kvart || null,
      address: row.adresa || null,
      latitude: row.lat ? parseFloat(row.lat) : null,
      longitude: row.lng ? parseFloat(row.lng) : null,
      imageUrls: row.slike ? row.slike.split(';') : [],
      contactPhone: row.telefon || null,
      contactEmail: row.email || null,
      agentName: row.agent || null,
      agencyName: row.agencija || null,
      originalUrl: `https://www.njuskalo.hr/nekretnine/oglas/${row.id}`,
      publishedAt: row.datum ? new Date(row.datum) : null,
      rawData: row,
    }));
  }

  validate(listing: StandardizedListing): boolean {
    return (
      listing.externalId !== '' &&
      listing.price > 0 &&
      listing.area > 0 &&
      listing.city !== '' &&
      listing.title !== ''
    );
  }

  deduplicationKey(listing: StandardizedListing): string {
    return `${this.sourceType}:${listing.externalId}`;
  }

  private mapPropertyType(tip: string): 'apartment' | 'house' | 'land' {
    const map: Record<string, 'apartment' | 'house' | 'land'> = {
      stan: 'apartment',
      kuca: 'house',
      zemljiste: 'land',
    };
    return map[tip?.toLowerCase()] || 'apartment';
  }
}

// Registracija
adapterRegistry.register(new NjuskaloAdapter());
```

### Kako dodati novi izvor podataka

1. Kreiraj novu datoteku: `src/server/modules/scraping/adapters/{source}.adapter.ts`
2. Implementiraj `ListingSourceAdapter` interface
3. Registriraj adapter: `adapterRegistry.register(new SourceAdapter())`
4. Dodaj Apify Actor za novi izvor (ili drugi scraping mehanizam)
5. Konfiguriraj webhook na `/api/webhooks/apify` s `sourceType` parametrom
6. Gotovo — ingest worker automatski koristi pravi adapter na temelju `sourceType`

**Procijenjeno vrijeme za dodavanje novog izvora**: 2-4 sata (adapter + Apify actor konfiguracija).

### LLM Provider Adapter (isti pattern)

Isti adapter pattern se koristi i za LLM providere (Grok, OpenAI, Anthropic):

```typescript
// src/server/modules/matching/types.ts

interface LLMProvider {
  readonly name: string;
  readonly costPer1kTokens: number;

  match(
    filter: UserFilter,
    listings: StandardizedListing[],
  ): Promise<MatchResult[]>;

  estimateCost(inputTokens: number, outputTokens: number): number;
}
```

Trenutno: samo `GrokProvider`. Fallback: `OpenAIProvider` (GPT-4o-mini) pripremnjen ali neaktivan.

---

## 8. Skalabilnost Plan

### 8.1 Baseline — Launch (M7, 200 korisnika)

| Komponenta | Kapacitet | Iskoristenje |
|-----------|-----------|-------------|
| API server | ~500 req/sec | < 5% |
| PostgreSQL | 10.000 listings, 200 korisnika | < 1% |
| Redis | 256MB | < 5% |
| BullMQ workers | 1 worker process | < 10% |
| Grok API | ~400 poziva/dan | Nizak |
| **Infra trosak** | | **~$50/mj** |

### 8.2 Target — 12 mjeseci (M18, 2.000 korisnika)

| Komponenta | Kapacitet | Iskoristenje |
|-----------|-----------|-------------|
| API server | ~500 req/sec | ~20% |
| PostgreSQL | 50.000 listings, 2.000 korisnika | ~10% |
| Redis | 512MB | ~30% |
| BullMQ workers | 1 worker, 10 concurrent jobs | ~40% |
| Grok API | ~13.000 poziva/dan | Umjeren |
| **Infra trosak** | | **~$110/mj** |

### 8.3 Ambiciozni target — 15.000 korisnika (M24+)

| Komponenta | Kapacitet | Iskoristenje | Akcija potrebna |
|-----------|-----------|-------------|-----------------|
| API server | ~500 req/sec | ~60% | Dodati 2. repliku |
| PostgreSQL | 200.000 listings | ~40% | Read replica za analytics |
| Redis | 1GB | ~60% | Upgrade plan |
| BullMQ workers | 3 worker procesa | ~70% | Horizontalno skalirati workere |
| Grok API | ~100.000 poziva/dan | Visok | Agresivniji caching, batch API calls |
| **Infra trosak** | | **~$300-500/mj** |

### 8.4 Bottleneck identifikacija

| Prioritet | Bottleneck | Kad puca | Simptom | Mitigacija |
|-----------|-----------|----------|---------|-----------|
| 1 | **Grok API cost** | > 1.000 korisnika | Infra trosak > $0.50/korisnik/mj | Agresivniji cache (60min TTL), batch matching (grupirati slicne filtere), tiering (FREE = basic ranking bez LLM-a) |
| 2 | **Grok API latencija** | > 2.000 korisnika | Matching queue lag > 30min | Vise concurrent worker-a (10 -> 20), prioritetna queue za PREMIUM |
| 3 | **PostgreSQL connections** | > 5.000 concurrent | Connection pool exhaustion | PgBouncer, connection pooling na Prisma (max 20) |
| 4 | **Redis memory** | > 10.000 korisnika | OOM errors | Upgrade Redis plan, agresivniji TTL, LRU eviction policy |

### 8.5 Cost projekcija

| Skala | Korisnici | Grok API | Apify | Railway | Ukupno/mj | Po korisniku |
|-------|-----------|----------|-------|---------|-----------|-------------|
| Launch | 200 | $30 | $50 | $50 | **$130** | $0.65 |
| 6 mj | 1.000 | $80 | $100 | $80 | **$260** | $0.26 |
| 12 mj | 2.000 | $150 | $150 | $110 | **$410** | $0.21 |
| 18 mj | 5.000 | $300 | $200 | $200 | **$700** | $0.14 |
| 24 mj | 15.000 | $600 | $350 | $400 | **$1.350** | $0.09 |

CFO target: < $0.50/korisnik/mj. **Projekcija pokazuje da se sustav uklapa u budget od ~1.000 korisnika nadalje** zahvaljujuci economies of scale na caching-u i batch processing-u.

### 8.6 Scaling strategija po komponenti

| Komponenta | Tip skaliranja | Trigger | Akcija |
|-----------|---------------|---------|--------|
| API server | Horizontalno | p95 latency > 500ms | Dodaj Railway repliku |
| BullMQ workers | Horizontalno | Queue depth > 1.000 jobs | Dodaj worker proces |
| PostgreSQL | Vertikalno, zatim read replica | Query time > 100ms | Upgrade plan, dodaj read replica |
| Redis | Vertikalno | Memory > 80% | Upgrade plan |
| Grok API | N/A (vanjski servis) | Cost > budget | Agresivniji cache, fallback LLM |

---

## 9. Non-Functional Requirements (NFR)

| NFR | Target | Mjerenje |
|-----|--------|---------|
| API response time (p95) | < 300ms (CRUD), < 3s (matching trigger) | Railway metrics + custom logging |
| Uptime | 99.5% (dozvoljeno ~3.6h downtime/mj) | UptimeRobot (besplatno) |
| Match lista load | < 3s (CPO zahtjev) | Client-side timing + Sentry performance |
| Push notification delay | < 60s od novog match-a do push-a | BullMQ job completion time |
| Data freshness | < 15 min za PREMIUM, < 12h za FREE | Scheduler monitoring |
| Concurrent users | 200 (launch), 2.000 (12mj) | Load testing (k6) |
| DB backup | Automatski dnevno, 7 dana retencija | Railway managed backups |
| RTO (Recovery Time Objective) | < 1h | Railway auto-restart + manual intervention |
| RPO (Recovery Point Objective) | < 24h | Dnevni DB backup |

---

## 10. Monitoring i Observability

| Sloj | Alat | Sto prati | Cijena |
|------|------|----------|--------|
| Error tracking | Sentry (free tier) | Exceptions, crashes, performance | $0 (do 5k events/mj) |
| Uptime | UptimeRobot (free) | API health check svakih 5 min | $0 |
| Infra metrics | Railway dashboard | CPU, RAM, network, DB connections | Ukljuceno |
| API cost tracking | Custom (Redis + admin endpoint) | Grok API pozivi i trosak po korisniku | $0 |
| App analytics | Firebase Analytics (free) | DAU/MAU, retencija, kohorte | $0 |
| Push analytics | Expo dashboard | Delivery rate, open rate | $0 |

**Alerting pravila**:
- API error rate > 5% -> Sentry alert (email)
- Redis memory > 80% -> Railway alert
- Grok API monthly cost > 80% budget -> Custom alert (email admin)
- Matching queue depth > 500 jobs -> Custom alert
- API health check fail > 5 min -> UptimeRobot alert (SMS)

---

## Zakljucak

Ova arhitektura je dizajnirana po principu **"najjednostavnije rjesenje koje zadovoljava zahtjeve"**:

1. **Modularni monolith** umjesto microservices-a — jer imamo 2 developera i jedan deploy target
2. **BullMQ** umjesto Kafke — jer imamo < 100 events/sec
3. **PostgreSQL FTS** umjesto Elasticsearch-a — jer imamo < 50k dokumenata
4. **Railway** umjesto Kubernetes-a — jer imamo 4 servisa, ne 20
5. **Redis** za cache I queue — jer ne trebamo dva odvojena servisa

Svaka od ovih odluka ima jasnu migracijsku stazu ako/kad sustav preraste MVP:
- Monolith -> izvuci matching engine u zasebni servis
- BullMQ -> migriraj na Kafka ako trebamo event replay
- PG FTS -> dodaj Meilisearch ako trebamo faceted search
- Railway -> migriraj na AWS ECS ako trebamo multi-region
- Redis single -> Redis Cluster ako trebamo > 4GB memorije

**Multi-source adapter pattern** osigurava da se novi izvori podataka i LLM provideri mogu dodati u 2-4 sata bez promjene core logike — sto je kljucni CEO zahtjev za regionalnu ekspanziju.

---

*Solution Architect Agent | AI StanFinder | Faza 3 — Tehnicka arhitektura*
*Ovaj dokument je input za: CTO (validacija), Backend Architect (implementacija), DevOps (infra setup), Cloud Architect (DR plan)*
*Verzija: 1.0*
*Datum: 01.04.2026*
