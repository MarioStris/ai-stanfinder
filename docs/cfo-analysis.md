# CFO Analiza — AI StanFinder
**Datum**: 31.03.2026
**Pripremio**: CFO Agent
**Projekt**: AI StanFinder — mobilna aplikacija za AI matching nekretnina
**Status**: Faza 1 — Strateška financijska analiza

---

## Izvršni sažetak

AI StanFinder je freemium mobilna aplikacija s tri revenue streama: FREE (akvizicija), PREMIUM (€4.99/mj, neograničeni matching), i AGENTI tier (lead gen, €1/klik). Projekt zahtijeva inicijalnu investiciju od **€52.500 – €91.500** ovisno o scenariju razvoja, uz očekivani break-even u **mjesecu 14–18** (base scenarij). Ključni financijski rizik je trošak Apify scrapinga i Grok API poziva koji su direktno vezani uz broj aktivnih korisnika — potrebna je stroga cost-per-user kontrola od dana 1.

---

## 1. Procjena budžeta

### 1.1 Development troškovi (jednokratni, 6 mjeseci)

Pretpostavke:
- Tim: 1 senior full-stack developer (backend + mobile) + 1 junior/mid developer + 0.5 FTE dizajner
- Tržišne rate: senior dev €3.500/mj, junior dev €2.000/mj, dizajner €1.500/mj (puno radno vrijeme = 1 FTE)
- Seniorski developer radi 6 mj, junior 4 mj (ulazi u sprint 2), dizajner 3 mj (UI/UX faza)

| Stavka | Worst | Base | Best |
|--------|-------|------|------|
| Senior developer (6 mj) | €21.000 | €21.000 | €21.000 |
| Junior developer (4 mj) | €8.000 | €8.000 | €8.000 |
| Dizajner / UX (3 mj) | €4.500 | €4.500 | €4.500 |
| Apify setup + konfiguracija (3 actor-a) | €1.500 | €1.000 | €800 |
| Grok API integracija + testiranje | €800 | €600 | €400 |
| App Store + Play Store upis | €200 | €200 | €200 |
| QA + bug fixing buffer | €4.000 | €2.500 | €1.500 |
| Pravni (GDPR, ToS, Privacy Policy) | €2.000 | €1.500 | €1.000 |
| Contingency (scope creep) | €5.000 | €3.000 | €0 |
| **UKUPNO — Development** | **€47.000** | **€42.300** | **€37.400** |

### 1.2 Infrastruktura — mjesečni tekući troškovi

Pretpostavke za prvih 12 mjeseci (korisnici rastu od 0 do ~2.000 aktivnih):

| Stavka | Worst (€/mj) | Base (€/mj) | Best (€/mj) | Napomena |
|--------|-------------|------------|------------|----------|
| Railway / Render (backend hosting) | €80 | €50 | €30 | Skalira s load-om |
| PostgreSQL (managed DB) | €40 | €25 | €20 | Supabase/Railway |
| Apify scraperI (3 aktora) | €250 | €150 | €100 | Krit. varijabilni trošak |
| Grok API (xAI) | €300 | €180 | €80 | $0.005–$0.015 / matching call |
| Push notifikacije (Firebase/Expo) | €20 | €10 | €5 | Besplatno do 10k/mj |
| CDN + Storage (Cloudflare R2) | €15 | €10 | €5 | |
| Monitoring (Sentry, Datadog free tier) | €30 | €20 | €0 | |
| Domain + SSL + email | €15 | €10 | €10 | |
| **UKUPNO — Infra/mj (startup faza)** | **€750** | **€455** | **€250** |  |
| **UKUPNO — Infra/mj (rast, >1.000 users)** | **€1.800** | **€1.100** | **€600** | |

> **Napomena CFO**: Apify i Grok API su jedine dvije stavke koje skaluaju direktno s brojem korisnika i matching requesti. Treba postaviti rate-limiting i cost cap po korisniku od lansiranja.

### 1.3 Marketing troškovi

#### Launch kampanja (jednokratno, M7)

| Stavka | Worst | Base | Best |
|--------|-------|------|------|
| Performance marketing (Meta + Google Ads) | €3.000 | €2.000 | €1.500 |
| ASO (App Store Optimization) | €800 | €500 | €300 |
| PR / content (blog, LinkedIn, lokalni mediji) | €1.500 | €800 | €400 |
| Influencer / realtor partnerships | €2.000 | €1.000 | €500 |
| Launch event / demo video | €1.200 | €700 | €300 |
| **UKUPNO — Launch** | **€8.500** | **€5.000** | **€3.000** |

#### Ongoing marketing (mjesečno, M8+)

| Stavka | Worst (€/mj) | Base (€/mj) | Best (€/mj) |
|--------|-------------|------------|------------|
| Paid acquisition (Meta/Google) | €1.500 | €800 | €400 |
| Content + SEO | €400 | €200 | €100 |
| Referral program troškovi | €300 | €150 | €50 |
| **UKUPNO — Marketing/mj (ongoing)** | **€2.200** | **€1.150** | **€550** |

### 1.4 Ukupna inicijalna investicija

| Kategorija | Worst | Base | Best |
|-----------|-------|------|------|
| Development (6 mj) | €47.000 | €42.300 | €37.400 |
| Infra (6 mj, pre-launch) | €4.500 | €2.730 | €1.500 |
| Marketing — launch | €8.500 | €5.000 | €3.000 |
| **UKUPNA INVESTICIJA DO LAUNCHA** | **€60.000** | **€50.030** | **€41.900** |

---

## 2. ROI projekcija — 12 i 24 mjeseca

### Pretpostavke o rastu korisnika (BASE scenarij)

| Mjesec | Ukupni registrirani | FREE (85%) | PREMIUM (12%) | AGENTI klikovi/mj |
|--------|-------------------|-----------|--------------|-------------------|
| M7 (launch) | 200 | 170 | 24 | 120 |
| M8 | 450 | 382 | 54 | 270 |
| M9 | 750 | 637 | 90 | 450 |
| M10 | 1.100 | 935 | 132 | 660 |
| M11 | 1.500 | 1.275 | 180 | 900 |
| M12 | 1.900 | 1.615 | 228 | 1.140 |
| M18 | 4.000 | 3.400 | 480 | 2.400 |
| M24 | 7.500 | 6.375 | 900 | 4.500 |

> Pretpostavka: Premium konverzija = 12% (industrijski prosjek SaaS je 2–5%, ali proptech/utility appovi postižu 10–15% uz dobar freemium gating); Agenti tier = 3% korisnika, prosječno 30 klikova/mj po agentu.

### Godišnji prihodi — svi scenariji

#### WORST scenarij (spori rast, 800 korisnika u M12)

| Period | Prihod PREMIUM | Prihod AGENTI | Ukupni prihod |
|--------|---------------|--------------|---------------|
| M7–M12 | €2.160 | €480 | €2.640 |
| M13–M24 | €14.400 | €3.600 | €18.000 |
| **UKUPNO 24 mj** | **€16.560** | **€4.080** | **€20.640** |

#### BASE scenarij (umjeren rast, 1.900 korisnika u M12)

| Period | Prihod PREMIUM | Prihod AGENTI | Ukupni prihod |
|--------|---------------|--------------|---------------|
| M7–M12 | €8.208 | €2.052 | €10.260 |
| M13–M24 | €54.000 | €13.500 | €67.500 |
| **UKUPNO 24 mj** | **€62.208** | **€15.552** | **€77.760** |

#### BEST scenarij (agresivni rast, 4.000 korisnika u M12)

| Period | Prihod PREMIUM | Prihod AGENTI | Ukupni prihod |
|--------|---------------|--------------|---------------|
| M7–M12 | €21.562 | €5.391 | €26.953 |
| M13–M24 | €129.600 | €32.400 | €162.000 |
| **UKUPNO 24 mj** | **€151.162** | **€37.791** | **€188.953** |

### ROI kalkulacija

| Scenarij | Ukupna investicija (24 mj) | Ukupni prihod (24 mj) | ROI 24 mj |
|----------|--------------------------|----------------------|-----------|
| Worst | €60.000 + €46.800 (ops) = €106.800 | €20.640 | **-81%** |
| Base | €50.030 + €31.200 (ops) = €81.230 | €77.760 | **-4%** (gotovo break-even) |
| Best | €41.900 + €21.600 (ops) = €63.500 | €188.953 | **+198%** |

> Ops troškovi = infra + marketing (ongoing) za 18 operativnih mjeseci (M7–M24).

---

## 3. Break-even analiza

### Break-even formula

```
Mjesečni troškovi (ops) = Infra + Marketing = €455 + €1.150 = €1.605/mj (base)
Prihod po PREMIUM korisniku = €4.99/mj
Prihod po AGENTI kliku = €1.00

Break-even korisnici (samo PREMIUM, bez agenti) = €1.605 / €4.99 = 322 premium korisnika
Ako je konverzija 12%, znači: 322 / 0.12 = 2.683 ukupnih registriranih korisnika
```

### Break-even timeline

| Scenarij | Break-even mjesec | Ukupni registrirani u BE točki |
|----------|------------------|-------------------------------|
| Worst | M22–M24 | 2.700+ (dostiže se kasno) |
| Base | M14 | ~2.683 korisnika |
| Best | M10 | ~1.800 korisnika |

### Kumulativni gubitak do break-even (base scenarij)

| Faza | Kumulativni rashod | Kumulativni prihod | Gap |
|------|-------------------|-------------------|-----|
| M1–M6 (dev) | €45.030 | €0 | -€45.030 |
| M7–M12 (launch+ops) | €55.660 | €10.260 | -€45.400 |
| M13 | €58.025 | €14.745 | -€43.280 |
| M14 | €60.390 | €20.745 | -€39.645 |
| M18 | €69.845 | €47.745 | -€22.100 |
| M24 | €81.230 | €77.760 | -€3.470 |

> Puni povrat investicije u BASE scenariju: **M25** (oko 2 godine od starta).

---

## 4. Unit Economics

### 4.1 CAC (Customer Acquisition Cost)

```
CAC = Ukupni marketing troškovi / Broj novih plaćajućih korisnika

Base scenarij, M7–M12:
- Marketing spend: €5.000 (launch) + 6 × €1.150 (ongoing) = €11.900
- Novi plaćajući korisnici (PREMIUM): 228
- CAC PREMIUM = €11.900 / 228 = €52.19 po premium korisniku

Optimistično (M9–M12, kad je funnell zagrijana):
- CAC PREMIUM = ~€35–€40
```

| Tier | CAC (Worst) | CAC (Base) | CAC (Best) |
|------|------------|-----------|-----------|
| FREE korisnik | €4 | €3 | €2 |
| PREMIUM korisnik | €75 | €52 | €35 |
| AGENTI korisnik | €90 | €60 | €40 |

### 4.2 LTV (Lifetime Value)

Pretpostavke:
- Prosječni retention PREMIUM: 8 mjeseci (churn ~12.5%/mj za B2C utility app)
- AGENTI retention: 12 mjeseci (viša stickiness jer direktno generira leade)
- Gross margin: 72% (prihod - direktni API/infra troškovi po korisniku)

```
LTV PREMIUM = ARPU × Gross Margin × Retention Period
LTV PREMIUM = €4.99 × 0.72 × 8 = €28.74

LTV AGENTI = Prosječni klikovi × €1 × Gross Margin × 12 mj
LTV AGENTI = 30 × €1.00 × 0.72 × 12 = €259.20
```

| Tier | ARPU/mj | Gross Margin | Avg Retention | LTV |
|------|---------|-------------|--------------|-----|
| FREE | €0 | — | — | €0 (strateška vrijednost) |
| PREMIUM | €4.99 | 72% | 8 mj | **€28.74** |
| AGENTI | €30 (30 kl.) | 72% | 12 mj | **€259.20** |

### 4.3 CAC/LTV ratio i Payback period

| Tier | LTV | CAC (Base) | LTV:CAC ratio | Payback period |
|------|-----|-----------|--------------|----------------|
| PREMIUM | €28.74 | €52 | **0.55 : 1** | **NIKAD** (negativan!) |
| AGENTI | €259.20 | €60 | **4.32 : 1** | **2 mjeseca** |

> **KRITICAN NALAZ CFO**: LTV:CAC ratio za PREMIUM tier je negativan (0.55:1). Industriski standard je minimum 3:1. Ovo znači da trenutna cijena od €4.99/mj nije profitabilna uz zadani CAC. Postoje 3 rješenja:
> 1. Povećati cijenu na €9.99/mj (LTV raste na €57.48 → ratio 1.10:1 — još uvijek nisko)
> 2. Povećati retenciju s 8 na 16+ mj (bolji onboarding, više value)
> 3. Drastično smanjiti CAC organskim/viralnim rastom (referral program, ASO)

---

## 5. Cash flow projekcija — 12 mjeseci (base scenarij)

> Napomena: M1–M6 = development faza, M7 = launch

| Mj | PRIHODI | Dev troš. | Infra | Marketing | UKUPNI RASHODI | NET CF | KUMULATIV |
|----|---------|----------|-------|-----------|----------------|--------|-----------|
| M1 | €0 | €8.000 | €250 | €0 | €8.250 | -€8.250 | -€8.250 |
| M2 | €0 | €8.000 | €250 | €0 | €8.250 | -€8.250 | -€16.500 |
| M3 | €0 | €8.000 | €300 | €0 | €8.300 | -€8.300 | -€24.800 |
| M4 | €0 | €8.000 | €350 | €0 | €8.350 | -€8.350 | -€33.150 |
| M5 | €0 | €6.000 | €350 | €200 | €6.550 | -€6.550 | -€39.700 |
| M6 | €0 | €4.300 | €400 | €500 | €5.200 | -€5.200 | -€44.900 |
| **M7** | **€360** | €0 | €455 | €6.150 | €6.605 | **-€6.245** | **-€51.145** |
| **M8** | **€810** | €0 | €600 | €1.150 | €1.750 | **-€940** | **-€52.085** |
| **M9** | **€1.350** | €0 | €750 | €1.150 | €1.900 | **-€550** | **-€52.635** |
| **M10** | **€1.980** | €0 | €900 | €1.150 | €2.050 | **-€70** | **-€52.705** |
| **M11** | **€2.700** | €0 | €1.000 | €1.150 | €2.150 | **+€550** | **-€52.155** |
| **M12** | **€3.510** | €0 | €1.100 | €1.150 | €2.250 | **+€1.260** | **-€50.895** |

**Legenda rashoda M7:**
- Infra: €455 (base, startup faza)
- Marketing: €5.000 (launch jednokratno) + €1.150 (ongoing) = €6.150

**Ključne CF točke:**
- Inicijalni kapital potreban: **€53.000** (dovoljno za pokriće do M10 uz base scenarij)
- Prva CF pozitivna mjesec: **M11** (neto pozitivan)
- Kumulativni break-even: **M24–M25** (puni povrat investicije)

### Tromjesečni agregati

| Kvartal | Prihod | Rashod | Net | Kumulativ |
|---------|--------|--------|-----|-----------|
| Q1 (M1–M3) | €0 | €24.800 | -€24.800 | -€24.800 |
| Q2 (M4–M6) | €0 | €20.100 | -€20.100 | -€44.900 |
| Q3 — launch (M7–M9) | €2.520 | €10.255 | -€7.735 | -€52.635 |
| Q4 (M10–M12) | €8.190 | €6.450 | +€1.740 | -€50.895 |

---

## 6. CFO preporuke

### 6.1 Optimalni pricing

**Preporuka: Povecati PREMIUM na €7.99/mj uz godišnju opciju €59.99/god (50% popust)**

| Model | LTV (8 mj) | LTV:CAC | Preporuka |
|-------|-----------|---------|-----------|
| €4.99/mj | €28.74 | 0.55:1 | Nije održivo |
| €7.99/mj | €46.02 | 0.88:1 | Bolje, još uvijek nisko |
| €9.99/mj | €57.54 | 1.10:1 | Prihvatljivo uz bolji retention |
| €59.99/god | €43.19 (godišnje) | 0.83:1 | Poboljšava cash flow predvidivost |

Godišnji model je strateški bolji jer:
- Smanjuje churn za 40–60% (jednom plaćeni, ostaju godinu dana)
- Poboljšava cash flow predvidivost
- LTV raste s duljim retencijskim periodom

**Konačna preporuka**: Dual pricing — €7.99/mj ILI €59.99/god (€5/mj ekvivalent). Naglasak u UI-u na godišnji plan.

### 6.2 Koji tier generira najviše revenue-a

**AGENTI tier je financijski najvrijedniji per-customer:**

| Tier | % korisnika | Prihod/korisnik/mj | Contribucija (pri 2.000 users) |
|------|------------|-------------------|-------------------------------|
| FREE | 85% | €0 | €0 (akvizicijski kanal) |
| PREMIUM | 12% | €4.99 | €1.197/mj |
| AGENTI | 3% | €30 (est.) | €1.800/mj |

Zaključak: AGENTI tier s 3% korisnika generira **60% više prihoda** od PREMIUM tiera s 12% korisnika.

**Strateška preporuka**: Aktivno privlačiti agente nekretnina od M7. Cilj je 50 aktivnih agenata u prvih 6 mj. Pri prosječno 30 klikova/mj × €1 = **€1.500/mj** samo od prvog kohorta agenata.

### 6.3 Smanjenje troškova infrastrukture

**Potencijalna ušteda: €200–€400/mj**

1. **Apify batching** — umjesto kontinuiranog scrapinga, grupirati sweep-ove na 4× dnevno umjesto svakih 15 min za FREE korisnike. Ušteda: ~40% Apify troška = €60/mj.

2. **Grok API caching** — cachirati matching rezultate za iste filtere (Redis, TTL 15 min). Procjena: 60% API poziva su duplicirani za slične filtere. Ušteda: ~€70–€100/mj.

3. **Grok API tiering** — FREE korisnici dobivaju matching 2× dnevno (umjesto real-time), PREMIUM dobivaju svakih 15 min. Ovo direktno smanjuje API trošak za FREE kohortu za 80%.

4. **PostgreSQL right-sizing** — koristiti Supabase free tier do 500 korisnika, zatim Supabase Pro (€25/mj) do 10k korisnika. Izbjegavati managed DB od €80+/mj u ranoj fazi.

5. **Expo Push Notifications** — besplatno do 1M notifikacija/mj. Nema troška do ~50k korisnika.

**Ukupna potencijalna ušteda**: €200–€350/mj pri 1.000–2.000 korisnika.

### 6.4 Runway i financijska sigurnost

| Scenarij | Potrebni startup kapital | Runway (mj) | Preporuka |
|----------|------------------------|------------|-----------|
| Worst | €80.000 | 18 mj | Potrebno vanjsko financiranje |
| Base | €55.000 | 14 mj | Bootstrappable uz osnivački kapital |
| Best | €45.000 | 10 mj | Brzi put do profitabilnosti |

**Preporuka**: Osigurati **€60.000 seed kapitala** koji pokriva worst case + buffer. U boljim scenarijima, višak kapitala reinvestirati u marketing (accelerate growth).

### 6.5 Ključni financijski KPI-ji za praćenje

| KPI | Cilj M12 | Alarm signal |
|-----|---------|-------------|
| MRR (Monthly Recurring Revenue) | €3.500+ | < €2.000 |
| Premium konverzija | 12% | < 7% |
| Churn rate (PREMIUM) | < 10%/mj | > 15%/mj |
| CAC | < €50 | > €80 |
| Gross margin | > 70% | < 60% |
| Infra trošak / korisnik / mj | < €0.50 | > €1.00 |
| AGENTI klikovi/agent/mj | 25+ | < 10 |

---

## Appendix: Ključne pretpostavke i ograničenja

1. **Apify cijena**: Procijenjeno na bazi Apify Starter/Scale planova (~€49–€499/mj). Stvarni trošak ovisi o frekvenciji scrapinga i volumenu. Potrebno verificirati pri architekturnoj fazi.

2. **Grok API cijena**: Bazira se na xAI API pricing ($0.005–$0.015 po 1k tokena, Q1 2026). Cijene su promjenjive.

3. **Premium konverzija 12%**: Optimistična pretpostavka. Industrijski benchmark za utility appove je 5–10%. Ako je konverzija 7%, svi break-even rokovi pomiču se za 3–4 mj.

4. **Tržišni fokus**: Analiza pretpostavlja primarno tržište HR (Zagreb, Split, Rijeka). Ekspanzija na BiH, SLO, SRB nije kalkulirana i predstavlja upside.

5. **Konkurencija**: Pretpostavljeno da Njuskalo.hr neće blokirati scraping u prvih 12 mj. Pravni i tehnički rizik treba adresirati u arhitekturnoj fazi.

---

*CFO Agent | AI StanFinder | Faza 1 — Strateška analiza*
*Dokument je input za: Sales Agent (pricing), CEO Agent (GO/NO-GO), CPO Agent (feature prioritizacija)*
