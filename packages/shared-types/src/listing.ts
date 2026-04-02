export enum PropertyType {
  APARTMENT = "APARTMENT",
  HOUSE = "HOUSE",
  LAND = "LAND",
}

export enum PropertyCategory {
  BUY = "BUY",
  RENT = "RENT",
}

export enum PropertyCondition {
  NEW_BUILD = "NEW_BUILD",
  RENOVATED = "RENOVATED",
  GOOD = "GOOD",
  NEEDS_RENOVATION = "NEEDS_RENOVATION",
}

export interface Listing {
  id: string;
  externalId: string;
  sourceUrl: string;
  title: string;
  description: string;
  price: number;
  pricePerSqm?: number;
  avgPricePerSqmInArea?: number;
  city: string;
  neighborhood?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  areaSqm: number;
  rooms?: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  condition?: PropertyCondition;
  hasParking: boolean;
  hasBalcony: boolean;
  hasElevator: boolean;
  propertyType: PropertyType;
  category: PropertyCategory;
  images: string[];
  agentName?: string;
  agentPhone?: string;
  agentEmail?: string;
  isActive: boolean;
  scrapedAt: string;
  createdAt: string;
  updatedAt: string;
}
