# Launch Checklist — AI StanFinder

**Dokument pripremio**: CMO Agent
**Datum**: 01.04.2026.
**Status**: FINAL — Faza 7 output
**Verzija**: 1.0

---

## Legenda

- [ ] Nije zapoceto
- [~] U tijeku
- [x] Zavrseno
- **Vlasnik**: Koji agent/osoba je odgovorna
- **Rok**: Najkasniji datum dovrsavanja

---

## BLOK A — Pre-Launch (T-14 do T-1)

### A1 — Produkt & Tehnicka gotovost (T-14 do T-7)
**Vlasnik: CTO / DevOps Agent**

- [ ] App je deployiran na staging okruzenju i prosen QA
- [ ] Nema Critical bugova (QA Agent sign-off)
- [ ] Performance testovi zadovoljeni: LCP < 2.5s, FCP < 1.5s
- [ ] Push notifikacije rade na iOS i Android (end-to-end test)
- [ ] AI matching vraca rezultate u < 5 sekundi
- [ ] Onboarding flow testiran na 5 stvarnih korisnika (UAT)
- [ ] App je submittan na App Store review (min. T-10 zbog Apple review procesa)
- [ ] App je submittan na Google Play review (min. T-3 zbog kraceg review procesa)
- [ ] Crashlytics i Sentry su konfigurirani i primaju podatke
- [ ] Firebase Analytics je aktivan i biljezi custom evente (signup, filter_set, match_viewed)
- [ ] Rate limiting je aktivan (zastita od abuse-a)
- [ ] GDPR: Privacy Policy i Terms of Service su zivi na web stranici
- [ ] Backup/restore procedura testirana

### A2 — Marketing infrastruktura (T-14 do T-7)
**Vlasnik: CMO Agent**

- [ ] Landing page je live na domeni (stanfinder.hr ili ai-stanfinder.com)
- [ ] Landing page loadtime < 1.5s na mobilnom (provjeri Google PageSpeed)
- [ ] Email waitlist forma je funkcionalna (integracija s Mailchimp ili Klaviyo)
- [ ] App Store listing je kreiran i popunjen (vidi sekciju D)
- [ ] Google Play listing je kreiran i popunjen (vidi sekciju D)
- [ ] UTM parametri postavljeni za sve kanale (Instagram bio link, TikTok bio, email)
- [ ] Social media profili su kreirani i optimizirani (Instagram, TikTok, LinkedIn)
- [ ] Profili imaju bio text, profilnu sliku, link u biou
- [ ] Canva Pro ili dizajnerski template za content je spreman
- [ ] Content kalendar za T+1 do T+30 je popunjen i odobren
- [ ] Email welcome sekvenca je napisana i konfigurirana (3 emaila: dan 1, dan 3, dan 7)
- [ ] Press kit je spreman: logo, screenshot-ovi, kratki opis, kontakt

### A3 — PR priprema (T-10 do T-3)
**Vlasnik: CMO Agent**

- [ ] Media lista je sastavljena (vidi sekciju E — PR kontakti)
- [ ] Press release (priopcenje) je napisan i odobren od CEO-a
- [ ] Embargo je postavljen na T-1 23:59 (mediji mogu dobiti info unaprijed, ne smiju objaviti)
- [ ] Founder/CEO je spreman za intervjue (Q&A dokument pripremljen)
- [ ] Kontaktirani novinari za ekskluzivni preview (1-2 medija koji dobivaju "prvu pricu")

### A4 — Pravno & Compliance (T-14 do T-7)
**Vlasnik: CEO / Legal**

- [ ] Pravno misljenje o web scrapingu dostavljeno i pozitivno
- [ ] Privacy Policy je odobren od pravnika (GDPR uskladivost)
- [ ] Terms of Service su odobren
- [ ] App Store Developer Agreement potpisan
- [ ] Google Play Developer Agreement potpisan
- [ ] Trademark check za ime "AI StanFinder" ili odabrano ime

### A5 — Beta korisnici i testimonijali (T-14 do T-3)
**Vlasnik: CMO / CSM Agent**

- [ ] Regrutiran minimum 20 beta korisnika s waitliste
- [ ] Beta korisnici su koristili app minimum 7 dana
- [ ] Prikupljeni testimonijali od minimum 5 beta korisnika (pisani + opcija video)
- [ ] Beta korisnici su pitani za App Store / Google Play review na dan launch-a
- [ ] Prikupljene fotografije ili video materijal (s dozvolom) za social media

### A6 — Team briefing (T-3)
**Vlasnik: COO / CMO Agent**

- [ ] Cijeli tim je briefiran o launch planu i rasporedu
- [ ] Definiran "war room" komunikacijski kanal (Slack kanal ili Whatsapp grupa)
- [ ] Definiran eskalacijski protokol za tehnicke probleme na launch danu
- [ ] Svaki clan tima zna sto radi na T+0
- [ ] Backup plan je definiran za slucaj App Store odbijanja (WebApp fallback)

---

## BLOK B — Launch Day (T+0)

### B1 — Jutarnja provjera (07:00-08:00)
**Vlasnik: CTO + DevOps**

- [ ] Svi servisi su UP (backend, baza, scraper, AI API)
- [ ] App je dostupan na App Store i Google Play (provjeri direktnim downloadeom)
- [ ] Push notifikacije rade (posalji test notifikaciju svim beta korisnicima)
- [ ] Landing page je dostupna i funkcionalna
- [ ] Email signup forma prima podatke
- [ ] Monitoring alerting je aktivan

### B2 — PR i mediji (08:00-10:00)
**Vlasnik: CMO**

- [ ] Poslan embargo lift email svim novinarima (embargo je zavrsio u ponoc)
- [ ] Ekskluzivni medij je obavjesten da moze objaviti
- [ ] Priopcenje je poslano svim ostalim medijima na listi
- [ ] Social media timovi su dobili zeleno svjetlo za objave

### B3 — Social media launch (09:00)
**Vlasnik: CMO / Content tim**

- [ ] Instagram Feed objava je live
- [ ] Instagram Stories (10 slajdova) su live
- [ ] TikTok launch video je live
- [ ] LinkedIn objava je live
- [ ] Bio linkovi na svim profilima su aktivni i vode na ispravnu stranicu
- [ ] Email svim waitlist pretplatnicima je poslan

### B4 — Monitoring tokom dana
**Vlasnik: CTO + CMO (zajednicki)**

- [ ] Monitoring dashboard je otvoren i prati se kontinuirano
- [ ] Svaka sat provjera: downloadi, registracije, crashevi
- [ ] Social media: odgovaranje na sve komentare u roku 30 minuta
- [ ] PR: pracenje coverage-a (Google Alerts na "AI StanFinder")
- [ ] App Store / Google Play: monitoring prvih recenzija

### B5 — Kraj dana recap (20:00)
**Vlasnik: CEO + CMO**

- [ ] Prebrojani downloadi, registracije, matchevi generirani
- [ ] Dokumentirani svi bugovi i incidenti koji su se dogodili
- [ ] Odgovoreno na sve korisnicke poruke (DM, email, komentari)
- [ ] Interna email/Slack poruka timu s rezultatima dan 1
- [ ] Plan za T+1 je potvrdjen

---

## BLOK C — Post-Launch (T+1 do T+14)

### C1 — Prva sedmica (T+1 do T+7)
**Vlasnik: CMO + CTO**

- [ ] Dnevni monitoring KPI-ja (downloadi, DAU, matchevi, churn)
- [ ] Svaki dan odgovoriti na sve App Store / Play Store recenzije
- [ ] Svaki dan objaviti minimalno 1 content komad (Reel ili TikTok)
- [ ] T+3: Poslan follow-up email korisnicima koji su se registrirali ali nisu koristili app 3 dana
- [ ] T+5: Poslan email korisnicima koji su koristili app ali nisu postavili filter
- [ ] T+7: Prva tjesdna analiza kohortne retencije (D1, D3, D7)
- [ ] T+7: Retrospektiva s timom — sto je proslo dobro, sto ne

### C2 — Bug fixing i patch (T+1 do T+5)
**Vlasnik: CTO / Backend + Frontend**

- [ ] Svi Critical i High bugovi prijavljeni od korisnika su prioritetizirani
- [ ] Hotfix release ako ima Critical bugova (target: < 24h od prijave)
- [ ] App Store / Play Store update je submittan sa fix-ovima
- [ ] Korisnici koji su dojavili bugove su obavjesteni o popravku

### C3 — B2B outreach (T+1 do T+14)
**Vlasnik: CMO + Sales Agent**

- [ ] Lista 50 nekretninarskih agenata / agencija je sastavljena (LinkedIn + portali)
- [ ] Personaliziranu poruku je poslana svakom agentu
- [ ] Pratimo odgovore i zakazujemo demo pozive
- [ ] T+7: Agent webinar je promoviran (LinkedIn Live, T+14)
- [ ] T+14: Odrzani webinar, prikupljeni leadovi

### C4 — Retention kampanja (T+7 do T+14)
**Vlasnik: CMO + CSM Agent**

- [ ] Referral program je lansiran (vidi content plan dan 17)
- [ ] Push notifikacija o referral programu je poslana svim korisnicima
- [ ] Kohorta korisnika koji nisu dosli 7 dana dobiva win-back notifikaciju
- [ ] "Tip tjedna" serijal pocinje (push notif + Instagram)
- [ ] In-app rating prompt je aktivan za korisnike koji su koristili app 5+ dana

### C5 — Media follow-up (T+7 do T+14)
**Vlasnik: CMO**

- [ ] Follow-up poslan novinarima koji nisu pokrili launch
- [ ] Novo priopcenje s prvim brojkama (downloadi, matchevi) je objavljeno
- [ ] Blog post o launch iskustvu objavljen (transparent founder content)
- [ ] T+14: 2-tjedni recap poslan svim korisnicima emailom

---

## SEKCIJA D — App Store i Google Play Listing Copy

### D1 — Naslov aplikacije

**Kratki naslov (30 znakova max)**:
AI StanFinder — Nekretnine

**Podnaslov (30 znakova max)**:
AI matching za tvoj stan

*Obrazlozenje*: Naslov sadrzi kljucne rijeci "AI", "stan", "nekretnine" za App Store SEO. Podnaslov komunicira core value proposition.

---

### D2 — Kratki opis (80 znakova, Google Play)

AI asistent koji automatski trazi savrsenu nekretninu umjesto tebe. Besplatno.

---

### D3 — Dugi opis (4.000 znakova max)

**AI koji radi umjesto tebe — pronadi savrseni stan bez sati pretrazivanja**

Koliko vremena tjedno trosiste na pretragu stanova na Njuskalu? Vecina ljudi kaze vise od sat dnevno — a i dalje strahuje da ce propustiti dobar oglas.

AI StanFinder to rjesava jednom za svagda.

**Kako radi:**
1. Jednom postavi filter — grad, cijena, velicina, i opis u slobodnom tekstu ("obitelj, parking, blizina vrtica")
2. AI automatski skenira sve nove oglase svakih 15 minuta
3. Dobivas push notifikaciju samo kad se pojavi savrseni match — ne i kad se pojavi 847 ne-odgovarajucih

**Zasto je AI StanFinder drugaciji:**

Svi portali za nekretnine rade isto — prikazuju popis oglasa i cekaju da ih sami pretrazujete. AI StanFinder je aktivan, ne pasivan. Nasalgoritmam razumije kontekst tvojih potreba, a ne samo kljucne rijeci.

Rezultat: TOP 10 matcheva koji stvarno odgovaraju tvojim kriterijima, s postotkom podudaranja i AI obrazlozenjem za svaki.

**Kljucne mogucnosti:**
- Real-time AI skeniranje svakih 15 minuta (PREMIUM)
- Personalizirani TOP 10 matchevi s postotnim scorom
- Push notifikacije za top matcheve
- AI savjeti: "Povecaj budzet 5% za 40% bolji izbor", "Pesenica daje 18% veci value/m2"
- Semanticko razumijevanje tvojih potreba — ne samo filteri, nego kontekst
- Pokriva cijelu Hrvatsku — Zagreb, Split, Rijeka, Osijek i sve ostale gradove

**Tko koristi AI StanFinder:**
- Obitelji koje trazaju veci stan i nema vremena za svakodnevno pretrazivanje
- Mladi kupci koji kupuju prvi stan i trebaju AI savjete
- Investitori koji traze brzinsku prednost na trzistu
- Nekretninski agenti koji trebaju real-time market intel

**Cijene:**
- FREE: Do 5 matcheva dnevno, osnovni filteri
- PREMIUM: €7.99/mj ili €59.99/god — Neograniceni matchevi, real-time scanning, AI savjeti
- 14 dana besplatno za novi Premium korisnici

Preuzmi AI StanFinder i nikad vise nemoj propustiti savrseni stan.

---

### D4 — Kljucne rijeci (App Store Search Ads / ASO)

**Primarne (visoki volumen)**:
nekretnine, stan, kupnja stana, njuskalo, trazenje stana, stanova

**Sekundarne (long-tail, manji volumen ali visi intent)**:
AI nekretnine, automatsko pretrazivanje stanova, aplikacija nekretnine hrvatska, matching stanova, upozorenje novi oglas stan

**Negativne (treba iskljuciti iz paid kampanja)**:
agencija nekretnina, hipoteka, kredit za stan (drugaciji intent)

---

### D5 — Kategorije

App Store: **Lifestyle** (primarna), **Utilities** (sekundarna)
Google Play: **House & Home** (primarna), **Lifestyle** (sekundarna)

*Obrazlozenje*: "House & Home" na Google Playu je direktnija kategorija s manjom konkurencijom od "Lifestyle". App Store nema ekvivalent pa koristimo Lifestyle kao najvecu relevantnu kategoriju.

---

### D6 — Screenshots (sadrzaj za dizajnera)

Screenshot 1 (Hero): Matchevi ekran s TOP 10 listom i postotnim scorevima. Naslov iznad: "Tvoj AI prona??e savrseni stan"
Screenshot 2: Filter setup ekran. Naslov: "Jednom postavi, zauvijek prati"
Screenshot 3: Push notifikacija na zakljucanom ekranu mobitela. Naslov: "Javi ti kad se pojavi pravo"
Screenshot 4: AI savjeti ekran. Naslov: "Savjeti koji ti stede tisuce"
Screenshot 5: Detalj oglasa s AI score-om i obrazlozenjem. Naslov: "Razumije zasto je nesto pravo za tebe"

---

## SEKCIJA E — PR Kontakti (HR tech mediji i nekretninski mediji)

### Tier 1 — Primarni (obavezni za kontakt)

**1. Vecernji.hr / Crozilla.com**
- Kontakt: Redakcija poslovnih vijesti + tech desk
- Email: poslovna@vecernji.net
- Zasto: Medijska grupa vlasnik Crozille — zanimljiv angle "AI konkurent naseg portala"
- Pristup: Ekskluzivni preview s embargom, pitaj za clanak "Startupi koji mijenjaju HR trziste"

**2. Jutarnji.hr**
- Kontakt: Tech & biznis desk
- Email: redakcija@jutarnji.hr
- Zasto: Najveci dnevni portal u HR, masovni doseg
- Pristup: Priopcenje + poziv na demo

**3. Tportal.hr (T-HT mediji)**
- Kontakt: Tech redakcija
- Email: redakcija@tportal.hr
- Zasto: Tehnoloska publika, rano adoptera
- Pristup: "Prva hrvatska AI aplikacija za nekretnine" angle

**4. Poslovni.hr (Poslovni dnevnik)**
- Kontakt: Startup i tech vijesti
- Email: redakcija@poslovni.hr
- Zasto: B2B publika — agenti, investitori, developeri koji su nas target
- Pristup: Podaci o trzisnoj praznini, ROI za korisnike, angle "HR proptech startup"

**5. Bug.hr**
- Kontakt: Tehnoloska redakcija
- Email: kontakt@bug.hr
- Zasto: Tehnoloska/geek publika, early adopters koji ce biti brand ambassadori
- Pristup: Deep dive o AI tehnologiji, Grok API integracija, arhitektura

### Tier 2 — Sekundarni (poslati priopcenje, ne exkluziva)

**6. 24sata.hr**
Kontakt: redakcija@24sata.hr
Zasto: Masovni doseg, lifestyle/consumer audience

**7. Index.hr**
Kontakt: redakcija@index.hr
Zasto: Mlada publika, digitalni nativci, potencijalni korisnici

**8. Lider.hr**
Kontakt: lider@lider.media
Zasto: Biznis publika, poduzetnici koji bi mogli biti investitori ili B2B partneri

**9. Netokracija.com**
Kontakt: urednistvo@netokracija.com
Zasto: Startup i tech zajednica u HR/regiji. Ovo je "home" za nasu pricu.
Pristup: Detaljni interview s founderom, tehnicki angle

**10. CRObiznis.com**
Kontakt: info@crobiznis.hr
Zasto: Pokriva startup ekosustav u HR

### Tier 3 — Specificni (nekretninski sektor)

**11. Creditexpress.hr / tematski portali o nekretninama**
Pristup: Partnerstvo za educativni sadrzaj o AI trazenju stanova

**12. Facebook grupe** (ne mediji, ali high-impact)
- "Kupujem/prodajem stan Zagreb" (50k+ clanova)
- "Nekretnine Zagreb" (30k+ clanova)
- "Stan Zagreb - kupoprodaja i najam" (20k+ clanova)
- Pristup: Osnivac objavljuje osobnu pricu (ne ad!), autentican post o problemu koji je rijesio gradjenjem ove aplikacije

---

### Press Release template struktura

**Naslov**: "Hrvatska aplikacija AI StanFinder automatizira trazenje nekretnina uz pomoc vjestacke inteligencije"

**Pod-naslov**: Novi alat skenira Njuskalo.hr svakih 15 minuta i isporucuje personalizirane preporuke nekretnina, eliminiraju?i sate rucnog pretrazivanja.

**Uvod** (tko, sto, kada, gdje, zasto — 100 rijeci):
Zagreb, [datum] — AI StanFinder, nova mobilna aplikacija dostupna na iOS i Android platformama, danas je lansirana kao prvo AI-pogonjeno rjesenje za personalizirano pretrazivanje nekretnina na hrvatskom trzistu. Aplikacija koristi napredni semanticki matching algoritmam koji razumije korisnikove potrebe u slobodnom tekstu i automatski skenira portale za nekretnine svakih 15 minuta, isporucujuci personalizirani TOP 10 matcheva uz real-time push notifikacije.

**Tijelo** (problem, rjesenje, citati, podaci)

**Citat foundera/CEO-a**: "Svaka osoba koja je trazila stan u Hrvatskoj zna tu frustraciju — sati pretrazivanja, stotine irelevantnih oglasa, strah da si propustio dobar oglas. AI StanFinder to mijenja tako da radi umjesto korisnika."

**Podaci o trzistu**: "S vise od 70.000 transakcija nekretninama godisnje i procijenjenih 900.000 aktivnih pretrazivaca, hrvatsko trziste nekretnina je primjerno za AI optimizaciju."

**Citat beta korisnika**: Koristiti testimonijale iz beta faze

**Pricing i dostupnost**: Besplatno preuzimanje, Premium od €7.99/mj

**Kontakt za medije**:
Ime, email, mobitel

---

## Monitoring i eskalacija

### Launch day war room kontakti

| Uloga | Odgovornost | Kontakt signal |
|-------|-------------|----------------|
| CTO | Tehnicka infrastruktura, crash response | Sentry alert |
| CMO | Social media, PR, korisnicka komunikacija | Komentar/DM |
| DevOps | Server uptime, deployment | Nagios/UptimeRobot |
| CSM | Korisnicka podrska, onboarding | App inbox |

### Eskalacijski protokol

**Razina 1 — Minor incident** (app sporo, 1-2 korisnicke prituzbe):
- CTO procjenjuje u 15 minuta
- Fix u roku 2 sata
- Korisnici nisu informirani

**Razina 2 — Significant incident** (matching ne radi, push notif ne stizrhu):
- CTO + DevOps odmah
- Status update na socijalnim medijima ("Radimo na poboljsanjima")
- Fix u roku 4 sata

**Razina 3 — Critical incident** (app down, baza nedostupna):
- Cijeli tim alert
- Status stranica azurirana (status.stanfinder.hr)
- Javna komunikacija na socijalnim medijima
- Rollback ako je potrebno
- Fix u roku 1 sat ili rollback

---

*CMO Agent | AI StanFinder | Faza 7 — Go-to-Market*
*Dokument je koordiniran s: Sales Agent (pricing tieri), CSM Agent (onboarding flow), CTO Agent (tehnicka gotovost)*
