import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { THEME } from '../constants/theme';
import { useAppContext } from '../context/AppContext';

export default function RecipeDetailScreen({ route }) {
  const { recipeIndex } = route.params;
  const { currentBatch } = useAppContext();

  const card = currentBatch?.cards[recipeIndex];

  if (!card) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackText}>Recipe not available.</Text>
      </View>
    );
  }

  const { recipe, imageUrl } = card;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* Dish image */}
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      {/* Title + meta */}
      <View style={styles.section}>
        <Text style={styles.name}>{recipe.name}</Text>
        <Text style={styles.description}>{recipe.description}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>⏱ {recipe.estimatedTime}</Text>
          <Text style={styles.metaText}>🍽 {recipe.servings} servings</Text>
        </View>

        {/* Tag chips */}
        <View style={styles.tagRow}>
          {recipe.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Ingredients */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Ingredients</Text>
        {recipe.ingredients.map((ing, i) => (
          <View key={i} style={styles.ingredientRow}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.ingredientText}>
              <Text style={styles.ingredientQuantity}>{ing.quantity}</Text>
              {'  '}
              {ing.item}
            </Text>
          </View>
        ))}
      </View>

      {/* Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Instructions</Text>
        {recipe.steps.map((step, i) => (
          <View key={i} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{i + 1}.</Text>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  content: {
    paddingBottom: 40,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.background,
  },
  fallbackText: {
    fontSize: 16,
    color: '#888',
  },
  image: {
    width: '100%',
    height: 300,
  },
  imagePlaceholder: {
    backgroundColor: '#F5EDE5',
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.accent,
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 16,
    color: THEME.accent,
    marginRight: 8,
    lineHeight: 22,
  },
  ingredientText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  ingredientQuantity: {
    fontWeight: '600',
    color: '#555',
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.accent,
    marginRight: 10,
    lineHeight: 22,
    minWidth: 22,
  },
  stepText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
});
