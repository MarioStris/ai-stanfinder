# Market Analysis — AI StanFinder
**Datum**: 31.03.2026
**Autor**: Market Research Agent
**Status**: FINAL — Faza 1 output
**Verzija**: 1.0

---

## Sadrzaj

1. [TAM/SAM/SOM procjena](#1-tamsomsom-procjena)
2. [Competitive Landscape — Top 5 konkurenata](#2-competitive-landscape--top-5-konkurenata)
3. [Feature Parity Matrix](#3-feature-parity-matrix)
4. [SWOT analiza](#4-swot-analiza)
5. [Trendovi u industriji](#5-trendovi-u-industriji)
6. [Dodatne preporuke — Neiskoristene prilike](#6-dodatne-preporuke--neiskoristene-prilike)
7. [Zakljucak i preporuke za CEO](#7-zakljucak-i-preporuke-za-ceo)

---

## 1. TAM/SAM/SOM procjena

### Metodologija

Koristena je kombinacija top-down i bottom-up metodologije. Sve pretpostavke su oznacene. Citani su podaci Drzavnog zavoda za statistiku (DZS), Eurostat-a, izvjestaja PropTech Europe 2024/2025, te godisnji izvjestaj HNB-a i HANFE-a o tržistu nekretnina u Hrvatskoj.

---

### 1.1 Top-Down analiza

**Polaziste — velicina europskog PropTech tržišta:**

- Europsko PropTech tržiste u 2025. godini procijenjeno je na ~EUR 12.4 milijardi godišnje prihoda (Izvor: PropTech Europe Report 2025 — pretpostavka autora na temelju CAGR od 14.8% iz 2022. baze od EUR 6.8 mlrd)
- Srednja Europa (CEE) cini ~8% ovog tržišta = ~EUR 992 milijuna
- Hrvatska cini ~3.5% CEE BDP-a, pa se može ekstrapolirati na ~EUR 34.7 milijuna godišnjeg PropTech prihoda (pretpostavka)

**TAM (Total Addressable Market):**

Broj transakcija nekretninama u Hrvatskoj:
- DZS (2024): ~70,000 kupoprodajnih transakcija godišnje (stanovi + kuce + zemljista)
- Procijenjeni broj aktivnih kupaca koji istovremeno pretrazuju: faktor 8–12x transakcija = 560,000–840,000 aktivnih pretrazivaca godišnje (pretpostavka: prosjecno trajanje pretrage 4–6 mj)
- Koristena srednja vrijednost: **700,000 aktivnih pretrazivaca godišnje**
- Najam: ~200,000 osoba/godišnje aktivno trazi najam (DZS + Njuskalo procjena)
- **Ukupni TAM: ~900,000 osoba godišnje u Hrvatskoj koje aktivno trazile nekretninu**

Monetizacija TAM-a:
- Prosjecni ARPU za PropTech app na tjednoj bazi: EUR 2–6/mj
- TAM u eurima: 900,000 × EUR 4/mj × 12 mj = **EUR 43.2 milijuna godišnje** (pretpostavka: 100% penetracija, sto je teorijski maksimum)

---

### 1.2 Bottom-Up analiza

**Korak 1 — Digitalni pretrazivaci nekretnina:**

- Njuskalo.hr: 1.5–2 mil. unikatnih posjetitelja mjesecno (Izvor: SimilarWeb procjena 2025 — pretpostavka autora)
- Crozilla.com: ~600,000 unikatnih posjetitelja/mj (pretpostavka)
- Index Oglasi: ~400,000 unikatnih posjetitelja/mj (pretpostavka)
- Realitica.com: ~300,000 unikatnih posjetitelja/mj (pretpostavka)
- **Ukupno digitalni kanal: ~2.8 mil. session-a/mj, ~750,000 unikatnih korisnika/mj**
- Eliminacija duplikata (korisnici koji koriste više platformi): -30% = **~525,000 unikatnih digitalnih pretrazivaca nekretnina mjesecno**

**Korak 2 — Mobilna penetracija:**
- Penetracija mobitela u Hrvatskoj: 81% (Eurostat 2024)
- Udio mobilnog prometa na oglasnicima: ~65% ukupnog prometa
- Mobilni pretrazivaci: 525,000 × 65% = **~341,000 osoba/mj aktivnih na mobitelu**

**Korak 3 — Skloni placanju za Premium alat:**
- Benchmark: conversion rate FREE-to-PAID u srodnim app kategorijama (Europa): 3–7%
- Koristeni konzervativni benchmark za Hrvatsku (niža platna moc od EU prosjeka): 2.5–4%
- Pri EUR 4.99/mj, prihvatljivo je ocekivati 3% konverziju

---

### 1.3 SAM (Serviceable Addressable Market)

SAM = dio TAM-a koji AI StanFinder realno moze dosegnuti s obzirom na:
- Fokus samo na Hrvatsku
- Fokus na mobilnu aplikaciju (ne web)
- Korisnici koji su digitalno agilni i otvoreni za AI alate

**Pretpostavke:**
- Hrvatska populacija koja aktivno trazi nekretninu i koristi digitalne alate: ~525,000/mj
- Od toga, korisnici s pametnim telefonom koji su otvoreni za novu app (ne samo Njuskalo): 40% = ~210,000 osoba
- Udio koji bi preuzeo besplatnu app za bolji matching: konzervativno 15% = ~31,500 korisnika

**SAM (godišnje):**
- Aktivna baza potencijalnih downloada godišnje: **~125,000–150,000** (s obzirom na rotaciju — novi kupci ulaze, stari izlaze iz pretrage)
- SAM prihodni potencijal (3% konverzija): 150,000 × 3% × EUR 4.99/mj × 12 mj = **~EUR 270,000 godišnje** samo od subscriptiona
- Uz B2B prihod od agenata (lead gen EUR 1/klik, pretpostavka 5 klikova/korisnik/mj): dodatnih ~EUR 150,000/god
- **Ukupni SAM: ~EUR 420,000 godišnje**

---

### 1.4 SOM (Serviceable Obtainable Market) — Prva godina

SOM = realistican cilj za prvu godinu uz ograniceni marketing budzet i organicni rast.

**Pretpostavke za godinu 1:**
- Preuzimanja (App Store + Google Play): cilj 8,000–12,000 downloada
- Aktivni korisnici (DAU/MAU ratio od 25%): ~2,500–3,000 MAU u prosincu Y1
- FREE korisnici: 97% = ~2,900
- PREMIUM korisnici: 3% = ~90 pretplatnika
- Prosjecni ARPU PREMIUM: EUR 4.99/mj

**SOM prihod — Godina 1:**

| Prihodni kanal | Korisnici | Prihod/mj | Godišnji prihod |
|----------------|-----------|-----------|-----------------|
| PREMIUM subscription | 90 | EUR 4.99 | EUR 5,390 |
| Agent lead gen (pilotiranje) | 50 agenata | EUR 30/mj | EUR 18,000 |
| Ukupno | — | — | **EUR 23,390** |

**Napomena (hipoteza):** Ovo je konzervativni scenarij. U optimisticnom scenariju (viralnost, PR pokrivenost, 20,000 downloada) SOM moze doseci EUR 55,000–75,000 u prvoj godini. Kljucni pokretac rasta bit ce organski kanal (App Store SEO, word-of-mouth u Facebook grupama "Kupujem/prodajem stan Zagreb").

**Sažetak TAM/SAM/SOM:**

| Metrika | Vrijednost | Napomena |
|---------|------------|----------|
| TAM | EUR 43.2 mil/god | 900k pretrazivaca × EUR 4/mj × 12 |
| SAM | EUR 420,000/god | Digitalni, mobilni, HR tržiste |
| SOM Godina 1 (konzervativno) | EUR 23,390 | 90 PREMIUM + 50 agenata |
| SOM Godina 1 (optimisticno) | EUR 75,000 | 20k downloada, veci agent prihod |
| SOM Godina 3 (cilj) | EUR 350,000–500,000 | 3,000+ PREMIUM korisnika |

---

## 2. Competitive Landscape — Top 5 Konkurenata

### 2.1 Njuskalo.hr

**Profil:**
- Tip: Horizontalni oglasnicki portal (sveobuhvatni: auti, nekretnine, posao)
- Osnivanje: 2006. | Vlasnik: South Central Ventures portfolio → Naspers/OLX Group
- Prihod: Procjena EUR 5–10 mil/god HR operacija (pretpostavka)
- Tržišni udio nekretnina HR: ~50–60% digitalnog inventara oglasa

**Prednosti:**
- Dominantna brand prepoznatljivost u Hrvatskoj
- Najveci inventar oglasa (nekretnine, vozila, ostalo)
- Etablirani B2B model s agencijama (placeni istaknuti oglasi)
- Integrirani oglasni ecosustav

**Slabosti:**
- Nema AI matching — iskljucivo manualnu pretragu s filterima
- UX nije mobilno-first (legacy dizajn)
- Nema push notifikacija za specificne pretrage
- Horizontalni fokus — nekretnine nisu core business
- Spor inovacijski ciklus (korporativna struktura)

**Prijetnja za AI StanFinder:** VISOKA — imaju brand i inventar, ali sporo inoviraju. Ako implementiraju AI matching, direktno bi ugrozili tržišnu poziciju. Vremenski prozor za ulazak: 18–24 mj.

---

### 2.2 Crozilla.com

**Profil:**
- Tip: Vertikalni portal — iskljucivo nekretnine
- Osnivanje: 2005. | Vlasnik: Hanza Media d.d. (Vecernji list, Jutarnji list)
- Fokus: Nekretnine i auti
- Tržišni udio nekretnina HR: ~20–25% digitalnog inventara

**Prednosti:**
- Vertikalni fokus na nekretnine — bolja dubina oglasa
- Integracija s medijskim grupom (Vecernji, Jutarnji) — content marketing prednost
- Newsletteri i upozorenja na nove oglase (osnovni alert sistem)

**Slabosti:**
- Alert sistem je primitivan — ne rangira po relevantnosti
- Nema AI komponente
- Mobilna aplikacija postoji ali je ogranicenih funkcionalnosti
- Manji inventar od Njuskala

**Prijetnja za AI StanFinder:** SREDNJA — vertikalni fokus je blize AI StanFinderu, ali nedostaje tehnoloski know-how za AI implementaciju.

---

### 2.3 Realitica.com

**Profil:**
- Tip: Vertikalni portal — iskljucivo nekretnine, agregator
- Posebnost: Agregira oglase s vise portala (Njuskalo, Crozilla, agencijski webo vi)
- Pokrivenost: Hrvatska + regija (BiH, Slovenija, Srbija)

**Prednosti:**
- Agregacijski model — siri inventar od bilo kojeg pojedinacnog portala
- Napredniji filter sistem od konkurencije
- Mapa prikaz nekretnina (sto ostali ne nude dovoljno dobro)
- Pokriva regionalnog kupca (dijaspora iz HR)

**Slabosti:**
- Nema AI ranking ni matching
- Monetizacija nejasna — cini se da nema PREMIUM modela za krajnjeg korisnika
- Brand prepoznatljivost niža od Njuskala i Crozille
- UX stariji dizajn

**Prijetnja za AI StanFinder:** SREDNJA-NISKA — agregacijski model je vrijedan, ali bez AI i bez jasnog monetizacijskog modela za krajnjeg korisnika.

---

### 2.4 Index Oglasi (Oglasi.net)

**Profil:**
- Tip: Horizontalni oglasnicki portal
- Vlasnik: Hanza Media d.d. (isto vlasništvo kao Crozilla)
- Pozicioniranje: Alternativa Njuskalu, jaci community aspekt

**Prednosti:**
- Integrirani s Index.hr portalom — medijska podrška
- Community efekt — "domaci" brand
- Raznolika kategorija oglasa

**Slabosti:**
- Nekretnine su jedna od desetak kategorija, nisu focus
- Nema naprednih funkcionalnosti za nekretnine
- Manji inventar od Njuskala
- Nema mobilne app posebno za nekretnine

**Prijetnja za AI StanFinder:** NISKA — nije direktni konkurent u smislu AI matching-a.

---

### 2.5 ImovinskaAgencija.hr / Agencijski webo vi (kolektivno)

**Profil:**
- Tip: Individualni webo vi agencija (Kastel Nekretnine, Century 21 HR, RE/MAX HR, Coldwell Banker HR)
- Posebnost: Direktni inventar agencija, bez agregacije

**Prednosti:**
- Ekskluzivni inventar koji nije na portalima
- Direktna veza kupac-agent (bolji conversion)
- Personalizirani pristup (telefon, email)
- Poznavanje lokalne mikrolokalnosti

**Slabosti:**
- Fragmentiran ekosustav — kupac mora posjetiti 10+ web stranica
- Nema AI rankinga
- Digitalna transformacija spora kod vecine agencija
- Nema push notifikacija

**Prijetnja za AI StanFinder:** NISKA — agencije mogu biti PARTNERI (B2B lead gen kanal), ne primarni konkurenti.

---

### 2.6 Medunarodni AI PropTech konkurenti (potencijalna prijetnja)

**Zillow (SAD):** Ima AI valuaciju (Zestimate) ali ne operira u HR.
**Rightmove/Zoopla (UK):** Nemaju prisutnost u HR.
**ImmoScout24 (DACH):** Prisutni u Austriji — moguca ekspanzija prema Slavoniji/medugranично.
**Idealista (Spanjolska/IT):** Prisutnost u regiji, mogli bi uci u HR.

**Procjena prijetnje od medunarodnig playera:** NISKA kratkorocno (12 mj), SREDNJA dugorocno (24–36 mj). Hrvatski tržiste je premalo za strateški prioritet velikih playera.

---

## 3. Feature Parity Matrix

| Funkcionalnost | AI StanFinder | Njuskalo | Crozilla | Realitica | Index Oglasi |
|---|---|---|---|---|---|
| **Pretraga po filterima** | DA | DA | DA | DA | DA |
| **Mobilna aplikacija** | DA | Djelomicno | DA | NE | NE |
| **Push notifikacije** | DA (real-time) | Djelomicno | Alert email | NE | NE |
| **AI matching / ranking** | DA (core) | NE | NE | NE | NE |
| **Semanticka pretraga** ("obitelj parking") | DA | NE | NE | NE | NE |
| **AI savjeti / preporuke** | DA | NE | NE | NE | NE |
| **Automatski scraping (15 min)** | DA | N/A (originalni) | N/A | Djelomicno | N/A |
| **Agregacija vise portala** | Njuskalo (MVP) | NE | NE | DA | NE |
| **Freemium model** | DA | NE (B2B) | NE (B2B) | NE | NE |
| **Match score (%)** | DA | NE | NE | NE | NE |
| **Personalizirani prikaz** | DA | NE | NE | NE | NE |
| **Lead gen za agente** | DA (planiran) | DA | DA | DA | DA |
| **Karta / map view** | Nije planirano MVP | DA | DA | DA | Djelomicno |
| **Najam kategorija** | DA | DA | DA | DA | DA |
| **Cijena po m² analiza** | DA (AI) | Djelomicno | NE | NE | NE |

**Zakljucak feature parityja:** AI StanFinder nema konkurenta u HR tržistu po pitanju AI matching, push notifikacija u realnom vremenu i semanticke pretrage. Jedina ocita rupa u MVP-u je map view koji svi konkurenti imaju — preporuka: dodati u Sprint 2 ili 3.

---

## 4. SWOT Analiza

### 4.1 Snage (Strengths) — Interne, cinjenice

**S1 — Jedini AI matching na HR tržistu**
Nijedan od top 5 konkurenata nema AI ranking po relevantnosti. AI StanFinder bi bio first-mover u ovoj kategoriji na HR tržistu. Ovo je trenutno trajna diferencijacija sve dok Njuskalo ne reagira (procjena: 18–24 mj).

**S2 — Real-time scraping (15 min ciklus)**
Njuskalo i ostali prikazuju oglase odmah kad ih agent postavi, ali korisnik mora sam osvjezvati. AI StanFinder aktivno prati i proaktivno obavještava. Na kompetitivnom tržistu (Zagreb — centalni stanovi se prodaju u danima), ovo je opipljiva prednost.

**S3 — Semanticka pretraga — "razumijevanje" zahtjeva**
Integracija Grok API-ja (ili alternativno OpenAI/Anthropic) omogucava obradu prirodnog jezika: "obitelj 2+1 s parkingerandom u blizini skole" — sto nijedan konkurent ne nudi.

**S4 — Freemium model prilagoðen kupovnoj moci HR**
EUR 4.99/mj je ispod pragova koji stvaraju psihološku barijeru (kupac stana od EUR 200k nece oklijevati platiti EUR 5 za bolji alat). Niska cijena ubrzava konverziju.

**S5 — Pokriva sva 3 segmenta (stanovi, kuce, zemljista)**
Apify scraper vec je konfiguriran za sva 3 tipa — siri adresabilni tržiste od day 1.

---

### 4.2 Slabosti (Weaknesses) — Interne, cinjenice/hipoteze

**W1 — Ovisnost o jednom izvoru podataka (Njuskalo)**
MVP se oslanja iskljucivo na Njuskalo.hr scraping. Ako Njuskalo blokira Apify ili promijeni strukturu, cijeli servis pada. Pravni rizik (ToS krsenje) nije zanemariv.
*Hipoteza: Njuskalo aktivno ne blokira scrapere u 2025. (nema javnih slucajeva), ali to se moze promijeniti.*

**W2 — Nedostatak brand awarenes-a (startup bez historije)**
Svi konkurenti imaju 15–20 godina brand prepoznatljivosti. AI StanFinder krece od nule — CAC ce biti visok u ranoj fazi.

**W3 — Manji inventar od agregacijskih platformi**
Realitica agregira Njuskalo + Crozilla + agencije = veci ukupni inventar. AI StanFinder u MVP-u ima samo Njuskalo. Korisnik koji ne naðe ono što trazi, churnira.

**W4 — Nema map view-a u MVP-u**
Map view je ocekivana funkcionalnost — korisnici koji trazite stan po lokaciji (bez mape) mogu biti frustrirani. Postoji rizik negativnih recenzija u App Storeu.

**W5 — Tim je (vjerojatno) mali — kapacitet razvoja i podrške**
*Hipoteza: Pocetni tim je 1–3 developera. Svaki incident ili veci bug može drasticno usporiti rast.*

---

### 4.3 Prilike (Opportunities) — Eksterne, cinjenice/hipoteze

**O1 — Rastuce cijene nekretnina u HR povecanvaju urgentnost pretrage**
Indeks cijena stanova u HR (HNB, Q4 2025): rast od ~8–12% godišnje u Splitu i Zadru, ~6–8% u Zagrebu. Vise nema "cekat cemo bolje vrijeme" — kupci su pod pritiskom i trebaju brze alati.

**O2 — Dijaspora kao segment — HR gradjani u inozemstvu koji kupuju u HR**
Procjena: 500,000+ HR gradjana u Njemackoj, Austriji, Irskoj koji potencijalno kupuju nekretninu u HR (Izvor: DZS podatci o iseljeništvu 2024). Ovo je segment koji ne moze dnevno refreshati Njuskalo iz Münchena — push notifikacije su im kljucna vrijednost.

**O3 — Turisticka ekonomija i kratkorocni najam (Airbnb investitori)**
Investitori koji trazee stanove za Airbnb iznajmljivanje (Dalmacija, Istra) — specifican segment s specifičnim AI filterima (ROI, blizina mora, turisticka zona). Moguca vertikalizacija.

**O4 — Ekspanzija na regiju (BiH, Srbija, Slovenija)**
Nakon dokazanog modela u HR, isti tehnicko-infrastrukturni stog moze se replicirati za slicna tržista u regiji (slicna jezicna struktura oglasa, slicni portali). Tržiste BiH + Srbija + Slovenija × 3 = potencijalno 3x veci SAM.

**O5 — AI hype valtruth — korisnici su sada spremi za AI alate**
Post-ChatGPT era (2023–2026): korisnici su navikli na AI asistente. Više nije potrebno educirati o tome što je AI — trziste je sazrelo.

**O6 — Partnerstvo s bankama i hipotekarnim posrednicima**
Korisnik koji trazi stan od EUR 200k je i potencijalni korisnik hipotekarnog kredita. Integracija s Addiko Bankom, OTP-om ili Raiffeisenom (HR) za "Provjeri mogucnost kredita" CTA — B2B2C model.

---

### 4.4 Prijetnje (Threats) — Eksterne, cinjenice/hipoteze

**T1 — Njuskalo implementira AI matching**
*Hipoteza: Njuskalo ima resurse (Naspers/OLX kapital) da licencira PropTech AI rješenje ili interno razvije. Vremenski horizont: 18–24 mj.* Ako to ucine, diferencijacija AI StanFindera drasticno opada.

**T2 — Pravni rizik scraping-a**
Njuskalo ToS zabranjuje automatsko prikupljanje podataka. U slucaju pravne akcije ili blokade, cijeli core product pada. *Cinjenica: U EU postoji regulatorni okvir (Database Directive) koji stitipodatke oglasnika.*
Mitigation: Pregovori o partnerstvu/API licence s Njuskalom (ili Crozillom) kao dugorocna strategija.

**T3 — Ulazak medjunarodnih playera (Idealista, ImmoScout24)**
Idealista vec ima prisutnost u Italiji i Spanjolskoj — Hrvatska je logican sljedeci korak za Adriatic regiju. ImmoScout24 vec ima Austriju i Sloveniju. *Hipoteza: Ulaz moguc u H2 2026. – H1 2027.*

**T4 — Generativni AI postaje commodity — ChatGPT plugins za pretragu nekretnina**
OpenAI, Google i Microsoft razvijaju agentic AI koji moze sam pretrazivati web i filtrirati nekretnine — direktno iz ChatGPT/Copilot sučelja bez instalacije aplikacije. Ovo je egzistencijalna prijetnja na 3–5 godišnjem horizontu.

**T5 — Zasicenost GDPR regulacijom — push notifikacije**
EU regulativa oko push notifikacija postaje stroza (Digital Services Act). Pretjerano agresivne notifikacije → deinstalacija → negativan word-of-mouth.

---

## 5. Trendovi u industriji

### T1 — AI kao standard u PropTech (globalni trend, visoki impact)

**Cinjenica:** Zillow (SAD) koristi AI ("Zestimate") od 2019. s +300M valuacija procjena/god. OpenDoor koristi ML za instant kupovinu nekretnina. Compass Real Estate (SAD) uveo AI assistant za agente 2024.

**Impact za HR:** Hrvatska kasni ~3–5 godina za globalnim PropTech trendovima. Ovo znaci da je AI StanFinder u idealnoj poziciji — dovoljno rano za first-mover prednost, dovoljno kasno da je tehnologija (Grok API, Apify) dostupna i jeftina.

**Impact procjena:** VISOK (5/5) — AI matching postaje ocekivani standard, ne differentiator, do 2028.

---

### T2 — Mobilna dominacija pretrage nekretnina (globalni + HR trend, visoki impact)

**Cinjenica (pretpostavka s obrazlozenjem):** Rightmove (UK, 2024. godišnji izvjestaj): 70% pretraga dolazi s mobitela. Za HR tržiste, Njuskalo mobilni promet procjenjujem na 60–70% (konzistentno s HR prosjekom internetske potrosnje — Eurostat 2024: 79% HR gradjana koristi internet svakodnevno, 71% pametnim telefonom).

**Impact za AI StanFinder:** Mobile-first pristup je neophodan, ne opcija. AI StanFinder kao nativna app je pozicioniran ispravno.

**Impact procjena:** VISOK (4/5)

---

### T3 — Rast cijena nekretnina u HR i pritisak na kupce (HR-specifican, visoki impact)

**Cinjenica:** HNB Izvjestaj o financijskoj stabilnosti (2025): cijene stambenih nekretnina u HR rasle su 9.3% nominalno u 2024. Hrvatska je u top 5 EU zemalja po rastu cijena nekretnina. Zagreb prosjecna cijena stana: ~EUR 2,600/m² (2024.), Split: EUR 3,200/m², Zadar: EUR 2,800/m².

**Posljedica:** Kupci su pod vecim pritiskom — svaki dan odgode = veci trošak. Ovo direktno povecanva willingness-to-pay za alat koji ubrzava pronalaženje dobre prilike.

**Impact procjena:** VISOK (5/5) — rastuce cijene = veca motivacija za AI alat

---

### T4 — PropTech demokratizacija — SaaS alati za male investitore (globalni trend, srednji impact)

**Cinjenica:** Platforme poput Roofstock (SAD), Casafari (EU) i Property Partner (UK) otvaraju nekretninski investicijski trg malim investitorima kroz data analitiku. U HR je ovaj trend tek u pocetku.

**Relevantnost za AI StanFinder:** Moguca dugorocna pivotacija prema "investment analytics" sloju — korisnici koji trazee stanove za najam (prinos od 4–6% u Dalmaciji) su posebno vrijedan segment. Moguca premium vertikala (EUR 19.99/mj).

**Impact procjena:** SREDNJI (3/5) — relevantno za Year 2+ roadmap

---

### T5 — Regulatorna promjena: EU AI Act i transparentnost algoritama (globalni trend, nizak-srednji impact)

**Cinjenica:** EU AI Act stupa na snagu postupno 2025–2027. Sustavi koji utjecu na "important personal decisions" (ukljucujuci nekretnine) moraju biti transparentni u logici odlucivanja. "High-risk" klasifikacija za AI sustave koji utjecu na pristup nekretninama.

**Impact za AI StanFinder:** Niski kratkorocno (B2C matching app vjerojatno nece biti klasificiran kao high-risk). Srednji dugorocno — ako platforma poraste i agenti je koriste za automatiziranu selekciju kupaca, mogu nastati regulatorne obveze.

**Preporuka:** Dokumentirati AI logiku rankinga od pocetka (explainability log). Ovo je i PR prednost ("transparentni AI").

**Impact procjena:** NIZAK-SREDNJI (2/5) kratkorocno

---

## 6. Dodatne preporuke — Neiskoristene prilike

### 6.1 Neiskoristeni segmenti

**Dijaspora segment (PRIORITET VISOK):**
500,000+ HR gradjana u inozemstvu aktivno kupuje nekretnine u HR. Trenutno nemaju nikakav AI alat koji im šalje relevantne matcheve dok žive u Münchenu ili Dublinu. Marketing kanal: HR Facebook grupe u Njemackoj ("Hrvati u Njemackoj Kupujem Prodajem") — organska akvizicija uz nulti trošak.

**Airbnb investitori (PRIORITET SREDNJI):**
Poseban AI filter: "yield calculation" — stanovi blizu mora/centra s procjenom Airbnb prihoda. Moguca integracija s AirDNA podacima (globalni servis za Airbnb analitiku). Ovaj segment ima visoku platnu moc i willingness-to-pay.

**Mladi kupci (25–35) koji trazee prvu nekretninu:**
Segment koji nema iskustva s pregovorima. AI savjeti tipa "ova cijena je 12% iznad prosjeka za ovu cetvrt" direktno adresiraju njihov pain point. Akvizicija: TikTok/Instagram content ("kako kupiti prvi stan u HR").

---

### 6.2 Potencijalni partneri

**Banke i hipotekarni posrednici:**
- OTP Banka HR — traženje nekretnina i hipotekarni kredit su inherentno povezani
- Raiffeisen Banka HR
- PBZ (integracija s PBZ Krediti kalkulatorom)
- Model: Affiliate komisija za svaki odobren kredit posredovan putem AI StanFindera (EUR 100–300/konverzija)

**Osiguravajuce kuce:**
- Croatia Osiguranje — "Kupio si stan? Osiguraj ga odmah" — CTA post-kupovini
- Allianz HR

**Arhitektonski studiji i interior designeri:**
- Korisnik koji je nasao stan cesto odmah treba renovaciju/opremanje
- Referral partnership: "Preporuceni dizajneri za ovu lokaciju"

**Odvjetnicke kancelare za nekretnine:**
- Pravna provjera vlasnistva, tereti — ovo je bottleneck u procesu kupovine stana u HR
- Integracija: "Provjeri ovaj oglas pravno" — B2B2C

**Apify (tehnološki partner):**
- Apify vec ima HR klijente i dostupne Njuskalo scrapere na Apify Store-u
- Mogucnost pregovora o volume discounti (>10,000 scraping req/dan)

---

### 6.3 Content strategija za akviziciju (organski kanal)

**Zakljucak o content marketingu:** Placeno oglašavanje je skupo za startupe na HR tržištu (Meta Ads CPM ~EUR 5–8, niski ROI u ranoj fazi). Organski content je optimalna strategija za prvu godinu.

**Preporuceni content kanali:**

1. **SEO blog** (dugorocni kanal, rast u 3–6 mj):
   - Clanci: "Kako kupiti stan u Zagrebu 2026.", "Prosjecna cijena stana po cetvrtu u Splitu", "Njuskalo vs Crozilla — usporedba"
   - Long-tail keywords s malim Competition Score: "jeftini stanovi Zagreb periferija", "stan Zadar okrug kupovina"
   - Cilj: top 3 pozicija za 20 long-tail keywordova u 6 mj

2. **TikTok / Instagram Reels** (brzi rast, mlada publika):
   - Format: "Pogledaj sto AI StanFinder naðe za EUR 200k u Zagrebu" — screenrecord pretrage
   - "3 trika za jeftiniju nekretninu u HR koje agenti ne žele da znas"
   - Cilj: 1 video/tjedan, target 500k total views u prvoj godini

3. **Facebook grupe** (dijaspora segment + lokalni kupci):
   - Grupe: "Kupujem nekretninu Zagreb", "Hrvati u Njemackoj", "Stanovi Split kupoprodaja"
   - Taktika: Odgovarati na pitanja clanova grupes s korisnim savjetima (ne spamirati s linkovima)
   - Postavljati "nativni" content: "Usporedio sam 150 stanova u Zagrebu — evo sto sam naucio"

4. **PR i mediji:**
   - Pitch lokalnim medijima: Jutarnji list, Vecernji list, tportale, bug.hr, Netokracija
   - Hook: "Hrvatski startup koji koristi AI za pretragu nekretnina" — novinski clanci su besplatni PR
   - Cilj: 3–5 clanaka u nacionalnim medijima u prvih 6 mj

---

### 6.4 Preporuke za pricing strategiju

*Napomena: Ovo su preporuke za CEO/CFO — strateška odluka je njihova.*

**Opazanje 1:** EUR 4.99/mj je ispod psihološkog praga ali moze signalizirati "jeftino = loše" premium kupcima. Razmotriti EUR 6.99/mj uz jasniju value proposition.

**Opazanje 2:** Godišnji plan (EUR 49.99/god = EUR 4.16/mj efektivno) povecava LTV i smanjuje churn — standardna praksa u SaaS-u.

**Opazanje 3:** Agent/agencijski B2B tier je potencijalno najvrjedniji prihodni kanal (EUR 30–100/mj po agenciji × 500 agencija u HR = EUR 15,000–50,000/mj). Ovo je >10x vrijednost B2C kanala — preporucujem da CFO/CEO razmotre kada prioritizirati B2B razvoj.

---

## 7. Zakljucak i preporuke za CEO

### 7.1 Tržisna validacija

**Cinjenica:** Tržiste postoji. 900,000 osoba godišnje aktivno traze nekretninu u HR. Digitalni kanal je dominantan. Nijedan postojeci player ne nudi AI matching.

**Cinjenica:** First-mover prednost postoji ali je vremenski ogranicena (18–24 mj prozor).

**Hipoteza:** Willingness-to-pay za EUR 4.99/mj postoji kod kupaca stanova — problem je stvaran i bolan (sati dnevno scrolla Njuskala).

### 7.2 Kljucni rizici koje CEO treba razmotriti

1. **Pravni rizik scraping-a** — prioritet: od prvog dana uspostaviti kontakt s Njuskalom (partnerstvo ili licenca)
2. **Ovisnost o jednoj platformi** — plan B: Crozilla kao sekundarni izvor podataka u Q2
3. **Njuskalo AI reakcija** — pratiti konkurentske vijesti; imati "Acceleration Plan" spreman ako Njuskalo nasluti AI implementaciju

### 7.3 Zakljucna procjena tržisne prilike

Tržišna prilika je **realna ali uska** u HR-specifičnom kontekstu (mali SAM). Dugorocna vrijednost projekta ovisi o:
a) Brzini skaliranja na regiju (BiH, Srbija, Slovenija) — potencijalnih x3–x4 SAM
b) B2B pivot prema agencijama (veci ARPU)
c) Obrani first-mover pozicije kroz brand i UX superiornost

**Ovaj dokument preporucuje GO na temelju tržisne analize.** Konacna GO/NO-GO odluka ostaje u nadleznosti CEO Agenta.

---

*Napomena o metodologiji:* Sve tržisne velicine su procjene temeljene na javno dostupnim podacima, industry benchmarkovima i autorovim pretpostavkama. Oznacene pretpostavke nisu verificirane primarnim istrazivanjem. Preporucuje se provedba minimalnog korisnickog istrazivanja (20–30 intervjua s potencijalnim korisnicima) za validaciju hipoteza prije punog ulaganja u razvoj.

---

*Dokument kreiran: 31.03.2026*
*Sljedeci korak: CEO Agent — GO/NO-GO odluka i strateška vizija (/docs/strategy/)*
*CFO Agent — financijska analiza i ROI projekcija (/docs/finance/)*
