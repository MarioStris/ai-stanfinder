# AI StanFinder -- Security Architecture

> **Agent**: Security Architect | **Faza**: 3 (Tehnicka arhitektura)
> **Datum**: 2026-04-01 | **Status**: MVP

---

## 1. Threat Model (STRIDE)

### S -- Spoofing (Lazno predstavljanje)

| Prijetnja | Primjer za StanFinder | Mitigation |
|-----------|----------------------|------------|
| Lazna autentifikacija | Napadac krade JWT token i pristupa tudem PREMIUM racunu | Clerk kao auth provider s MFA opcijom; kratki JWT lifetime (15 min access, 7d refresh); token rotation pri svakom refreshu |
| Bot registracije | Masovno kreiranje FREE racuna za scraping rezultata | Rate limiting na signup (5/sat po IP); Clerk Bot Protection; email verifikacija obavezna |
| API impersonation | Lazni pozivi prema Grok/Apify API-ju koristeci ukradene kljuceve | API kljucevi iskljucivo u Railway env vars; nikad na klijentu; server-side proxy za sve externe API pozive |

### T -- Tampering (Neovlastena izmjena)

| Prijetnja | Primjer za StanFinder | Mitigation |
|-----------|----------------------|------------|
| Manipulacija pretrage | Korisnik mijenja query parametre da dobije PREMIUM rezultate na FREE racunu | Server-side enforcement tier ogranicenja; nikad ne vjeruj klijentskim parametrima za autorizaciju |
| Izmjena scraping podataka | Man-in-the-middle izmedu Apify webhookova i naseg servera | Webhook signature verification (Apify signing key); HTTPS obavezan; validacija payload strukture putem Zod |
| SQL injection | Manipulacija search filtera za pristup bazi | Prisma ORM (parametrizirani upiti); Zod validacija svih inputa; nikad raw SQL |

### R -- Repudiation (Poricanje radnji)

| Prijetnja | Primjer za StanFinder | Mitigation |
|-----------|----------------------|------------|
| Korisnik porece transakciju | AGENT korisnik tvrdi da nije kupio premium listing | Audit log svih purchase operacija (RevenueCat webhook log + vlastiti log); strukturirani logovi s user ID, timestamp, action |
| Neovlasteni pristup podacima | Admin pristupa korisnickim podacima bez razloga | Audit trail za sve admin operacije; logiranje u zasebnu tablicu `audit_log` |

### I -- Information Disclosure (Curenje podataka)

| Prijetnja | Primjer za StanFinder | Mitigation |
|-----------|----------------------|------------|
| Izlozenost korisnickih podataka | API vraca vise podataka nego sto klijent treba (over-fetching) | Eksplicitni `select` u Prisma upitima; DTO pattern -- nikad ne vracaj cijeli model; ukloni sensitive polja (password hash, interni ID-ovi) |
| Curenje API kljuceva | Grok/Apify kljucevi commitani u git ili vidljivi u klijentskom kodu | `.env` u `.gitignore`; pre-commit hook za secret detection; svi vanjski API pozivi iskljucivo server-side |
| Error stack trace | Production error vraca stack trace s internim detaljima | Genericki error responses u produkciji; detaljni logovi samo server-side (strukturirani JSON log) |

### D -- Denial of Service (Uskracivanje usluge)

| Prijetnja | Primjer za StanFinder | Mitigation |
|-----------|----------------------|------------|
| API flooding | Bot salje tisuce pretraga u sekundi | Rate limiting po tier-u: FREE 30 req/min, PREMIUM 120 req/min, AGENT 300 req/min; Hono rate-limit middleware |
| Scraping abuse | Konkurent scrapeuje nase rezultate | User-Agent filtering; CAPTCHA na kriticnim endpointima; response pagination (max 50 rezultata po stranici) |
| Database overload | Skupe pretrage (full-text search bez limita) | Query timeout (5s max); pagination obavezna; indeksiranje search polja; connection pooling (PgBouncer na Railway) |

### E -- Elevation of Privilege (Eskalacija privilegija)

| Prijetnja | Primjer za StanFinder | Mitigation |
|-----------|----------------------|------------|
| FREE korisnik pristupa PREMIUM feature-ima | Manipulacija klijentskog koda za pristup AI matching-u | Server-side provjera tiera na SVAKOM API endpointu; middleware `requireTier('PREMIUM')` |
| Korisnik pristupa admin endpointima | Pogadanje admin ruta | Admin rute na zasebnom prefixu `/admin/*`; Clerk role-based provjera; IP whitelist za admin |
| IDOR (Insecure Direct Object Reference) | Korisnik mijenja ID u URL-u da vidi tude pretrage | Uvijek provjeri `userId === resource.ownerId`; middleware `requireOwnership()` |

---

## 2. Authentication / Authorization strategija

### Auth Provider: Clerk

**Obrazlozenje izbora Clerk umjesto custom auth-a:**
- Ugraden MFA, social login, email verifikacija
- React Native SDK (Expo compatible)
- Webhook za sync s nasom bazom
- SOC 2 compliant
- Smanjuje attack surface -- ne pisemo vlastiti auth kod
- Cijena prihvatljiva za MVP (~$25/mj za 1000 MAU)

### Token strategija

```
Access Token:  JWT, 15 min lifetime, signed by Clerk
Refresh Token: 7 dana, rotira se pri svakom refreshu
Session:       Clerk session management (server-side validation)
```

- Access token se salje u `Authorization: Bearer <token>` headeru
- Backend validira token putem Clerk SDK (`clerkClient.verifyToken()`)
- Nikad ne pohranjuj token u AsyncStorage bez enkripcije -- koristiti `expo-secure-store`

### Role-Based Access Control (RBAC)

| Rola | Clerk metadata key | Pristup |
|------|-------------------|---------|
| `FREE` | `tier: "free"` | Osnovna pretraga (3 grada), max 10 rezultata, bez AI matchinga |
| `PREMIUM` | `tier: "premium"` | Svi gradovi, neograniceni rezultati, AI matching (Grok), push notifikacije za nove stanove |
| `AGENT` | `tier: "agent"` | Sve PREMIUM + listing management, analitika, bulk export |
| `ADMIN` | `role: "admin"` | Full access + admin panel, user management, system config |

### Authorization middleware (Hono)

```typescript
// src/server/middleware/auth.ts
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';

export const requireAuth = clerkMiddleware();

export const requireTier = (minTier: 'free' | 'premium' | 'agent') => {
  return async (c, next) => {
    const auth = getAuth(c);
    const userTier = auth.sessionClaims?.tier || 'free';
    const tierOrder = { free: 0, premium: 1, agent: 2 };
    if (tierOrder[userTier] < tierOrder[minTier]) {
      return c.json({ error: 'Upgrade required' }, 403);
    }
    await next();
  };
};
```

---

## 3. Data Encryption

### At Rest (baza podataka)

- **PostgreSQL na Railway**: Encryption at rest omogucen by default (Railway koristi encrypted volumes)
- **Sensitive polja**: Email adrese i korisnicke preference pohranjene u bazi; lozinke NE -- Clerk upravlja autentifikacijom
- **Payment tokeni**: NE pohranjujemo -- RevenueCat upravlja payment processingom; mi samo cuvamo `revenuecatUserId` i `subscriptionStatus`

### In Transit

- **HTTPS**: Obavezan na svim endpointima; Railway automatski provisiona TLS certifikat
- **HSTS header**: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- **Certificate pinning**: Razmotriti za mobile app u post-MVP fazi (React Native SSL pinning)

### Sensitive Data Handling

| Podatak | Kako ga tretiramo |
|---------|-------------------|
| Email | Pohranjujemo u bazi; ne logiramo u plaintext; maskiranje u logovima (`m***@gmail.com`) |
| Lozinka | Clerk upravlja -- mi je nikad ne vidimo |
| Payment info | RevenueCat upravlja -- mi cuvamo samo subscription status |
| API kljucevi | Railway env vars; nikad u kodu, bazi, ili logovima |
| Lokacija korisnika | Pohranjujemo samo odabrani grad (ne GPS koordinate) |
| Search history | Pohranjujemo za personalizaciju; brisemo na zahtjev korisnika (GDPR) |

---

## 4. API Security

### Rate Limiting

```typescript
// src/server/middleware/rateLimiter.ts
import { rateLimiter } from 'hono-rate-limiter';

const tierLimits = {
  free:    { windowMs: 60_000, max: 30 },
  premium: { windowMs: 60_000, max: 120 },
  agent:   { windowMs: 60_000, max: 300 },
};

export const apiRateLimiter = (c, next) => {
  const tier = getAuth(c)?.sessionClaims?.tier || 'free';
  const config = tierLimits[tier];
  return rateLimiter({
    windowMs: config.windowMs,
    limit: config.max,
    keyGenerator: (c) => getAuth(c)?.userId || c.req.header('x-forwarded-for'),
  })(c, next);
};
```

### Input Validation (Zod)

- **Svaki** API endpoint mora imati Zod schema za request body, query params, i path params
- Validacija se izvrsava u middleware-u PRIJE business logike
- Odbij nepoznata polja (`z.object({...}).strict()`)

```typescript
// Primjer: search endpoint validacija
const searchSchema = z.object({
  city: z.string().min(2).max(50),
  minPrice: z.number().min(0).max(10000).optional(),
  maxPrice: z.number().min(0).max(10000).optional(),
  rooms: z.number().int().min(1).max(10).optional(),
  page: z.number().int().min(1).max(100).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});
```

### CORS Policy

```typescript
import { cors } from 'hono/cors';

app.use('*', cors({
  origin: [
    'https://stanfinder.app',        // Production
    'exp://localhost:8081',           // Expo dev
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowHeaders: ['Authorization', 'Content-Type'],
  maxAge: 86400,
}));
```

### Security Headers (Helmet)

```typescript
import { secureHeaders } from 'hono/secure-headers';

app.use('*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'https:'],
  },
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
}));
```

### API Key Management za eksterne servise

| Servis | Varijabla | Rotacija | Pristup |
|--------|-----------|----------|---------|
| Grok API | `GROK_API_KEY` | Kvartalno | Samo backend; proxy sve pozive |
| Apify | `APIFY_API_TOKEN` | Kvartalno | Samo backend; webhook signing key zasebno |
| RevenueCat | `REVENUECAT_API_KEY` | Godisnje | Public key na klijentu (safe), secret key samo backend |
| Clerk | `CLERK_SECRET_KEY` | Godisnje | Samo backend; publishable key na klijentu (safe) |

---

## 5. GDPR Compliance Checklist

### Obavezno za MVP

- [ ] **Consent na registraciji**: Eksplicitan checkbox za prihvacanje uvjeta koristenja i privacy policy-ja; ne smije biti pre-checked
- [ ] **Privacy Policy stranica**: Jasno opisuje koje podatke prikupljamo, zasto, koliko dugo cuvamo, s kim dijelimo
- [ ] **Terms of Service**: Uvjeti koristenja aplikacije
- [ ] **Data export (portability)**: Endpoint `GET /api/user/data-export` -- vraca JSON sa svim korisnickim podacima (profil, pretrage, favorite)
- [ ] **Brisanje racuna (right to erasure)**: Endpoint `DELETE /api/user/account` -- brise sve korisnicke podatke; Clerk account deletion; cascade delete u bazi
- [ ] **Cookie/tracking consent**: Ako koristimo analytics (Mixpanel/PostHog) -- consent banner na prvom pokretanju
- [ ] **Data minimization**: Prikupljamo SAMO podatke koji su potrebni za funkcionalnost
- [ ] **Lawful basis**: Legitimate interest za core funkcionalnost; consent za marketing/analytics

### Data Retention Policy

| Podatak | Retention | Obrazlozenje |
|---------|-----------|--------------|
| Korisnicki profil | Do brisanja racuna | Potrebno za servis |
| Search history | 90 dana | Personalizacija; brise se automatski |
| Push notification tokens | Do odjave | Tehnicka potreba |
| Audit logovi | 1 godina | Compliance i debugging |
| Scraping cache | 24 sata | Performance; ne sadrzi osobne podatke |

### Implementacija brisanja

```typescript
// src/server/routes/user.ts
app.delete('/api/user/account', requireAuth, async (c) => {
  const userId = getAuth(c).userId;

  // 1. Brisanje iz nase baze (cascade)
  await prisma.user.delete({ where: { clerkId: userId } });

  // 2. Brisanje Clerk racuna
  await clerkClient.users.deleteUser(userId);

  // 3. Log za audit (anonimizirano)
  await prisma.auditLog.create({
    data: {
      action: 'ACCOUNT_DELETED',
      anonymizedId: hashUserId(userId),
      timestamp: new Date(),
    },
  });

  return c.json({ message: 'Account deleted' }, 200);
});
```

---

## 6. Security Testing Plan

### SAST (Static Application Security Testing)

- **ESLint security plugin**: `eslint-plugin-security` -- detektira `eval()`, `child_process.exec`, nesiguran regex
- **TypeScript strict mode**: Obavezan; sprijecava implicitne `any` tipove koji skrivaju bugove
- **Zod validacija**: Svaki endpoint MORA imati schema -- enforceable putem custom ESLint rule-a

```json
// .eslintrc.json (security pravila)
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"],
  "rules": {
    "security/detect-eval-with-expression": "error",
    "security/detect-non-literal-fs-filename": "warn",
    "security/detect-object-injection": "warn",
    "security/detect-unsafe-regex": "error"
  }
}
```

### Dependency Scanning

- **npm audit**: Pokrece se u CI/CD pipelineu na svakom PR-u; blokira merge ako postoji `critical` ili `high` ranjivost
- **Renovate Bot**: Automatski PR-ovi za dependency update; dnevna provjera
- **Snyk**: Razmotriti za post-MVP (besplatan tier dostupan); integracija s GitHub Actions

```yaml
# .github/workflows/security.yml
- name: Security audit
  run: npm audit --audit-level=high

- name: Check for known vulnerabilities
  run: npx audit-ci --high
```

### DAST (Dynamic Application Security Testing)

- **Post-MVP**: OWASP ZAP scan na staging okruzenju prije svakog releasa
- **MVP**: Rucna provjera OWASP Top 10 na kriticnim endpointima (auth, search, payment webhooks)

### Penetration Testing Plan

| Faza | Sto testiramo | Kada |
|------|---------------|------|
| MVP launch | Auth bypass, IDOR, injection | Prije prvog public releasa |
| Post-MVP (3 mj) | Full OWASP Top 10, mobile app security | Kvartalno |
| Ongoing | Dependency vulnerabilities, config drift | Automated u CI/CD |

---

## 7. Secrets Management

### Railway Environment Variables

Svi secreti se pohranjuju iskljucivo u Railway environment variables:

```
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...  (safe for client)
GROK_API_KEY=grok-...
APIFY_API_TOKEN=apify_api_...
APIFY_WEBHOOK_SECRET=whsec_...
REVENUECAT_API_KEY=rc_...
DATABASE_URL=postgresql://...
```

### .env Handling

- `.env` je u `.gitignore` -- NIKADA se ne commitava
- `.env.example` postoji u repozitoriju sa placeholder vrijednostima (bez pravih kljuceva)
- Lokalni development koristi `.env.local` (takoder u `.gitignore`)

### Pre-commit Hook za Secret Detection

```bash
#!/bin/bash
# .husky/pre-commit
# Provjera za slucajno unesene secrete
if git diff --cached --name-only | xargs grep -lE '(sk_live_|sk_test_|apify_api_|grok-|PRIVATE_KEY)' 2>/dev/null; then
  echo "ERROR: Potential secret detected in staged files!"
  echo "Remove secrets before committing."
  exit 1
fi
```

### Rotation Policy

| Secret | Rotacija | Postupak |
|--------|----------|----------|
| Clerk Secret Key | Godisnje ili pri kompromitaciji | Generirati novi u Clerk dashboardu; update Railway env var; deploy |
| Grok API Key | Kvartalno | Novi key u Grok konzoli; update Railway; stari key aktiviran jos 24h |
| Apify Token | Kvartalno | Novi token u Apify konzoli; update Railway + webhook secret |
| RevenueCat API Key | Godisnje | Novi key u RevenueCat dashboardu; update Railway |
| Database URL | Pri kompromitaciji | Railway DB credentials reset; update connection string |

### Incident Response (kratki plan)

1. **Detekcija**: Monitoring alert ili korisnicka prijava
2. **Containment**: Rotiraj kompromitirani secret; onemoguceci zahvaceni API endpoint ako je potrebno
3. **Investigation**: Provjeri audit logove; identificiraj opseg
4. **Recovery**: Deploy fix; obavijesti zahvacene korisnike ako je doslo do curenja osobnih podataka (GDPR obveza -- 72 sata)
5. **Post-mortem**: Dokumentiraj sto se dogodilo, zasto, i kako sprijeciti ponavljanje

---

## Arhitekturna odluka (ADR)

**ADR-SEC-001: Clerk kao auth provider**
- **Kontekst**: Trebamo auth za mobile app s role-based pristupom
- **Odluka**: Clerk umjesto custom JWT auth-a
- **Razlog**: Sigurniji (SOC 2), brzi za implementaciju, React Native SDK, ugraden MFA
- **Posljedice**: Ovisnost o SaaS provideru; mjesecni trosak ~$25-50; migracija moguca ali skupa
- **Status**: Prihvaceno

**ADR-SEC-002: Server-side proxy za sve vanjske API pozive**
- **Kontekst**: Grok i Apify API kljucevi ne smiju biti na mobilnom klijentu
- **Odluka**: Svi pozivi prema Grok/Apify idu kroz nas backend
- **Razlog**: Klijentski kod je dekompilabilan; API kljucevi bi bili izlozeni
- **Posljedice**: Dodatna latencija (~50ms); backend postaje bottleneck za AI matching
- **Status**: Prihvaceno
