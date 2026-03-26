import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

/**
 * Reusable error display shown whenever an external request fails.
 *
 * @param {{ message?: string, onRetry: () => void }} props
 */
export default function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        {message || 'Something went wrong. Please try again.'}
      </Text>
      <Pressable
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        onPress={onRetry}
      >
        <Text style={styles.buttonText}>Try Again</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fafafa',
  },
  message: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  button: {
    backgroundColor: '#222',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  buttonPressed: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
