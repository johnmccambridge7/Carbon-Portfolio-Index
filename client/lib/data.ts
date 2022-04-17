import {
  Industry,
  Portfolio,
  Company,
  GHGs,
  GHG,
  AppState,
  Fund,
} from "./types";
import RAW from "./data.json";
import LOGOS from "./logos.json";
import FUNDS from "./funds.json";
import FUND_LOGOS from "./fund-logos.json";
import MiniSearch from "minisearch";

export const generateState = (): AppState => {
  const industries: Record<string, Industry> = {};
  const companies: Record<string, Company> = {};
  const funds: Record<string, Fund> = {};
  RAW.forEach((obj) => {
    const symbol = obj.symbol;
    const partOfIndustries = obj.industry.split(",");
    partOfIndustries.forEach((industry) => {
      if (!(industry in industries)) {
        industries[industry] = {
          name: industry,
          companies: [],
        };
      }
    });
    const {
      marketCap,
      sharesOutstanding,
      carbon,
      methane,
      nitrous,
      latitude,
      longitude,
    } = obj;
    const facility = {
      name: obj.facility,
      latitude,
      longitude,
      industry: obj.industry.split(",")[0] || "Misc",
      emissions: {
        carbon,
        methane,
        nitrous,
      },
    };
    if (!(symbol in companies)) {
      companies[symbol] = {
        symbol,
        name: obj.company,
        marketCap,
        sharesOutstanding,
        industries: partOfIndustries,
        emissions: {
          carbon,
          methane,
          nitrous,
        },
        facilities: [facility],
      };
    } else {
      companies[symbol].facilities.push(facility);
      (["carbon", "methane", "nitrous"] as GHG[]).forEach((ghg) => {
        companies[symbol].emissions[ghg] += obj[ghg];
      });
    }
  });

  FUNDS.forEach(({ name, aum, stocks: rawStocks, emissions }) => {
    const stocks: Record<string, number> = {};
    Object.entries(rawStocks).forEach(([symbol, quantity]) => {
      if (typeof quantity === "number") {
        stocks[symbol] = quantity;
      } else {
        stocks[symbol] = 0;
      }
    });
    funds[name] = {
      name,
      aum,
      stocks,
      emissions,
      // @ts-ignore
      logo: name in FUND_LOGOS ? FUND_LOGOS[name] : "",
    };
  });
  Object.entries(LOGOS).forEach(([companyName, logo]) => {
    const isItInThere = Object.values(companies).find(
      ({ name }) => name === companyName
    );
    if (!!isItInThere) {
      isItInThere.logo = logo;
    }
  });
  const searchIndex = new MiniSearch<Company>({
    fields: ["symbol", "company", "industry"],
    storeFields: ["symbol"],
    searchOptions: {
      fuzzy: 1.0,
    },
  });

  searchIndex.addAll(
    Object.values(companies).map((company) => ({
      ...company,
      id: company.symbol,
    }))
  );

  return {
    portfolio: {
      stocks: {
        PEP: 8700,
        DOW: 32000,
        TSLA: 100,
        D: 800,
        K: 500,
      },
    },
    industries,
    companies,
    funds,
    searchIndex,
  };
};
