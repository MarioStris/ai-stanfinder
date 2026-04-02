import type { Filter, Property } from '@prisma/client';

export interface ListingSummary {
  id: string;
  title: string;
  city: string;
  neighborhood: string | null;
  price: number;
  area: number;
  pricePerM2: number | null;
  rooms: number | null;
  propertyType: string;
  condition: string | null;
  isNewBuild: boolean;
  hasParking: boolean;
  hasBalcony: boolean;
  hasElevator: boolean;
  description: string | null;
}

export function toListingSummary(p: Property): ListingSummary {
  return {
    id: p.id,
    title: p.title,
    city: p.city,
    neighborhood: p.neighborhood,
    price: p.price,
    area: p.area,
    pricePerM2: p.pricePerM2,
    rooms: p.rooms,
    propertyType: p.propertyType,
    condition: p.condition,
    isNewBuild: p.isNewBuild,
    hasParking: p.hasParking,
    hasBalcony: p.hasBalcony,
    hasElevator: p.hasElevator,
    description: p.description,
  };
}

function buildFilterDescription(filter: Filter): string {
  const parts: string[] = [];

  if (filter.city) parts.push(`Grad: ${filter.city}`);
  if (filter.propertyType) parts.push(`Tip nekretnine: ${filter.propertyType}`);
  if (filter.priceMin || filter.priceMax) {
    const min = filter.priceMin ? `${filter.priceMin} EUR` : 'bez min';
    const max = filter.priceMax ? `${filter.priceMax} EUR` : 'bez max';
    parts.push(`Raspon cijene: ${min} — ${max}`);
  }
  if (filter.areaMin || filter.areaMax) {
    const min = filter.areaMin ? `${filter.areaMin} m²` : 'bez min';
    const max = filter.areaMax ? `${filter.areaMax} m²` : 'bez max';
    parts.push(`Površina: ${min} — ${max}`);
  }
  if (filter.rooms) parts.push(`Broj soba: ${filter.rooms}`);
  if (filter.isNewBuild !== null && filter.isNewBuild !== undefined) {
    parts.push(`Novogradnja: ${filter.isNewBuild ? 'da' : 'nije obavezno'}`);
  }
  if (filter.freeText) parts.push(`Slobodan opis zahtjeva: "${filter.freeText}"`);

  return parts.join('\n');
}

export function buildMatchingPrompt(filter: Filter, listings: ListingSummary[]): string {
  const filterDesc = buildFilterDescription(filter);
  const listingsJson = JSON.stringify(
    listings.map((l) => ({
      id: l.id,
      naslov: l.title,
      grad: l.city,
      kvart: l.neighborhood,
      cijena_eur: l.price,
      povrsina_m2: l.area,
      cijena_po_m2: l.pricePerM2,
      sobe: l.rooms,
      tip: l.propertyType,
      stanje: l.condition,
      novogradnja: l.isNewBuild,
      parking: l.hasParking,
      balkon: l.hasBalcony,
      lift: l.hasElevator,
      opis: l.description ? l.description.substring(0, 300) : null,
    })),
    null,
    2,
  );

  return `Si AI asistent za nekretnine koji rangira oglase prema relevantnosti za korisnika.

## Korisnički zahtjev (filter)
${filterDesc}

## Lista nekretnina za rangiranje (${listings.length} oglasa)
${listingsJson}

## Zadatak
Rangiraj SVAKU nekretninu prema tome koliko dobro odgovara korisnikovim zahtjevima.

## Kriteriji rangiranja (po važnosti)
1. Cijena u odnosu na traženi raspon i cijenu po m² (najvažnije)
2. Lokacija — grad i kvart (ako je specificiran)
3. Veličina — površina i broj soba
4. Semantičko podudaranje slobodnog teksta s opisom nekretnine
5. Dodatne karakteristike (parking, balkon, lift, stanje, novogradnja)

## Format odgovora
Vrati ISKLJUČIVO JSON array, bez ikakvog drugog teksta:
[
  {
    "listingId": "id_nekretnine",
    "score": 85,
    "comment": "Kratki komentar na hrvatskom zašto je ova nekretnina dobra/loša za korisnika (max 100 znakova)"
  }
]

Gdje je score broj od 0 do 100 (postotak podudaranja).
Vrati sve nekretnine rangirane od najboljeg prema najlošijem.`;
}
