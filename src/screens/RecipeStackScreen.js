import React, { useCallback, useEffect } from 'react';
import { Alert, Button, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import LoadingScreen from '../components/LoadingScreen';
import { THEME } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorState from '../components/ErrorState';
import SwipeStack from '../components/SwipeStack';
import { useAppContext } from '../context/AppContext';
import { fetchRecipes } from '../services/claudeService';
import { fetchBatchImages } from '../services/unsplashService';
import { addSeenIds, getSeenIds } from '../storage/seenList';
import { getRecipeCorpus, addToRecipeCorpus, getTfidfProfile, updateTfidfProfile } from '../storage/tfidfProfile';
import { cosineSimilarity } from '../utils/cosineSimilarity';
import { buildVocabulary, tfidf } from '../utils/tfidf';

/** Returns the text representation of a recipe used for TF-IDF vectorization. */
function buildRecipeText(recipe) {
  return `${recipe.name}. ${recipe.description}. Tags: ${recipe.tags.join(', ')}`;
}

export default function RecipeStackScreen({ route, navigation }) {
  const { photoBase64 } = route.params;

  const {
    currentBatch,
    setCurrentBatch,
    status,
    setStatus,
    errorMessage,
    setErrorMessage,
    tagProfile,
    updateTagProfile,
  } = useAppContext();

  /**
   * Fetches a fresh batch of 5 recipes + their dish images.
   * Uses the current tagProfile and seenIds so personalization and
   * deduplication are always up to date at call time.
   *
   * Called on mount and by SwipeStack.onBatchComplete when all 5 cards are swiped.
   */
  const loadBatch = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    setCurrentBatch(null);

    try {
      const seenIds = await getSeenIds();
      const recipes = await fetchRecipes(photoBase64, seenIds, tagProfile);
      const imageUrls = await fetchBatchImages(recipes);

      // Prefetch all dish images into the local cache so each card's photo
      // is ready the moment it becomes the front card. allSettled so a single
      // failed prefetch doesn't block the rest.
      await Promise.allSettled(imageUrls.filter(Boolean).map((url) => Image.prefetch(url)));

      // Compute TF-IDF match scores for this batch.
      let matchScores = recipes.map(() => null);
      try {
        const corpus = await getRecipeCorpus();
        const recipeTexts = recipes.map(buildRecipeText);
        await addToRecipeCorpus(recipeTexts);
        const updatedCorpus = [...corpus, ...recipeTexts];
        const profile = await getTfidfProfile();
        console.log('[RecipeStackScreen] tfidf profile:', profile === null ? 'null' : `count=${profile.count}, vocab_size=${profile.vocabulary.length}`);
        if (profile !== null) {
          const liveVocab = buildVocabulary(updatedCorpus);
          matchScores = recipeTexts.map((text) => {
            const liveVector = tfidf(text, updatedCorpus);
            const projected = profile.vocabulary.map((term) => {
              const idx = liveVocab.indexOf(term);
              return idx !== -1 ? liveVector[idx] : 0;
            });
            const cosine = cosineSimilarity(projected, profile.vector);
            return Math.max(0, Math.round(cosine * 100));
          });
        }
      } catch (err) {
        console.warn('[RecipeStackScreen] Failed to compute match scores:', err);
        matchScores = recipes.map(() => null);
      }

      const cards = recipes.map((recipe, i) => ({
        recipe,
        imageUrl: imageUrls[i] ?? null,
        matchScore: matchScores[i],
      }));

      // Record all 5 IDs before any swiping begins (T020).
      await addSeenIds(cards.map((c) => c.recipe.id));

      setCurrentBatch({ cards, index: 0 });
      setStatus('showing');
    } catch (err) {
      setErrorMessage(err.message ?? 'Failed to load recipes.');
      setStatus('error');
    }
  }, [photoBase64, tagProfile]);

  // Load the first batch when the screen mounts
  useEffect(() => {
    loadBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  // ── Error ─────────────────────────────────────────────────────────────────────

  if (status === 'error') {
    return <ErrorState message={errorMessage} onRetry={loadBatch} />;
  }

  // ── Stack ─────────────────────────────────────────────────────────────────────

  // TODO: remove debug button before release
  async function showDebugStorage() {
    const [tagProfileRaw, seenListRaw, tfidfRaw] = await Promise.all([
      AsyncStorage.getItem('@srp/tag_profile'),
      AsyncStorage.getItem('@srp/seen_list'),
      AsyncStorage.getItem('@srp/tfidf_profile'),
    ]);
    const tfidfProfile = JSON.parse(tfidfRaw ?? 'null');
    Alert.alert(
      'Debug Storage',
      `tag_profile:\n${tagProfileRaw ?? 'null'}\n\nseen_list:\n${seenListRaw ?? 'null'}\n\ntfidf_profile: count=${tfidfProfile?.count ?? 'none'}, vocab_size=${tfidfProfile?.vocabulary?.length ?? 0}`,
    );
  }

  if (status === 'showing' && currentBatch) {
    return (
      <View style={styles.container}>
        <View style={styles.stackGroup}>
        <View style={styles.retakeHeader}>
          <Pressable onPress={() => navigation.navigate('Camera')}>
            <Text style={styles.retakeText}>← Retake photo</Text>
          </Pressable>
        </View>
        <Button title="Debug Storage" onPress={showDebugStorage} />
        <View style={styles.swipeArea}>
          <SwipeStack
            // key resets SwipeStack's local currentIndex when a new batch loads
            key={currentBatch.cards[0].recipe.id}
            cards={currentBatch.cards}
            onSwipe={(recipeId, direction) => {
                const card = currentBatch?.cards.find((c) => c.recipe.id === recipeId);
                if (card) {
                  updateTagProfile(card.recipe.tags, direction);
                  if (direction === 'right') {
                    getRecipeCorpus().then((corpus) =>
                      updateTfidfProfile(buildRecipeText(card.recipe), corpus)
                    ).catch((err) =>
                      console.warn('[RecipeStackScreen] Failed to update TF-IDF profile:', err)
                    );
                  }
                }
              }}
            onBatchComplete={loadBatch} // auto-fetch when all 5 cards are swiped
            onTap={(cardIndex) =>        // wired in T023 (Phase 5)
              navigation.navigate('RecipeDetail', { recipeIndex: cardIndex })
            }
          />
        </View>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  stackGroup: {
    // Natural height — centered as one unit by the container.
  },
  swipeArea: {
    // Matches SwipeStack's fixed container height so the group size (and
    // therefore the header/button positions) never changes, even for the
    // brief render between the last card disappearing and the loading screen.
    height: 460,
  },
  retakeHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  retakeText: {
    color: THEME.accent,
    fontSize: 14,
    fontWeight: '600',
  },
});
