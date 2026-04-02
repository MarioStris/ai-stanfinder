# Bug Report Template — AI StanFinder

**Datum**: _______________
**Reporter**: _______________
**Verzija aplikacije**: _______________
**Okruzenje**: [ ] Local  [ ] Staging  [ ] Production

---

## Identifikacija

| Polje | Vrijednost |
|-------|-----------|
| **Bug ID** | BUG-YYYY-NNN |
| **Naslov** | Kratki opis problema (max 80 znakova) |
| **Modul** | [ ] Auth  [ ] Listings  [ ] Matching  [ ] Notifications  [ ] Billing  [ ] GDPR  [ ] Ingest  [ ] Scheduler |
| **User Story** | US-XX |
| **Severity** | [ ] Critical  [ ] High  [ ] Medium  [ ] Low |
| **Priority** | [ ] P1 (blokira release)  [ ] P2 (ovaj sprint)  [ ] P3 (sljedeci sprint)  [ ] P4 (backlog) |
| **Status** | [ ] New  [ ] In Progress  [ ] Fixed  [ ] Verified  [ ] Closed  [ ] Won't Fix |

---

## Severity definicije

| Razina | Opis | Primjer |
|--------|------|---------|
| **Critical** | Sustav neupotrebljiv, sigurnosna ranjivost, gubitak podataka | Korisnik moze vidjeti podatke drugog korisnika; brisanje racuna ne radi |
| **High** | Kljucna funkcionalnost ne radi, nema workarounda | Matching ne vraca rezultate; billing webhook ne azurira tier |
| **Medium** | Funkcionalnost djelomicno ne radi ili postoji workaround | Paginacija preskoce zadnji element; notifikacija kasni |
| **Low** | Kozmeticki problem, sitna anomalija | Tipfeler u error poruci; netocan status kod (201 vs 200) |

---

## Okruzenje reprodukcije

```
OS:                 (Windows 11 / macOS / Ubuntu)
Node.js verzija:    (npr. v20.12.0)
pnpm verzija:       (npr. 9.0.0)
PostgreSQL verzija: (npr. 15.6)
Redis verzija:      (npr. 7.2)
API verzija:        (iz GET /api/health)
Branch:             (npr. main / feature/billing-fix)
Commit hash:        (git rev-parse HEAD)
```

---

## Reprodukcija

### Preduvjeti
> Sto mora biti postavljeno prije reprodukcije?

- [ ] Korisnik registriran i prijavljen
- [ ] Aktivan filter postoji
- [ ] PREMIUM pretplata aktivna
- [ ] Drugi: _______________

### Koraci reprodukcije

```
1.
2.
3.
4.
```

### HTTP zahtjev (ako primjenjivo)

```http
METHOD /path HTTP/1.1
Host: localhost:3001
Authorization: Bearer <token>
Content-Type: application/json

{
  "field": "value"
}
```

---

## Rezultati

### Ocekivani rezultat
> Sto bi se trebalo desiti?

```

```

### Stvarni rezultat
> Sto se zapravo desilo?

```

```

### HTTP odgovor (ako primjenjivo)

```
Status:
Body: {
  "data": ...,
  "error": { "code": "...", "message": "..." },
  "meta": ...
}
```

---

## Dokazi

| Tip | Link / Prilog |
|-----|--------------|
| Screenshot | |
| Video snimka | |
| Log izvadak | |
| curl naredba | |

### Relevantni logovi

```
[TIMESTAMP] [MODULE] Log poruka ovdje
```

---

## Utjecaj

### Pogodeni korisnici
- [ ] Svi korisnici
- [ ] FREE korisnici
- [ ] PREMIUM korisnici
- [ ] Novi korisnici (onboarding)
- [ ] Postotak procjena: ____%

### Pogodene User Stories
- US-__ : _______________
- US-__ : _______________

### Pogodeni endpointi
- `METHOD /api/v1/...`

---

## Analiza uzroka (popunjava developer)

### Root cause
> Sto je uzrokovalo bug?

```

```

### Pogodene datoteke
```
apps/api/src/modules/___/routes.ts  (linija __)
apps/api/src/lib/___.ts             (linija __)
```

### Tip problema
- [ ] Logicka greska u kodu
- [ ] Race condition
- [ ] Manjkava validacija
- [ ] Pogresna Prisma query
- [ ] Kriva environment varijabla
- [ ] Externog servis (Clerk / Grok / Expo / RevenueCat)
- [ ] Migracija baze
- [ ] Konfiguracija

---

## Rjesenje (popunjava developer)

### Opis popravka

```

```

### PR link
> https://github.com/.../pull/XXX

### Test pokrivenost dodana
- [ ] Da — naziv test case-a: _______________
- [ ] Ne — obrazlozenje: _______________

---

## Verifikacija (popunjava QA)

### Test plan za verifikaciju

```
1.
2.
3.
```

### Verifikacijski rezultat
- [ ] Bug riješen — datum: _______________
- [ ] Regression test prošao
- [ ] Bug nije rijesen — komentar: _______________

### Potpis QA

**QA Agent**: _______________
**Datum verifikacije**: _______________

---

## Changelog

| Datum | Status | Komentar | Osoba |
|-------|--------|---------|-------|
| | New | Kreiran | |
| | In Progress | Dodijeljen | |
| | Fixed | PR merged | |
| | Verified | QA prihvatio | |
| | Closed | | |
