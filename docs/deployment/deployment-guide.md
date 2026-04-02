# Vodic za deployment — AI StanFinder

**Datum**: 01.04.2026
**Agent**: DevOps
**Status**: Faza 6 — Deployment

---

## Pregled

AI StanFinder se deploya na **Railway** kao primarnu hosting platformu. Lokalni razvoj koristi Docker Compose. CI/CD pipeline (GitHub Actions) automatski deployuje na staging i produkciju.

```
developer laptop
  └── docker-compose.yml    (lokalni dev: API + PostgreSQL + Redis + Mailhog)

GitHub Actions (cd.yml)
  ├── develop branch  →  Railway staging
  └── main branch     →  Railway production
```

---

## 1. Preduvjeti

Potrebni alati na lokalnom racunalu:

```bash
node --version      # >= 20.x
pnpm --version      # >= 9.x
docker --version    # >= 24.x
railway --version   # Railway CLI (@railway/cli)
```

Instalacija Railway CLI:
```bash
npm install -g @railway/cli
railway login
```

---

## 2. Lokalni razvoj — Docker Compose

### Pokretanje

```bash
# 1. Kopiraj .env.example u .env i popuni vrijednosti
cp .env.example .env

# 2. Pokreni sve servise
docker-compose -f infra/docker/docker-compose.yml up -d

# 3. Provjeri status
docker-compose -f infra/docker/docker-compose.yml ps

# 4. Pokreni DB migracije
pnpm --filter @ai-stanfinder/api run db:migrate

# 5. (Opcionalno) Seed baza s testnim podacima
pnpm --filter @ai-stanfinder/api run db:seed
```

### Pristup servisima

| Servis | URL |
|--------|-----|
| API server | http://localhost:3001 |
| Health check | http://localhost:3001/api/health |
| Mailhog web UI | http://localhost:8025 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Zaustavljanje i cistenje

```bash
# Zaustavi servise (sacuvaj podatke)
docker-compose -f infra/docker/docker-compose.yml down

# Zaustavi i obrisi volume (resetiraj bazu)
docker-compose -f infra/docker/docker-compose.yml down -v
```

---

## 3. Konfiguracija Railway projekta (prvi put)

### 3.1 Kreiranje projekta

```bash
# Prijavi se u Railway
railway login

# Kreiraj novi projekt
railway init

# Poveži lokalni repozitorij s projektom
railway link
```

### 3.2 Kreiranje servisa u Railway dashboardu

U Railway dashboardu, kreiraj sljedece servise:

| Servis | Tip | Opis |
|--------|-----|------|
| `api-production` | GitHub repo deploy | Hono API server — main branch |
| `api-staging` | GitHub repo deploy | Hono API server — develop branch |
| `postgres` | Database plugin | PostgreSQL 16 |
| `redis` | Database plugin | Redis 7 |

### 3.3 Postavljanje environment varijabli

Environment varijable postavljaju se u Railway dashboardu za svaki servis zasebno.
**Nikad ne commitati .env datoteke u repozitorij.**

Kopiraj varijable iz tablice u poglavlju 4. Opcije:

**Opcija A — Railway dashboard**:
`Railway projekt > api-production > Variables > + New Variable`

**Opcija B — Railway CLI**:
```bash
railway variables set CLERK_SECRET_KEY=sk_live_xxx --service api-production
railway variables set DATABASE_URL=postgresql://... --service api-production
```

**Opcija C — .env datoteka upload**:
```bash
railway variables upload .env.production --service api-production
```

### 3.4 Konfiguracija GitHub Actions secrets

U GitHub repozitoriju (`Settings > Secrets and variables > Actions`):

| Secret | Vrijednost |
|--------|-----------|
| `RAILWAY_TOKEN` | Railway API token (Railway dashboard > Account > Tokens) |

U GitHub `vars` (ne secrets, jer nisu osjetljive):

| Variable | Vrijednost |
|----------|-----------|
| `RAILWAY_STAGING_SERVICE_ID` | ID staging servisa iz Railway dashboarda |
| `RAILWAY_PRODUCTION_SERVICE_ID` | ID production servisa iz Railway dashboarda |
| `STAGING_URL` | https://staging-api.ai-stanfinder.com |
| `PRODUCTION_URL` | https://api.ai-stanfinder.com |

### 3.5 Konfiguracija Railway servisa

U Railway dashboardu za `api-production`:
- Build: `DOCKERFILE` — `infra/docker/Dockerfile`
- Health check path: `/api/health`
- Restart policy: On failure (max 3 retries)
- Region: `eu-west` (Frankfurt, Njemacka)

---

## 4. Environment varijable

### Obavezne varijable (production i staging)

| Varijabla | Opis | Primjer |
|-----------|------|---------|
| `NODE_ENV` | Runtime okruzenje | `production` |
| `PORT` | Port na kojem server slusa | `3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `REDIS_URL` | Redis connection string | `redis://default:pass@host:6379` |
| `CLERK_SECRET_KEY` | Clerk backend API kljuc | `sk_live_xxx` |
| `CLERK_PUBLISHABLE_KEY` | Clerk frontend API kljuc | `pk_live_xxx` |
| `GROK_API_KEY` | xAI Grok API kljuc (AI matching) | `xai-xxx` |
| `APIFY_API_TOKEN` | Apify token (web scraping) | `apify_api_xxx` |
| `REVENUECAT_WEBHOOK_SECRET` | RevenueCat webhook verifikacija | `rcwh_xxx` |
| `EXPO_ACCESS_TOKEN` | Expo push notifikacije | `xxx` |
| `SENTRY_DSN` | Sentry error tracking DSN | `https://xxx@sentry.io/xxx` |

### Opcionalne varijable

| Varijabla | Opis | Default |
|-----------|------|---------|
| `LOG_LEVEL` | Razina logiranja | `info` |
| `RATE_LIMIT_MAX` | Max zahtjeva po IP/minuta | `100` |
| `MATCHING_CACHE_TTL` | Cache TTL za matching rezultate (sekunde) | `3600` |
| `SCRAPING_CRON_INTERVAL` | Interval scrapinga (cron izraz) | `0 */6 * * *` |

### Railway automatske varijable

Railway automatski injektira ove varijable kada koristis plugin servise:

| Varijabla | Opis |
|-----------|------|
| `DATABASE_URL` | PostgreSQL connection string (Railway PostgreSQL plugin) |
| `REDIS_URL` | Redis connection string (Railway Redis plugin) |

---

## 5. Prisma migracije

### Development

```bash
# Kreiraj novu migraciju
pnpm --filter @ai-stanfinder/api run db:migrate

# Primijeni migracije bez kreiranja novih (CI/CD)
npx prisma migrate deploy
```

### Production deploy

Migracije se automatski izvrsavaju u CD pipeline-u nakon uspjesnog deploya (korak `Run Prisma migrations`). Rucno pokretanje:

```bash
# Izvrsiti migracije na produkcijskoj bazi
railway run --service api-production -- npx prisma migrate deploy
```

### Rollback migracije

Prisma ne podrzava automatski rollback. Postopak:

1. Kreiraj novu migraciju koja ponitava promjene (reverse migration)
2. Deployaj tu migraciju
3. Ako je struktura podataka kompromitirana — koristiti DB backup (vidi poglavlje 7)

---

## 6. Rollback procedura

**Cilj: < 5 minuta od detekcije problema do povratka na stabilnu verziju.**

### Automatski rollback (Railway)

Railway cuva zadnjih 10 deploya po servisu.

```bash
# Prikazi listu deploya
railway deployments list --service api-production

# Rollback na prethodni deploy
railway rollback --service api-production

# Rollback na specificni deploy
railway rollback --service api-production --deployment <deployment-id>
```

### Korak po korak

1. **Detekcija (0-2 min)**
   - UptimeRobot salje alert (downtime ili health check fail)
   - Sentry prijavljuje visoku stopu gresaka
   - Railway salje obavijest o crash loopu

2. **Procjena (1 min)**
   - Provjeri Railway logs: `railway logs --service api-production`
   - Provjeri Sentry dashboard za tip greske
   - Odluka: rollback ili hotfix?

3. **Rollback (1-2 min)**
   ```bash
   railway rollback --service api-production
   ```

4. **Verifikacija (1-2 min)**
   ```bash
   ./infra/monitoring/health-check.sh
   # ili rucno:
   curl https://api.ai-stanfinder.com/api/health
   ```

5. **Komunikacija**
   - Obavijesti tim u Slack `#incidents`
   - Dokumentiraj sto se dogodilo i kada je rollback izveden

6. **Post-mortem (unutar 24h)**
   - Uzrok incidenta
   - Sto je popravljeno
   - Sto se mijenja da se ne ponovi

### Rollback baze podataka

Koristiti samo ako migracija uzrokuje gubitak ili korupciju podataka:

```bash
# 1. Provjeri zadnji backup (Railway automatski backupira PostgreSQL svaka 24h)
# Railway dashboard > postgres > Backups

# 2. Restore backup (Railway UI)
# postgres > Backups > <datum> > Restore
# UPOZORENJE: Restore baze je destruktivan — provjeri dva puta!

# 3. Redeploy API na staru verziju
railway rollback --service api-production --deployment <stable-deployment-id>
```

---

## 7. Backup strategija

### PostgreSQL (Railway managed)

- **Automatski backup**: Railway Pro plan — daily backups, 7 dana retencija
- **Point-in-time recovery**: nije dostupno na Railway Free/Pro (samo Starter je bez backupa)
- **Rucni backup** (preporucuje se prije svake vecje migracije):

```bash
# Dohvati DATABASE_URL iz Railway
DB_URL=$(railway variables get DATABASE_URL --service postgres)

# Dump baze
pg_dump "$DB_URL" > backup-$(date +%Y%m%d-%H%M%S).sql

# Pohrani na sigurno mjesto (npr. lokalno ili Cloudflare R2)
```

### Redis

- Redis sadrzi samo privremene podatke (BullMQ job queues, matching cache)
- **Nema potrebe za backup** — gubitak Redis podataka uzrokuje samo ponavljanje pozadinskih jobova
- BullMQ jobovi koji su bili `waiting` ili `active` ce biti ponovo zakazani pri restartu

---

## 8. Scaling

### Vertikalno skaliranje (Railway)

Railway automatski skalira CPU i RAM unutar limita plana. Za povecanje limita:
`Railway dashboard > api-production > Settings > Resources > vCPU/RAM`

### Horizontalno skaliranje

Za > 500 concurrent korisnika:
```bash
# U Railway dashboardu: api-production > Settings > Replicas > 2+
# Railway automatski load-balancira izmedju replika
```

Trigger: API P95 response time > 500ms sustained 10 minuta.

### Database skaliranje

- PostgreSQL: Railway podrzava read replicas (Pro+ plan) — dodati ako SELECT upiti postanu bottleneck
- Redis: Povecaj `maxmemory` u railway.toml ako queue se puni (monitoring u Railway metrics)

---

## 9. Korisni Railway CLI komande

```bash
# Prijava
railway login

# Prikazi projekte
railway projects

# Prikazi varijable
railway variables --service api-production

# Prati live logs
railway logs --service api-production --follow

# Otvori shell u kontejneru
railway run --service api-production -- /bin/sh

# Provjeri status deploya
railway deployments list --service api-production

# Pokrni jednokratnu naredbu (npr. seed)
railway run --service api-production -- node dist/scripts/seed.js
```
