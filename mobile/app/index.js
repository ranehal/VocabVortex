import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './_layout';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { User as UserIcon } from 'lucide-react-native';

const BASE_URL = 'http://localhost:3000';

WebBrowser.maybeCompleteAuthSession();

export default function SplashScreen() {
  const router = useRouter();
  const { activeTheme, setUser } = useApp();
  const [checking, setChecking] = useState(true);

  // We define the redirect URI explicitly to avoid mismatches
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'vocab-vortex',
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    webClientId: "373930632450-c021sic727j75777v9s0k3ne58t9hohf.apps.googleusercontent.com",
    redirectUri: Platform.OS === 'web' ? 'http://localhost:8081' : redirectUri,
  });

  useEffect(() => {
    if (request) {
      console.log("👉 Requested Redirect URI:", redirectUri);
    }
  }, [request]);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleLogin(authentication.idToken);
    }
  }, [response]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('vortex_session');
      const name = await AsyncStorage.getItem('userName');
      
      // Artificial delay for splash vibe
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (token && name) {
        router.replace('/home');
      } else {
        setChecking(false);
      }
    };
    checkAuth();
  }, []);

  const handleGoogleLogin = async (idToken) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('vortex_session', data.sessionToken);
        await AsyncStorage.setItem('vortex_user', JSON.stringify(data.user));
        setUser(data.user);
        
        const name = await AsyncStorage.getItem('userName');
        if (name) router.replace('/home');
        else router.replace('/onboarding');
      }
    } catch (e) {
      alert("Auth failed. Check backend.");
    }
  };

  const handleGuestLogin = async () => {
    // Just route to onboarding, it now handles demo population on finish
    router.replace('/onboarding');
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <MotiView
        from={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 1500 }}
        style={styles.logoContainer}
      >
        <Text style={[styles.logoText, { color: activeTheme.text }]}>
          VOCAB<Text style={{ color: activeTheme.accent }}>VORTEX</Text>
        </Text>
        <MotiView
          animate={{ rotate: '360deg' }}
          transition={{ loop: true, repeat: Infinity, duration: 4000, type: 'timing' }}
          style={[styles.ring, { borderColor: activeTheme.accent }]}
        />
      </MotiView>

      {!checking && (
        <MotiView from={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.authBox}>
           <TouchableOpacity 
             onPress={() => promptAsync()} 
             style={[styles.loginBtn, { backgroundColor: activeTheme.accent }]}
           >
             <UserIcon color="#fff" size={20} />
             <Text style={styles.loginText}>Sign in with Google</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             onPress={handleGuestLogin} 
             style={styles.guestBtn}
           >
             <Text style={{ color: activeTheme.subText }}>Continue as Guest</Text>
           </TouchableOpacity>
        </MotiView>
      )}
      
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: 500 }}
        style={styles.footer}
      >
        <Text style={[styles.footerText, { color: activeTheme.subText }]}>
          Brewing your vocabulary...
        </Text>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoContainer: { alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 42, fontWeight: '900', letterSpacing: -2 },
  ring: { position: 'absolute', width: 150, height: 150, borderRadius: 75, borderWidth: 2, borderStyle: 'dashed', opacity: 0.3 },
  authBox: { position: 'absolute', bottom: 120, width: '100%', alignItems: 'center', gap: 15 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 30, paddingVertical: 18, borderRadius: 25, elevation: 5 },
  loginText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  guestBtn: { padding: 10 },
  footer: { position: 'absolute', bottom: 50 },
  footerText: { fontSize: 14, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' }
});
