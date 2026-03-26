import React, { useCallback, useRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SWIPE_THRESHOLD = 120; // px horizontal travel that triggers a dismiss

/**
 * A single recipe card rendered in the swipe stack.
 *
 * Phase 4 (T018): adds PanGesture + spring dismiss animation.
 * Phase 5 (T022): adds onTap handler — Gesture.Race gives tap priority
 *   over pan for quick presses with minimal movement; a swipe activates pan
 *   first (movement exceeds tap maxDistance) so onTap is never fired mid-swipe.
 *
 * Shadow and border live on the outer Animated.View; `overflow: 'hidden'`
 * lives on the inner `cardClip` View so the image clips to the border radius
 * without suppressing the iOS shadow (overflow:hidden clips iOS shadows).
 *
 * @param {{
 *   recipe:   object,          Full Recipe object
 *   imageUrl: string|null,     Dish photo URL; placeholder shown if null
 *   index:    number,          Stack position — 0 is the front card
 *   onSwiped: function,        (direction: 'left'|'right') => void
 *   onTap:    function,        () => void
 * }} props
 */
export default function RecipeCard({ recipe, imageUrl, index, onSwiped, onTap, matchScore = null }) {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  // Keep a ref so the Reanimated worklet always calls the *current* onSwiped,
  // not the value captured when the gesture was first created (which would be
  // undefined for cards that start as back-stack cards and later become front).
  const onSwipedRef = useRef(onSwiped);
  onSwipedRef.current = onSwiped;
  const dispatchSwiped = useCallback((direction) => {
    onSwipedRef.current?.(direction);
  }, []);

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotate.value = event.translationX / 12; // subtle tilt while dragging
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        const direction = event.translationX > 0 ? 'right' : 'left';
        const target = event.translationX > 0 ? 500 : -500;
        translateX.value = withTiming(
          target,
          { duration: 220, easing: Easing.out(Easing.ease) },
          () => { runOnJS(dispatchSwiped)(direction); },
        );
      } else {
        // Snap back to centre
        translateX.value = withSpring(0, { damping: 18 });
        rotate.value = withSpring(0, { damping: 18 });
      }
    });

  // Tap fires only when finger lifts with minimal movement (maxDistance default ~20px).
  // Race ensures pan wins on a real swipe (movement triggers pan before tap completes).
  const tap = Gesture.Tap()
    .onEnd(() => {
      if (onTap) runOnJS(onTap)();
    });

  const gesture = Gesture.Race(tap, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* Inner clip so the image respects border radius without killing the shadow */}
        <View style={styles.cardClip}>
          {/* Dish image */}
          {imageUrl ? (
            <>
              <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
              <Text style={styles.attribution}>Photo by Unsplash</Text>
            </>
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]} />
          )}

          {/* Match score badge — only shown when a taste profile exists */}
          {matchScore !== null && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>{matchScore}% match</Text>
            </View>
          )}

          {/* Recipe details */}
          <View style={styles.body}>
            <Text style={styles.name} numberOfLines={2}>
              {recipe.name}
            </Text>

            <Text style={styles.description} numberOfLines={3}>
              {recipe.description}
            </Text>

            {/* Tag chips */}
            <View style={styles.tagRow}>
              {recipe.tags.slice(0, 4).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Time + servings */}
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>⏱ {recipe.estimatedTime}</Text>
              <Text style={styles.metaText}>🍽 {recipe.servings} servings</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.border,
    // Shadow lives here (not on cardClip) so overflow:hidden doesn't suppress it.
    shadowColor: THEME.cardShadow.shadowColor,
    shadowOffset: THEME.cardShadow.shadowOffset,
    shadowOpacity: THEME.cardShadow.shadowOpacity,
    shadowRadius: THEME.cardShadow.shadowRadius,
    elevation: THEME.cardShadow.elevation,
  },
  cardClip: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 220,
  },
  imagePlaceholder: {
    backgroundColor: '#e9e9e9',
  },
  body: {
    padding: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: THEME.accentBg,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: THEME.accent,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metaText: {
    fontSize: 13,
    color: '#888',
  },
  attribution: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'right',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  matchBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  matchBadgeText: {
    color: THEME.accent,
    fontSize: 13,
    fontWeight: '700',
  },
});
