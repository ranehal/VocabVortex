import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from './_layout';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { User as UserIcon, Zap } from 'lucide-react-native';
import { BASE_URL, GOOGLE_WEB_CLIENT_ID } from '../constants';

WebBrowser.maybeCompleteAuthSession();

export default function SplashScreen() {
  const router = useRouter();
  const { activeTheme, setUser, setBookmarks } = useApp();
  const [checking, setChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoName, setDemoName] = useState('');

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_WEB_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken || response.params?.id_token || null;
      const accessToken = response.authentication?.accessToken || response.params?.access_token || null;
      if (idToken || accessToken) {
        handleGoogleLogin(idToken, accessToken);
      } else {
        alert("Google Login failed: No token received. Try Demo Login instead.");
      }
    } else if (response?.type === 'error') {
      alert("Google Auth Error: " + (response.error?.message || "Unknown. Try Demo Login instead."));
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

  const handleGoogleLogin = async (idToken, accessToken) => {
    setAuthLoading(true);
    try {
      console.log("Logging in with backend:", `${BASE_URL}/api/auth/google`);
      const res = await fetch(`${BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, accessToken })
      });
      const data = await res.json();
      
      if (res.ok) {
        // Sync local bookmarks to account
        const localBookmarks = await AsyncStorage.getItem('vortex_bookmarks');
        const bookmarksArray = localBookmarks ? JSON.parse(localBookmarks) : [];
        
        const syncRes = await fetch(`${BASE_URL}/api/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.sessionToken}`,
          },
          body: JSON.stringify({
            email: data.user.email,
            name: data.user.name,
            picture: data.user.picture,
            googleId: data.user.googleId,
            bookmarks: bookmarksArray
          })
        });
        const syncedUser = await syncRes.json();
        const finalUser = syncRes.ok ? syncedUser : data.user;

        await AsyncStorage.setItem('vortex_session', data.sessionToken);
        await AsyncStorage.setItem('vortex_user', JSON.stringify(finalUser));
        await AsyncStorage.setItem('userEmail', finalUser.email);
        await AsyncStorage.setItem('userName', finalUser.name);
        
        if (finalUser.bookmarks) {
          await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(finalUser.bookmarks));
          setBookmarks(finalUser.bookmarks);
        }
        
        setUser(finalUser);
        
        const name = await AsyncStorage.getItem('userName');
        if (name) router.replace('/home');
        else router.replace('/onboarding');
      } else {
        alert("Server Auth Failed: " + (data.error || "Unknown error") + (data.detail ? "\n\n" + data.detail : ""));
      }
    } catch (e) {
      console.error("Auth fetch failed:", e);
      alert("Auth failed. Backend unreachable at " + BASE_URL);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    router.replace('/onboarding');
  };

  const handleDemoLogin = async () => {
    const name = demoName.trim() || 'Demo User';
    setShowDemoModal(false);
    setAuthLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('vortex_session', data.sessionToken);
        await AsyncStorage.setItem('vortex_user', JSON.stringify(data.user));
        await AsyncStorage.setItem('userEmail', data.user.email);
        await AsyncStorage.setItem('userName', data.user.name);
        setUser(data.user);
        router.replace('/home');
      } else {
        alert('Demo login failed: ' + (data.error || 'Unknown error'));
      }
    } catch (e) {
      alert('Demo login failed. Server unreachable at ' + BASE_URL);
    } finally {
      setAuthLoading(false);
    }
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
             onPress={() => setShowDemoModal(true)}
             style={[styles.loginBtn, { backgroundColor: activeTheme.accent }]}
             disabled={authLoading}
           >
             {authLoading ? <ActivityIndicator color="#fff" /> : <Zap color="#fff" size={20} />}
             <Text style={styles.loginText}>{authLoading ? "Signing in..." : "Quick Demo Login"}</Text>
           </TouchableOpacity>
           <TouchableOpacity
             onPress={() => promptAsync()}
             style={[styles.googleBtn, { borderColor: activeTheme.border }]}
             disabled={authLoading}
           >
             <UserIcon color={activeTheme.subText} size={18} />
             <Text style={[styles.googleBtnText, { color: activeTheme.subText }]}>Sign in with Google</Text>
           </TouchableOpacity>
           <TouchableOpacity
             onPress={handleGuestLogin}
             style={styles.guestBtn}
             disabled={authLoading}
             nativeID="guest-login-btn"
           >
             <Text style={{ color: activeTheme.subText, fontSize: 13 }}>Continue as Guest</Text>
           </TouchableOpacity>
        </MotiView>
      )}

      <Modal visible={showDemoModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <MotiView from={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={[styles.demoModal, { backgroundColor: activeTheme.card, borderColor: activeTheme.accent }]}>
            <Text style={[styles.demoTitle, { color: activeTheme.text }]}>Enter Your Name</Text>
            <TextInput
              style={[styles.demoInput, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.bg }]}
              placeholder="e.g. Professor Rahman"
              placeholderTextColor={activeTheme.subText}
              value={demoName}
              onChangeText={setDemoName}
              autoFocus
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity onPress={() => setShowDemoModal(false)} style={[styles.demoBtn, { backgroundColor: activeTheme.bg, borderWidth: 1, borderColor: activeTheme.border }]}>
                <Text style={{ color: activeTheme.subText, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDemoLogin} style={[styles.demoBtn, { backgroundColor: activeTheme.accent, flex: 1 }]}>
                <Text style={{ color: '#fff', fontWeight: '900' }}>Enter Vortex</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      </Modal>
      
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
  authBox: { position: 'absolute', bottom: 100, width: '85%', alignItems: 'center', gap: 12 },
  loginBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 30, paddingVertical: 16, borderRadius: 25, elevation: 5, width: '100%', justifyContent: 'center' },
  loginText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 25, borderWidth: 1.5, width: '100%', justifyContent: 'center' },
  googleBtnText: { fontWeight: '700', fontSize: 14 },
  guestBtn: { padding: 8 },
  footer: { position: 'absolute', bottom: 40 },
  footerText: { fontSize: 12, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  demoModal: { width: '100%', borderRadius: 28, padding: 24, borderWidth: 2, gap: 16 },
  demoTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center' },
  demoInput: { borderWidth: 1.5, borderRadius: 16, padding: 14, fontSize: 16, fontWeight: '600' },
  demoBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }
});
