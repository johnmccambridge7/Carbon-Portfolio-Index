import MiniSearch from "minisearch";

export interface Portfolio {
  stocks: Record<string, number>;
}

export interface PortfolioStats {
  totalFootprint: GHGs;
  footprintPerDollar: GHGs;
}

export interface Industry {
  name: string;
  companies: string[];
}

export interface Company {
  symbol: string;
  name: string;
  industries: string[];
  sharesOutstanding: number;
  marketCap: number;
  emissions: GHGs;
  facilities: Facility[];
  logo?: string;
}

export interface Facility {
  name: string;
  industry?: string;
  latitude: number;
  longitude: number;
  emissions: GHGs;
}

export type GHG = "carbon" | "methane" | "nitrous";

export interface GHGs extends Record<GHG, number> {}

export interface Fund {
  name: string;
  aum: number;
  stocks: Record<string, number>; // key is symbol, value is number of shares
  emissions: GHGs;
  logo: string;
}

export interface AppState {
  portfolio: Portfolio;
  companies: Record<string, Company>;
  industries: Record<string, Industry>;
  funds: Record<string, Fund>;
  searchIndex: MiniSearch<Company>;
}
