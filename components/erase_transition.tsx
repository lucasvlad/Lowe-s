import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, {
  ClipPath,
  Defs,
  Rect,
  Polygon,
  ForeignObject,
} from "react-native-svg";

interface EraseTransitionProps {
  mode: "erase" | "reveal";
  running: boolean;
  onComplete?: () => void;
  children: React.ReactNode;
  width: number;
  height: number;
}

// We animate a single value 0→1 that controls how far the diagonal edge has swept.
// The clip polygon always covers from x=0 to the diagonal edge.
//
// The diagonal line goes from (progress - height, 0) to (progress, height)
// where progress sweeps from 0 to width+height.
//
//  erase:  progress 0→(w+h)  clip grows   → content disappears L→R diagonally
//  reveal: progress (w+h)→0  clip shrinks → content appears    R→L... no wait:
//
//  reveal: we want content to APPEAR sweeping top-left to bottom-right too.
//          So the clip polygon starts as nothing and grows the same direction.
//          progress goes 0→(w+h) but we use it as the REVEALED region not hidden.
//
// In both cases progress 0→(w+h):
//   erase:  clip = left of diagonal  (content visible where clip is)
//           starts full, diagonal sweeps right removing content
//           → actually we want ERASE to go from full clip to empty clip
//             so erase: progress (w+h)→0
//   reveal: progress 0→(w+h), clip grows from nothing to full

export function EraseTransition({
  mode,
  running,
  onComplete,
  children,
  width,
  height,
}: EraseTransitionProps) {
  const progress = useRef(
    new Animated.Value(mode === "erase" ? width + height : 0),
  ).current;

  useEffect(() => {
    if (!running) return;
    Animated.timing(progress, {
      toValue: mode === "erase" ? 0 : width + height,
      duration: 700,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false, // ClipPath needs JS-driven animation
    }).start(() => onComplete?.());
  }, [running]);

  // Build the clip polygon points string from the animated progress value.
  // The visible region is everything to the LEFT of the diagonal sweep line.
  // Diagonal line: top point = (p, 0), bottom point = (p - height, height)
  // Clip polygon = top-left corner + top-right(p,0) + bottom-right(p-h,h) + bottom-left
  const animatedPoints = progress.interpolate({
    inputRange: [0, width + height],
    outputRange: [
      `0,0 0,0 0,${height} 0,${height}`, // nothing visible
      `0,0 ${width},0 ${width + height},${height} 0,${height}`, // everything visible
    ],
  });

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <ClipPath id="eraseClip">
            <AnimatedPolygon animatedPoints={animatedPoints} />
          </ClipPath>
        </Defs>
        <ForeignObject
          x={0}
          y={0}
          width={width}
          height={height}
          clipPath="url(#eraseClip)"
        >
          <View style={{ width, height }}>{children}</View>
        </ForeignObject>
      </Svg>
    </View>
  );
}

// react-native-svg doesn't support Animated values on SVG props directly,
// so we use a workaround: listen to the animated value and update state.
function AnimatedPolygon({
  animatedPoints,
}: {
  animatedPoints: Animated.AnimatedInterpolation<string>;
}) {
  const [points, setPoints] = React.useState("0,0 0,0 0,0 0,0");

  useEffect(() => {
    const id = animatedPoints.addListener(({ value }) => setPoints(value));
    return () => animatedPoints.removeListener(id);
  }, [animatedPoints]);

  const { Polygon: SvgPolygon } = require("react-native-svg");
  return <SvgPolygon points={points} fill="black" />;
}
