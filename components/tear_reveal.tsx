import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from "react-native";
import { Colors } from "@/constants/theme";

interface TearRevealProps {
  /** True as soon as the screen should be covered (shows static halves + a spinner). */
  active: boolean;
  /** True once the content underneath is actually ready — starts the tear-apart animation. */
  ready: boolean;
  onComplete: () => void;
}

const DURATION = 1500;
const FALLBACK_BUFFER = 800;
// Safety net: don't leave the user staring at closed paper forever if `ready`
// never arrives (e.g. the listings fetch hangs) — tear anyway after this long.
const MAX_WAIT_FOR_READY = 6000;

/**
 * One-shot overlay: the torn-paper background image covers the screen (with
 * a themed spinner) as soon as `active` flips true, then splits into two
 * halves that slide apart once `ready` is also true, revealing whatever's
 * rendered underneath. Meant to cover a screen's own first mount right after
 * sign-in, not to animate across a navigation transition.
 */
export function TearReveal({ active, ready, onComplete }: TearRevealProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [visible, setVisible] = useState(active);
  const [forceReady, setForceReady] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const done = useRef(false);
  const started = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.width === width && prev.height === height ? prev : { width, height },
    );
  };

  useEffect(() => {
    if (active) setVisible(true);
  }, [active]);

  useEffect(() => {
    if (!active || ready) return;
    const timeout = setTimeout(() => setForceReady(true), MAX_WAIT_FOR_READY);
    return () => clearTimeout(timeout);
  }, [active, ready]);

  const effectiveReady = ready || forceReady;

  useEffect(() => {
    if (!active || !effectiveReady || started.current || done.current) return;
    started.current = true;
    setIsTearing(true);

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
    // Intentionally only re-run when active/effectiveReady flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, effectiveReady]);

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
      {!isTearing ? (
        <View style={styles.spinnerWrap}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  half: {
    position: "absolute",
    top: 0,
    overflow: "hidden",
  },
  spinnerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
