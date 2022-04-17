import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useReducer, useState } from "react";
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
import { useFonts } from "expo-font";
import { TONS_TO_KG, T_TO_GT } from "../lib/constants";
import { round } from "../lib/utils";
import { StockRow } from "./stock";

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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={{ ...TYPE.bold, fontSize: 32 }}>Portfolio</Text>
        <Stack size={24}></Stack>
        <View style={styles.scoreCard}>
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
        </View>
        <Stack size={36}></Stack>
        <View style={{}}>
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
              name="add-circle"
              size={24}
              onPress={() => setAddingStock(true)}
            ></Ionicons>
            {/* <Button onPress={(e) => {}} title="+">
              </Button> */}
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
                <Text style={{ ...TYPE.bold, flex: 1 }}>
                  {companies[openedStock].symbol}
                </Text>
                <Pressable style={{}} onPress={() => openStock(undefined)}>
                  <Ionicons name="ios-close" size={24} />
                </Pressable>
              </View>
              <Stack size={24}></Stack>
              <Text style={{ ...TYPE.bold, fontSize: 24 }}>
                {companies[openedStock].name}
              </Text>
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
                    console.log(text);
                    setSearchQuery(text);
                  }}
                  autoFocus
                  placeholder="Enter stock ticker"
                  style={{
                    ...TYPE.regular,
                    fontSize: 18,
                    padding: 8,
                    borderBottomColor: COLORS.text,
                    borderBottomWidth: 3,
                    flex: 1,
                  }}
                >
                  {/* <Ionicons name="ios-search" size={24} /> */}
                  {/* <Queue size={12}></Queue> */}
                </TextInput>
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
});
