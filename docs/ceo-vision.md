# CEO Vizija i Strateska odluka: AI StanFinder

**Datum**: 31.03.2026.
**Agent**: CEO
**Status**: Faza 1 -- Strateska analiza
**Napomena**: Outputi CFO i Market Research agenta nisu bili dostupni u trenutku izrade ovog dokumenta. GO/NO-GO odluka je preliminarna i podlozna reviziji nakon primitka financijske analize (ROI, unit economics) i trzisnog istrazivanja (TAM/SAM/SOM, konkurencija). Konacna odluka slijedi nakon sinteze svih inputa Faze 1.

---

## 1. Vizija proizvoda

AI StanFinder je inteligentni asistent za pronalazenje nekretnina koji eliminira desetke sati rucnog pretrazivanja oglasnika. Kombiniranjem automatskog prikupljanja podataka s Njuskalo.hr i semantickog razumijevanja korisnikovih potreba putem Grok AI-ja, aplikacija isporucuje personalizirane TOP 10 preporuke i real-time push notifikacije -- transformirajuci frustrirajuci proces trazenja stana u pasivno, automatizirano iskustvo. Cilj je postati default alat za svakog trazitelja nekretnine u Hrvatskoj unutar 18 mjeseci.

---

## 2. Strateski ciljevi (SMART format, horizont 12 mjeseci)

### Cilj 1: Korisnicka baza
- **Specific**: Doseci 15.000 registriranih korisnika na mobilnoj aplikaciji (iOS + Android)
- **Measurable**: Mjerenje putem analytics platforme (Firebase/Mixpanel)
- **Achievable**: Hrvatska ima ~40.000 aktivnih trazitelja nekretnina godisnje (procjena)
- **Relevant**: Kriticna masa za validaciju product-market fita i privlacenje agenata
- **Time-bound**: Do 31.03.2027.

### Cilj 2: Premium konverzija
- **Specific**: Postici 8% konverziju s besplatnog na Premium tier (4.99 EUR/mj)
- **Measurable**: 1.200 pretplatnika = ~6.000 EUR MRR
- **Achievable**: Industrija freemium aplikacija ima 2-10% konverziju; 8% realno uz kvalitetan AI matching
- **Relevant**: Glavni revenue stream za samoodrzivost
- **Time-bound**: Do kraja mjeseca 12 od launcha

### Cilj 3: Prihod od agenata (B2B)
- **Specific**: Onboardati 50 aktivnih nekretninski agenata/agencija na lead generation model
- **Measurable**: Minimalno 500 EUR MRR od B2B kanala (klikovi/leadovi)
- **Achievable**: Zagreb ima 200+ aktivnih agencija; 50 je 25% penetracija u glavnom gradu
- **Relevant**: Diversifikacija prihoda i stvaranje network efekta
- **Time-bound**: Do 31.03.2027.

### Cilj 4: Kvaliteta matchinga
- **Specific**: Postici prosjecnu ocjenu relevantnosti AI matcheva od 4.2/5.0 (korisnicka evaluacija)
- **Measurable**: In-app rating system za svaki prikazani match
- **Achievable**: Grok API sa semantickim razumijevanjem + iterativno ucenje iz feedbacka
- **Relevant**: Kvaliteta matchinga je core value proposition -- bez nje nema retencije
- **Time-bound**: Kontinuirano mjerenje, target dosegnut do mjeseca 6

### Cilj 5: Retencija
- **Specific**: Postici D30 retenciju od 35% i MAU/DAU ratio od 25%
- **Measurable**: Firebase Analytics / kohorte
- **Achievable**: Real estate apps imaju nize retencije zbog prirode use casea (ljudi nadju stan i prestanu koristiti); 35% je ambicozan ali ostvariv uz push notifikacije i AI savjete
- **Relevant**: Bez retencije nema konverzije u premium
- **Time-bound**: Target do mjeseca 9

---

## 3. GO/NO-GO odluka

### ODLUKA: UVJETNI GO (Conditional GO)

### Obrazlozenje

**Zasto GO:**

1. **Jasan pain point**: Pretrazivanje nekretnina na Njuskalo.hr je frustrirajuce iskustvo -- stotine oglasa, nema inteligentnog filtriranja, nema real-time notifikacija za nove oglase koji odgovaraju specificnim kriterijima. Problem je realan i univerzalan za sve trazitelje nekretnina u Hrvatskoj.

2. **Tehnicka izvedivost**: Svi kljucni tehnoloski blokovi postoje i dostupni su: Apify za web scraping, Grok API za semanticki matching, PostgreSQL za podatke, push notifikacije su standardna mobilna funkcionalnost. Ne gradimo nista od nule -- integriramo postojece servise u koherentan proizvod.

3. **Nizak pocetni trosk**: MVP se moze izgraditi s malim timom u 6-8 tjedana. Infrastrukturni troskovi su niski (Apify se placa po upotrebi, Grok API ima razumne cijene, PostgreSQL na Railway/Supabase je jeftin za pocetne volumene).

4. **Trojaki revenue model**: Freemium (B2C), Premium pretplata (B2C), i Lead generation za agente (B2B) daju tri neovisna izvora prihoda, sto smanjuje rizik ovisnosti o jednom kanalu.

5. **Timing**: Hrvatsko trziste nekretnina je aktivno, digitalna transformacija kasni za zapadnom Europom, i ne postoji dominantan AI-powered alat za trazenje nekretnina.

**Zasto UVJETNI (sto mora biti zadovoljeno):**

1. **Pravna analiza scrapinga**: Prije prvog eura investicije, potrebno je pravno misljenje o scrapingu Njuskalo.hr. Njuskalo moze imati ToS koji zabranjuje automatsko prikupljanje podataka. Ovo je **bloker** -- bez legalne jasnoce, ne krece razvoj.

2. **CFO validacija unit economics**: Troskovi Apify + Grok API po korisniku moraju biti ispod 0.50 EUR/mj da bi freemium model bio odrziv. Cekam CFO analizu.

3. **Trzisna validacija**: Prije full builda, potreban je landing page + waitlist za mjerenje interesa. Cilj: 500 signupova u 2 tjedna ili revizija pristupa.

---

## 4. SWOT analiza

| Kategorija | Stavke |
|---|---|
| **Snage (Strengths)** | Jasan i razumljiv value proposition; AI matching kao diferencijator; Nizak CAC putem viralnosti (preporuke); Tehnicka izvedivost s postojecim servisima; Trojaki revenue model |
| **Slabosti (Weaknesses)** | Ovisnost o jednom izvoru podataka (Njuskalo.hr); Ograniceno trziste (samo Hrvatska); Nema vlastitih podataka o nekretninama; Push notifikacije mogu postati spammy i smanjiti retenciju; Tim jos nije validiran za mobile development |
| **Prilike (Opportunities)** | Ekspanzija na druge oglasne platforme (Index Oglasi, Crozilla); Ekspanzija na regionalna trzista (Slovenija, Srbija); B2B model za agencije moze biti profitabilniji od B2C; Partnerstvo s bankama za mortgage kalkulator; Vertikalna ekspanzija (najam, poslovni prostori, zemljista) |
| **Prijetnje (Threats)** | Njuskalo razvija vlastiti AI alat; Pravni problemi oko scrapinga; Grok API promjena cijena ili uvjeta; Nizak LTV zbog prirode use casea (korisnik nadje stan i odlazi); Konkurencija od strane velikih igraca (Idealista, Immoscout) koji ulaze na hrvatsko trziste |

---

## 5. Top 3 strateska rizika i mitigation strategije

### Rizik 1: PRAVNI RIZIK SCRAPINGA (Vjerojatnost: VISOKA | Impact: KRITICAN)

**Opis**: Njuskalo.hr moze pravno zabraniti scraping svojih podataka putem ToS-a, DMCA zahtjeva, ili sudske tuzbe. EU Directive on Copyright i Database Directive stite baze podataka. Ako Njuskalo posalje cease & desist, cijeli proizvod gubi core data source.

**Mitigation strategija**:
- **Kratkorocno**: Angaizrati odvjetnika specijaliziranog za IT pravo za misljenje o legalnosti scrapinga javno dostupnih podataka u Hrvatskoj
- **Srednjorocno**: Istraziti mogucnost API partnerstva s Njuskalo.hr -- placeni pristup podacima je sigurniji od scrapinga
- **Dugorocno**: Izgraditi vlastitu bazu nekretnina putem direktnog inputa od agenata (B2B model gdje agenti sami unose oglase u zamjenu za pristup leadovima)
- **Contingency**: Pripremiti integraciju s minimalno 2 alternativna izvora podataka (Index Oglasi, Crozilla) tako da gubitak jednog izvora ne znaci smrt proizvoda

### Rizik 2: NIZAK LTV ZBOG PRIRODE USE CASEA (Vjerojatnost: VISOKA | Impact: VISOK)

**Opis**: Kupnja nekretnine je rijedak dogadaj (jednom u 5-10 godina). Korisnik koji nadje stan otkazuje pretplatu. Prosjecno trajanje pretrage stana je 3-6 mjeseci, sto znaci prosjecni LTV od 15-30 EUR po korisniku. To je nizak LTV za mobilnu aplikaciju.

**Mitigation strategija**:
- **Kratkorocno**: Fokusirati se na engagement features koji zadrzavaju korisnika i nakon sto nadje stan (trzisni insights, price tracking kvartova, "koliko vrijedi vas stan" alat)
- **Srednjorocno**: Dodati segment najma -- trazitelji najma su recurring korisnici jer se sele cesce (svake 1-2 godine)
- **Dugorocno**: Transformacija u "real estate companion" platformu (mortgage kalkulatori, pravni savjeti, usporedba agencija, home insurance) -- korisnik ostaje i nakon kupnje
- **Contingency**: Ako B2C LTV ostane nizak, pivotirati prema B2B modelu gdje agenti placaju za pristup kvalificiranim leadovima (visi LTV po klijentu)

### Rizik 3: OVISNOST O TRECIM SERVISIMA (Vjerojatnost: SREDNJA | Impact: VISOK)

**Opis**: Proizvod se oslanja na tri kljucna vanjska servisa: Apify (scraping), Grok API (matching), Njuskalo.hr (izvor podataka). Promjena cijena, ukidanje servisa, ili promjena API uvjeta bilo kojeg od ovih moze destabilizirati proizvod.

**Mitigation strategija**:
- **Kratkorocno**: Dokumentirati sve ovisnosti, pratiti API changelogs, postaviti alerting za promjene u pricing modelima
- **Srednjorocno**: Izgraditi vlastiti scraping engine kao backup za Apify (Puppeteer/Playwright na vlastitoj infrastrukturi); Istraziti alternativne LLM provajdere za matching (OpenAI, Anthropic, Mistral) za brzi switch
- **Dugorocno**: Sto vise logike internalizirati -- vlastiti ranking algoritam treniran na korisnickom feedbacku umjesto potpunog oslanjanja na genericki LLM
- **Contingency**: Uvijek imati plan B za svaki servis; maksimalno 30 dana potrebno za zamjenu bilo koje komponente

---

## 6. Risk matrica (Vjerojatnost x Impact)

```
              |  Nizak Impact  |  Srednji Impact  |  Visok Impact    |  Kritican Impact
--------------+----------------+------------------+------------------+-------------------
Visoka        |                |                  | Nizak LTV (R2)   | Pravni rizik
Vjerojatnost  |                |                  |                  | scrapinga (R1)
--------------+----------------+------------------+------------------+-------------------
Srednja       |                | Konkurencija     | Ovisnost o       |
Vjerojatnost  |                | velikih igraca   | servisima (R3)   |
--------------+----------------+------------------+------------------+-------------------
Niska         | Push spam      | Tim skill gap    | Njuskalo AI      |
Vjerojatnost  | zamor          | (mobile)         | konkurent        |
--------------+----------------+------------------+------------------+-------------------
```

---

## 7. CEO preporuke: Poslovni model, revenue, skaliranje

### 7.1 Procjena poslovnog modela

Trenutni trojaki model (Free / Premium / Agenti) je solidan pocetni okvir, ali imam nekoliko kljucnih primjedbi:

**Premium cijena od 4.99 EUR/mj je PRENISKA.** Korisnik koji trazi stan za 200.000 EUR nece se dvoumiti oko 9.99 EUR ili cak 14.99 EUR mjesecno ako mu alat zaista stedi 10+ sati tjedno i pomaze pronaci bolji deal. Preporucujem A/B testiranje vise price pointova od prvog dana. Psihologija kupca nekretnine je drukcija od prosjecnog app korisnika -- radi se o najvecoj kupovini u zivotu, i svaki alat koji pomaze percipira se kao investicija, ne trosak.

**B2B lead generation je NAJJACI revenue stream.** Dugrocno, B2B ce generirati 70%+ prihoda. Nekretninski agenti placaju 50-200 EUR po kvalificiranom leadu. Nas model od 1 EUR po kliku je agresivno podcijenjen. Preporucujem pricing model baziran na kvaliteti leada:
- Obicni klik na oglas: 2-3 EUR
- Kvalificirani lead (korisnik trazi kontakt agenta): 10-20 EUR
- Premium placement u TOP 10 rezultatima: Mjesecna pretplata za agente (49-149 EUR/mj)

**Nedostaje podatkovni monetizacijski sloj.** Uskoro cemo imati najkvalitetnije podatke o potraznji nekretnina u Hrvatskoj u realnom vremenu. Ovi podaci imaju ogromnu vrijednost za:
- Agencije za nekretnine (sto ljudi traze, po kojim cijenama, u kojim kvartovima)
- Developere/investitore (gdje graditi, sto je trazenija lokacija)
- Banke (prediktivni modeli za mortgage)
- Drzavne institucije (trzisni trendovi)

### 7.2 Skaliranje izvan Hrvatske

Hrvatska je odlicno trziste za validaciju jer je dovoljno malo da se moze dominirati brzo, ali plan skaliranja mora biti definiran od dana 1:

**Faza A (mjesec 1-12): Hrvatska**
- Njuskalo.hr kao primarni izvor
- Dodati Index Oglasi i Crozilla
- Fokus na Zagreb, Split, Rijeka, Osijek

**Faza B (mjesec 12-18): Regionalna ekspanzija**
- **Slovenija**: Nepremicnine.net -- slicna trzisna dinamika, lako prilagodljiv proizvod
- **Srbija**: Halooglasi.com, 4zida.rs -- veliko trziste, brzo rastuce
- **Isto rjesenje, drugi scraping source i jezik** -- arhitektura mora biti multi-tenant od pocetka

**Faza C (mjesec 18-36): EU ekspanzija ili specijalizacija**
- Opcija 1: Ekspanzija u Austriju, Njemacku (Immoscout, WillHaben) -- veci trzisni potencijal, ali jaca konkurencija
- Opcija 2: Vertikalna specijalizacija -- postati "AI real estate intelligence platforma" s fokusom na jugoistocnu Europu

**Kljucna arhitekturna preporuka za CTO**: Sustav mora biti dizajniran s multi-source i multi-language podrskom od samog pocetka. Svaki novi izvor podataka treba biti plug-and-play (adapter pattern). Ovo NE smije biti refactoring poslije -- mora biti u originalnoj arhitekturi.

### 7.3 Partnerstva koja treba istraziti

1. **Njuskalo.hr / Styria Media Group**: Umjesto adversarial scrapinga, ponuditi partnerstvo -- mi im donosimo engaged korisnike, oni nam daju API pristup. Win-win.
2. **Hrvatske banke (PBZ, Erste, Zaba)**: Integracija mortgage kalkulatora -- banka dobiva kvalificirane mortgage leadove, mi dobivamo credibilitet i co-marketing budget.
3. **Nekretninske agencije (Opereta, Dogma, RE/MAX Croatia)**: Early adopter program za B2B lead generation -- besplatno prvih 3 mjeseca u zamjenu za feedback i testimoniale.

---

## 8. Preporuke za sljedecu fazu

1. **HITNO**: Angaizrati odvjetnika za pravno misljenje o legalnosti web scrapinga u Hrvatskoj -- ovo je bloker za sve ostalo
2. **HITNO**: Lansirati landing page + waitlist za validaciju potraznje (cilj: 500 signupova u 14 dana)
3. **CFO Agent**: Potrebna detaljna analiza unit economics -- posebno trosak Apify + Grok API po korisniku na raznim skalama (100, 1.000, 10.000 korisnika)
4. **Market Research Agent**: Potrebna analiza postojecih rjesenja na hrvatskom trzistu i konkurentska matrica
5. **CPO Agent (Faza 2)**: Definirati MVP scope sa strogim fokusom na core loop (filter -> matching -> notifikacija), bez feature creep-a
6. **CTO Agent (Faza 3)**: Multi-source adapter arhitektura je MUST od pocetka; jednako tako multi-language support za regionalnu ekspanziju

---

## Zakljucak

AI StanFinder rjesava realan problem na trzistu koje jos nema dominantnog digitalnog igraca u AI segmentu. Tehnicka izvedivost je potvrdena, pocetni troskovi su niski, a trostruki revenue model pruza fleksibilnost. Glavni rizik je pravni aspekt scrapinga koji MORA biti rijesena prije pocetka razvoja. Uz pravnu jasnocu i validaciju potraznje putem waitliste, ovaj projekt ima potencijal postati regionalni lider u AI-powered real estate searchu.

**Preliminarna odluka: UVJETNI GO -- ceka se pravno misljenje i CFO/Market Research inputi.**

---

*Dokument pripremio: CEO Agent*
*Datum: 31.03.2026.*
*Verzija: 1.0*
*Sljedeca revizija: Nakon primitka CFO i Market Research outputa*
