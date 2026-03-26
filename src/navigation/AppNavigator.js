import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Screen files are created in Phase 3 (US1) and Phase 5 (US3).
// The navigator is registered here so the full route tree is defined
// before any screen implementation begins.
import CameraScreen from '../screens/CameraScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import RecipeStackScreen from '../screens/RecipeStackScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Camera"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="RecipeStack" component={RecipeStackScreen} />
          <Stack.Screen
            name="RecipeDetail"
            component={RecipeDetailScreen}
            options={{ headerShown: true, title: 'Recipe' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
