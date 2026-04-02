# Politika privatnosti — AI StanFinder

**Verzija**: 1.0
**Datum objave**: 02.04.2026.
**Zadnji pregled**: 02.04.2026.

> NAPOMENA: Ovaj dokument je izrađen kao nacrt i mora proći pravni review od strane kvalificiranog odvjetnika prije objave.

---

## 1. Voditelj obrade podataka

Voditelj obrade osobnih podataka u smislu Opće uredbe o zaštiti podataka (GDPR, Uredba EU 2016/679) je:

**Mario Striškovic**
Neovisni razvijač softvera
Republika Hrvatska
E-mail: privacy@aistanfinder.hr

Za sva pitanja vezana uz obradu Vaših osobnih podataka možete nas kontaktirati na gore navedenu e-mail adresu.

---

## 2. Koji osobni podaci se prikupljaju

### 2.1 Podaci koje Vi izravno dajete

| Kategorija podataka | Primjeri | Kada se prikuplja |
|---------------------|----------|-------------------|
| Podaci o računu | Ime, prezime, e-mail adresa | Registracija putem Clerk |
| Podaci o preferencijama | Grad, vrsta nekretnine, raspon cijena, broj soba, kvadratura, željene lokacije | Postavljanje filtera pretrage |
| Favoriti | ID-ovi oglasa koje ste označili kao favorite | Korištenje aplikacije |
| Komunikacijski podaci | Sadržaj poruka poslanih na korisničku podršku | Kontakt s podrškom |

### 2.2 Podaci koji se prikupljaju automatski

| Kategorija podataka | Primjeri | Svrha |
|---------------------|----------|-------|
| Push notification token | Expo push token Vašeg uređaja | Slanje push obavijesti o novim oglasima |
| Podaci o korištenju | Kada ste se prijavili, koji filteri su korišteni, koje oglase ste pregledali | Poboljšanje AI matching algoritma |
| Tehnički podaci | Tip uređaja, verzija operativnog sustava, verzija aplikacije | Dijagnostika grešaka (Sentry) |
| IP adresa | IP adresa pri svakom zahtjevu | Sigurnost, prevencija zlouporabe, rate limiting |

### 2.3 Podaci koje NE prikupljamo

Ne prikupljamo i ne obrađujemo:
- Posebne kategorije podataka (zdravlje, vjeroispovijest, politička mišljenja i sl.)
- Podatke o plaćanju (broj kartice, IBAN) — te podatke izravno obrađuje RevenueCat i Apple/Google
- Podatke o lokaciji u stvarnom vremenu

---

## 3. Pravna osnova obrade

Za svaku svrhu obrade navodimo konkretnu pravnu osnovu sukladno članku 6. GDPR-a:

| Svrha obrade | Pravna osnova | Objašnjenje |
|--------------|---------------|-------------|
| Pružanje usluge matchinga nekretnina | Izvršenje ugovora (čl. 6(1)(b)) | Obrada je neophodna kako bismo Vam pružili uslugu za koju ste se registrirali |
| Slanje push obavijesti o novim oglasima | Izvršenje ugovora (čl. 6(1)(b)) | Obavijesti su ključni dio usluge; možete ih isključiti u postavkama aplikacije |
| Upravljanje pretplatom i naplatom | Izvršenje ugovora (čl. 6(1)(b)) | Neophodna za obradu plaćanja i aktivaciju Premium/Pro tiera |
| Poboljšanje AI algoritma | Legitimni interes (čl. 6(1)(f)) | Koristimo anonimiziranu analitiku korištenja kako bismo poboljšali točnost matchinga; možete prigovoriti ovoj obradi |
| Dijagnostika grešaka (Sentry) | Legitimni interes (čl. 6(1)(f)) | Neophodna za osiguranje stabilnosti aplikacije; Sentry podaci su pseudonimni |
| Komunikacija s korisničkom podrškom | Legitimni interes (čl. 6(1)(f)) | Rješavanje Vaših upita i tehničkih problema |
| Zakonske obveze (porezna dokumentacija) | Zakonska obveza (čl. 6(1)(c)) | Čuvanje podataka o transakcijama sukladno Zakonu o računovodstvu RH |

---

## 4. Kako koristimo Vaše podatke

### 4.1 AI matching

Vaše preferencije pretrage (lokacija, cijena, kvadratura, broj soba itd.) koristimo za generiranje personaliziranih preporuka nekretnina. Vaši filteri šalju se kao upit xAI Grok API-ju koji ih uspoređuje s dostupnim oglasima. Grok prima isključivo Vaše preferencije — ne prima Vaše ime, e-mail niti bilo koji drugi identifikacijski podatak.

### 4.2 Push obavijesti

Kada se pojavi novi oglas koji odgovara Vašim filterima, Expo push notification sustav šalje Vam obavijest. Možete isključiti push obavijesti u postavkama uređaja ili u aplikaciji.

### 4.3 Oglasi nekretnina

Oglasi koje vidite u aplikaciji dohvaćaju se s javno dostupnih platformi (Njuškalo, Crozilla i sl.) putem Apify web scraping servisa. Mi ne obrađujemo osobne podatke vlasnika nekretnina — prikupljamo isključivo javno objavljene podatke o oglasima (cijena, kvadratura, lokacija, fotografije).

### 4.4 Poboljšanje usluge

Anonimiziranu statistiku korištenja (npr. koji filteri su najpopularniji, prosječan broj pregleda po sesiji) koristimo za poboljšanje algoritma i korisničkog iskustva. Ova analitika ne sadrži podatke koji bi Vas osobno identificirali.

---

## 5. Dijeljenje podataka s trećim stranama

Ne prodajemo Vaše osobne podatke. Surađujemo s pažljivo odabranim pružateljima usluga (izvršiteljima obrade) koji obrađuju podatke isključivo prema našim uputama:

| Pružatelj usluge | Uloga | Koji podaci | Lokacija | Pravna osnova za prijenos |
|------------------|-------|-------------|----------|---------------------------|
| **Clerk** (clerk.com) | Autentifikacija i upravljanje računom | Ime, e-mail, hash lozinke | SAD (SCCs + Clerk DPA) | Standardne ugovorne klauzule |
| **Neon** (neon.tech) | Pohrana baze podataka (PostgreSQL) | Svi podaci pohranjenio na računu | EU (Frankfurt, AWS eu-central-1) | Unutar EU — nije prijenos u treću zemlju |
| **Railway** (railway.app) | Hosting backend servera i Redis cache | Podaci u obradi (cache) | SAD (SCCs + Railway DPA) | Standardne ugovorne klauzule |
| **xAI Grok** (x.ai) | AI matching nekretnina | Preferencije pretrage (bez osobnih identifikatora) | SAD (SCCs) | Standardne ugovorne klauzule |
| **Apify** (apify.com) | Dohvaćanje javnih oglasa nekretnina | Nema osobnih podataka korisnika | EU (Praha) | Unutar EU |
| **RevenueCat** (revenuecat.com) | Upravljanje pretplatama | Clerk User ID, tier pretplate | SAD (SCCs + RevenueCat DPA) | Standardne ugovorne klauzule |
| **Expo** (expo.dev) | Slanje push obavijesti | Push notification token | SAD (SCCs) | Standardne ugovorne klauzule |
| **Sentry** (sentry.io) | Praćenje grešaka i performansi | Pseudonimizirani tehnički podaci | SAD (SCCs + Sentry DPA) | Standardne ugovorne klauzule |

### 5.1 Prijenosi podataka izvan EU/EEA

Neke od navedenih trećih strana nalaze se u Sjedinjenim Američkim Državama. Prijenosi podataka u SAD vrše se uz odgovarajuće zaštitne mjere, konkretno putem Standardnih ugovornih klauzula (SCC) koje je odobrila Europska komisija, sukladno čl. 46(2)(c) GDPR-a.

### 5.2 Zakonski zahtjevi

Vaše podatke možemo otkriti ako smo na to zakonski obvezani (npr. sudski nalog, zahtjev policije ili AZOP-a), a uvijek ćemo Vas o tome obavijestiti u mjeri u kojoj nam to zakon dopušta.

---

## 6. Kolačići i tehnologije praćenja

AI StanFinder je mobilna aplikacija i **ne koristi kolačiće** u tradicionalnom smislu (kolačići su tehnologija web preglednika).

U aplikaciji koristimo sljedeće analogije kolačićima:

| Tehnologija | Svrha | Kako kontrolirati |
|-------------|-------|-------------------|
| Lokalna pohrana uređaja (AsyncStorage) | Pamćenje Vaših filtera i postavki između sesija | Brisanjem podataka aplikacije u postavkama uređaja |
| Expo push token | Identifikacija uređaja za slanje push obavijesti | Isključivanjem push obavijesti u postavkama uređaja ili aplikacije |
| Sentry SDK | Automatsko slanje izvještaja o greškama | Kontaktirajte nas na privacy@aistanfinder.hr |

Ako u budućnosti razvijemo web verziju, dodat ćemo Politiku kolačića kao zasebni dokument.

---

## 7. Vaša prava prema GDPR-u

Kao ispitanik prema GDPR-u, imate sljedeća prava:

### 7.1 Pravo pristupa (čl. 15 GDPR)
Možete zatražiti kopiju svih osobnih podataka koje obrađujemo o Vama, uključujući svrhu obrade, kategorije podataka i primatelje.

### 7.2 Pravo na ispravak (čl. 16 GDPR)
Možete zatražiti ispravak netočnih ili nepotpunih podataka. Naziv i e-mail možete sami izmijeniti u postavkama aplikacije.

### 7.3 Pravo na brisanje ("pravo na zaborav") (čl. 17 GDPR)
Možete zatražiti brisanje Vaših podataka. Vaš zahtjev ćemo izvršiti unutar 30 dana, osim ako postoji zakonska obveza čuvanja podataka (npr. podaci o transakcijama čuvaju se 11 godina sukladno Zakonu o računovodstvu RH).

### 7.4 Pravo na ograničenje obrade (čl. 18 GDPR)
U određenim okolnostima možete zatražiti da privremeno prestanemo obrađivati Vaše podatke.

### 7.5 Pravo na prenosivost podataka (čl. 20 GDPR)
Možete zatražiti izvoz Vaših podataka u strojno čitljivom formatu (JSON), uključujući preferencije filtera, listu favorita i povijest pretrage.

### 7.6 Pravo na prigovor (čl. 21 GDPR)
Možete prigovoriti obradi koja se temelji na legitimnom interesu (npr. analitika korištenja). U tom slučaju prestat ćemo s takvom obradom, osim ako imamo neophodne legitimne razloge koji nadilaze Vaše interese.

### 7.7 Kako ostvariti svoja prava
Zahtjev pošaljite na: **privacy@aistanfinder.hr**
Rok odgovora: **30 dana** (uz mogućnost produljenja za 2 × 30 dana kod složenih zahtjeva, uz obavijest)
Odgovor je besplatan, osim za očigledno neutemeljene ili pretjerane zahtjeve.

### 7.8 Pravo na pritužbu nadzornom tijelu
Ako smatrate da obrađujemo Vaše podatke nezakonito, imate pravo podnijeti pritužbu Agenciji za zaštitu osobnih podataka (AZOP):
**Web**: www.azop.hr
**E-mail**: azop@azop.hr
**Adresa**: Selska cesta 136, 10 000 Zagreb

---

## 8. Pohrana i sigurnost podataka

### 8.1 Gdje se podaci pohranjuju

Vaši podaci primarno se pohranjuju u PostgreSQL bazi podataka na Neon platformi, smještenoj u AWS podatkovnom centru u **Frankfurtu, Njemačka (eu-central-1)** — unutar EU/EEA.

Redis cache (Railway) privremeno pohranjuje sesijske podatke i rezultate matchinga. Podaci u cacheu automatski se brišu nakon isteka TTL-a (tipično 15 minuta do 24 sata).

### 8.2 Sigurnosne mjere

- Svi podaci u prijenosu zaštićeni su TLS 1.2+ enkripcijom
- Lozinke se nikada ne pohranjuju u čitljivom obliku — Clerk koristi industry-standard hashing
- Pristup produkcijskoj bazi podataka ograničen je isključivo na backend server putem whiteliste IP adresa
- JWT access tokeni imaju kratki vijek trajanja (15 minuta); refresh tokeni rotiraju se pri svakom korištenju
- Redovite sigurnosne kopije baze podataka (automatski, svaka 24 sata, čuvanje 7 dana)
- Sve API ključeve trećih strana čuvamo u sigurnim environment varijablama — nikada u izvornom kodu

### 8.3 Rokovi čuvanja podataka

| Kategorija podataka | Rok čuvanja | Razlog |
|---------------------|-------------|--------|
| Podaci o računu (aktivni korisnik) | Trajno dok je račun aktivan | Neophodna za pružanje usluge |
| Podaci o računu (izbrisani račun) | 30 dana od brisanja | Mogućnost vraćanja u slučaju pogreške |
| Preferencije i favoriti | Trajno dok je račun aktivan; brišu se s računom | Neophodna za uslugu |
| Podaci o transakcijama (pretplata) | 11 godina | Zakonska obveza (Zakon o računovodstvu RH) |
| Logovi grešaka (Sentry) | 90 dana | Dijagnostika i otklanjanje grešaka |
| Redis cache | 15 minuta – 24 sata (TTL) | Privremeni cache; automatsko brisanje |
| Push notification tokeni | Dok je račun aktivan ili dok se token ne obnovi | Neophodna za slanje obavijesti |

### 8.4 Sigurnosni incidenti

U slučaju povrede podataka koja predstavlja rizik za Vaša prava i slobode, obavijestit ćemo AZOP u roku od 72 sata od saznanja o povredi, a Vas — bez nepotrebnog odlaganja — ako povreda predstavlja visoki rizik.

---

## 9. Maloljetnici

Naša usluga namijenjena je osobama starijim od 16 godina. Svjesno ne prikupljamo podatke osoba mlađih od 16 godina. Ako saznamo da smo prikupili podatke maloljetnika, odmah ćemo ih izbrisati.

---

## 10. Izmjene politike privatnosti

Ovu politiku možemo povremeno ažurirati kako bismo odrazili promjene u usluzi ili zakonskim zahtjevima. Obavijestit ćemo Vas o značajnim izmjenama putem:
- Push obavijesti u aplikaciji
- E-mail obavijesti (za korisnike s Premium/Pro pretplatom)
- Prominentne obavijesti pri sljedećem pokretanju aplikacije

Datum "Zadnji pregled" na vrhu dokumenta uvijek odražava najnoviju verziju. Nastavljanjem korištenja aplikacije nakon obavijesti o izmjenama prihvaćate ažuriranu politiku.

---

## 11. Kontakt

Za sva pitanja, zahtjeve ili prigovore vezane uz obradu Vaših osobnih podataka:

**E-mail**: privacy@aistanfinder.hr
**Predmet poruke**: navedite "Zahtjev za zaštitu podataka — [Vaše ime]"

Cilj nam je odgovoriti na sve upite u roku od **5 radnih dana**.

---

*AI StanFinder — Pronađi stan koji ti odgovara.*
