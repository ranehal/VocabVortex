import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  SafeAreaView, 
  Dimensions,
  Platform,
  StatusBar as RNStatusBar
} from 'react-native';
import { 
  BookOpen, 
  ChevronRight, 
  Settings, 
  Zap, 
  Trash2, 
  Volume2, 
  Bookmark,
  RefreshCw,
  Star,
  Palette,
  Target,
  Trophy,
  X,
  Info,
  Lightbulb,
  RotateCw,
  Sparkles
} from 'lucide-react-native';
import { MotiView, MotiText, AnimatePresence } from 'moti';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Theme Configurations (Native Adapted) ---
const themes = {
  verdant: {
    name: 'Verdant Luxe',
    bg: '#051c14',
    card: 'rgba(6, 78, 59, 0.3)',
    accent: '#10b981',
    text: '#ecfdf5',
    subText: '#34d399',
    font: 'System',
  },
  crimson: {
    name: 'Crimson Royal',
    bg: '#1a0505',
    card: 'rgba(153, 27, 27, 0.3)',
    accent: '#dc2626',
    text: '#fef2f2',
    subText: '#f87171',
    font: 'System',
  },
  onyx: {
    name: 'Pure Onyx',
    bg: '#000000',
    card: 'rgba(39, 39, 42, 0.5)',
    accent: '#f4f4f5',
    text: '#f4f4f5',
    subText: '#71717a',
    font: 'System',
  },
  amethyst: {
    name: 'Royal Amethyst',
    bg: '#12051a',
    card: 'rgba(88, 28, 135, 0.3)',
    accent: '#a855f7',
    text: '#f5f3ff',
    subText: '#c084fc',
    font: 'System',
  },
  white: {
    name: 'Pure White',
    bg: '#f8fafc',
    card: '#ffffff',
    accent: '#2563eb',
    text: '#0f172a',
    subText: '#64748b',
    font: 'System',
  }
};

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

export default function App() {
  const [themeKey, setThemeKey] = useState('verdant');
  const [currentView, setCurrentView] = useState('home');
  const [level, setLevel] = useState('A2');
  const [inputWord, setInputWord] = useState('');
  const [trainerQueue, setTrainerQueue] = useState([]);
  const [currentStory, setCurrentStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const activeTheme = themes[themeKey];

  const refreshSuggestions = (currentLevel) => {
    const list = levelWordsMap[currentLevel || level];
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 5));
  };

  useEffect(() => {
    refreshSuggestions(level);
  }, [level]);

  const wordOfTheDay = useMemo(() => {
    const words = ["Resilient", "Ephemeral", "Luminous", "Eloquent", "Sovereign"];
    return words[new Date().getDay() % words.length];
  }, []);

  const handleStart = async (wordToUse) => {
    const word = wordToUse || inputWord;
    if (!word) return;
    
    setLoading(true);
    setCurrentView('reading');

    // In a real app, this would call our Next.js API
    // For now, using direct Gemini call like original App.jsx
    const apiKey = ""; // Should be in env, but keeping original logic
    const systemPrompt = `You are a VocabVortex AI mentor. Create educational content for the word "${word}" at ${level} level. 
    Return the response in JSON format:
    {
      "story": "A 4-sentence story using the word contextually.",
      "drills": [
        { "sentence": "A unique sentence using the word.", "explanation": "A deep insight into why this usage is effective." },
        ... (generate 6 drills)
      ],
      "bengaliDefinition": "Bengali meaning"
    }`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate content for: ${word}` }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });
      const result = await response.json();
      const data = JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text);
      setCurrentStory({ word, ...data });
    } catch (err) {
      setCurrentStory({ word, story: "Error generating content. Please check your connection.", drills: [] });
    } finally {
      setLoading(false);
      setInputWord('');
    }
  };

  const addToTrainer = (w) => {
    const cleanWord = w.replace(/[.,!?;:]/g, '');
    if (!trainerQueue.some(item => item.word.toLowerCase() === cleanWord.toLowerCase())) {
      setTrainerQueue([...trainerQueue, { word: cleanWord, level, id: Date.now() }]);
    }
    setSelectedWord(null);
    setSelectedDrill(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <StatusBar style={themeKey === 'white' ? 'dark' : 'light'} />
      
      {/* Vortex Aura Fallback */}
      <MotiView 
        from={{ rotate: '0deg' }}
        animate={{ rotate: '360deg' }}
        transition={{ loop: true, duration: 60000, type: 'timing' }}
        style={styles.vortexAura}
      />

      <View style={styles.header}>
        <MotiView from={{ translateX: -20, opacity: 0 }} animate={{ translateX: 0, opacity: 1 }}>
          <Text style={[styles.title, { color: activeTheme.text }]}>
            VOCAB<Text style={{ color: activeTheme.subText }}>VORTEX</Text>
          </Text>
          <Text style={[styles.tagline, { color: activeTheme.subText, opacity: 0.5 }]}>LANGUAGE LAB</Text>
        </MotiView>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => setShowThemePicker(true)} style={[styles.iconButton, { backgroundColor: activeTheme.card }]}>
            <Palette size={20} color={activeTheme.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <AnimatePresence exitBeforeEnter>
          {currentView === 'home' && (
            <MotiView 
              key="home" 
              from={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              style={styles.viewContainer}
            >
              <View style={[styles.heroCard, { backgroundColor: activeTheme.card, borderColor: 'rgba(255,255,255,0.05)' }]}>
                <Text style={[styles.heroTitle, { color: activeTheme.text }]}>Step into{"\n"}<Text style={{ color: activeTheme.subText }}>the Vortex</Text></Text>
                
                <View style={styles.levelContainer}>
                  {levels.map(lvl => (
                    <TouchableOpacity 
                      key={lvl} onPress={() => setLevel(lvl)}
                      style={[
                        styles.levelButton, 
                        { borderColor: activeTheme.text },
                        level === lvl ? { backgroundColor: activeTheme.accent, borderColor: activeTheme.accent } : { opacity: 0.3 }
                      ]}
                    >
                      <Text style={[styles.levelText, { color: level === lvl ? '#fff' : activeTheme.text }]}>{lvl}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.inputSection}>
                  <TextInput 
                    style={[styles.input, { color: activeTheme.text, backgroundColor: 'rgba(0,0,0,0.2)' }]}
                    placeholder="Enter or pick a word..."
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={inputWord}
                    onChangeText={setInputWord}
                  />
                  <TouchableOpacity 
                    onPress={() => handleStart()}
                    style={[styles.startBtn, { backgroundColor: activeTheme.accent }]}
                  >
                    <ChevronRight size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.suggestions}>
                  {suggestions.map((w, idx) => (
                    <TouchableOpacity 
                      key={idx} onPress={() => setInputWord(w)}
                      style={[styles.suggestionBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
                    >
                      <Text style={[styles.suggestionText, { color: activeTheme.text }]}>{w}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { backgroundColor: activeTheme.card }]}>
                  <RotateCw size={20} color={activeTheme.subText} />
                  <Text style={[styles.statValue, { color: activeTheme.text }]}>{trainerQueue.length}</Text>
                  <Text style={[styles.statLabel, { color: activeTheme.subText }]}>QUEUE</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setCurrentView('trainer')}
                  style={[styles.statCard, { backgroundColor: activeTheme.card }]}
                >
                  <Target size={20} color={activeTheme.subText} />
                  <Text style={[styles.statLabel, { color: activeTheme.subText, marginTop: 10 }]}>VORTEX</Text>
                </TouchableOpacity>
              </View>
            </MotiView>
          )}

          {currentView === 'reading' && (
            <MotiView key="reading" from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.viewContainer}>
              {loading ? (
                <View style={styles.loader}>
                  <RotateCw size={40} color={activeTheme.accent} />
                  <Text style={[styles.loaderText, { color: activeTheme.text }]}>Vortex Generation...</Text>
                </View>
              ) : (
                <View style={[styles.readingCard, { backgroundColor: activeTheme.card }]}>
                  <Text style={[styles.storyText, { color: activeTheme.text }]}>{currentStory?.story}</Text>
                  <View style={styles.bengaliSection}>
                    <Text style={[styles.bengaliLabel, { color: activeTheme.subText }]}>SEMANTIC ANCHOR</Text>
                    <Text style={[styles.bengaliValue, { color: activeTheme.text }]}>{currentStory?.bengaliDefinition}</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setCurrentView('home')}
                    style={[styles.nextBtn, { backgroundColor: activeTheme.accent }]}
                  >
                    <Text style={styles.nextBtnText}>NEXT DRILL</Text>
                  </TouchableOpacity>
                </View>
              )}
            </MotiView>
          )}
        </AnimatePresence>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <View style={[styles.navContainer, { backgroundColor: activeTheme.card }]}>
          <TouchableOpacity onPress={() => setCurrentView('home')}>
            <Zap size={24} color={currentView === 'home' ? activeTheme.accent : activeTheme.text} opacity={currentView === 'home' ? 1 : 0.4} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentView('trainer')}>
            <RotateCw size={24} color={currentView === 'trainer' ? activeTheme.accent : activeTheme.text} opacity={currentView === 'trainer' ? 1 : 0.4} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Picker Modal */}
      <AnimatePresence>
        {showThemePicker && (
          <MotiView 
            from={{ opacity: 0, translateY: SCREEN_HEIGHT }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: SCREEN_HEIGHT }}
            style={styles.modal}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Universe</Text>
              <TouchableOpacity onPress={() => setShowThemePicker(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.themeGrid}>
              {Object.entries(themes).map(([key, t]) => (
                <TouchableOpacity 
                  key={key} 
                  onPress={() => { setThemeKey(key); setShowThemePicker(false); }}
                  style={[styles.themeCard, { backgroundColor: t.bg, borderColor: themeKey === key ? '#fff' : 'rgba(255,255,255,0.1)' }]}
                >
                  <Text style={[styles.themeName, { color: t.text }]}>{t.name}</Text>
                  <View style={[styles.themeColor, { backgroundColor: t.accent }]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </MotiView>
        )}
      </AnimatePresence>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  vortexAura: {
    position: 'absolute',
    top: -SCREEN_WIDTH * 0.5,
    right: -SCREEN_WIDTH * 0.3,
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    borderRadius: SCREEN_WIDTH * 0.75,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight + 20 : 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    padding: 12,
    borderRadius: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  viewContainer: {
    padding: 24,
  },
  heroCard: {
    borderRadius: 40,
    padding: 32,
    borderWidth: 1,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    lineHeight: 40,
    marginBottom: 30,
    textTransform: 'uppercase',
  },
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 30,
  },
  levelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '900',
  },
  inputSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 20,
    height: 60,
    fontSize: 16,
    fontWeight: '700',
  },
  startBtn: {
    width: 60,
    height: 60,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  suggestionText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    height: 120,
    borderRadius: 32,
    padding: 24,
    justifyContent: 'space-between',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  readingCard: {
    borderRadius: 40,
    padding: 32,
    minHeight: 400,
  },
  storyText: {
    fontSize: 22,
    lineHeight: 32,
    fontStyle: 'italic',
    marginBottom: 40,
  },
  bengaliSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 30,
    alignItems: 'center',
  },
  bengaliLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 10,
  },
  bengaliValue: {
    fontSize: 36,
    fontWeight: '900',
  },
  nextBtn: {
    marginTop: 40,
    height: 60,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#fff',
    fontWeight: '900',
    letterSpacing: 2,
  },
  loader: {
    flex: 1,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: '#000',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    zIndex: 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  themeCard: {
    width: (SCREEN_WIDTH - 80) / 2,
    height: 150,
    borderRadius: 32,
    padding: 20,
    justifyContent: 'space-between',
    borderWidth: 2,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  themeColor: {
    width: 32,
    height: 32,
    borderRadius: 16,
  }
});
