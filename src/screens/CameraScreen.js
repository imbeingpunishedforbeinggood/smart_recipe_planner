import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import { THEME } from '../constants/theme';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LoadingScreen from '../components/LoadingScreen';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [capturing, setCapturing] = useState(false);

  if (capturing) return <LoadingScreen />;

  // Permission still loading
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          Camera access is required to photograph your ingredients.
        </Text>
        <Pressable style={styles.grantButton} onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        exif: false,
      });
      navigation.navigate('RecipeStack', {
        photoUri: photo.uri,
        photoBase64: photo.base64,
      });
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Text style={styles.appTitle}>Snap {'&'} Cook</Text>
          <Text style={styles.hint}>Point at your ingredients</Text>
          <Pressable
            style={[
              styles.captureButton,
              capturing && styles.captureButtonDisabled,
            ]}
            onPress={handleCapture}
            disabled={capturing}
          >
            <View style={styles.captureInner} />
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 52,
  },
  appTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  hint: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    marginBottom: 28,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: THEME.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.accent,
  },
  permissionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  grantButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 10,
  },
  grantButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
