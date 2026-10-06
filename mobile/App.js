import React from 'react';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import RootNavigator from './src/navigation/RootNavigator.js';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1677ff',
    secondary: '#52c41a'
  }
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider 
        theme={theme}
        settings={{
          icon: props => <MaterialCommunityIcons {...props} />,
        }}
      >
        <StatusBar style="auto" />
        <RootNavigator />
        <Toast />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
