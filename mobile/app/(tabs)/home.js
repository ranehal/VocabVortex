import { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Modal } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../_layout';
import { ChevronRight, RotateCw, Zap, Sparkles, Star, Palette, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS', 'TOEFL', 'GRE'];

const levelWordsMap = {
  'A1': ['Apple', 'Water', 'Friend', 'School', 'Happy'],
  'A2': ['Village', 'Journey', 'Kitchen', 'Famous', 'Simple'],
  'B1': ['Confident', 'Opportunity', 'Manage', 'Product', 'Discuss'],
  'B2': ['Analyze', 'Challenge', 'Consequence', 'Distinct', 'Flexible'],
  'C1': ['Acquaint', 'Beneficial', 'Coherent', 'Elaborate', 'Hypothesis'],
  'C2': ['Aesthetic', 'Benevolent', 'Conundrum', 'Epiphany', 'Ineffable'],
  'IELTS': ['Mitigate', 'Correlation', 'Substantial', 'Paradigm', 'Advocate'],
  'TOEFL': ['Interdependence', 'Biodiversity', 'Sediment', 'Stratosphere', 'Chronological'],
  'GRE': ['Alacrity', 'Bellicose', 'Capricious', 'Ephemeral', 'Loquacious']
};

export default function Home() {
  const { activeTheme, themes, themeKey, setTheme, bookmarks, handleTapWord } = useApp();
  const router = useRouter();
  const [level, setLevel] = useState('A2');
  const [inputWord, setInputWord] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [learned, setLearned] = useState([]);
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const l = await AsyncStorage.getItem('vortex_learned');
      if (l) setLearned(JSON.parse(l));
      refreshSuggestions('A2');
    };
    loadData();
  }, []);

  const refreshSuggestions = (currentLevel) => {
    const list = levelWordsMap[currentLevel || level];
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 8));
  };

  const wordOfTheDay = useMemo(() => {
    const words = ["Resilient", "Ephemeral", "Luminous", "Eloquent", "Sovereign"];
    return words[new Date().getDay() % words.length];
  }, []);

  const handleStart = async (wordToUse) => {
    const word = wordToUse || inputWord;
    if (!word) return;
    router.push({ pathname: '/reading', params: { word, level } });
  };

  const progressPercent = useMemo(() => {
    const total = bookmarks.length + learned.length;
    return total === 0 ? 0 : Math.round((learned.length / total) * 100);
  }, [bookmarks, learned]);

  return (
    <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: activeTheme.bg }]} showsVerticalScrollIndicator={false}>
      <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.viewContainer}>
        
        {/* Header with Theme Toggle */}
        <View style={styles.headerRow}>
           <MotiView 
            from={{ translateY: -20, opacity: 0 }} 
            animate={{ translateY: 0, opacity: 1 }}
            style={[styles.wotdMiniCard, { backgroundColor: activeTheme.accent }]}
            >
                <Sparkles size={12} color="#fff" />
                <Text style={styles.wotdMiniLabel}>WORD OF DAY: {wordOfTheDay.toUpperCase()}</Text>
            </MotiView>
            <TouchableOpacity 
                onPress={() => setShowThemePicker(true)} 
                style={[styles.themeBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}
                nativeID="theme-toggle"
            >
                <Palette size={20} color={activeTheme.accent} />
            </TouchableOpacity>
        </View>

        <View style={[styles.heroCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
          <Text style={[styles.heroTitle, { color: activeTheme.text }]}>Step into{"\n"}<Text style={{ color: activeTheme.accent }}>the Vortex</Text></Text>

          <View style={styles.levelRow} nativeID="level-selector">
            {levels.map(lvl => (
              <TouchableOpacity 
                key={lvl} 
                onPress={() => { setLevel(lvl); refreshSuggestions(lvl); }} 
                style={[styles.levelBtn, level === lvl ? { backgroundColor: activeTheme.accent } : { borderColor: activeTheme.border, borderWidth: 1, opacity: 0.5 }]}
                testID={`level-btn-${lvl}`}
                nativeID={`level-btn-${lvl}`}
              >
                <Text style={[styles.levelBtnText, { color: level === lvl ? '#fff' : activeTheme.text }]}>{lvl}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.suggestionSection}>
            <View style={styles.suggestHeader}>
              <Text style={[styles.suggestLabel, { color: activeTheme.subText }]}>LEVEL SUGGESTIONS</Text>
              <TouchableOpacity onPress={() => refreshSuggestions()} nativeID="randomize-suggestions-btn"><RotateCw size={12} color={activeTheme.subText} /></TouchableOpacity>
            </View>
            <View style={styles.pillContainer} nativeID="suggestions-list">
              {suggestions.map((w, i) => (
                <TouchableOpacity key={i} onPress={() => setInputWord(w)} style={[styles.pill, { backgroundColor: activeTheme.bg, borderColor: activeTheme.border, borderWidth: 1 }]} testID={`suggestion-word-${i}`} nativeID={`suggestion-word-${i}`}>
                  <Text style={[styles.pillText, { color: activeTheme.text }]}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput 
              style={[styles.input, { color: activeTheme.text, backgroundColor: activeTheme.bg, borderColor: activeTheme.border, borderWidth: 1 }]} 
              placeholder="What word today?" 
              placeholderTextColor={activeTheme.subText}
              value={inputWord} 
              onChangeText={setInputWord} 
              nativeID="word-input"
            />
            <TouchableOpacity onPress={() => handleStart()} style={[styles.exploreBtn, { backgroundColor: activeTheme.accent }]} nativeID="explore-btn"><ChevronRight size={24} color="#fff" /></TouchableOpacity>
          </View>
        </View>

        <View style={[styles.dashboardCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
          <View style={styles.dashboardHeader}>
            <Zap size={18} color={activeTheme.accent} />
            <Text style={[styles.dashboardTitle, { color: activeTheme.subText }]}>MASTERY DASHBOARD</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: activeTheme.bg }]}>
              <MotiView from={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={[styles.progressFill, { backgroundColor: activeTheme.accent }]} />
            </View>
            <Text style={[styles.progressText, { color: activeTheme.text }]} nativeID="queue-count">{bookmarks.length}</Text>
            <Text style={[styles.progressSubText, { color: activeTheme.subText }]}>Words in Vortex Queue</Text>
          </View>
        </View>

        {/* Theme Picker Modal */}
        <Modal visible={showThemePicker} transparent animationType="fade">
            <View style={styles.modalOverlay}>
                <MotiView from={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={[styles.modalContent, { backgroundColor: activeTheme.bg }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: activeTheme.text }]}>CHOOSE UNIVERSE</Text>
                        <TouchableOpacity onPress={() => setShowThemePicker(false)} id="close-theme-picker"><X size={24} color={activeTheme.text} /></TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.themeGrid}>
                        {Object.entries(themes).map(([k, t]) => (
                            <TouchableOpacity 
                                key={k} 
                                onPress={() => { setTheme(k); setShowThemePicker(false); }} 
                                style={[styles.themeCard, { backgroundColor: t.bg, borderColor: themeKey === k ? t.accent : activeTheme.border }]}
                                nativeID={`theme-option-${k}`}
                            >
                                <View style={[styles.colorDot, { backgroundColor: t.accent }]} />
                                <Text style={[styles.themeLabel, { color: t.text }]}>{t.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </MotiView>
            </View>
        </Modal>

      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 150 },
  viewContainer: { padding: 24, paddingTop: 60 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  wotdMiniCard: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15 },
  wotdMiniLabel: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  themeBtn: { padding: 10, borderRadius: 12, borderWidth: 1 },
  heroCard: { borderRadius: 32, padding: 32, marginBottom: 20 },
  heroTitle: { fontSize: 36, fontWeight: '900', marginBottom: 24, textTransform: 'uppercase' },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  levelBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  levelBtnText: { fontSize: 10, fontWeight: '900' },
  suggestionSection: { marginBottom: 24 },
  suggestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  suggestLabel: { fontSize: 8, fontWeight: '900', opacity: 0.4, letterSpacing: 1 },
  pillContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25 },
  pillText: { fontSize: 12, fontWeight: '800' },
  inputWrapper: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 20, height: 60, fontSize: 16, fontWeight: '700' },
  exploreBtn: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  dashboardCard: { borderRadius: 32, padding: 24 },
  dashboardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  dashboardTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  progressContainer: { marginBottom: 20 },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 5 },
  progressText: { fontSize: 32, fontWeight: '900' },
  progressSubText: { fontSize: 10, fontWeight: '700', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', borderRadius: 30, padding: 25, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  themeCard: { width: '48%', padding: 15, borderRadius: 15, borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  themeLabel: { fontSize: 11, fontWeight: 'bold' }
});
