import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import RecipeCard from './RecipeCard';

// Depth constants — tweak here to adjust the whole stack at once.
//
// Direction: back cards are positioned HIGHER than the front card so their top
// edges peek above it — the same way a physical deck of cards looks when held.
const OFFSET_Y = 8; // px each back card rises above the one in front of it

/**
 * Renders an ordered stack of RecipeCards with the front card on top.
 *
 * Phase 4 (T019): wires onSwiped from the front card to advance currentIndex;
 * calls onBatchComplete when all cards have been swiped.
 *
 * @param {{
 *   cards:           object[],
 *   onSwipe:         (recipeId: string, direction: 'left'|'right') => void,
 *   onBatchComplete: () => void,
 *   onTap:           (index: number) => void,
 * }} props
 */
export default function SwipeStack({ cards, onSwipe, onBatchComplete, onTap }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Trigger auto-fetch once all cards have been swiped.
  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length) {
      onBatchComplete?.();
    }
  }, [currentIndex, cards.length, onBatchComplete]);

  const visibleCards = cards.slice(currentIndex);

  if (visibleCards.length === 0) {
    return null;
  }

  // Render from back to front so the front card sits on top in DOM order
  // (zIndex also enforces this explicitly).
  return (
    <View style={styles.container}>
      {[...visibleCards].reverse().map((card, reversedIdx) => {
        const stackIndex = visibleCards.length - 1 - reversedIdx; // 0 = front card
        const isFront = stackIndex === 0;

        return (
          <View
            key={card.recipe.id}
            style={[
              styles.cardSlot,
              {
                zIndex: 10 - stackIndex,
                // Back cards (higher stackIndex) get a SMALLER top value so they
                // sit higher in the container and their top edge peeks above the
                // front card.
                top: (visibleCards.length - 1 - stackIndex) * OFFSET_Y,
              },
            ]}
          >
            <RecipeCard
              recipe={card.recipe}
              imageUrl={card.imageUrl}
              index={stackIndex}
              matchScore={card.matchScore ?? null}
              // Only the front card handles swipe gestures to avoid ghost swipes.
              onSwiped={isFront ? (direction) => {
                onSwipe?.(card.recipe.id, direction);
                setCurrentIndex((prev) => prev + 1);
              } : undefined}
              onTap={() => onTap?.(currentIndex + stackIndex)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Height = front card (~400px) + front card offset (4 × 8px = 32px) + breathing room.
    height: 460,
    alignSelf: 'stretch',
  },
  cardSlot: {
    // Absolutely positioned so cards overlay each other.
    position: 'absolute',
    left: 0,
    right: 0,
  },
});
