// import { StyleSheet, TouchableOpacity } from "react-native";
// import React from "react";
// import { AntDesign } from "@expo/vector-icons";
// import { Colors } from "@/constants/Colors";

// const ArrowUp = ({ scrollToTop }: { scrollToTop: () => void }) => {
//   return (
//     <TouchableOpacity
//       style={styles.arrowUp}
//       onPress={scrollToTop}
//       activeOpacity={0.7}
//       accessibilityLabel="Scroll to top"
//       accessibilityRole="button"
//     >
//       <AntDesign name="up" size={18} color="white" />
//     </TouchableOpacity>
//   );
// };

// export default ArrowUp;

// const styles = StyleSheet.create({
//   arrowUp: {
//     position: "absolute",
//     bottom: "15%",
//     right: "5%",
//     width: 40,
//     height: 40,
//     borderRadius: 28,
//     backgroundColor: Colors.universal.primary,
//     justifyContent: "center",
//     alignItems: "center",

//     // iOS Shadow
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,

//     // Android Shadow
//     elevation: 8,
//   },
// });

import React, { useEffect, useRef, useCallback, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/Colors";

type Props = {
  scrollToTop: () => void;
  visible?: boolean;
  storageKey?: string;
};

const SIZE = 40;
const MARGIN = 12;

type SavedPos = { side: "left" | "right"; yNorm: number };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const ArrowUp = ({
  scrollToTop,
  visible = true,
  storageKey = "ArrowUp:pos",
}: Props) => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // position
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  // bounds
  const minX = useSharedValue(0);
  const maxX = useSharedValue(0);
  const minY = useSharedValue(0);
  const maxY = useSharedValue(0);

  // drag start
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  // visibility animation
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  // drag state – keeps button visible & full-size while dragging
  const isDragging = useSharedValue(false);

  // persistence
  const savedRef = useRef<SavedPos | null>(null);
  const didInitRef = useRef(false);
  const [rehydrated, setRehydrated] = useState(false);

  const loadSaved = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(storageKey);
      if (!raw) {
        savedRef.current = null;
        return;
      }
      const parsed = JSON.parse(raw) as SavedPos;
      if (
        parsed &&
        (parsed.side === "left" || parsed.side === "right") &&
        typeof parsed.yNorm === "number"
      ) {
        savedRef.current = { side: parsed.side, yNorm: clamp01(parsed.yNorm) };
      } else {
        savedRef.current = null;
      }
    } catch {
      savedRef.current = null;
    }
  }, [storageKey]);

  const saveSaved = useCallback(
    async (next: SavedPos) => {
      try {
        savedRef.current = { side: next.side, yNorm: clamp01(next.yNorm) };
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(savedRef.current),
        );
      } catch {}
    },
    [storageKey],
  );

  // load on mount
  useEffect(() => {
    let alive = true;
    (async () => {
      await loadSaved();
      if (alive) setRehydrated(true);
    })();
    return () => {
      alive = false;
    };
  }, [loadSaved]);

  // animate visibility
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 160 });
    scale.value = withTiming(visible ? 1 : 0.95, { duration: 160 });
  }, [visible, opacity, scale]);

  // update bounds + init position
  useEffect(() => {
    const bMinX = MARGIN;
    const bMaxX = Math.max(MARGIN, width - SIZE - MARGIN);
    const bMinY = insets.top + MARGIN;
    const bMaxY = Math.max(
      insets.top + MARGIN,
      height - insets.bottom - SIZE - MARGIN,
    );

    minX.value = bMinX;
    maxX.value = bMaxX;
    minY.value = bMinY;
    maxY.value = bMaxY;

    if (!didInitRef.current && rehydrated) {
      didInitRef.current = true;

      const saved = savedRef.current;
      if (saved) {
        const targetX = saved.side === "left" ? bMinX : bMaxX;
        const yRange = Math.max(1, bMaxY - bMinY);
        const targetY = bMinY + clamp01(saved.yNorm) * yRange;
        x.value = targetX;
        y.value = Math.max(bMinY, Math.min(targetY, bMaxY));
      } else {
        // default: bottom-right (matches the old fixed position)
        x.value = bMaxX;
        y.value = bMaxY - (height * 0.15 - MARGIN); // ≈ old bottom 15%
      }
      return;
    }

    // already initialized → clamp
    if (didInitRef.current) {
      x.value = Math.max(bMinX, Math.min(x.value, bMaxX));
      y.value = Math.max(bMinY, Math.min(y.value, bMaxY));
    }
  }, [
    width,
    height,
    insets.top,
    insets.bottom,
    minX,
    maxX,
    minY,
    maxY,
    x,
    y,
    rehydrated,
  ]);

  const persistFromWorklet = useCallback(
    (side: "left" | "right", yNorm: number) => {
      saveSaved({ side, yNorm: clamp01(yNorm) });
    },
    [saveSaved],
  );

  // ---- Gestures ----
  const pan = Gesture.Pan()
    .enabled(visible)
    .minDistance(4)
    .onBegin(() => {
      isDragging.value = true;
      startX.value = x.value;
      startY.value = y.value;
    })
    .onUpdate((e) => {
      "worklet";
      x.value = Math.max(
        minX.value,
        Math.min(startX.value + e.translationX, maxX.value),
      );
      y.value = Math.max(
        minY.value,
        Math.min(startY.value + e.translationY, maxY.value),
      );
    })
    .onEnd(() => {
      "worklet";
      isDragging.value = false;

      // snap to nearest side
      const mid = (minX.value + maxX.value) / 2;
      const targetX = x.value < mid ? minX.value : maxX.value;
      const side: "left" | "right" = targetX === minX.value ? "left" : "right";
      const yRange = Math.max(1, maxY.value - minY.value);
      const yNorm = (y.value - minY.value) / yRange;

      runOnJS(persistFromWorklet)(side, yNorm);

      x.value = withSpring(targetX, { damping: 50, stiffness: 450 });
      y.value = withSpring(y.value, { damping: 50, stiffness: 450 });
    });

  const tap = Gesture.Tap()
    .enabled(visible)
    .onEnd((_e, success) => {
      "worklet";
      if (success) runOnJS(scrollToTop)();
    });

  const gesture = Gesture.Exclusive(pan, tap);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: isDragging.value ? 1 : opacity.value,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: isDragging.value ? 1 : scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[styles.fab, animatedStyle]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <AntDesign name="up" size={18} color="white" />
      </Animated.View>
    </GestureDetector>
  );
};

export default ArrowUp;

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    width: SIZE,
    height: SIZE,
    borderWidth: 0.3,
    borderRadius: SIZE / 2,
    backgroundColor: Colors.universal.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
