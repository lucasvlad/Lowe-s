import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Polygon } from "react-native-svg";

interface EraseTransitionProps {
  /** "erase": wipe the content away. "reveal": wipe a covering layer off. */
  mode: "erase" | "reveal";
  /** Set true to run the animation once. */
  running: boolean;
  onComplete?: () => void;
  children: React.ReactNode;
  /** Colour of the sweeping "paper" overlay (defaults to the login bg). */
  backgroundColor?: string;
  style?: ViewStyle;
}

const DURATION = 700;
// Safety margin so the flow always advances even if the animation callback
// or layout measurement misbehaves on a given platform.
const FALLBACK_BUFFER = 400;

/**
 * Sweeps a diagonal "paper" overlay across its children.
 *
 * The children always render normally; the animation is an absolutely
 * positioned SVG overlay on top, so the content is never hidden inside the SVG
 * (which previously risked a blank screen on platforms without solid
 * ForeignObject support). `progress` drives the covered region: 0 = nothing
 * covered (content fully visible), 1 = fully covered.
 */
export function EraseTransition({
  mode,
  running,
  onComplete,
  children,
  backgroundColor = "#e8dcc8",
  style,
}: EraseTransitionProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  // reveal starts fully covered; erase starts fully visible.
  const progress = useRef(new Animated.Value(mode === "reveal" ? 1 : 0)).current;
  const [overlayVisible, setOverlayVisible] = useState(mode === "reveal");
  const done = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  useEffect(() => {
    if (!running || done.current) return;

    setOverlayVisible(true);

    const finish = () => {
      if (done.current) return;
      done.current = true;
      if (mode === "reveal") setOverlayVisible(false);
      onComplete?.();
    };

    const fallback = setTimeout(finish, DURATION + FALLBACK_BUFFER);

    Animated.timing(progress, {
      toValue: mode === "erase" ? 1 : 0,
      duration: DURATION,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false, // animating an SVG polygon via a JS listener
    }).start(() => {
      clearTimeout(fallback);
      finish();
    });

    return () => clearTimeout(fallback);
    // Intentionally only re-run when `running` flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const { width, height } = size;

  return (
    <View style={style} onLayout={onLayout}>
      {children}
      {overlayVisible && width > 0 && height > 0 ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={width} height={height}>
            <AnimatedWipe
              progress={progress}
              width={width}
              height={height}
              color={backgroundColor}
            />
          </Svg>
        </View>
      ) : null}
    </View>
  );
}

/**
 * The covered region is everything to the RIGHT of a 45° diagonal sweep line.
 * react-native-svg can't take an Animated value on `points` directly, so we
 * listen to the interpolated string and push it into state.
 */
function AnimatedWipe({
  progress,
  width,
  height,
  color,
}: {
  progress: Animated.Value;
  width: number;
  height: number;
  color: string;
}) {
  const span = width + height;
  const uncovered = `${span},0 ${span},0 ${span},${height} ${width},${height}`;
  const covered = `0,0 ${span},0 ${span},${height} ${-height},${height}`;

  const pointsAnim = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [uncovered, covered],
  });

  const [points, setPoints] = useState(uncovered);

  useEffect(() => {
    const id = pointsAnim.addListener(({ value }) =>
      setPoints(value as unknown as string),
    );
    return () => pointsAnim.removeListener(id);
  }, [pointsAnim]);

  return <Polygon points={points} fill={color} />;
}
