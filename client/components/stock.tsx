import { Pressable, Text, View } from "react-native";
import { Stack } from "react-native-spacing-system";
import { T_TO_GT } from "../lib/constants";
import { COLORS, TYPE } from "../lib/theme";
import { Company, GHG } from "../lib/types";
import { round } from "../lib/utils";

export const StockRow: React.FC<{
  company: Company;
  GHG: GHG;
  onPress: () => void;
}> = ({ company, GHG, onPress }) => (
  <Pressable
    style={{
      flexDirection: "row",
      alignItems: "center",
      borderTopColor: COLORS.grayLight,
      borderTopWidth: 0.5,
      paddingVertical: 12,
    }}
    onPress={onPress}
  >
    <View style={{ flex: 1 }}>
      <Text style={{ ...TYPE.bold }}>{company.symbol}</Text>
      <Stack size={4}></Stack>
      <Text style={{ ...TYPE.light, fontSize: 14 }}>{company.name}</Text>
    </View>
    <View style={{ alignItems: "flex-end" }}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ ...TYPE.regular, fontSize: 24 }}>
          {round(company.emissions[GHG] * T_TO_GT, 1)}{" "}
        </Text>
        <Text style={{ ...TYPE.regular, fontSize: 14 }}>Gt/yr</Text>
      </View>
    </View>
  </Pressable>
);
