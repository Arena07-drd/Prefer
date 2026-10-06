import { NativeModules, Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Automatically detects the backend server IP:
 * - On a physical phone running Expo Go, it uses the IP address of the PC hosting Metro.
 * - On Android Emulator, it falls back to 10.0.2.2.
 * - On iOS Simulator or Web, it falls back to localhost.
 */
const getBackendHost = () => {
  // 1. Try React Native's NativeModules.SourceCode.scriptURL (points to Metro server on the PC)
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const host = scriptURL.split('://')[1]?.split('/')[0]?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  // 2. Try Expo Constants hostUri (Expo Go / Expo dev server)
  const hostUri = Constants.expoConfig?.hostUri 
    || Constants.manifest2?.extra?.expoClient?.hostUri 
    || Constants.manifest?.debuggerHost;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }

  // 3. Fallback for emulator vs simulator
  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
};

const host = getBackendHost();

const config = {
  API_URL: `http://${host}:5000/api/v1`,
};

export default config;
