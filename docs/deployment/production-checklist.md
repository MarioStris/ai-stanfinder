# Production checklist — AI StanFinder

**Datum**: 01.04.2026
**Agent**: DevOps
**Status**: Faza 6 — Deployment

---

## Upute za koristenje

Prolazi kroz checklist **slijeva nadesno, odozgo prema dolje**.
Svaku stavku oznaci [x] kad je gotova.
**Ne deployati na produkciju dok sve stavke u Pre-launch checklistu nisu [x].**

---

## Pre-launch checklist

### Infrastruktura

- [ ] Railway projekt kreiran s odvojenim staging i production okruzenjima
- [ ] PostgreSQL plugin dodan i aktivan (Railway Pro plan)
- [ ] Redis plugin dodan i aktivan (Railway Pro plan)
- [ ] `infra/railway/railway.toml` commitano u repozitorij
- [ ] Railway servis konfiguriran da koristi `infra/docker/Dockerfile`
- [ ] Health check path postavljen na `/api/health` u Railway dashboardu
- [ ] Region postavljen na `eu-west` (Frankfurt)
- [ ] Restart policy: `On failure, max 3 retries`

### Environment varijable

- [ ] `NODE_ENV=production` postavljen
- [ ] `DATABASE_URL` postavljen (Railway automatski injektira ako koristis plugin)
- [ ] `REDIS_URL` postavljen (Railway automatski injektira)
- [ ] `CLERK_SECRET_KEY` postavljen (production Clerk aplikacija, ne test)
- [ ] `CLERK_PUBLISHABLE_KEY` postavljen (production)
- [ ] `GROK_API_KEY` postavljen i verifikacija API poziva radi
- [ ] `APIFY_API_TOKEN` postavljen
- [ ] `REVENUECAT_WEBHOOK_SECRET` postavljen
- [ ] `EXPO_ACCESS_TOKEN` postavljen
- [ ] `SENTRY_DSN` postavljen (production projekt u Sentry)
- [ ] Nijedno polje nije `undefined` — provjeri Railway dashboard > Variables

### Baza podataka i migracije

- [ ] Prisma migracije su pokrenute na production bazi (`npx prisma migrate deploy`)
- [ ] Schema je sinkronizirana s `prisma/schema.prisma`
- [ ] Indeksi su kreirani (provjeri `prisma/migrations/` za CREATE INDEX)
- [ ] Baza je dostupna iz Railway API servisa (provjeri logs za `Prisma connected`)
- [ ] Backup baze kreiran neposredno prije prvog deploya

### Sigurnost

- [ ] Nema hardkodiranih API kljuceva ili lozinki u kodu (provjeri `git grep -r "sk_live\|api_key" -- '*.ts'`)
- [ ] `.env` datoteke su u `.gitignore` i nisu commitane
- [ ] CORS je konfiguriran za produkcijsku domenu (ne `*`)
- [ ] Rate limiting je aktivan (provjeri `middleware/rate-limit.ts`)
- [ ] Clerk auth middleware stiti sve `/api/v1` rute osim javnih
- [ ] HTTPS/TLS — Railway automatski osigurava SSL za custom domene
- [ ] Prisma koristi `DATABASE_URL` iz environment varijable (ne hardkodirano)

### DNS i domene

- [ ] Custom domena dodana u Railway (`api.ai-stanfinder.com`)
- [ ] Cloudflare DNS A/CNAME rekord postavljen na Railway IP/hostname
- [ ] SSL certifikat aktivan (Railway/Cloudflare automatski)
- [ ] `www` redirectira na `api` (ako je aplicabilno)
- [ ] Cloudflare proxy ukljucen (narancasta oblacic ikona u DNS)

### CI/CD pipeline

- [ ] `RAILWAY_TOKEN` secret dodan u GitHub Actions
- [ ] `RAILWAY_STAGING_SERVICE_ID` var dodan u GitHub Actions
- [ ] `RAILWAY_PRODUCTION_SERVICE_ID` var dodan u GitHub Actions
- [ ] `STAGING_URL` i `PRODUCTION_URL` vars dodani u GitHub Actions
- [ ] GitHub environments `staging` i `production` kreirani s odgovarajucim `url`
- [ ] CD pipeline (`cd.yml`) uspjesno prosao na `develop` branch (staging deploy test)

### Monitoring

- [ ] Sentry projekt kreiran za `ai-stanfinder-api`
- [ ] `SENTRY_DSN` postavljen i Sentry prima testne evente
- [ ] UptimeRobot monitor kreiran za `/api/health` (5-minutni interval)
- [ ] UptimeRobot alert konfiguriran za devops@ai-stanfinder.com
- [ ] Railway notifikacije konfigurirane za Slack `#ops-alerts`

### Aplikacijski testovi

- [ ] `pnpm run test` prolazi bez gresaka (sve jedinicne testove)
- [ ] Build prolazi bez TypeScript gresaka (`pnpm run build`)
- [ ] Health check odgovara s `{ data: { status: "ok" } }` na produkciji
- [ ] Osnovna API autentikacija radi (test Clerk token)
- [ ] DB CRUD operacija radi (test listing CREATE/READ)

---

## Post-launch checklist (prvih 24h)

### Odmah nakon deploya (0-30 minuta)

- [ ] `curl https://api.ai-stanfinder.com/api/health` vraca HTTP 200
- [ ] `./infra/monitoring/health-check.sh` prolazi sve provjere
- [ ] Railway logs ne pokazuju FATAL ili ERROR poruke
- [ ] Sentry ne prima neuobicajeno visok broj gresaka
- [ ] UptimeRobot pokazuje "UP" status

### Funkcionalni smoke testovi (30-60 minuta)

- [ ] Registracija novog korisnika radi (`POST /api/v1/auth/register`)
- [ ] Login radi i vraca JWT token
- [ ] Dohvat listings-a radi (`GET /api/v1/listings`)
- [ ] Search/filter radi (`GET /api/v1/listings?city=Zagreb`)
- [ ] BullMQ workers su pokrenuti (provjeri logs za `Worker started`)
- [ ] Scheduled jobs su registrirani (provjeri logs za `Scheduler initialized`)

### Monitoring verifikacija (prvi dan)

- [ ] UptimeRobot je primio barem 12 uspjesnih provjera (svaka 5 min x 1h)
- [ ] Sentry dashboard prikazuje production okruzenje
- [ ] Railway metrics pokazuju normalne CPU/RAM vrijednosti (< 50%)
- [ ] Cloudflare Analytics prima promet

### Dokumentacija i komunikacija

- [ ] Tim obavijesten o uspjesnom launchu (Slack `#general`)
- [ ] Staging URL podijeljen s QA agentom za regression testiranje
- [ ] Deployment datum i verzija zabiljeleni u CHANGELOG.md

---

## Rollback plan

Aktivirati ako se pojavi P1 ili P2 incident u prvih 24h.

### Brzi rollback (< 5 minuta)

```bash
# 1. Identifikacija problema
railway logs --service api-production --follow

# 2. Pokretanje rollbacka
railway rollback --service api-production

# 3. Verifikacija
curl https://api.ai-stanfinder.com/api/health

# 4. Obavijest tima
# Slack #incidents: "Rollback izveden u [HH:MM], razlog: [opis]"
```

### Rollback decision tree

```
Problem detektiran
      |
      v
Je li API down (health check fail)?
  DA --> Rollback odmah, istrazuj poslije
  NE --> Je li error rate > 5%?
           DA --> Procijeni ozbiljnost:
                  - Podaci su kompromitrani? --> Rollback odmah
                  - Samo greske, nema gubitka podataka? --> Hotfix pokusaj (max 30 min) --> inace Rollback
           NE --> Je li performance degradiran (P95 > 3s)?
                  DA --> Monitor 15 minuta, ako se ne popravi --> Rollback
                  NE --> Logirati kao P3, istrazi u radnom vremenu
```

### Kontakti za incident

| Uloga | Kontakt | Dostupnost |
|-------|---------|-----------|
| On-call dev | devops@ai-stanfinder.com | 24/7 za P1 |
| CTO | cto@ai-stanfinder.com | Radni sati za P2+ |
| Railway support | https://railway.app/support | Radni sati |

---

## Periodicni zadaci (tjedno/mjesecno)

### Tjedno

- [ ] Provjeri Railway metrics (CPU, RAM, request rate trend)
- [ ] Provjeri Sentry — novi tipovi gresaka, trend povecanja
- [ ] Provjeri UptimeRobot report za prethodni tjedan
- [ ] Provjeri PostgreSQL storage usage (Railway dashboard)

### Mjesecno

- [ ] Pregledaj i ažuriraj dependencies (`pnpm update --interactive`)
- [ ] Provjeri Railway racun — troskovi vs budzet
- [ ] Provjeri istek API kljuceva (Clerk, Apify, Grok) — obnovi ako treba
- [ ] Testiraj rollback proceduru na staging okruzenju
- [ ] Provjeri backup integritet (rucni pg_dump + verifikacija restore na staging)
- [ ] Security scan: `pnpm audit --audit-level=high`
