import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animations/Cooking.json')}
        autoPlay
        loop
        style={styles.animation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFAF7',
  },
  animation: {
    width: 240,
    height: 240,
    backgroundColor: 'transparent',
  },
});
