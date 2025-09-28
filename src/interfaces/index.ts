import type { TCategory, TUrl } from "../types";

export interface IReview {
  id: string;
  rating: number;
  description: string;
}

export interface IPlace {
  id: string;
  name: string;
  address: string;
  images: TUrl[];
  category: TCategory[];
  description: string;
  reviews: IReview[];
  average_rating: number;
}
