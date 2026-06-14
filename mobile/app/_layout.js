import { Stack } from 'expo-router';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Modal, ScrollView, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StarField from '../components/StarField';
import LoadingSpinner from '../components/LoadingSpinner';
import { X, Volume2, Lightbulb, Info, Zap, Bookmark } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { BASE_URL } from '../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const themes = {
  amoled: { name: 'Space AMOLED', bg: '#000000', card: '#121212', border: '#1e293b', accent: '#3b82f6', text: '#ffffff', subText: '#94a3b8', isSpace: true },
  verdant: { name: 'Verdant Luxe', bg: '#022c22', card: '#064e3b', border: '#065f46', accent: '#10b981', text: '#ecfdf5', subText: '#6ee7b7' },
  crimson: { name: 'Crimson Royal', bg: '#450a0a', card: '#7f1d1d', border: '#991b1b', accent: '#ef4444', text: '#fef2f2', subText: '#fca5a5' },
  bubblegum: { name: 'Bubblegum', bg: '#fdf2f8', card: '#ffffff', border: '#f472b6', accent: '#db2777', text: '#831843', subText: '#be185d' },
  sky: { name: 'Sky High', bg: '#f0f9ff', card: '#ffffff', border: '#7dd3fc', accent: '#0284c7', text: '#0c4a6e', subText: '#0369a1' },
  white: { name: 'Pure White', bg: '#f8fafc', card: '#ffffff', border: '#e2e8f0', accent: '#2563eb', text: '#0f172a', subText: '#64748b' }
};

const avatars = [
  '🐶', '🐱', '🦊', '🦁', '🦉', '🦄', '🦖', '🚀', '👽', '🐳'
];

const AppContext = createContext({
  themeKey: 'amoled',
  activeTheme: themes.amoled,
  setTheme: () => {},
  user: null,
  setUser: () => {},
  handleTapWord: () => {},
  bookmarks: [],
  setBookmarks: () => {},
  avatar: '🚀',
  setAvatar: () => {}
});

export const useApp = () => useContext(AppContext);

export default function RootLayout() {
  const [themeKey, setThemeKey] = useState('amoled');
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [selectedWordData, setSelectedWordData] = useState(null);
  const [tappingLoading, setTappingLoading] = useState(false);
  const [avatar, setAvatarState] = useState('🚀');

  const activeTheme = themes[themeKey];

  useEffect(() => {
    const init = async () => {
      const savedTheme = await AsyncStorage.getItem('vortex_theme');
      if (savedTheme && themes[savedTheme]) setThemeKey(savedTheme);
      
      const savedUser = await AsyncStorage.getItem('vortex_user');
      const email = await AsyncStorage.getItem('userEmail');
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Fetch latest data from server
        if (email && !email.startsWith('guest_')) {
          try {
            const res = await fetch(`${BASE_URL}/api/user?email=${email}`);
            const data = await res.json();
            if (res.ok) {
              setUser(data);
              if (data.bookmarks) {
                setBookmarks(data.bookmarks);
                await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(data.bookmarks));
              }
            }
          } catch (e) {
            console.error("Failed to fetch user data on init:", e);
          }
        }
      }

      const savedBookmarks = await AsyncStorage.getItem('vortex_bookmarks');
      if (savedBookmarks && bookmarks.length === 0) setBookmarks(JSON.parse(savedBookmarks));

      const savedAvatar = await AsyncStorage.getItem('vortex_avatar');
      if (savedAvatar) setAvatarState(savedAvatar);
    };
    init();
  }, []);

  const setTheme = async (key) => {
    setThemeKey(key);
    await AsyncStorage.setItem('vortex_theme', key);
  };

  const setAvatar = async (emoji) => {
    setAvatarState(emoji);
    await AsyncStorage.setItem('vortex_avatar', emoji);
  };

  const handleTapWord = useCallback(async (word) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
    if (!cleanWord) return;
    
    setTappingLoading(true);
    try {
      const level = (await AsyncStorage.getItem('userLevel')) || 'A2';
      const response = await fetch(`${BASE_URL}/api/word`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer DUMMY_TEST_TOKEN_LONG_ENOUGH'
        },
        body: JSON.stringify({ word: cleanWord, level })
      });
      const data = await response.json();
      setSelectedWordData(data);
    } catch (err) {
      setSelectedWordData({ word: cleanWord, bengaliDefinition: "Error loading detail", drills: [] });
    } finally {
      setTappingLoading(false);
    }
  }, []);

  const addBookmark = async (word) => {
    if (!bookmarks.includes(word)) {
      const next = [...bookmarks, word];
      setBookmarks(next);
      await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(next));
      
      // Sync to server if user is logged in
      try {
        const email = await AsyncStorage.getItem('userEmail');
        if (email && !email.startsWith('guest_')) {
          await fetch(`${BASE_URL}/api/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email, 
              googleId: user?.googleId || 'synced-user', // Fallback or use real ID
              bookmarks: next 
            })
          });
        }
      } catch (e) {
        console.error("Failed to sync bookmark to server:", e);
      }
    }
    setSelectedWordData(null);
  };

  const speak = (w) => {
    if (!w) return;
    Speech.speak(w, { language: 'en-US', pitch: 1.0, rate: 0.9 });
  };

  return (
    <AppContext.Provider value={{ themeKey, activeTheme, setTheme, themes, user, setUser, handleTapWord, bookmarks, setBookmarks, avatar, setAvatar, avatars }}>
      <View style={{ flex: 1, backgroundColor: activeTheme.bg }}>
        {activeTheme.isSpace && <StarField />}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/onboarding" />
          <Stack.Screen name="(tabs)" />
        </Stack>

        {/* Global Word Insight Modal */}
        <Modal visible={!!selectedWordData || tappingLoading} transparent animationType="slide">
          <View style={styles.modalOverlay}>
             <MotiView from={{ translateY: 300, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} style={[styles.detailModal, { backgroundColor: activeTheme.card, borderColor: activeTheme.accent }]}>
                {tappingLoading ? (
                  <View style={styles.modalLoader}><LoadingSpinner activeTheme={activeTheme} text="FETCHING INSIGHTS..." /></View>
                ) : (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.modalHeaderInner}>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={[styles.modalWord, { color: activeTheme.text }]}>{selectedWordData?.word}</Text>
                          <TouchableOpacity onPress={() => speak(selectedWordData?.word)} style={styles.modalSpeakerBtn}>
                            <Volume2 size={32} color={activeTheme.accent} />
                          </TouchableOpacity>
                        </View>
                        <Text style={[styles.modalPhonetic, { color: activeTheme.subText }]}>{selectedWordData?.phonetic} • {selectedWordData?.partOfSpeech}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setSelectedWordData(null)} style={[styles.modalClose, { backgroundColor: activeTheme.bg }]}><X size={24} color={activeTheme.text}/></TouchableOpacity>
                    </View>
                    
                    <View style={[styles.modalMeaningCard, { backgroundColor: activeTheme.bg, borderColor: activeTheme.border, borderWidth: 2 }]}><Text style={[styles.modalMeaning, { color: activeTheme.text }]}>{selectedWordData?.bengaliDefinition}</Text></View>
                    
                    <View style={styles.drillSection}>
                      <View style={styles.sectionLabel}><Lightbulb size={16} color={activeTheme.accent} /><Text style={[styles.sectionLabelText, { color: activeTheme.accent }]}>CONTEXTUAL DRILLS</Text></View>
                      {selectedWordData?.drills?.map((drill, i) => (
                        <View key={i} style={[styles.drillCard, { borderLeftColor: activeTheme.accent, backgroundColor: activeTheme.bg, borderColor: activeTheme.border, borderWidth: 1 }]}>
                          <Text style={[styles.drillSentence, { color: activeTheme.text }]}>
                            {drill.sentence.split(' ').map((w, j) => {
                              const isTarget = w.toLowerCase().includes(selectedWordData?.word?.toLowerCase());
                              return (
                                <Text 
                                  key={j} 
                                  onPress={() => handleTapWord(w)}
                                  style={isTarget ? { color: activeTheme.accent, fontWeight: '900', textDecorationLine: 'underline' } : {}}
                                >
                                  {w}{' '}
                                </Text>
                              );
                            })}
                          </Text>
                          <View style={styles.drillExplanationRow}>
                            <Info size={14} color={activeTheme.subText}/>
                            <Text style={[styles.drillExplanation, { color: activeTheme.subText }]}>{drill.explanation}</Text>
                          </View>
                        </View>
                      ))}
                    </View>

                    <View style={styles.modalActions}>
                      <TouchableOpacity onPress={() => setSelectedWordData(null)} style={[styles.modalBtn, { backgroundColor: activeTheme.accent, elevation: 8 }]}><Zap size={18} color="#fff" /><Text style={styles.modalBtnText}>GOT IT</Text></TouchableOpacity>
                      <TouchableOpacity onPress={() => addBookmark(selectedWordData?.word)} style={[styles.modalBtn, { backgroundColor: activeTheme.bg, borderWidth: 2, borderColor: activeTheme.accent }]}><Bookmark size={18} color={activeTheme.accent} /><Text style={[styles.modalBtnText, { color: activeTheme.text }]}>BOOKMARK</Text></TouchableOpacity>
                    </View>
                  </ScrollView>
                )}
             </MotiView>
          </View>
        </Modal>
      </View>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  detailModal: { 
    width: Platform.OS === 'web' ? Math.min(SCREEN_WIDTH * 0.9, 500) : '94%', 
    maxHeight: '90%', 
    borderRadius: 35, 
    padding: 25, 
    borderWidth: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20
  },
  modalLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  modalHeaderInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  modalWord: { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  modalSpeakerBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16 },
  modalPhonetic: { fontSize: 14, fontWeight: '700' },
  modalClose: { padding: 8, borderRadius: 12 },
  modalMeaningCard: { padding: 20, borderRadius: 25, marginBottom: 25 },
  modalMeaning: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  drillSection: { gap: 12, marginBottom: 30 },
  drillCard: { padding: 18, borderRadius: 20, borderLeftWidth: 6 },
  drillSentence: { fontSize: 16, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
  drillExplanationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  drillExplanation: { fontSize: 12, flex: 1, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 12, paddingBottom: 10 },
  modalBtn: { flex: 1, height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  modalBtnText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  sectionLabelText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
});
