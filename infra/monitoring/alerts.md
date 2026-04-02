# Monitoring i alerting plan — AI StanFinder

**Datum**: 01.04.2026
**Agent**: DevOps
**Status**: Faza 6 — Deployment

---

## Pregled alata

| Alat | Namjena | Plan | Cijena |
|------|---------|------|--------|
| Sentry | Error tracking, performance APM | Developer (free) → Team ($26/mj kad > 5k errors) | $0 start |
| UptimeRobot | Uptime monitoring, alerti | Free (50 monitora, 5-min interval) | $0 |
| Railway metrics | CPU, RAM, request rate | Ukljuceno u Pro planu | $0 extra |
| Cloudflare Analytics | CDN, DNS, DDoS statistike | Free tier | $0 |

---

## 1. Sentry — Error Tracking

### Integracija

```typescript
// apps/api/src/lib/sentry.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Ne logirati PII podatke korisnika
  beforeSend(event) {
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }
    return event;
  },
});
```

### Alert pravila u Sentry

| Alert | Uvjet | Kanal | Prioritet |
|-------|-------|-------|-----------|
| High error rate | > 10 novih errora u 5 minuta | Email + Slack | P1 |
| New issue | Svaki novi tip errora (first occurrence) | Email | P2 |
| Regression | Issue koji je bio resolved pojavi se opet | Email + Slack | P1 |
| Performance — P95 > 3s | API endpoint spor | Email | P2 |
| Unhandled rejection | Svaki unhandled promise rejection | Email | P1 |

### Sentry projekti

- `ai-stanfinder-api` — Node.js/Hono backend
- `ai-stanfinder-mobile` — Expo React Native (buduci)

---

## 2. UptimeRobot — Uptime Monitoring

### Konfiguracija monitora

#### Production

| Monitor | URL | Metoda | Interval | Alert threshold |
|---------|-----|--------|----------|-----------------|
| API Health | `https://api.ai-stanfinder.com/api/health` | HTTP | 5 min | > 2 neuspjesna provjera |
| API Root | `https://api.ai-stanfinder.com/api/v1` | HTTP (expect 404) | 10 min | > 2 neuspjesna provjera |
| Cloudflare DNS | `api.ai-stanfinder.com` | DNS | 5 min | Svaka promjena |

#### Staging

| Monitor | URL | Metoda | Interval |
|---------|-----|--------|----------|
| Staging Health | `https://staging-api.ai-stanfinder.com/api/health` | HTTP | 10 min |

### Alert kanali — UptimeRobot

1. Email: devops@ai-stanfinder.com (svi eventi)
2. Email: cto@ai-stanfinder.com (samo P1 downtime)
3. SMS (opcija za produkciju, UptimeRobot Pro)
4. Slack webhook: `#ops-alerts` kanal

### SLA ciljevi

| Metrika | Target | Mjerni period |
|---------|--------|---------------|
| Uptime | >= 99.5% | Mjesecno |
| P50 response time | < 200ms | Tjedno |
| P95 response time | < 1000ms | Tjedno |
| Error rate | < 1% | Dnevno |

---

## 3. Railway Metrics — Infrastructure

Railway Pro plan ukljucuje:
- **CPU usage** — alert ako > 80% sustained 5 minuta
- **Memory usage** — alert ako > 85% RAM limita
- **Deploy success/failure** — obavijest za svaki deploy
- **Crash loop detection** — automatski restart + notifikacija

### Konfiguracija Railway alertova

U Railway dashboardu (`Settings > Notifications`):
- Deploy success: `#deployments` Slack kanal
- Deploy failure: email + `#ops-alerts` Slack kanal
- Service crash: email + `#ops-alerts` Slack kanal + SMS

---

## 4. Cloudflare Analytics

Cloudflare Free tier pruzuje:
- **Request analytics** — ukupan broj zahtjeva, cache hit rate
- **Security analytics** — blocked threats, firewall rules triggered
- **Performance** — TTFB, response size

Provjera tjedno za:
- Neuobicajeni spike u zahtjevima (potencijalni abuse)
- Cache hit rate pad (provjeriti Cache-Control headere)
- Povec anje 4xx/5xx greskaka

---

## 5. Logging strategija

### Log leveli

| Level | Kada koristiti |
|-------|---------------|
| ERROR | Neocekivane greske, failed DB upiti, external API failures |
| WARN | Throttling, visoki response time, deprecated usage |
| INFO | Request/response (bez tijela), deploy eventi, scheduled job start/end |
| DEBUG | Samo u development i staging okruzenju |

### Log format (JSON structured)

```json
{
  "timestamp": "2026-04-01T12:00:00.000Z",
  "level": "error",
  "message": "Prisma query failed",
  "service": "ai-stanfinder-api",
  "environment": "production",
  "requestId": "req_abc123",
  "userId": "user_xyz789",
  "error": {
    "code": "P2002",
    "target": ["email"]
  }
}
```

### Log retention

- Railway logs: 7 dana (ukljuceno u Pro plan)
- Sentry events: 90 dana (Developer plan)
- Audit logs (baza): 12 mjeseci (vlastita tablica)

---

## 6. Performance APM (Sentry Tracing)

```typescript
// Instrumentirati kljucne operacije
const span = Sentry.startInactiveSpan({
  name: 'matching.rankListings',
  op: 'function',
});
// ... posao ...
span.end();
```

### Kljucne transakcije za pracenje

| Transakcija | Target P95 | Alert threshold |
|-------------|-----------|-----------------|
| POST /api/v1/matching/run | < 3s | > 5s |
| GET /api/v1/listings | < 500ms | > 2s |
| POST /api/v1/auth/* | < 300ms | > 1s |
| BullMQ: scraping job | < 120s | > 300s |
| BullMQ: matching job | < 30s | > 60s |

---

## 7. Incident response

### Severity klasifikacija

| Razina | Opis | Reaction time | Tko |
|--------|------|---------------|-----|
| P1 — Critical | API down, DB nedostupan, data breach | 15 minuta | On-call dev |
| P2 — High | > 5% error rate, spore API (> 3s) | 1 sat | On-call dev |
| P3 — Medium | Povecani error rate, pojedine funkcije ne rade | 4 sata | Radni sati |
| P4 — Low | Performansni problemi, UI bugovi | Sljedeci sprint | Backlog |

### P1 runbook (kratki)

1. Provjeri Railway dashboard — je li servis up?
2. Provjeri Sentry — koji je error?
3. Provjeri Railway logs zadnjih 5 minuta
4. Ako je potreban rollback: `railway rollback --service <id>`
5. Obavijesti tim u Slack `#incidents`
6. Pisati post-mortem unutar 24h
