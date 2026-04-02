# Pricing Model — AI StanFinder

**Autor**: CSO Agent
**Datum**: 01.04.2026.
**Verzija**: 1.0
**Input**: CFO analiza (pricing preporuka €7.99/mj, €59.99/god), CEO vizija (B2B najjaci stream)

---

## Obrazlozenje pricing strategije

CFO je jasno pokazao da €4.99/mj nije odrzivo (LTV:CAC = 0.55:1, negativan). Podizemo na €7.99/mj
sto je psihologijski razumna cijena za korisnika koji trazi stan vrijedan 150.000–400.000 EUR.
Godisnji plan je strateski prioritet jer smanjuje churn za 40–60% i poboljsava cash flow predvidivost.

B2B Agenti tier je financijski najvazniji — s 3% korisnika generira vise prihoda od 12% Premium korisnika.
Zato agresivno privlacimo agente vec od M7 (launch).

---

## Tier 1: FREE

**Cijena**: €0/mj

### Sto dobivas
- Registracija i kreiranje 1 aktivnog filtera
- TOP 5 AI matcheva dnevno (ne 10 kao Premium)
- Push notifikacije: maksimalno 2/dan
- AI matching osvjezavanje: 2× dnevno (08:00 i 18:00)
- Pregled oglasa (redirect na Njuskalo)
- Nema spremanja favorita

### Sto ne dobivas (intentional limits za konverziju)
- Nema svakih-15-min real-time scana
- Nema AI savjeta ("Povecaj budzet 10k → +40% bolji izbor")
- Nema analize cijene po m² po kvartu
- Nema vise od 1 filtera istovremeno
- Nema export/dijeljenja liste
- Nema priority notifikacija (kad se pojavi 5-zvjezdican match odmah)

### Strateski cilj FREE tiera
- Akvizicija korisnika (85% baze)
- Dokaz vrijednosti AI matchinga u prvih 7 dana
- Konverzija u Premium unutar 14 dana (ili korisnik odlazi)

---

## Tier 2: PREMIUM

**Cijena mjesecno**: €7.99/mj
**Cijena godisnje**: €59.99/god (€5.00/mj ekvivalent — ustedite 37%)

### Sto dobivas (sve iz FREE + dodaci)
- Neogranicen broj filtera (koristite za razlicite gradove, tipove nekretnina)
- TOP 10 AI matcheva po filteru, osvjezavano svakih 15 minuta
- Priority push notifikacije u trenutku pojave 4+ zvjezdica matcha
- AI savjeti: personalizirana preporuka za poboljsanje filtera
- Analiza cijene po m² po kvartu (usporedba "jesi li placao previse?")
- Spreemanje neogranicenog broja favorita
- Usporedba vise nekretnina side-by-side
- Export liste (PDF, email)
- Pristup povijesti oglasa (je li cijena pala od postavljanja?)
- E-mail digest (dnevni ili tjedni sazetak najboljeg matcha)

### Zasto €7.99/mj
- Korisnik trazi stan od 200.000 EUR — €7.99/mj je 0.004% vrijednosti kupovine
- Direktna usporedba: Netflix je €15.99/mj, Spotify €11.99/mj
- Konkurentska analiza pokazuje da nema ekvivalentnog alata — nismo usporedivi s Njuskalom, usporedivi smo s decision-support alatima
- CFO potvrda: €7.99/mj daje LTV = €46.02 (vs €28.74 pri €4.99/mj)

### Discount strategija

| Tip | Popust | Trajanje | Uvjet |
|-----|--------|----------|-------|
| Godisnja pretplata | 37% (€59.99 umjesto €95.88) | Trajno | Placanje unaprijed |
| Early Bird | Prvih 500 korisnika dobivaju prvi mj 50% off | M7–M8 | Promo kod EARLYBIRD |
| Referral | 1 mj besplatno za svakog referiranog korisnika | Trajno | Oboje moraju biti Premium |
| Studenti | 20% popust | Semestrar | Verificirana .edu adresa |

**Pravilo**: Nikad ne nuditi vise od jednog popusta istovremeno. Early Bird + godisnji NE ide zajedno.

---

## Tier 3: AGENTI (B2B)

**Model**: Pay-per-lead + opcija mjesecne pretplate

### Opcija A: Pay-per-lead (preporuceno za start)

| Dogadaj | Cijena |
|---------|--------|
| Klik korisnika na "Kontaktiraj agenta" | €2.00 |
| Korisnik popuni kontakt formu (kvalificirani lead) | €12.00 |
| Korisnik rezervira termin za pregled (top lead) | €25.00 |

### Opcija B: Premium placement (fiksni troskak/mj)

| Paket | Cijena/mj | Sto ukljucuje |
|-------|-----------|---------------|
| Starter | €49/mj | Oglas agenta u rezultatima za 1 grad |
| Pro | €99/mj | 3 grada + prioritetni prikaz u TOP 10 |
| Enterprise | €199/mj | Cijela Hrvatska + brand badge + analytics |

### Zasto ovaj model

CEO i CFO su potvrdili da je B2B tier financijski najvazniji (LTV:CAC = 4.32:1 za agente, vs 0.88:1 za Premium B2C). Agenti u HR placaju 50–200 EUR po kvalificiranom leadu kod tradicionalnih portala — nasa cijena od €12 za formu-lead je agresivno kompetitivna, ali svjesno podcijenjena za brzu akviziciju.

Nakon 6 mj tracije i 50 agenata, revidiramo cijene prema gore.

### Onboarding agenata (da ubrzamo akviziciju)
- Prvih 90 dana BESPLATNO (bez placanja za klikove, samo form-leadi)
- Postavljamo kontakt na 10 agencija (Opereta, Dogma, RE/MAX Croatia, Century 21, Kastel...) s CEO-ovom preporukom da im ponudimo early adopter program
- Trazimo testimonial i case study kao uvjet za besplatni period

---

## Feature matrica po tieru

| Feature | FREE | PREMIUM | AGENTI |
|---------|------|---------|--------|
| Kreiranje filtera | 1 | Neograniceno | — |
| AI matchevi/dan | 5 | Neograniceno | — |
| Osvjezavanje | 2×/dan | Svakih 15 min | — |
| Push notifikacije | 2/dan | Real-time priority | — |
| AI savjeti za filter | Ne | Da | — |
| Analiza cijene/m² | Ne | Da | — |
| Favoriti | Ne | Neograniceno | — |
| Usporedba nekretnina | Ne | Da | — |
| Export liste | Ne | Da | — |
| Povijest cijene oglasa | Ne | Da | — |
| Oglas agenta u rezultatima | Ne | Ne | Da |
| Analytics (koliko pogleda) | Ne | Ne | Da |
| Lead dashboard | Ne | Ne | Da |
| Priority placement | Ne | Ne | Pro/Enterprise |

---

## Usporedba s konkurencijom

| Portal | Cijene za korisnike | AI matching | Push notif. | Savjeti |
|--------|--------------------|-----------:|------------|--------|
| **AI StanFinder FREE** | €0 | Osnovni | Da (limit) | Ne |
| **AI StanFinder Premium** | €7.99/mj | Pun | Real-time | Da |
| Njuskalo.hr | €0 | Ne | Ne | Ne |
| Crozilla.com | €0 | Ne | Ne | Ne |
| Realitica.com | €0 | Osnovno filtriranje | Ne | Ne |
| Immoscout24 (AT/DE) | €9.99–€19.99/mj | Ograniceno | Da | Ne |

**Zakljucak**: AI StanFinder je jedini produkt u HR s pravim AI matchingom i real-time notifikacijama. Cijenimo se ispod europske konkurencije, ali iznad €0 jer nudimo stvarnu vrijednost.

---

## Implementacijski plan

**M7 (launch)**:
- FREE + PREMIUM (€7.99/mj i €59.99/god) aktivni
- Early Bird promo za prvih 500 korisnika

**M8**:
- Agenti tier — Opcija A (pay-per-lead) aktivna
- Onboarding prvih 10 agenata s besplatnim periodom

**M10**:
- Agenti Opcija B (Premium placement) aktivna
- Revizija cijene Premium ovisno o konverziji (ako je > 15%, mozemo ostati na €7.99; ako je < 8%, razmatramo snizenje na €6.99 ili poboljsanje free gating-a)

**M12**:
- Revizija Agenti cijena bazirana na podacima (target: povecanje form-lead cijene na €20)

---

*CSO Agent | AI StanFinder | Faza 7 — Sales strategija*
