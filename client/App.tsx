import { useMemo, useReducer, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { generateState } from "./lib/data";
import { COLORS, TYPE } from "./lib/theme";
import { AppState, GHG, GHGs, PortfolioStats } from "./lib/types";
import { PortfolioScreen } from "./components/portfolio";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FundsScreen } from "./components/funds";

export default function App() {
  const [loaded] = useFonts({
    ["Montserrat Light"]: require("./assets/fonts/Montserrat-Light.ttf"),
    ["Montserrat Regular"]: require("./assets/fonts/Montserrat-Regular.ttf"),
    ["Montserrat Bold"]: require("./assets/fonts/Montserrat-Bold.ttf"),
  });

  const Tab = createBottomTabNavigator();

  return (
    loaded && (
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === "Portfolio") {
                iconName = focused ? "ios-book" : "ios-book-outline";
              } else if (route.name === "Funds") {
                iconName = focused ? "ios-grid" : "ios-grid-outline";
              } else if (route.name === "Story") {
                iconName = focused ? "ios-people" : "ios-people";
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerShown: false,
          })}
          tabBarOptions={{
            activeTintColor: COLORS.primaryDark,
            inactiveTintColor: "gray",
          }}
        >
          <Tab.Screen name="Portfolio" component={PortfolioScreen} />
          <Tab.Screen name="Funds" component={FundsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    )
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
