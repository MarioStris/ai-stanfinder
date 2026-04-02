# UX Research — AI StanFinder
**Datum**: 01.04.2026
**Agent**: UX Researcher
**Status**: Faza 2 — UX analiza
**Dependency**: Faza 1 outputi + CPO product definicija

---

## 1. User Journey Map — Primarna persona (Ana Kovacic, 31, Zagreb)

### Faza 1: Awareness (Saznavanje)
| Aspekt | Detalj |
|--------|--------|
| **Touchpoints** | Instagram ad, TikTok video, preporuka prijatelja, Google search "AI trazenje stana" |
| **Akcije** | Vidi oglas/post → klikne → dolazi na App Store listing ili landing page |
| **Misli/Osjecaji** | "Hm, zanimljivo — AI trazi stanove umjesto mene?" Skepticna ali znatizelja |
| **Pain points** | Ne zna je li legit app ili spam; nema recenzija (novi proizvod) |
| **Prilike** | Demo video u App Store listingu; "Pogledaj sto AI pronalazi za €200k u Zagrebu" hook |

### Faza 2: Download & Registracija
| Aspekt | Detalj |
|--------|--------|
| **Touchpoints** | App Store / Play Store → instalacija → welcome screen |
| **Akcije** | Download → otvori app → vidi 6 "best of" demo nekretnina → registracija email |
| **Misli/Osjecaji** | "Zelim vidjeti radi li ovo zaista" — nestrpljiva da vidi rezultate |
| **Pain points** | Ako registracija trazi previse podataka, odustaje; ako ne vidi vrijednost odmah, brise app |
| **Prilike** | Pokazati AI matcheve PRIJE registracije (demo); registracija = samo email + lozinka |

### Faza 3: Filter Setup (Onboarding)
| Aspekt | Detalj |
|--------|--------|
| **Touchpoints** | Filter ekran — grad, cijena, m², tip, slobodni tekst |
| **Akcije** | Odabere Zagreb → pomakne slider €150k-€250k → 55-75m² → Stan → upise "blizu tramvaja, balkon" |
| **Misli/Osjecaji** | "Ovo je brzo i jednostavno!" ili "Previse opcija, ne znam sto da stavim" |
| **Pain points** | Prevelik broj opcija moze paralizirati; ne zna je li bolje siri ili uzi filter |
| **Prilike** | Progressive disclosure — pocni samo s gradom i cjenom (2 koraka), ostalo opciono; AI sugestija: "Vecina korisnika u Zagrebu trazi 60-80m² za €180k-€250k" |

### Faza 4: First Match (Aha Moment)
| Aspekt | Detalj |
|--------|--------|
| **Touchpoints** | TOP 10 match lista — prvi put |
| **Akcije** | Vidi listu → scrollira → klikne na #1 match → cita AI komentar → gleda slike |
| **Misli/Osjecaji** | "Wow, ovo je zapravo relevantno!" (uspjeh) ILI "Ovo nije sto trazim" (neuspjeh) |
| **Pain points** | Ako prvi matchevi nisu relevantni, gubi povjerenje u AI; ako nema slika, tesko procjenjuje |
| **Prilike** | **Ovo je KLJUCNI moment** — kvaliteta prvih 3 matcheva odreduje hoce li ostati. AI komentar ("Odlicna cijena za Tresnjevku — 15% ispod prosjeka") gradi povjerenje |

### Faza 5: Daily Use (Navika)
| Aspekt | Detalj |
|--------|--------|
| **Touchpoints** | Push notifikacija → app → match lista → detalji |
| **Akcije** | Prima push "Novi TOP match: 72m² Tresnjevka €198k ⭐⭐⭐⭐⭐" → otvara app → pregledava |
| **Misli/Osjecaji** | "Super, ne moram sam traziti!" — osjecaj kontrole i ustedjenog vremena |
| **Pain points** | Previse notifikacija = spam osjecaj → mute → churn; premalo = zaboravi na app |
| **Prilike** | Smart notifikacije: samo za matcheve > 85% relevantnosti; dnevni sazetak opcija |

### Faza 6: Conversion (FREE → PREMIUM)
| Aspekt | Detalj |
|--------|--------|
| **Touchpoints** | Paywall — kad pokusa kreirati 2. filter ili vidjeti TOP 10 (umjesto TOP 5) |
| **Akcije** | Vidi paywall → cita sto dobiva → odlucuje: platiti ili ostati na FREE |
| **Misli/Osjecaji** | "Isplati li se €7.99/mj?" → racuna u glavi: "Usteda 10h mjesecno, cijena kave" |
| **Pain points** | Paywall ne smije doci prerano (prije nego vidi vrijednost) ni prekasno (vec zadovoljen FREE-om) |
| **Prilike** | Idealan timing: nakon 3-5 dana koristenja, kad je vec vidjela 2-3 dobra matcha; prikazati konkretnu ustedu ("Nasla si 3 matcha — PREMIUM ti daje 2x vise, svakih 15 min") |

### Faza 7: Retention ili Churn
| Aspekt | Detalj |
|--------|--------|
| **Touchpoints** | App, email, push notifikacije |
| **Retention signali** | Otvara app 3x tjedno; pregledava matcheve; sprema favorite; daje feedback na matcheve |
| **Churn signali** | Ne otvara app 7+ dana; mute-a notifikacije; matchevi nisu relevantni |
| **Prilike** | Re-engagement: "3 nova matcha od zadnjeg posjeta!"; AI savjet: "Prosirila filter na Peščenicu za +23% bolji izbor?"; Win-back email nakon 14 dana neaktivnosti |

---

## 2. Pain Points analiza — Trenutno stanje (Njuskalo.hr)

| # | Pain Point | Severity (1-5) | Frequency (1-5) | Opis |
|---|-----------|:---:|:---:|-----|
| P1 | Neinteligentni filteri | 5 | 5 | Njuskalo ima samo basic filtere (cijena, m², sobe). Ne razumije "blizu skole" ili "miran kvart". Korisnik mora sam procjenjivati svaki oglas. |
| P2 | Informacijska preopterecenest | 5 | 5 | Stotine rezultata — korisnik ne zna koji su zaista relevantni. Nema rankinga po kvaliteti, samo sort po cijeni/datumu. |
| P3 | Propustene prilike | 5 | 4 | Dobri stanovi u Zagrebu se prodaju u danima. Ako korisnik ne provjeri Njuskalo svaki dan vise puta, propusta priliku. Nema proaktivnih obavijesti. |
| P4 | Nema procjene vrijednosti | 4 | 5 | Korisnik ne zna je li cijena fer za lokaciju i stanje. Nema usporedbe cijena/m² po kvartu, nema AI procjene. |
| P5 | Rucni i repetitivni proces | 4 | 5 | Svaki dan ista pretraga: otvori Njuskalo → postavi iste filtere → scrollaj → usporedi → ponovi. 1-2h dnevno. |
| P6 | Lose slike i opisi | 3 | 4 | Mnogi oglasi imaju 2-3 lose fotografije i minimalan opis. Korisnik mora kontaktirati agenta samo da sazna osnovne informacije. |
| P7 | Duplicirani oglasi | 3 | 3 | Isti stan se pojavljuje vise puta (razliciti agenti, razlicite cijene). Zbunjuje i trosi vrijeme. |
| P8 | Mobilno iskustvo | 3 | 4 | Njuskalo mobilna app postoji ali je spora i nije optimizirana za pretragu nekretnina specificno. |

### Prioritetni pain points za AI StanFinder (Severity × Frequency):
1. **P1** (25) + **P2** (25) → Rijesava AI matching + TOP 10
2. **P3** (20) → Rijesavaju push notifikacije
3. **P5** (20) → Rijesava automatizacija
4. **P4** (20) → Rijesava AI komentar + cijena/m² analiza

---

## 3. Information Architecture

```
AI StanFinder
│
├── 🏠 Home (Match Lista)              ← Glavni ekran, default tab
│   ├── Filter selector (dropdown — odabir aktivnog filtera)
│   ├── TOP 10 match kartica lista
│   │   ├── Match kartica (%, cijena, lokacija, m², slika, AI komentar)
│   │   └── → Tap → Match Detail ekran
│   ├── AI sugestija banner (dno liste)
│   └── Pull-to-refresh (rucno azuriranje)
│
├── 🔍 Filter Setup                    ← Drugi tab ili modal
│   ├── Grad (dropdown / search)
│   ├── Tip nekretnine (stan / kuca / zemljiste)
│   ├── Cijena range (dual slider)
│   ├── Kvadratura range (dual slider)
│   ├── Dodatne opcije (novogradnja, stanje — collapsible)
│   ├── Slobodni tekst ("Opisi sto trazis...")
│   └── [GENERIRAJ MATCHEVE] CTA button
│
├── ❤️ Favoriti                        ← Treci tab
│   ├── Lista spremljenih nekretnina
│   ├── Status oznake (Novi / Kontaktiran / Odbijen)
│   └── Usporedba (odaberi 2-3 → side-by-side)
│
├── 🔔 Notifikacije                    ← Cetvrti tab / bell ikona
│   ├── Lista notifikacija (novi matchevi, AI savjeti)
│   └── → Tap → Match Detail
│
├── 👤 Profil                           ← Peti tab / hamburger
│   ├── Moji podaci (email)
│   ├── Pretplata (FREE/PREMIUM — upgrade CTA)
│   ├── Postavke notifikacija
│   │   ├── Push: On/Off
│   │   ├── Frekvencija: Instant / Dnevni sazetak / Iskljuceno
│   │   └── Email sazetak: On/Off
│   ├── Pravne informacije (Privacy, ToS)
│   └── Obrisi racun (GDPR)
│
└── Match Detail (ekran, ne tab)
    ├── Galerija slika (swipe)
    ├── Cijena + cijena/m²
    ├── AI komentar (zasto je ovo dobar match)
    ├── Osnovni podaci (m², sobe, kat, godina, stanje)
    ├── Lokacija (adresa + link na Google Maps)
    ├── Puni opis oglasa
    ├── Kontakt agenta (telefon CTA + email)
    ├── [Spremi u favorite] button
    └── [Podijeli] button
```

### Navigacijski model:
- **Bottom tab bar** s 4-5 tabova (Home, Filter, Favoriti, Notifikacije, Profil)
- **Home je default** — korisnik odmah vidi matcheve
- **Match Detail** je push screen (back button za povratak)
- **Filter Setup** moze biti tab ili floating button na Home screenu

---

## 4. Wireframes opisi — Kljucni ekrani

### Ekran 1: Welcome / Onboarding (prvi pokretanje)

**Layout:**
- **Gornji dio (60%)**: Hero ilustracija — smartphone s prikazom match liste
- **Sredina**: Naslov "Pronadi savrseni stan s AI-em" + podnaslov "Umjesto 2h scrollanja — 5 min setup, automatski matchevi"
- **3 benefit ikone** (horizontalno): ⏱️ "Ustedi 15h/mj" | 🎯 "AI matchevi" | 🔔 "Real-time obavijesti"
- **Donji dio**: 6 demo nekretnina u horizontalnom scrollu (best of HR) — korisnik moze tapnuti za preview
- **CTA button** (puni sirina, sticky bottom): "Kreiraj svoj filter →"
- **Ispod CTA**: "Vec imas racun? Prijavi se" link

**Zasto ovaj layout**: Korisnik vidi vrijednost PRIJE registracije (demo nekretnine). CTA vodi na filter setup, ne na registraciju — registracija dolazi kad zeli spremiti rezultate. Smanjuje friction.

### Ekran 2: Filter Setup

**Layout:**
- **Header**: "Sto trazite?" + progress indikator (korak 1/3)
- **Korak 1**: Grad (search dropdown s top 5 gradova kao chipovi: Zagreb, Split, Rijeka, Osijek, Zadar)
- **Korak 2**: Tip (3 velike kartice s ikonom: 🏢 Stan | 🏠 Kuca | 🏗️ Zemljiste — mogucnost odabira vise)
- **Korak 3**: Cijena (dual range slider s min/max u EUR, labels na krajevima) + Kvadratura (dual range slider)
- **Opciono (collapsible)**: Novogradnja toggle, Stanje dropdown, Broj soba
- **Text input**: "Opisi sto trazis svojim rijecima..." placeholder: "npr. blizu tramvaja, balkon, mirna ulica"
- **CTA button** (sticky bottom): "🔍 Generiraj matcheve" (pulsira)
- **Ispod CTA**: "AI ce analizirati 500+ oglasa za vas"

**Zasto ovaj layout**: Progressive disclosure — 3 koraka minimiziraju cognitive load. Slobodni tekst na kraju je opcionalan ali vidljiv. Chipovi za gradove ubrzavaju odabir.

### Ekran 3: Match Lista (Glavni ekran)

**Layout:**
- **Header**: "Vasi matchevi" + filter naziv (npr. "Zagreb centar") dropdown za switch
- **Subheader**: "Zadnje azuriranje: 14:32 | Sljedece: 14:47" (za PREMIUM) ili "Sljedece azuriranje: 20:00" (FREE)
- **Lista kartica** (vertikalni scroll):
  - Svaka kartica: slika (lijevo, 100x100), desno: **94% ⭐⭐⭐⭐⭐** | **€198.000** | "Zagreb, Tresnjevka" | "78m² · 3 sobe · 2. kat" | AI komentar: *"15% ispod prosjeka za kvart — odlicna prilika"*
  - Srce ikona (gornji desni kut kartice) za favorit
  - Tap na karticu → Match Detail
- **AI sugestija banner** (nakon 10. kartice): "💡 Probajte prosiriti na Peščenicu — +23% bolji value" [Primijeni]
- **Bottom tab bar**: Home (active) | Filter | ❤️ | 🔔 | 👤
- **FREE korisnici**: nakon 5. kartice, paywall overlay: "Otključaj jos 5 matcheva — PREMIUM €7.99/mj" [Nadogradi]

**Zasto ovaj layout**: Kartica format je skenabilan — korisnik brzo procjenjuje. % match i zvjezdice odmah govore kvalitetu. AI komentar gradi povjerenje. Paywall na 5. kartici je dobar balance — korisnik je vec vidio vrijednost.

### Ekran 4: Match Detail

**Layout:**
- **Header**: Back arrow + "94% match" badge + Share ikona
- **Galerija slika**: Full-width carousel s dots indikatorom (swipe lijevo/desno)
- **Cijena sekcija**: "€198.000" (veliki font) + "€2.538/m²" (manji, sivi) + badge "15% ispod prosjeka"
- **AI sekcija** (highlight box, plava pozadina): "🤖 AI kaze: Ovo je jedan od najboljih dealova na Tresnjevki ovaj mjesec. Cijena po m² je 15% niza od prosjeka kvarta (€2.985/m²). Stan ima parking — rijedak feature u ovom podrucju."
- **Osnovni podaci** (grid 2x3): m² | Sobe | Kat | Godina | Stanje | Parking
- **Lokacija**: Adresa + "📍 Otvori u Google Maps" link
- **Opis**: Puni tekst oglasa (expandable)
- **CTA sekcija** (sticky bottom, 2 buttona): "📞 Nazovi agenta" (primary) | "✉️ Posalji upit" (secondary)
- **Ispod CTA**: "❤️ Spremi u favorite"

**Zasto ovaj layout**: AI sekcija je vizualno istaknuta — ovo je diferencijator. Cijena/m² i usporedba s prosjekom odmah daju kontekst. Kontakt CTA je sticky jer je to zeljeni ishod.

### Ekran 5: Notifikacije / Postavke

**Layout:**
- **Header**: "Obavijesti"
- **Lista notifikacija** (kronoloski):
  - "🔥 Novi TOP match: 72m² Tresnjevka €198k (94%)" — tap → detail
  - "💡 AI savjet: Prosiri filter na Peščenicu za bolji izbor" — tap → filter
  - "📊 Tjedni pregled: 12 novih matcheva, 3 u TOP 5" — tap → lista
- **Svaka notifikacija**: timestamp, procitano/neprocitano indikator
- **Postavke** (gear ikona u headeru):
  - Push notifikacije: Toggle on/off
  - Frekvencija: Segmented control (Instant | Dnevni sazetak | Iskljuceno)
  - Minimum match % za notifikaciju: Slider (default 80%)
  - Email sazetak: Toggle on/off

**Zasto ovaj layout**: Notifikacije su kanalizirane i filtrirane — korisnik kontrolira sto prima. Minimum match % sprjecava spam od niskih matcheva.

### Ekran 6: Profil / Subscription

**Layout:**
- **Header**: User avatar (inicijali) + email
- **Pretplata sekcija**:
  - FREE korisnici: kartica "Trenutni plan: FREE" + feature usporedba tablica (FREE vs PREMIUM, checkmarks) + CTA "Nadogradi na PREMIUM — €7.99/mj"
  - PREMIUM korisnici: "PREMIUM ✓ Aktivan do 15.05.2026" + "Upravljaj pretplatom"
- **Pricing** (ako FREE):
  - Dva taba: "Mjesecno €7.99/mj" | "Godisnje €59.99/god (ustedite 37%)" ← istaknut
  - Feature lista s checkmarkovima
  - [Nadogradi] CTA
- **Moji filteri**: Lista s edit/delete opcijama
- **Podrska**: "Kontaktiraj nas" + FAQ link
- **Legal**: Privacy Policy | Uvjeti koristenja
- **Danger zone**: "Obrisi racun" (crveni tekst, confirmation dialog)

**Zasto ovaj layout**: Dual pricing prominentno prikazan s naglaskom na godisnji (ustedite 37%). Feature usporedba tablica je proven conversion pattern.

---

## 5. Usability heuristike — Nielsen's 10 primijenjene na AI StanFinder

### H1: Visibility of System Status
**Primjena**: Korisnik uvijek mora znati sto AI radi.
- Pokazati "AI analizira 500+ oglasa..." loading state s progress indikatorom
- Na match listi prikazati "Zadnje azuriranje: 14:32 | Sljedece: 14:47"
- Push notifikacija potvrda: "Notifikacije ukljucene za matcheve > 80%"
**Paziti na**: Ne skrivati AI procesiranje — transparentnost gradi povjerenje.

### H2: Match Between System and Real World
**Primjena**: Koristiti jezik korisnika, ne tehnicki zargon.
- "Matchevi" umjesto "AI rezultati rangirani po cosine similarity"
- "Cijena po m²" umjesto "normalizirana cijena"
- Imena kvartova, ne postanski brojevi
- EUR valuta, m² jedinice — standard za HR trziste
**Paziti na**: AI komentari moraju biti pisani kao da covjek govori, ne bot.

### H3: User Control and Freedom
**Primjena**: Korisnik uvijek moze promijeniti misljenje.
- "Undo" za brisanje favorita (toast s "Ponisti" opcijom, 5 sekundi)
- Filteri se mogu uvijek mijenjati — novi matchevi regeneriraju se odmah
- Korisnik moze preskociti onboarding i vidi demo matcheve
- Lako otkazivanje pretplate (ne skrivati u 5 koraka)
**Paziti na**: Brisanje racuna mora biti jednostavno (GDPR zahtjev).

### H4: Consistency and Standards
**Primjena**: Slijediti iOS/Android platformske konvencije.
- Bottom tab bar (standard za mobile apps)
- Swipe-to-delete na favoritima (iOS), long-press na Android
- Pull-to-refresh na match listi
- Standardni back/forward navigacijski patterny
**Paziti na**: Isti flow na iOS i Android — ne izmisljati custom navigaciju.

### H5: Error Prevention
**Primjena**: Sprijeciti greske prije nego se dogode.
- Filter slideri imaju razumne default-ove (€100k-€300k, 40-120m²)
- "Jeste li sigurni?" dialog samo za destruktivne akcije (brisanje racuna, ne za svaki tap)
- Validacija email formata u real-time (ne tek na submit)
- Dupli tap prevencija na "Nazovi agenta" buttonu
**Paziti na**: Ne pretjerati s confirmation dialogovima — korisnik mora osjecati flow.

### H6: Recognition Rather Than Recall
**Primjena**: Ne traziti od korisnika da pamti informacije.
- Aktivni filter prikazan u headeru match liste (ne skrivati)
- Prethodno pregledane nekretnine oznacene kao "Pregledano" (opacity/badge)
- Favoriti uvijek dostupni jednim tapom
- AI sugestije referiraju trenutne filtere ("Vaš budget je €200k — s €210k otvarate 15% vise opcija")
**Paziti na**: Korisnik ne smije morati zapamtiti sto je prethodno postavio.

### H7: Flexibility and Efficiency of Use
**Primjena**: Napredni korisnici moraju biti brzi, pocetnici vodeni.
- Quick filter chipovi na match listi ("Novogradnja", "S parkingom", "< €200k")
- Swipe na match kartici: lijevo = odbaci, desno = favorit (Tinder pattern — poznato)
- Long press na match karticu = quick actions (favorit, dijeli, kontaktiraj)
- Pocetnici: step-by-step filter wizard; napredni: direct edit mode
**Paziti na**: Shortcuts ne smiju zbuniti pocetnike — prikazati ih tek nakon 3. sesije.

### H8: Aesthetic and Minimalist Design
**Primjena**: Svaki element mora sluziti svrsi.
- Match kartica: samo kljucne info (%, cijena, lokacija, m², 1 slika, AI komentar) — ne 15 polja
- Filter setup: progressive disclosure — pocni s 3 polja, ostalo skriveno
- Bijela pozadina, plavi akcent (#2563EB), crni tekst — cist, profesionalan
- Nema bannera, popupova, ili modal-a osim paywall-a
**Paziti na**: AI komentar mora biti 1-2 recenice, ne esej. Matchevi > sadrzaj > dekoracija.

### H9: Help Users Recognize, Diagnose, and Recover from Errors
**Primjena**: Jasne poruke kad nesto ne radi.
- "Nema matcheva za vase filtere — pokusajte prosiriti cjenovni raspon" (ne "Error 404")
- "Nema internet veze — prikazujemo zadnje spremljene matcheve" (offline mode)
- "Grok API nedostupan — matchevi ce se azurirati uskoro" (graceful degradation)
- Ako scraping nije vratio podatke: "Njuskalo trenutno nedostupan — pokusavamo ponovo"
**Paziti na**: Nikad ne prikazivati tehnicke greske korisniku (HTTP kodovi, stack traces).

### H10: Help and Documentation
**Primjena**: Pomoc kad je potrebna, ali ne nametljiva.
- Onboarding tooltipovi (3 koraka) pri prvom pokretanju — preskocivi
- "?" ikona na filter setup ekranu: "Sto je semantic search? AI razumije opise poput 'blizu skole' i pronalazi odgovarajuce nekretnine"
- FAQ u profilu: "Kako radi AI matching?", "Zasto ne vidim sve oglase?", "Kako otkazati pretplatu?"
- In-app chat/email support link
**Paziti na**: Dokumentacija ne smije biti jedini nacin za koristen app — app mora biti intuitivan i bez nje.

---

## 6. Preporuke za dizajn

### Design System osnove (za Frontend Agenta)
- **Boje**: Primary #2563EB (plava — povjerenje), Secondary #10B981 (zelena — uspjeh/match), Accent #F59E0B (zuta — upozorenje/highlight), Error #EF4444
- **Tipografija**: Inter (body), Inter Bold (headings) — clean, moderan, odlicna citljivost na mobitelu
- **Spacing**: 8px grid sustav
- **Border radius**: 12px za kartice, 8px za buttone — moderan, prijateljski
- **Shadows**: Subtle (0 2px 8px rgba(0,0,0,0.08)) — ne preplasno, clean look
- **Ikone**: Lucide ili Heroicons — konzistentne, outlined stil

### Kljucne UX odluke
1. **Mobile-first, native-feel**: React Native s platformski specificnim komponentama
2. **Core loop mora raditi u 3 tapa**: Otvori app → vidi matcheve → tap na match → detalji
3. **AI transparentnost**: Uvijek objasniti ZASTO je nesto match (AI komentar)
4. **Notifikacije su opt-in s kontrolom**: Nikad spammy — korisnik bira frekvenciju i min %
5. **Paywall timing**: Dan 3-5, nakon sto je korisnik vidio vrijednost (ne na prvom pokretanju)

---

*UX Researcher Agent | AI StanFinder | Faza 2 — UX analiza*
*Dokument je input za: Frontend Agent (implementacija), CTO Agent (tech decisions), QA Agent (test plan)*
