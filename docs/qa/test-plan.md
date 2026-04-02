# Test Plan — AI StanFinder
**Datum**: 01.04.2026
**Agent**: QA Agent
**Status**: Faza 6 — QA i Deployment
**Verzija**: 1.0

---

## 1. Svrha i opseg

Ovaj dokument definira kompletnu test strategiju za AI StanFinder API (Sprint 1-5 MVP opseg). Pokriva sve User Stories US-01 do US-20 i sve API endpointe definirane u Hono aplikaciji.

### Što je obuhvaceno
- Svi REST API endpointi u `/api/v1/`
- Auth flow (Clerk JWT, GDPR brisanje racuna)
- Filter CRUD s tier gatingom (FREE/PREMIUM)
- AI Matching engine (Grok API + queue)
- Push notifikacije i postavke
- Billing webhook (RevenueCat)
- Ingest pipeline (CSV → BullMQ → DB)
- Rate limiting middleware

### Što nije obuhvaceno u ovoj fazi
- Mobile UI (Expo/React Native) — poseban QA plan
- Email sazetak (Should Have, Sprint 2+)
- Map view integracija (Could Have)

---

## 2. Test strategija

Koristimo test piramidu s tri razine:

```
        /\
       /  \   E2E scenariji (YAML)
      /----\  Integration testovi (Vitest + mocked DB)
     /------\ Unit testovi (Vitest)
    /--------\
```

### 2.1 Unit testovi
- **Alat**: Vitest
- **Lokacija**: `apps/api/src/__tests__/*.test.ts`
- **Opseg**: Poslovne logike, validacijske sheme, helper funkcije, CSV parser, matching prompt builder, caching logika
- **Cilj pokrivenosti**: > 80% linija po modulu

### 2.2 Integration testovi
- **Alat**: Vitest s mockiranim Prisma klijentom i vanjskim servisima
- **Lokacija**: `apps/api/src/__tests__/integration/*.test.ts`
- **Opseg**: Kriticni tokovi koji prolaze kroz vise modula (ingest → match → notify, billing webhook → tier promjena → scheduler)
- **Vanjski servisi koji se mockaju**: Grok API, Clerk, Expo Push, RevenueCat webhook, BullMQ

### 2.3 E2E / API testovi
- **Alat**: YAML specifikacija za Postman/Insomnia + rucno testiranje na staging okruzenju
- **Lokacija**: `tests/e2e/api-tests.md`
- **Opseg**: Kompletni korisnicni tokovi od registracije do brisanja racuna

---

## 3. Test matrica — User Stories

### US-01: Email registracija
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | POST /api/v1/auth/register s valjanim emailom i lozinkom | 201, korisnik kreiran | Visok |
| 2 | POST s nevaljanom email adresom | 400, VALIDATION_ERROR | Visok |
| 3 | POST s prekratkom lozinkom (< 8 znakova) | 400 | Visok |
| 4 | POST s emailom koji vec postoji | 409, EMAIL_IN_USE | Visok |
| 5 | POST bez body-ja | 400 | Srednji |

### US-02: Demo bez registracije
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | GET /api/v1/listings bez Auth headera | 200, javni podaci | Visok |
| 2 | GET /api/v1/listings?limit=6 (demo mode) | 200, max 6 stavki | Srednji |

### US-03: Filter setup (osnovni filteri)
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | POST /api/v1/filters s valjanim tijelom | 201, filter kreiran | Visok |
| 2 | POST bez autorizacije | 401 | Visok |
| 3 | FREE korisnik kreira drugi filter | 403, FILTER_LIMIT_REACHED | Visok |
| 4 | POST s nevaljanim propertyType | 400, VALIDATION_ERROR | Visok |
| 5 | POST s negativnom cijenom | 400 | Srednji |
| 6 | GET /api/v1/filters (lista filtera) | 200, paginirana lista | Visok |
| 7 | PUT /api/v1/filters/:id (azuriranje) | 200, azurirani filter | Visok |
| 8 | PUT filtera drugog korisnika | 403, FORBIDDEN | Visok |
| 9 | DELETE /api/v1/filters/:id | 204 | Visok |
| 10 | DELETE nepostojeceg filtera | 404 | Srednji |

### US-04: Semanticka pretraga (prirodni jezik)
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | POST filtera s poljem `naturalLanguageQuery` | 201, polje sacuvano | Visok |
| 2 | Matching job koristi nl query uz standardne filtere | Grok API pozvan s kombiniranim promptom | Visok |
| 3 | Grok API vrati greshu (timeout) | Posao u dead-letter queue | Srednji |

### US-05: Vise filtera (tier gating)
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | FREE korisnik ima 1 filter — POST drugog filtera | 403, FILTER_LIMIT_REACHED | Visok |
| 2 | PREMIUM korisnik kreira 4+ filtera | 201 za svaki | Visok |
| 3 | GET /api/v1/filters vraca samo filtere prijavljenog korisnika | 200, izolirani podaci | Visok |

### US-06: TOP 10 match lista
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | GET /api/v1/filters/:id/matches s valjanim filterom | 200, polje `data` je array | Visok |
| 2 | Svaki match ima `matchPercent`, `rank`, `aiComment`, `property` | Svi kljucni podaci prisutni | Visok |
| 3 | Matchevi su sortirani po `rank` ASC | Provjera redosljeda | Visok |
| 4 | GET matches nepostojeceg filtera | 404 | Visok |
| 5 | GET matches filtera drugog korisnika | 403, FORBIDDEN | Visok |

### US-07: Detalji oglasa
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | GET /api/v1/listings/:id (postojeci) | 200, kompletan objekt | Visok |
| 2 | GET /api/v1/listings/:id (nepostojeci) | 404, NOT_FOUND | Visok |
| 3 | Odgovor sadrzi `images`, `price`, `area`, `pricePerM2` | Provjera shape-a | Visok |

### US-08: AI sugestije (Should Have)
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | Grok API vraca suggestions polje u matching rezultatu | Polje prisutno u match odgovoru | Srednji |
| 2 | Sugestije su prazne ako nema podataka | Prazan array, ne null | Nizak |

### US-09: Push notifikacije
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | POST /api/v1/push-tokens s valjanim tokenom | 201, registered: true | Visok |
| 2 | POST s praznim tokenom | 400, VALIDATION_ERROR | Visok |
| 3 | POST s nevaljanom platformom (ne ios/android) | 400 | Visok |
| 4 | POST bez autorizacije | 401 | Visok |
| 5 | DELETE /api/v1/push-tokens/:token | 204, isActive: false | Visok |
| 6 | Notifikacija worker salje push na Expo API | Mock Expo SDK verifikacija | Visok |

### US-10: Email sazetak (Should Have - Sprint 2)
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | PUT /api/v1/notifications/settings s emailEnabled: true | 200, postavka sacuvana | Srednji |

### US-11 / US-12: Favoriti i statusi (Should Have)
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | PATCH /api/v1/matches/:id/read | 200, isNew: false, isSeen: true | Visok |
| 2 | PATCH matcheva koji ne pripada korisniku | 403 | Visok |

### US-13 / US-14: FREE/PREMIUM tier gating
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | GET /api/v1/billing/status bez pretplate | 200, tier: FREE | Visok |
| 2 | GET /api/v1/billing/status s aktivnom pretplatom | 200, tier: PREMIUM | Visok |
| 3 | POST /billing/webhook INITIAL_PURCHASE s valjanim secretom | 200, PREMIUM upgrade | Visok |
| 4 | POST /billing/webhook bez Authorization headera | 401 | Visok |
| 5 | POST /billing/webhook EXPIRATION | 200, downgrade na FREE, scheduler azuriran | Visok |
| 6 | POST /billing/webhook CANCELLATION | 200, status: CANCELLED | Visok |
| 7 | POST /billing/webhook s nepostojecim korisnikom | 404 | Visok |

### US-17: Profil i postavke
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | GET /api/v1/notifications/settings (nema prefs) | 200, default vrijednosti | Visok |
| 2 | PUT /api/v1/notifications/settings s valjanim tijelom | 200, azurirano | Visok |
| 3 | PUT s minMatchScore: 150 | 400, VALIDATION_ERROR | Visok |
| 4 | PUT s nevaljanom frequency vrijednosti | 400 | Visok |

### US-18: CSV ingest
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | POST /api/v1/ingest s valjanim CSV i API kljucem | 202, jobId vraceN | Visok |
| 2 | POST bez API kljuca | 401 | Visok |
| 3 | POST s pogresnim API kljucem | 401 | Visok |
| 4 | POST s nevaljanim CSV formatom | 400 | Visok |
| 5 | Isti oglas poslan dva puta — deduplikacija | Jedan zapis u DB | Visok |
| 6 | Oglas s promijenjenom cijenom — azuriranje | Cijena azurirana, ne duplikat | Visok |
| 7 | CSV sa 1000 redaka | 202, worker procesira bez greske | Srednji |

### US-19: AI Matching scheduler
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | POST /api/v1/filters/:id/matches/refresh | 202, jobId, status: queued | Visok |
| 2 | Refresh na neaktivnom filteru | 400, FILTER_INACTIVE | Visok |
| 3 | Refresh na filteru drugog korisnika | 403, FORBIDDEN | Visok |
| 4 | Matching worker generira matcheve i sprema ih | DB upis provjeren | Visok |

### US-20: API troskovi i rate limiting
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | Rate limit — 100+ zahtjeva/min s iste IP | 429, Too Many Requests | Visok |
| 2 | API usage log upisan po Grok API pozivu | DB zapis s tokenima i cijenom | Srednji |

### GDPR testovi
| # | Scenarij | Ocekivani rezultat | Prioritet |
|---|---------|-------------------|-----------|
| 1 | GET /api/v1/me/data-export | 200, kompletni export JSON | Visok |
| 2 | GET /me/data-export bez autorizacije | 401 | Visok |
| 3 | DELETE /api/v1/me bez X-Confirm-Delete headera | 400, CONFIRMATION_REQUIRED | Visok |
| 4 | DELETE /api/v1/me s X-Confirm-Delete: true | 200, deleted: true | Visok |
| 5 | DELETE brise i lokalnog korisnika i Clerk korisnika | Oba obrisana | Visok |

---

## 4. Edge case testovi

### 4.1 Boundary vrijednosti
| Scenarij | Input | Ocekivani rezultat |
|---------|-------|-------------------|
| Cijena = 0 | priceMin: 0 | 200 ili 400 (ovisno o schema) |
| Kvadratura = 1 m² | areaMin: 1 | 200 |
| matchScore = 0 | minMatchScore: 0 | 200, validno |
| matchScore = 100 | minMatchScore: 100 | 200, validno |
| matchScore = 101 | minMatchScore: 101 | 400, VALIDATION_ERROR |
| Limit = 1 (listings) | ?limit=1 | 200, 1 stavka |
| Limit = 100 (max) | ?limit=100 | 200, max 100 |
| Limit = 0 | ?limit=0 | 400 ili default |
| Cursor nepostojeci ID | ?cursor=fake-id | 200, prazna lista |

### 4.2 Concurrency scenariji
| Scenarij | Ocekivani rezultat |
|---------|-------------------|
| Dva istovremena refresh zahtjeva na isti filter | Oba dodana u queue, ne duplikati u DB |
| Dva korisnika pristupaju istom nekretnini | Nema race condition — izolirani odgovori |
| Ingest i matching paralelno | Nema deadlocka, oba posla uspjesno zavrse |

### 4.3 Malformed input
| Scenarij | Ocekivani rezultat |
|---------|-------------------|
| JSON body s nevalidnim tipovima (`price: "string"`) | 400, VALIDATION_ERROR |
| Prazan JSON `{}` na POST filtera | 400 |
| Enormno dugacak naturalLanguageQuery (> 2000 znakova) | 400 ili skracivanje |
| SQL injection u city parametru | 200 sa sanitiziranim inputom (Prisma stiti) |
| XSS payload u name polju filtera | 200, sacuvan kao string (bez izvrsavanja) |

### 4.4 Auth edge cases
| Scenarij | Ocekivani rezultat |
|---------|-------------------|
| Istekli JWT token | 401, TOKEN_EXPIRED |
| JWT s nevaljanim potpisom | 401 |
| JWT za obrisanog korisnika | 401 ili 404 |
| Request bez Authorization headera na zasticenu rutu | 401 |

---

## 5. Performance ciljevi

| Metrika | Cilj | Alarm |
|---------|------|-------|
| API p95 response time (zdravi endpoint) | < 50ms | > 100ms |
| API p95 response time (listings s filterima) | < 200ms | > 500ms |
| Match lista dohvat (cached) | < 500ms | > 1s |
| Match lista dohvat (fresh) | < 3s | > 5s |
| CSV ingest job (1000 redaka) | < 10s | > 30s |
| Billing webhook obrada | < 500ms | > 2s |
| Throughput (concurrent korisnici) | 100 RPS bez degradacije | < 50 RPS |
| DB query za listings (10k redaka) | < 500ms | > 1s |

### Load test scenariji
1. **Smoke test**: 5 VU, 1 minuta — verificira osnovno funkcioniranje
2. **Load test**: 50 VU, 5 minuta — simulira normalnu produkcijsku razinu
3. **Spike test**: 0 → 200 VU u 10s — simulira marketing kampanju / App Store featured
4. **Soak test**: 20 VU, 2h — detektira memory leak i kumulativne pogre"ke

---

## 6. Accessibility checklist (Mobile app — Expo)

- [ ] Svi interaktivni elementi imaju `accessibilityLabel`
- [ ] Kontrast teksta >= 4.5:1 (WCAG AA)
- [ ] Font size minimalno 16px za body tekst
- [ ] VoiceOver/TalkBack navigacija bez zaprecenosti
- [ ] Touch target minimalno 44x44pt
- [ ] Ne oslanja se isklju"civo na boju za prenosenje informacija
- [ ] Animacije postuju `prefers-reduced-motion`
- [ ] Gresne poruke su programski povezane s inputom

---

## 7. Security test checklist

### Autentikacija i autorizacija
- [ ] Sve zasticene rute vracaju 401 bez valjanog tokena
- [ ] Korisnik ne moze pristupiti podacima drugog korisnika (IDOR test)
- [ ] Webhook endpoint odbija zahtjeve bez valjanog HMAC/Bearer secreta
- [ ] GDPR brisanje zahtijeva eksplicitnu potvrdu (X-Confirm-Delete header)

### Input validacija
- [ ] Sve Zod sheme validiraju tip, velicinu i format
- [ ] Ninjekcija u DB parametrima nije moguca (Prisma parameterized queries)
- [ ] File upload (CSV) validira content-type i velicinu
- [ ] Rate limiting aktivan na svim javnim endpointima

### Podatkovna sigurnost
- [ ] Tajni kljucevi nisu u kodu (provjera .env varijabli)
- [ ] CORS konfiguriran restriktivno (ne wildcard u produkciji)
- [ ] Push tokeni se maskaju u logovima
- [ ] Korisnicki emailovi nisu izlozeni u javnim endpointima
- [ ] API usage log ne biljezi sadrzaj prompta

### GDPR compliance
- [ ] Data export ukljucuje sve podatke vezane uz korisnika
- [ ] Brisanje racuna brise i podatke u Clerku
- [ ] Privacy policy link dostupan u app-u
- [ ] Push token se automatski deaktivira pri brisanju racuna

---

## 8. Test environment setup

### Lokalni razvoj
```bash
# 1. Instaliraj ovisnosti
cd apps/api && pnpm install

# 2. Pokreni DB (PostgreSQL)
docker-compose up -d postgres redis

# 3. Pokreni migracije
pnpm db:migrate

# 4. Seed test podataka
pnpm db:seed

# 5. Pokreni testove
pnpm test

# 6. S coverage izvjescem
pnpm test:coverage
```

### Okolišne varijable za testove
```
DATABASE_URL=postgresql://localhost:5432/stanfinder_test
REDIS_URL=redis://localhost:6379
CLERK_SECRET_KEY=test_clerk_key
REVENUECAT_WEBHOOK_SECRET=test_revenuecat_secret
SCRAPING_API_KEY=test_scraping_key
GROK_API_KEY=test_grok_key (nikad pravi u testovima)
```

### Mock strategija
| Servis | Mock alat | Napomena |
|--------|-----------|---------|
| Prisma / PostgreSQL | `vi.mock('../lib/db.js')` | Svi DB pozivi mockirani |
| Grok API | `vi.mock('../lib/grok.js')` | Nikad se ne poziva pravi API u testovima |
| Clerk | `vi.mock('@clerk/backend')` | Lazi user ID i JWT verifikacija |
| Expo Push | `vi.mock('../lib/push.js')` | Simulira uspjesno slanje |
| BullMQ | `vi.mock('../lib/queue.js')` | Mock `add` metoda queue-a |
| Scheduler | `vi.mock('../lib/scheduler.js')` | Mock `updateSchedulerInterval` |

---

## 9. Definition of Done — QA kriteriji

Merge je blokiran dok:
- [ ] Svi unit testovi prolaze (`pnpm test` — zero failures)
- [ ] Coverage >= 80% po modulu
- [ ] Nema critical ili high severity bugova
- [ ] Svaki novi endpoint ima minimalno 5 testova (success + auth fail + validation fail + not found + server error)
- [ ] Integration testovi za kriticne tokove prolaze
- [ ] E2E scenariji manualno verificirani na staging okruzenju
- [ ] Security checklist provjeren i prihvacen
- [ ] Performance ciljevi dostignuti na staging load testu
- [ ] GDPR flow (export + delete) verificiran end-to-end

---

*QA Agent | AI StanFinder | Faza 6 — QA i Deployment*
