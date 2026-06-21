import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the machine's IP address for Android emulator/real device
const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

// On web: use the same hostname the browser used to open the app.
// This handles phone browsers accessing via IP (e.g. http://192.168.x.x:8081).
const webHost = typeof window !== 'undefined'
  ? window.location.hostname
  : 'localhost';

export const BASE_URL = Platform.OS === 'web'
  ? `http://${webHost}:3000`
  : `http://${localhost}:3000`;

export const GOOGLE_WEB_CLIENT_ID = "373930632450-c021sic727j75777v9s0k3ne58t9hohf.apps.googleusercontent.com";
