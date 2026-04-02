import { PropertyType, PropertyCategory, PropertyCondition } from "./listing";

export interface Filter {
  id: string;
  userId: string;
  name: string;
  city: string;
  propertyType?: PropertyType;
  category: PropertyCategory;
  priceMin?: number;
  priceMax?: number;
  areaSqmMin?: number;
  areaSqmMax?: number;
  roomsMin?: number;
  roomsMax?: number;
  condition?: PropertyCondition;
  isNewBuild?: boolean;
  hasParking?: boolean;
  hasBalcony?: boolean;
  freeTextQuery?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFilterInput {
  name: string;
  city: string;
  propertyType?: PropertyType;
  category: PropertyCategory;
  priceMin?: number;
  priceMax?: number;
  areaSqmMin?: number;
  areaSqmMax?: number;
  roomsMin?: number;
  roomsMax?: number;
  condition?: PropertyCondition;
  isNewBuild?: boolean;
  hasParking?: boolean;
  hasBalcony?: boolean;
  freeTextQuery?: string;
}

export interface UpdateFilterInput extends Partial<CreateFilterInput> {
  isActive?: boolean;
}
