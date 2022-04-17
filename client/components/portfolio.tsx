import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import hsl from "hsl-to-hex";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  Alert,
  Pressable,
  Image,
  Button,
  SafeAreaView,
  ScrollView,
  TextInput,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MapView, { Marker, Polygon, Polyline } from "react-native-maps";
import { generateState } from "../lib/data";
import { COLORS, TYPE } from "../lib/theme";
import {
  AppState,
  Company,
  GHG,
  GHGs,
  Portfolio,
  PortfolioStats,
} from "../lib/types";
import { Queue, Stack } from "react-native-spacing-system";
import { Dimensions } from "react-native";
import { useFonts } from "expo-font";
import { TONS_TO_KG, T_TO_GT, T_TO_MT } from "../lib/constants";
import { round } from "../lib/utils";
import { StockRow } from "./stock";

import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";

export function PortfolioScreen() {
  const [{ portfolio, funds, companies, industries, searchIndex }, dispatch] =
    useReducer((state: AppState, action: any) => {
      switch (action.type) {
        case "ADD_STOCK":
          return {
            ...state,
            portfolio: {
              stocks: {
                ...state.portfolio.stocks,
                [action.payload.symbol]: action.payload.quantity,
              },
            },
          };
        default:
          return state;
      }
    }, generateState());

  const [page, setPage] = useState("PORTFOLIO");
  const [GHG, setGHG] = useState<GHG>("carbon");

  const portfolioStats: PortfolioStats = useMemo(() => {
    const totalFootprint: GHGs = {
      carbon: 0,
      methane: 0,
      nitrous: 0,
    };
    const dollars: GHGs = {
      carbon: 0,
      methane: 0,
      nitrous: 0,
    };
    Object.entries(portfolio.stocks).forEach(([symbol, quantity]) => {
      const company = companies[symbol];
      const ownership = quantity / company.sharesOutstanding;
      (["carbon", "methane", "nitrous"] as GHG[]).forEach((emission) => {
        totalFootprint[emission] += company.emissions[emission] * ownership;
        dollars[emission] += company.marketCap * ownership;
      });
    });
    return {
      totalFootprint,
      footprintPerDollar: {
        carbon: totalFootprint.carbon / dollars.carbon,
        methane: totalFootprint.methane / dollars.methane,
        nitrous: totalFootprint.nitrous / dollars.nitrous,
      } as GHGs,
    };
  }, [portfolio]);

  const [openedStock, openStock] = useState<string>();

  const [addingStock, setAddingStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const searchResults = useMemo(() => {
    const results = searchIndex.search(searchQuery);
    return results;
  }, [searchQuery]);

  const collateIndustries = useCallback(() => {
    if (!!openedStock) {
      const collated: Record<string, number> = {};
      companies[openedStock].facilities.forEach((facility) => {
        if (facility.industry && facility.emissions) {
          if (facility.industry in collated) {
            collated[facility.industry] += facility.emissions.carbon;
          } else {
            collated[facility.industry] = facility.emissions.carbon;
          }
        }
      });
      return collated;
    }
    return null;
  }, [companies, openedStock]);

  const screenWidth = Dimensions.get("window").width;

  const chartConfig = {
    backgroundGradientFrom: "#1E2923",
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: "#08130D",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* <Text style={{ ...TYPE.bold, fontSize: 32 }}>Portfolio</Text> */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Image
            source={require("../assets/brand.png")}
            style={{
              width: 150,
              height: 53,
              resizeMode: "contain",
              alignSelf: "flex-end",
              marginLeft: -8,
            }}
          ></Image>
          <Ionicons
            name="ios-person-circle"
            size={36}
            color={COLORS.text}
          ></Ionicons>
        </View>
        <Stack size={12}></Stack>
        {/* <View style={styles.scoreCard}>
          <View>
            <Text style={{ ...styles.subtitle, alignSelf: "flex-end" }}>
              CO₂ emissions
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.totalNumber}>
                {round(portfolioStats.totalFootprint[GHG], 1).toLocaleString(
                  "en-US"
                )}{" "}
              </Text>
              <Text style={{ ...TYPE.regular, fontSize: 18 }}>
                tons per year
              </Text>
            </View>
            <Stack size={12}></Stack>
            <Text style={{ ...TYPE.regular, fontSize: 14 }}>
              Here is your portfolio's total annual carbon footprint.
            </Text>
            <Stack size={12}></Stack>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.totalNumber}>
                {round(
                  portfolioStats.footprintPerDollar[GHG] * TONS_TO_KG,
                  1
                ).toLocaleString("en-US")}{" "}
              </Text>
              <Text style={{ ...TYPE.regular, fontSize: 18 }}>
                kg per dollar
              </Text>
            </View>
            <Stack size={12}></Stack>
            <Text style={{ ...TYPE.regular, fontSize: 14 }}>
              We factor in your ownership stakes to assess the carbon footprint
              of each dollar.
            </Text>
          </View>
        </View> */}
        <Text style={{ ...TYPE.regular, fontSize: 32 }}>Your portfolio's</Text>
        <Stack size={8}></Stack>
        <Text style={{ ...TYPE.regular, fontSize: 32 }}>
          carbon footprint is
        </Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text
            style={{ ...TYPE.bold, fontSize: 48, color: COLORS.primaryDark }}
          >
            {round(portfolioStats.totalFootprint[GHG], 1).toLocaleString(
              "en-US"
            )}{" "}
          </Text>
          <Text style={{ ...TYPE.regular, fontSize: 32, marginBottom: 8 }}>
            tons a year,
          </Text>
        </View>
        <Text style={{ ...TYPE.regular, fontSize: 32 }}>and every dollar</Text>
        <Stack size={8}></Stack>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text style={{ ...TYPE.regular, fontSize: 32 }}>adds</Text>
          <Text style={{ ...TYPE.bold, fontSize: 36, color: COLORS.primary }}>
            {" "}
            {round(
              portfolioStats.footprintPerDollar[GHG] * TONS_TO_KG,
              2
            ).toLocaleString("en-US")}{" "}
          </Text>
          <Text style={{ ...TYPE.regular, fontSize: 32 }}>kg.</Text>
        </View>
        <Text></Text>
        <Stack size={24}></Stack>
        <View
          style={{ backgroundColor: "white", padding: 16, borderRadius: 16 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                ...TYPE.bold,
                flex: 1,
              }}
            >
              Assets
            </Text>
            <Ionicons
              name="ios-add-circle"
              size={24}
              color={COLORS.primaryDark}
              onPress={() => setAddingStock(true)}
            ></Ionicons>
          </View>
          <Stack size={24}></Stack>
          {Object.entries(portfolio.stocks).map(([symbol, quantity]) => {
            const company = companies[symbol];
            const ownership = quantity / company.sharesOutstanding;
            return (
              <StockRow
                key={symbol}
                company={company}
                GHG={GHG}
                onPress={() => openStock(symbol)}
              ></StockRow>
            );
          })}
        </View>
        <Stack size={64}></Stack>
        <StatusBar style="auto" />
        <Modal
          presentationStyle="pageSheet"
          animationType="slide"
          visible={!!openedStock}
          onRequestClose={() => {
            openStock(undefined);
          }}
        >
          {!!openedStock && (
            <View style={{ alignItems: "stretch", padding: 24 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Image
                  style={{ width: 50, height: 50 }}
                  source={{
                    uri:
                      companies[openedStock].logo ||
                      "https://logo.clearbit.com/kelloggs.com",
                  }}
                />
                <Pressable style={{}} onPress={() => openStock(undefined)}>
                  <Ionicons name="ios-close" size={24} />
                </Pressable>
              </View>
              <Stack size={24}></Stack>
              <Text style={{ ...TYPE.bold, fontSize: 24 }}>
                {companies[openedStock].name}
              </Text>
              <Stack size={12}></Stack>
              <Text>
                Operating in the{" "}
                {companies[openedStock].industries[0] || "public"} sector with a
                current market cap of $
                {companies[openedStock].marketCap.toLocaleString("en-US")}, the
                carbon footprint of {companies[openedStock].name} was reported
                by the EPA in 2020 as{" "}
                {round(
                  companies[openedStock].emissions[GHG] * T_TO_MT,
                  1
                ).toLocaleString("en-US")}{" "}
                megatons of CO₂ per year. For investors, each dollar contributes
                towards{" "}
                {round(
                  (companies[openedStock].emissions[GHG] * TONS_TO_KG) /
                    companies[openedStock].marketCap,
                  2
                ).toLocaleString("en-US")}{" "}
                kg of CO₂.
              </Text>
              <Stack size={12}></Stack>
              <View
                style={{ height: 1, backgroundColor: COLORS.grayLight }}
              ></View>
              <Stack size={12}></Stack>
              <Text style={{ ...TYPE.regular }}>
                For investors, each dollar contributes towards{" "}
                {round(
                  (companies[openedStock].emissions[GHG] * TONS_TO_KG) /
                    companies[openedStock].marketCap,
                  2
                ).toLocaleString("en-US")}{" "}
                kg of CO₂.
              </Text>
              {Object.keys(collateIndustries()).length >= 3 && (
                <PieChart
                  data={(() => {
                    return Object.entries(collateIndustries())
                      .map(([name, population], i) => ({
                        name,
                        population,
                        color: hsl(
                          174,
                          75,
                          100 - 60 * (Math.pow(9, -i) / Math.pow(10, -i))
                        ),
                        legendFontColor: "#7F7F7F",
                        legendFontSize: 14,
                      }))
                      .filter((_, i) => i < 7);
                  })()}
                  width={screenWidth - 48}
                  height={
                    Math.min(companies[openedStock].facilities.length, 7) * 24
                  }
                  chartConfig={chartConfig}
                  accessor={"population"}
                  backgroundColor={"transparent"}
                  center={[0, 10]}
                />
              )}

              <View>
                <MapView
                  initialRegion={{
                    latitude: companies[openedStock].facilities[0].latitude,
                    longitude: companies[openedStock].facilities[0].longitude,
                    latitudeDelta:
                      Math.max(
                        ...companies[openedStock].facilities.map(
                          ({ latitude }) => latitude
                        )
                      ) -
                      Math.min(
                        ...companies[openedStock].facilities.map(
                          ({ latitude }) => latitude
                        )
                      ),
                    longitudeDelta: 0.0421,
                  }}
                  style={styles.map}
                  provider="google"
                >
                  {companies[openedStock].facilities.map((facility) => {
                    return (
                      <>
                        <Marker
                          coordinate={{
                            latitude: facility.latitude,
                            longitude: facility.longitude,
                          }}
                          pinColor={"purple"} // any color
                          title={`${facility.name} Facility`}
                          description={`${facility.name} is a subsidary of ${companies[openedStock].symbol}`}
                        >
                          <Ionicons
                            name="business"
                            size={24}
                            color={COLORS.primaryDark}
                          ></Ionicons>
                        </Marker>
                        {companies[openedStock].facilities.map(
                          (otherFacility) => (
                            <Polyline
                              coordinates={[
                                {
                                  latitude: facility.latitude,
                                  longitude: facility.longitude,
                                },
                                {
                                  latitude: otherFacility.latitude,
                                  longitude: otherFacility.longitude,
                                },
                              ]}
                              strokeColor={COLORS.primaryDark}
                              strokeWidth={0.1}
                            ></Polyline>
                          )
                        )}
                      </>
                    );
                  })}
                  {/* <Polygon
                    coordinates={companies[openedStock].facilities.map(
                      ({ latitude, longitude }) => ({ latitude, longitude })
                    )}
                    strokeColor="#F00"
                    fillColor="#000"
                    strokeWidth={2}
                  /> */}
                </MapView>
              </View>
              {true && (
                <Image
                  source={require("../assets/images/nature.png")}
                  style={{
                    alignSelf: "center",
                    width: "66%",
                  }}
                  resizeMode="contain"
                ></Image>
              )}
            </View>
          )}
        </Modal>
        <Modal
          presentationStyle="pageSheet"
          animationType="slide"
          visible={addingStock}
          onRequestClose={() => {
            setAddingStock(false);
            setSearchQuery("");
          }}
        >
          {addingStock && (
            <View style={{ alignItems: "stretch", padding: 24 }}>
              <Stack size={12}></Stack>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <TextInput
                  onChangeText={(text) => {
                    setSearchQuery(text);
                  }}
                  autoFocus
                  placeholder="Enter stock ticker"
                  style={{
                    ...TYPE.regular,
                    fontSize: 18,
                    padding: 8,
                    borderBottomColor: COLORS.grayLight,
                    borderBottomWidth: 2,
                    flex: 1,
                  }}
                ></TextInput>
                <Queue size={24}></Queue>
                <Pressable
                  style={{}}
                  onPress={() => {
                    setAddingStock(false);
                    setSearchQuery("");
                  }}
                >
                  <Ionicons name="ios-close" size={24} />
                </Pressable>
              </View>
              {searchResults.length > 0 ? (
                <View>
                  <Stack size={12}></Stack>
                  <Text
                    style={{ ...TYPE.regular, fontSize: 14, color: "gray" }}
                  >
                    {searchResults.length} results
                  </Text>
                  <Stack size={12}></Stack>
                  {searchResults.map(({ symbol }) => {
                    return (
                      <StockRow
                        key={symbol}
                        company={companies[symbol]}
                        GHG={GHG}
                        onPress={() =>
                          Alert.prompt("Number of shares", "", (quantity) => {
                            setAddingStock(false);
                            setSearchQuery("");
                            dispatch({
                              type: "ADD_STOCK",
                              payload: { symbol, quantity },
                            });
                          })
                        }
                      ></StockRow>
                    );
                  })}
                </View>
              ) : (
                <Image
                  source={require("../assets/images/nature.png")}
                  style={{
                    alignSelf: "center",
                    width: "66%",
                    height: 600,
                  }}
                  resizeMode="contain"
                ></Image>
              )}
            </View>
          )}
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {},
  scroll: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  scoreCard: {
    flexDirection: "column",
    width: "100%",
    padding: 24,
    borderRadius: 24,
    shadowColor: COLORS.primaryDark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    backgroundColor: COLORS.primaryLight,
  },
  subtitle: {
    ...TYPE.regular,
    color: "gray",
  },
  totalNumber: {
    ...TYPE.bold,
    fontSize: 36,
  },
  perDollar: {
    ...TYPE.bold,
    fontSize: 18,
  },
  centeredView: {},
  map: {
    borderRadius: 20,
    marginTop: 20,
    width: screenWidth - 50,
    height: 330,
  },
  picker: {
    borderRadius: 20,
    width: screenWidth,
    height: 250,
  },
});
