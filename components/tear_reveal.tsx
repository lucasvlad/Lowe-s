import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, LayoutChangeEvent, StyleSheet, View } from "react-native";

interface TearRevealProps {
  /** Set true to run the tear-apart animation once. */
  running: boolean;
  onComplete: () => void;
}

const DURATION = 700;
const FALLBACK_BUFFER = 400;

/**
 * One-shot overlay: the torn-paper background image split into two halves
 * that slide apart (plus a slight rotate) to reveal whatever's rendered
 * underneath. Meant to cover a screen's own first mount right after sign-in,
 * not to animate across a navigation transition.
 */
export function TearReveal({ running, onComplete }: TearRevealProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [visible, setVisible] = useState(running);
  const progress = useRef(new Animated.Value(0)).current;
  const done = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  useEffect(() => {
    if (!running || done.current) return;
    setVisible(true);

    const finish = () => {
      if (done.current) return;
      done.current = true;
      setVisible(false);
      onComplete();
    };

    const fallback = setTimeout(finish, DURATION + FALLBACK_BUFFER);

    Animated.timing(progress, {
      toValue: 1,
      duration: DURATION,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      clearTimeout(fallback);
      finish();
    });

    return () => clearTimeout(fallback);
    // Intentionally only re-run when `running` flips.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const { width, height } = size;
  if (!visible || width === 0 || height === 0) {
    return <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none" />;
  }

  const half = width / 2;
  const leftTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width * 0.7],
  });
  const rightTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.7],
  });
  const leftRotate = progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "-6deg"] });
  const rightRotate = progress.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "6deg"] });

  return (
    <View style={StyleSheet.absoluteFill} onLayout={onLayout} pointerEvents="none">
      <Animated.View
        style={[
          styles.half,
          {
            left: 0,
            width: half,
            height,
            transform: [{ translateX: leftTranslate }, { rotate: leftRotate }],
          },
        ]}
      >
        <Image
          source={require("../assets/images/login_background_torn.png")}
          style={{ width, height }}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.half,
          {
            left: half,
            width: half,
            height,
            transform: [{ translateX: rightTranslate }, { rotate: rightRotate }],
          },
        ]}
      >
        <Image
          source={require("../assets/images/login_background_torn.png")}
          style={{ width, height, marginLeft: -half }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  half: {
    position: "absolute",
    top: 0,
    overflow: "hidden",
  },
});
