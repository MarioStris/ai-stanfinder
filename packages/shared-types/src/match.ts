import { Listing } from "./listing";

export interface MatchResult {
  id: string;
  filterId: string;
  userId: string;
  listing: Listing;
  matchPercentage: number;
  aiComment: string;
  priceAnalysis?: PriceAnalysis;
  isFavorite: boolean;
  isViewed: boolean;
  status: MatchStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PriceAnalysis {
  pricePerSqm: number;
  avgPricePerSqmInArea: number;
  percentageDiffFromAvg: number;
  isGoodDeal: boolean;
}

export enum MatchStatus {
  NEW = "NEW",
  VIEWED = "VIEWED",
  CONTACTED = "CONTACTED",
  REJECTED = "REJECTED",
  FAVORITED = "FAVORITED",
}
