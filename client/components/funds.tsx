import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
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
import { TONS_TO_KG, T_TO_GT, T_TO_MT } from "../lib/constants";
import { round } from "../lib/utils";
import { StockRow } from "./stock";
import hslToHex from "hsl-to-hex";

export function FundsScreen() {
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

  const [GHG, setGHG] = useState<GHG>("carbon");

  const fundBounds = useMemo(
    () => ({
      min: Math.min(
        ...Object.values(funds).map(({ emissions }) => emissions[GHG])
      ),
      max: Math.max(
        ...Object.values(funds).map(({ emissions }) => emissions[GHG])
      ),
    }),
    [funds]
  );

  const getColor = useCallback(
    (fund) => {
      const { min, max } = fundBounds;
      const { emissions } = fund;
      const percent = (emissions[GHG] - min) / (max - min);
      const hue = Math.round(percent * 140);
      return hslToHex(140 - hue, 53, 53);
    },
    [funds]
  );

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
        <Text style={{ ...TYPE.bold, fontSize: 32 }}>Funds</Text>
        <Stack size={24}></Stack>
        {Object.values(funds).map((fund) => {
          return (
            <View
              key={fund.name}
              style={{
                borderTopColor: COLORS.grayLight,
                borderTopWidth: 1,
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                }}
              >
                <View style={{ flex: 1 }}>
                  {!!fund.logo ? (
                    <Image
                      source={{
                        uri: fund.logo,
                      }}
                      width={32}
                      height={32}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                      }}
                    />
                  ) : (
                    <Ionicons
                      name="business"
                      color={COLORS.primaryDark}
                      size={32}
                    ></Ionicons>
                  )}
                  <Stack size={12}></Stack>
                  <Text style={{ ...TYPE.bold, fontSize: 14 }}>
                    {fund.name}
                  </Text>
                </View>
                <Queue size={24}></Queue>
                <View style={{ justifyContent: "flex-end" }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        ...TYPE.bold,
                        fontSize: 24,
                        color: getColor(fund),
                      }}
                    >
                      {round(fund.emissions.carbon * T_TO_MT, 1).toLocaleString(
                        "en-US"
                      )}
                    </Text>
                    <Queue size={12}></Queue>
                    <Text
                      style={{
                        ...TYPE.bold,
                        fontSize: 14,
                        color: getColor(fund),
                      }}
                    >
                      Mt/yr
                    </Text>
                  </View>
                  <Stack size={6}></Stack>
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-end" }}
                  >
                    <Text style={{ ...TYPE.regular, fontSize: 18 }}>
                      ${round(fund.aum * T_TO_GT, 0).toLocaleString("en-US")}
                    </Text>
                    <Text style={{ ...TYPE.regular, fontSize: 14 }}>B AUM</Text>
                  </View>
                </View>
              </View>
              <Stack size={12}></Stack>
              <Text
                style={{
                  ...TYPE.regular,
                  overflow: "hidden",
                  color: "gray",
                  fontSize: 12,
                }}
              >
                {Object.entries(fund.stocks)
                  .sort((a, b) => b[1] - a[1])
                  .filter((_, i) => i < 15)
                  .map(([symbol, _]) => symbol)
                  .join(", ")}
              </Text>
            </View>
          );
        })}
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
