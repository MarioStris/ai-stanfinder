# CPO Product Definicija — AI StanFinder
**Datum**: 01.04.2026
**Agent**: CPO
**Status**: Faza 2 — Product definicija
**Dependency**: Faza 1 outputi (CEO vizija, CFO analiza, Market Research)

---

## 1. Product Vision

**AI StanFinder transformira trazenje nekretnina u Hrvatskoj iz frustrirajuceg rucnog procesa u automatizirano, AI-vodeno iskustvo koje korisniku isporucuje personalizirane TOP 10 preporuke i real-time obavijesti — stedeci mu 15+ sati mjesecno.**

Strateski ciljevi proizvoda:
1. Postati #1 AI alat za trazenje nekretnina u Hrvatskoj unutar 12 mjeseci
2. Dokazati product-market fit s 15.000 korisnika i 8%+ premium konverzijom
3. Izgraditi multi-source platformu spremnu za regionalnu ekspanziju (SLO, SRB)

---

## 2. Persone

### Persona 1: Ana Kovacic — Mlada kupac prvog stana

| Atribut | Detalj |
|---------|--------|
| **Dob** | 31 godina |
| **Zanimanje** | UX dizajnerica u IT firmi, Zagreb |
| **Situacija** | Zivi u najmu s partnerom, stednja ~€40k, traze prvi stan u Zagrebu (€150k-€250k, 55-75m²) |
| **Pain points** | Svaki dan trosi 1-2h na Njuskalo; propustila 3 dobra stana jer ih je vidjela prekasno; ne zna procijeniti je li cijena fer; frustrirana losim filterima na Njuskalo |
| **Goals** | Pronaci stan s dobrim omjerom cijena/kvaliteta blizu posla (centar/Tresnjevka); ne propustiti novi oglas; imati AI pomoc za procjenu dealova |
| **Tech savviness** | Visoka (5/5) — koristi app-ove za sve, navikla na personalizirane preporuke (Spotify, Netflix) |
| **Willingness to pay** | €7.99/mj bez razmisljanja ako vidi vrijednost u prvih 3 dana; €59.99/god ako je dugorocno korisno |

### Persona 2: Marko Petrovic — Dijaspora kupac

| Atribut | Detalj |
|---------|--------|
| **Dob** | 42 godine |
| **Zanimanje** | Software engineer u Munchen, Njemacka |
| **Situacija** | Zeli kupiti stan u Splitu za umirovljenje/najam (€200k-€350k, 70-100m²); ne moze fizicki gledati stanove cesto; oslanja se na online pretrazivanje |
| **Pain points** | Njuskalo je nepregledno iz inozemstva; ne poznaje kvartove dovoljno dobro; treba mu nesto sto "razumije" da trazi blizu mora, parking, novogradnju; timezone razlika otezava kontakt s agentima |
| **Goals** | Dobiti kuriranu listu najboljih opcija bez svakodnevnog scrollanja; razumjeti value za lokaciju; reagirati brzo na dobre ponude |
| **Tech savviness** | Visoka (4/5) — techie, ali ne zeli trositi vrijeme na rucno pretrazivanje |
| **Willingness to pay** | €9.99/mj odmah — za njega je to trivijalan iznos u usporedbi s kupnjom od €300k; godisnja pretplata preferirana |

### Persona 3: Ivana Babic — Nekretninska agentica

| Atribut | Detalj |
|---------|--------|
| **Dob** | 38 godina |
| **Zanimanje** | Samostalna nekretninska agentica, Rijeka |
| **Situacija** | Radi s 20-30 aktivnih klijenata; trosi vrijeme na rucno uparivanje klijenata s oglasima; zeli vise leadova bez vise rada |
| **Pain points** | Klijenti ocekuju instant odgovor kad se pojavi novi stan; konkurencija od velikih agencija s vise resursa; trosak oglasavanja na Njuskalo raste |
| **Goals** | Dobiti kvalificirane leadove (kupce koji aktivno traze); reagirati prije konkurencije na nove oglase; automatizirati matching za klijente |
| **Tech savviness** | Srednja (3/5) — koristi smartphone, WhatsApp, portale, ali ne napredne alate |
| **Willingness to pay** | €49-€149/mj za premium agentski profil; €1-3 po kvalificiranom kliku/leadu |

---

## 3. User Stories

### Registracija i onboarding
**US-01**: Kao Ana, zelim se registrirati putem emaila u manje od 1 minute, kako bih odmah pocela koristiti app.
- AC: Registracija zahtijeva samo email + lozinka
- AC: Odmah nakon registracije vidim 6 "best of" nekretnina u HR kao demo
- AC: CTA "Kreiraj svoj filter" je vidljiv odmah

**US-02**: Kao Marko, zelim vidjeti vrijednost aplikacije PRIJE registracije, kako bih odlucio isplati li se.
- AC: Landing screen prikazuje primjer TOP 10 liste (demo podaci)
- AC: "Pogledaj sto AI pronalazi za tebe" CTA vodi na brzi filter setup
- AC: Registracija se trazi tek kad korisnik zeli spremiti rezultate

### Filter setup
**US-03**: Kao Ana, zelim postaviti filter po gradu, cijeni, kvadraturi i tipu nekretnine, kako bih dobila relevantne rezultate.
- AC: Filteri: grad (dropdown), cijena (range slider), kvadratura (range slider), tip (stan/kuca/zemljiste)
- AC: Promjena filtera regenerira matcheve unutar 5 sekundi
- AC: Filter se automatski sprema

**US-04**: Kao Marko, zelim opisati sto trazim prirodnim jezikom ("blizu mora, parking, novogradnja, 3 sobe"), kako bih dobio rezultate koje obicni filteri ne mogu naci.
- AC: Text input polje za prirodni jezik (semantic search)
- AC: Grok API parsira opis i kombinira s filterima
- AC: Korisnik vidi kako je AI interpretirao njegov opis

**US-05**: Kao Ana, zelim imati vise spremljenih filtera (npr. "Zagreb centar" i "Zagreb Tresnjevka"), kako bih pratila vise opcija.
- AC: Korisnik moze kreirati do 3 filtera (FREE) ili neograniceno (PREMIUM)
- AC: Svaki filter ima naziv i zasebnu TOP 10 listu
- AC: Switch izmedu filtera jednim tapom

### Matching i rezultati
**US-06**: Kao Ana, zelim vidjeti TOP 10 AI matcheva s postotkom relevantnosti, kako bih znala koji oglas najbolje odgovara mojim kriterijima.
- AC: Lista prikazuje: % match, cijena, lokacija, m², slika, AI komentar
- AC: Sortiranje po relevantnosti (default), cijeni, datumu
- AC: AI komentar objasnjava zasto je match visok (npr. "Odlicna cijena po m² za ovu lokaciju")

**US-07**: Kao Marko, zelim vidjeti detalje oglasa bez napustanja aplikacije, kako bih brzo procijenio nekretninu.
- AC: Detalji: sve slike, puni opis, cijena/m², lokacija na mapi (link na Google Maps u MVP)
- AC: Kontakt agenta (telefon + email) jednim tapom
- AC: "Spremi u favorite" button

**US-08**: Kao Ana, zelim dobiti AI savjete za poboljsanje pretrage, kako bih dobila bolje matcheve.
- AC: AI sugestije na dnu TOP 10 liste (npr. "Povecajte budget 10k€ za +40% bolji izbor")
- AC: Sugestije su personalizirane na osnovu trenutnih filtera i trzisnih podataka
- AC: Klik na sugestiju automatski primjenjuje promjenu filtera

### Notifikacije
**US-09**: Kao Ana, zelim dobiti push notifikaciju kad se pojavi novi TOP match, kako ne bih propustila dobru priliku.
- AC: Push notifikacija sadrzi: % match, kratki opis, cijena
- AC: Klik na notifikaciju otvara detalje oglasa
- AC: Korisnik moze podesiti frekvenciju notifikacija (odmah / dnevni sazetak / iskljuceno)

**US-10**: Kao Marko, zelim primiti dnevni email sazetak novih matcheva, kako bih mogao pregledati u svoje vrijeme.
- AC: Email sadrzi TOP 3-5 novih matcheva s osnovnim podacima
- AC: Link "Pogledaj sve u aplikaciji"
- AC: Opcija za iskljucivanje email notifikacija

### Favoriti i upravljanje
**US-11**: Kao Ana, zelim spremiti favorite i usporediti ih medusobno, kako bih lakse donijela odluku.
- AC: "Srce" ikona na svakom oglasu za dodavanje u favorite
- AC: Favoriti ekran prikazuje sve spremljene s kljucnim podacima
- AC: Jednostavna usporedba 2-3 nekretnine (side-by-side cijena, m², lokacija)

**US-12**: Kao Ana, zelim oznaciti oglas kao "kontaktiran" ili "nije relevantno", kako bih pratila status svojih pretraga.
- AC: Status oznake: Novi / Kontaktiran / Odbijen / Favorit
- AC: Filtriranje liste po statusu

### Premium i monetizacija
**US-13**: Kao Ana, zelim vidjeti jasnu razliku FREE vs PREMIUM, kako bih znala sto dobivam za €7.99/mj.
- AC: FREE: 1 filter, TOP 5 matcheva, azuriranje 2x dnevno, osnovne notifikacije
- AC: PREMIUM: neograniceni filteri, TOP 10, azuriranje svakih 15min, prioritetne notifikacije, AI savjeti, usporedba
- AC: Upgrade flow unutar 2 tapa

**US-14**: Kao Marko, zelim platiti godisnju pretplatu (€59.99/god), kako bih ustedil 37% u odnosu na mjesecnu.
- AC: Dual pricing jasno prikazan: €7.99/mj vs €59.99/god (istaknut)
- AC: Apple Pay / Google Pay / kartica
- AC: Automatsko obnavljanje s opcijom otkazivanja

**US-15**: Kao Ivana (agentica), zelim agentski profil koji mi daje pristup leadovima, kako bih dobila nove klijente.
- AC: Agentski dashboard: lista leadova koji su kliknuli "kontaktiraj agenta"
- AC: Statistika: broj prikazivanja, klikova, konverzija
- AC: Mjesecna pretplata (€49/mj starter) ili pay-per-lead (€2-3/klik)

### Kategorije nekretnina
**US-16**: Kao Ana, zelim pretrazivati stanove, kuce i zemljista odvojeno, kako bih se fokusirala na relevantnu kategoriju.
- AC: 3 kategorije na home screenu: Stanovi / Kuce / Zemljista
- AC: Filteri se prilagodavaju kategoriji (npr. zemljista nemaju "broj soba")
- AC: Mogucnost pretrazivanja vise kategorija odjednom

### Profil i postavke
**US-17**: Kao korisnik, zelim upravljati svojim profilom i postavkama notifikacija, kako bih prilagodio iskustvo.
- AC: Profil: email, lozinka, pretplata status
- AC: Postavke: jezik (HR), notifikacije (push on/off, email on/off, frekvencija)
- AC: Brisanje racuna (GDPR compliance)

### Podatkovni feed
**US-18**: Kao sustav, zelim primati CSV podatke od Apify scrapera svakih 15 minuta, kako bi matchevi bili azurni.
- AC: API endpoint prima CSV (stanovi, kuce, zemljista)
- AC: Deduplikacija — isti oglas se ne upisuje dvaput
- AC: Azuriranje cijene/statusa ako se oglas promijeni
- AC: Brisanje oglasa koji vise nisu aktivni na Njuskalo

**US-19**: Kao sustav, zelim pokrenuti AI matching za svakog korisnika kad dodu novi podaci, kako bi korisnik vidio svjeze rezultate.
- AC: Scheduler pokrece matching ciklus: FREE 2x/dan, PREMIUM svakih 15min
- AC: Grok API prima korisnikove filtere + opis + nove oglase
- AC: Rezultat: rangirani TOP 10 s % relevantnosti i AI komentarom
- AC: Caching — isti filteri na istim podacima ne pozivaju API ponovo

**US-20**: Kao sustav, zelim pratiti Grok API trosak po korisniku, kako bih ostao unutar budzeta.
- AC: Logging svakog API poziva: korisnik, tokeni, cijena
- AC: Rate limiting: max 50 API poziva/korisnik/dan
- AC: Alert ako trosak po korisniku prijede €0.50/mj

---

## 4. MoSCoW Prioritizacija

### Must Have (MVP) — Bez ovoga nema proizvoda
| # | Feature | Obrazlozenje |
|---|---------|-------------|
| M1 | Email registracija | Osnovni auth |
| M2 | Filter setup (grad, cijena, m², tip) | Core funkcionalnost |
| M3 | Semantic search (prirodni jezik) | Key differentiator vs konkurencija |
| M4 | TOP 10 AI match lista s % relevantnosti | Core value proposition |
| M5 | AI komentar za svaki match | Objasnjava zasto je match relevantan |
| M6 | Detalji oglasa (slike, opis, cijena/m²) | Korisnik mora vidjeti sto kupuje |
| M7 | Push notifikacije za nove matcheve | Real-time vrijednost, retention driver |
| M8 | Apify CSV ingest API | Data pipeline — bez podataka nema matcheva |
| M9 | Grok API matching engine | AI matching — core technologija |
| M10 | FREE/PREMIUM tier gating | Monetizacija — CFO zahtjev |
| M11 | Postavke notifikacija | Sprjecava churn od previše notifikacija |

### Should Have — Znacajno poboljsava iskustvo
| # | Feature | Obrazlozenje |
|---|---------|-------------|
| S1 | Vise spremljenih filtera (do 3 FREE, neograniceno PREMIUM) | Power users imaju vise pretraga |
| S2 | Favoriti s usporednom | Pomaze u odlucivanju |
| S3 | AI sugestije za bolji matching | Povecava engagement i kvalitetu |
| S4 | Dnevni email sazetak | Za korisnike koji ne zele push |
| S5 | Grok API caching i cost tracking | CFO zahtjev — cost kontrola |

### Could Have — Nice to have, ali moze cekati Sprint 2+
| # | Feature | Obrazlozenje |
|---|---------|-------------|
| C1 | Map view (Google Maps integracija) | Konkurenti ga imaju, ali nije core AI value |
| C2 | Agentski profil i lead gen dashboard | B2B revenue stream — ali zahtijeva poseban razvoj |
| C3 | Status oznake (kontaktiran/odbijen) | Organizacijski feature, ne core |
| C4 | Godisnja pretplata opcija | Poboljsava LTV, ali moze doci naknadno |

### Won't Have (za MVP)
| # | Feature | Obrazlozenje |
|---|---------|-------------|
| W1 | Multi-source (Index Oglasi, Crozilla) | CEO zeli adapter arhitekturu, ali MVP = samo Njuskalo |
| W2 | Multi-language / regionalna ekspanzija | Faza B (mjesec 12-18) |
| W3 | Mortgage kalkulator / partnerstva s bankama | Year 2 feature |
| W4 | Investment analytics (prinos od najma) | Year 2+ premium vertikala |

---

## 5. MVP Scope — Definicija

MVP ukljucuje iskljucivo Must Have features (M1-M11) koji cine **core loop**:

```
Registracija → Filter Setup → AI Matching → TOP 10 Lista → Push Notifikacija → Repeat
```

### MVP funkcionalnosti:
1. Email registracija (bez social login u MVP)
2. Filter ekran: grad, cijena (slider), m² (slider), tip (stan/kuca/zemljiste), slobodni tekst
3. AI matching engine: Grok API + korisnikovi filteri → TOP 10 rangirani rezultati
4. Match lista: % relevantnosti, cijena, lokacija, m², slika, AI komentar
5. Detalji oglasa: sve slike, puni opis, cijena/m², kontakt agenta
6. Push notifikacije: novi TOP match (podesiva frekvencija)
7. Apify CSV ingest: 3 kategorije, svakih 15 min, deduplikacija
8. Scheduler: FREE 2x/dan, PREMIUM svakih 15 min
9. FREE/PREMIUM gating: FREE = 1 filter, TOP 5, 2x/dan; PREMIUM = full access
10. In-app upgrade flow (Apple Pay / Google Pay)
11. Postavke: notifikacije on/off, frekvencija
12. Profil: email, pretplata status, brisanje racuna (GDPR)

### MVP NE ukljucuje:
- Map view, agentski dashboard, multi-source, email sazetak, favoriti/usporedba

### Definition of Done za MVP:
- Sve M1-M11 user stories prolaze acceptance criteria
- < 3s load time za match listu
- Push notifikacije rade na iOS i Android
- 0 critical/high bugova
- GDPR compliance (privacy policy, brisanje racuna)
- App Store i Play Store listing spreman

---

## 6. Feature-Effort Matrix

| Feature | Impact (1-5) | Effort (1-5) | Prioritet | Kvadrant |
|---------|:---:|:---:|---|---|
| AI matching (Grok API) | 5 | 4 | M9 | High Impact / High Effort — DO IT |
| Semantic search (NLP) | 5 | 3 | M3 | High Impact / Med Effort — QUICK WIN |
| TOP 10 match lista | 5 | 2 | M4 | High Impact / Low Effort — QUICK WIN |
| Push notifikacije | 5 | 2 | M7 | High Impact / Low Effort — QUICK WIN |
| Apify CSV ingest | 4 | 3 | M8 | High Impact / Med Effort — DO IT |
| Filter setup (basic) | 4 | 2 | M2 | High Impact / Low Effort — QUICK WIN |
| FREE/PREMIUM gating | 4 | 3 | M10 | High Impact / Med Effort — DO IT |
| AI komentar per match | 4 | 2 | M5 | High Impact / Low Effort — QUICK WIN |
| Detalji oglasa | 3 | 2 | M6 | Med Impact / Low Effort — DO IT |
| Email registracija | 3 | 1 | M1 | Med Impact / Low Effort — QUICK WIN |
| AI sugestije | 4 | 3 | S3 | High Impact / Med Effort — Sprint 2 |
| Favoriti + usporedba | 3 | 3 | S2 | Med Impact / Med Effort — Sprint 2 |
| Vise filtera | 3 | 2 | S1 | Med Impact / Low Effort — Sprint 2 |
| Grok API caching | 3 | 3 | S5 | Med Impact / Med Effort — Sprint 2 |
| Map view | 4 | 4 | C1 | High Impact / High Effort — Sprint 3 |
| Agentski dashboard | 4 | 5 | C2 | High Impact / Very High Effort — Sprint 3-4 |
| Email sazetak | 2 | 2 | S4 | Low Impact / Low Effort — kad stignemo |
| Status oznake | 2 | 1 | C3 | Low Impact / Low Effort — kad stignemo |
| Godisnja pretplata | 2 | 2 | C4 | Low Impact / Low Effort — Sprint 2 |

### Kvadranti:
```
              Low Effort          High Effort
High Impact   QUICK WINS          STRATEGIC (DO IT)
              Semantic search     AI matching engine
              TOP 10 lista        Apify ingest
              Push notif.         FREE/PREMIUM gating
              Filter setup        Map view (Sprint 3)
              AI komentar

Low Impact    FILL-INS            AVOID / DEFER
              Email sazetak       Multi-source
              Status oznake       Regional expansion
              God. pretplata      Investment analytics
```

---

## 7. Success KPIs

### Launch KPIs (M7 — prvi mjesec)

| KPI | Target | Alarm | Mjerenje |
|-----|--------|-------|----------|
| Registracije | 200+ | < 100 | Firebase Analytics |
| D1 retencija | 50% | < 30% | Kohorte |
| Filter completion rate | 70% | < 50% | Event tracking |
| Prosjecni matchevi pregledani/sesija | 5+ | < 3 | Analytics |
| App crash rate | < 1% | > 3% | Sentry / Crashlytics |
| Avg match relevance rating | 3.5+/5 | < 3.0 | In-app rating |

### Growth KPIs (M9 — 3 mjeseca od launcha)

| KPI | Target | Alarm | Mjerenje |
|-----|--------|-------|----------|
| Ukupni registrirani | 750+ | < 400 | Firebase |
| D7 retencija | 40% | < 25% | Kohorte |
| D30 retencija | 25% | < 15% | Kohorte |
| Premium konverzija | 8% | < 5% | Billing analytics |
| MRR | €450+ | < €200 | Stripe/RevenueCat |
| NPS | 40+ | < 20 | In-app survey |
| Push notification opt-in | 60% | < 40% | Firebase |

### Scale KPIs (M12 — 6 mjeseci od launcha)

| KPI | Target | Alarm | Mjerenje |
|-----|--------|-------|----------|
| Ukupni registrirani | 1.900+ | < 1.000 | Firebase |
| D30 retencija | 35% | < 20% | Kohorte |
| Premium konverzija | 12% | < 7% | Billing |
| MRR | €3.500+ | < €2.000 | Stripe/RevenueCat |
| Churn rate (PREMIUM) | < 10%/mj | > 15%/mj | Billing |
| App Store rating | 4.5+ | < 4.0 | App Store / Play Store |
| Infra trosak / korisnik / mj | < €0.50 | > €1.00 | Cloud billing |
| Grok API trosak / matching | < €0.01 | > €0.02 | API logs |
| Avg match relevance | 4.2+/5 | < 3.5 | In-app rating |

### North Star Metric
**Broj korisnika koji pregledaju 3+ matcheva tjedno** — ovo kombinira aktivaciju, engagement i kvalitetu matchinga u jednu metriku.

---

## 8. Product rizici i mitigation

| Rizik | Vjerojatnost | Impact | Mitigation |
|-------|:---:|:---:|---|
| AI matchevi nisu dovoljno relevantni | Srednja | Kritican | A/B testiranje prompt-ova; korisnicko ocjenjivanje matcheva; iterativno poboljsanje |
| Push notifikacije uzrokuju churn (spam) | Srednja | Visok | Default: dnevni sazetak, ne instant; korisnik bira frekvenciju; smart batching |
| FREE tier predovoljan — nema konverzije | Srednja | Visok | Agresivniji gating (TOP 5, ne TOP 10 u FREE); paywall na semantic search |
| Njuskalo blokira scraping | Visoka | Kritican | Adapter pattern za brzi switch na alternativne izvore; pravna analiza HITNO |
| Grok API trosak skalira prebrzo | Srednja | Visok | Caching identicnih query-ja; batch processing; fallback na lokalni ranking |
| Korisnici ne zavrse filter setup | Srednja | Srednji | Progressive disclosure — pocni s gradom i cijenom, ostalo opciono |

---

*CPO Agent | AI StanFinder | Faza 2 — Product definicija*
*Dokument je input za: CTO Agent (arhitektura), EM Agent (sprint planiranje), UX Researcher (wireframes)*
