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
import MiniSearch from "minisearch";

// export const SAMPLE_PORTFOLIO: Portfolio = {
//   AAPL: {
//     symbol: "AAPL",
//     quantity: 100,
//     sharesOutstanding: 1_000_000_000,
//     marketCap: 1_000_000_000_000,
//     name: "Ardelle Ning",
//     description:
//       "Apple Inc. is an American multinational technology company headquartered in Cupertino, California, that designs, develops, and sells consumer electronics, computer software, and online services.",
//     industry: {
//       name: "Technology",
//     },
//     emissions: {
//       carbon: 37_560_000_000,
//       methane: 16_200,
//       nitrous: 5_400,
//     },
//     facilities: [],
//   },
//   MSFT: {
//     symbol: "MSFT",
//     quantity: 100,
//     sharesOutstanding: 1_000_000_000,
//     marketCap: 1_000_000_000_000,
//     name: "Microsoft Corporation",
//     description:
//       "Microsoft Corporation is an American multinational technology company headquartered in Redmond, Washington, that develops, manufactures, licenses, supports and sells computer software, consumer electronics, personal computers, and related services.",
//     industry: {
//       name: "Technology",
//     },
//     emissions: {
//       carbon: 230_000_000,
//       methane: 16_200,
//       nitrous: 5_400,
//     },
//     facilities: [],
//   },
//   ["3M"]: {
//     symbol: "3M",
//     quantity: 100,
//     sharesOutstanding: 1_000_000_000,
//     marketCap: 1_000_000_000_000,
//     name: "3M Company",
//     description:
//       "3M Company is an American multinational corporation that manufactures and sells consumer electronics, office equipment, and plastic products.",
//     industry: {
//       name: "Industrials",
//     },
//     emissions: {
//       carbon: 490_150_000_000,
//       methane: 16_200,
//       nitrous: 5_400,
//     },
//     facilities: [],
//   },
//   NKE: {
//     symbol: "NKE",
//     quantity: 100,
//     sharesOutstanding: 1_000_000_000,
//     marketCap: 1_000_000_000_000,
//     name: "Nike, Inc.",
//     description:
//       "Nike, Inc. is an American multinational corporation that designs, manufactures, and sells athletic shoes, apparel, and equipment.",
//     industry: {
//       name: "Consumer Discretionary",
//     },
//     emissions: {
//       carbon: 89_030_000_000,
//       methane: 16_200,
//       nitrous: 5_400,
//     },
//     facilities: [],
//   },
//   GE: {
//     symbol: "GE",
//     quantity: 100,
//     sharesOutstanding: 1_000_000_000,
//     marketCap: 1_000_000_000_000,
//     name: "General Electric Company",
//     description:
//       "General Electric Company is an American multinational industrial company headquartered in Seattle, Washington, that generates, plants, transmits and distributes electricity and other electricity-related products.",
//     industry: {
//       name: "Industrials",
//     },
//     emissions: {
//       carbon: 1_980_770_000_000,
//       methane: 16_200,
//       nitrous: 5_400,
//     },
//     facilities: [],
//   },
// };

export const generateState = (): AppState => {
  const industries: Record<string, Industry> = {};
  const companies: Record<string, Company> = {};
  RAW.forEach((obj) => {
    const symbol = obj.symbol;
    if (symbol === "PEP") {
      console.log(obj);
    }
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
  FUNDS.forEach(({ name, aum, stocks, emissions }) => {});
  // Object.entries(LOGOS).forEach(([companyName, logo]) => {
  //   if (companyName in companies) {
  //     companies[companyName].logo = logo;
  //   }
  // })
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
      stocks: {},
    },
    industries,
    companies,
    funds: {},
    searchIndex,
  };
};
