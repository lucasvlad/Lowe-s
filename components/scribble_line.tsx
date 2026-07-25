import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

interface ScribbleLineProps {
  style?: ViewStyle;
}

export function ScribbleLine({ style }: ScribbleLineProps) {
  return (
    <View style={[styles.container, style]}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
      >
        {/* Slightly wobbly hand-drawn horizontal line */}
        <Path
          d="M0,6 C10,4 20,7 30,5.5 C40,4 50,7 60,5 C70,3.5 80,6.5 90,5 C95,4.5 98,5.5 100,5"
          stroke="#000"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 10,
  },
});
