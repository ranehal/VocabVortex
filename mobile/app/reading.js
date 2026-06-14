import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MotiView } from 'moti';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from './_layout';
import { Volume2, Bookmark, RotateCw, ChevronLeft } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../components/LoadingSpinner';
import { BASE_URL } from '../constants';

export default function Reading() {
  const { word, level } = useLocalSearchParams();
  const { activeTheme, handleTapWord } = useApp();
  const router = useRouter();
  
  const [currentStory, setCurrentStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const init = async () => {
      const b = await AsyncStorage.getItem('vortex_bookmarks');
      if (b) setBookmarks(JSON.parse(b));
      fetchStory();
    };
    init();
  }, []);

  const fetchStory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/word`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer DUMMY_TEST_TOKEN_LONG_ENOUGH'
        },
        body: JSON.stringify({ word, level })
      });
      const data = await response.json();
      setCurrentStory(data);
    } catch (err) {
      setCurrentStory({ word, story: "Vortex logic fail korsi... server check koren." });
    } finally {
      setLoading(false);
    }
  };

  const speak = (w) => {
    if (!w) return;
    Speech.speak(w, { language: 'en-US', pitch: 1.0, rate: 0.9 });
  };

  const addBookmark = async (w) => {
    const cleanWord = w.replace(/[.,!?;:]/g, '').trim();
    if (!bookmarks.includes(cleanWord)) {
      const next = [...bookmarks, cleanWord];
      setBookmarks(next);
      await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(next));
    }
    alert(`${cleanWord} bookmarked!`);
  };

  if (loading) return <View style={[styles.container, { backgroundColor: activeTheme.bg }]}><LoadingSpinner activeTheme={activeTheme} text="BREWING THE VORTEX..." /></View>;

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <ScrollView contentContainerStyle={styles.viewContainer} showsVerticalScrollIndicator={false}>
        <MotiView from={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.resultStack}>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={20} color={activeTheme.subText} />
            <Text style={{ color: activeTheme.subText, fontWeight: 'bold' }}>BACK</Text>
          </TouchableOpacity>

          <View style={[styles.dictionaryHeader, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
            <View style={styles.dictTop}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={[styles.dictWord, { color: activeTheme.text }]}>{currentStory?.word}</Text>
                <TouchableOpacity onPress={() => speak(currentStory?.word)} style={styles.speakerBtn} nativeID="tts-btn">
                  <Volume2 size={24} color={activeTheme.accent} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => addBookmark(currentStory?.word)} nativeID="add-to-vortex-btn"><Bookmark size={24} color={activeTheme.accent} /></TouchableOpacity>
            </View>
            <Text style={[styles.dictPhonetic, { color: activeTheme.subText }]}>{currentStory?.phonetic} • {currentStory?.partOfSpeech}</Text>
            <Text style={[styles.dictBengali, { color: activeTheme.text }]}>{currentStory?.bengaliDefinition}</Text>
          </View>

          <View style={[styles.storySection, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
            <Text style={[styles.sectionLabelText, { color: activeTheme.subText }]}>VORTEX PARAGRAPH (TAP ANY WORD)</Text>
            <Text style={[styles.wordFlow, { color: activeTheme.text }]} nativeID="story-text">
              {currentStory?.story?.split(' ').map((w, i) => {
                const isTarget = w.toLowerCase().includes(currentStory.word.toLowerCase());
                return (
                  <Text 
                    key={i} 
                    onPress={() => handleTapWord(w)}
                    nativeID={`word-span-${i}`}
                    style={[
                      styles.flowWord, 
                      isTarget ? { color: activeTheme.accent, fontWeight: '900', textDecorationLine: 'underline' } : { opacity: 0.8 }
                    ]}
                  >
                    {w}{' '}
                  </Text>
                );
              })}
            </Text>
          </View>
          
          <TouchableOpacity onPress={() => router.back()} style={[styles.nextBtn, { backgroundColor: activeTheme.accent }]}>
            <Text style={styles.nextBtnText}>BACK TO LAB</Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  viewContainer: { padding: 24, paddingTop: 60 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  resultStack: { gap: 20 },
  dictionaryHeader: { borderRadius: 32, padding: 32 },
  dictTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dictWord: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  speakerBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  dictPhonetic: { fontSize: 14, fontWeight: '700', marginBottom: 20 },
  dictBengali: { fontSize: 32, fontWeight: '900' },
  storySection: { borderRadius: 32, padding: 32 },
  sectionLabelText: { fontSize: 10, fontWeight: '900', opacity: 0.5, marginBottom: 15, letterSpacing: 1 },
  wordFlow: { fontSize: 20, lineHeight: 32 },
  flowWord: {},
  nextBtn: { height: 60, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 2 },
});
