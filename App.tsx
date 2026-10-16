import React from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

// Warm Orange & Beige Theme for TaFo
export const tafoTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF6B35', // Vibrant Warm Orange
    onPrimary: '#FFFFFF',
    primaryContainer: '#FFEAD9', // Soft Peach Beige
    onPrimaryContainer: '#662400',
    secondary: '#D97736', // Warm Amber Terracotta
    onSecondary: '#FFFFFF',
    secondaryContainer: '#F7E7D9',
    onSecondaryContainer: '#4D2408',
    background: '#FAF5EE', // Warm Cream Beige
    onBackground: '#2B1F17', // Deep Warm Espresso
    surface: '#FFFFFF', // Crisp White Card
    onSurface: '#2B1F17',
    surfaceVariant: '#F3E8DC', // Warm Sand Beige
    onSurfaceVariant: '#6E5F53', // Muted Warm Charcoal
    outline: '#E3D4C4', // Soft warm divider
    error: '#D9381E',
    onError: '#FFFFFF',
    errorContainer: '#FDEAE7',
    onErrorContainer: '#7A1A0C',
    elevation: {
      level0: 'transparent',
      level1: '#FFFFFF',
      level2: '#FCF9F5',
      level3: '#FAF5EE',
      level4: '#F6EFE6',
      level5: '#F2E8DC',
    },
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={tafoTheme}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
