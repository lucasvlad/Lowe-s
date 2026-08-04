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
  /** True as soon as the screen should be covered (shows solid paper + a spinner). */
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

// Each side panel is wider than half the screen so they overlap in the
// middle at rest — that overlap buries the torn texture's ragged edge under
// two full layers of paper instead of a single seam, so there's no visible
// split until the panels actually start moving. Every panel also carries the
// plain (non-torn) background underneath its torn layer, so if the torn
// asset has any transparent/ragged bits it never exposes what's behind it —
// only the panel sliding away does that, which is what makes the reveal
// grow from the center outward instead of popping in all at once.
const OVERLAP_PCT = 16;
const PANEL_WIDTH_PCT = 50 + OVERLAP_PCT / 2;
const PANEL_IMAGE_WIDTH_PCT = (100 / PANEL_WIDTH_PCT) * 100;
const RIGHT_PANEL_IMAGE_MARGIN_PCT = -(((100 - PANEL_WIDTH_PCT) / PANEL_WIDTH_PCT) * 100);

/**
 * One-shot overlay: two overlapping paper panels (plain background backed,
 * torn texture on top) cover the screen as soon as `active` flips true, with
 * a themed spinner. Once `ready` also flips true, both panels slide apart —
 * since they overlap at rest, the screen underneath is only uncovered where
 * the panels have actually moved, so the reveal grows outward from the
 * center in step with the animation rather than showing a gap immediately.
 * Meant to cover a screen's own first mount right after sign-in, not to
 * animate across a navigation transition.
 */
export function TearReveal({ active, ready, onComplete }: TearRevealProps) {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(active);
  const [forceReady, setForceReady] = useState(false);
  const [isTearing, setIsTearing] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const done = useRef(false);
  const started = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
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

  if (!visible) return null;

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
    <View style={styles.fill} onLayout={onLayout} pointerEvents="none">
      <Animated.View
        style={[
          styles.panel,
          styles.leftPanel,
          { transform: [{ translateX: leftTranslate }, { rotate: leftRotate }] },
        ]}
      >
        <Image
          source={require("../assets/images/login_background.png")}
          style={styles.panelImage}
          resizeMode="cover"
        />
        <View style={StyleSheet.absoluteFillObject}>
          <Image
            source={require("../assets/images/login_background_torn.png")}
            style={styles.panelImage}
            resizeMode="cover"
          />
        </View>
      </Animated.View>
      <Animated.View
        style={[
          styles.panel,
          styles.rightPanel,
          { transform: [{ translateX: rightTranslate }, { rotate: rightRotate }] },
        ]}
      >
        <Image
          source={require("../assets/images/login_background.png")}
          style={[styles.panelImage, styles.rightPanelImage]}
          resizeMode="cover"
        />
        <View style={StyleSheet.absoluteFillObject}>
          <Image
            source={require("../assets/images/login_background_torn.png")}
            style={[styles.panelImage, styles.rightPanelImage]}
            resizeMode="cover"
          />
        </View>
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
  fill: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.paper,
  },
  panel: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: `${PANEL_WIDTH_PCT}%`,
    overflow: "hidden",
  },
  leftPanel: {
    left: 0,
  },
  rightPanel: {
    right: 0,
  },
  panelImage: {
    width: `${PANEL_IMAGE_WIDTH_PCT}%`,
    height: "100%",
  },
  rightPanelImage: {
    marginLeft: `${RIGHT_PANEL_IMAGE_MARGIN_PCT}%`,
  },
  spinnerWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
