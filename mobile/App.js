import './global.css';
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  StatusBar as RNStatusBar,
  Modal,
  ActivityIndicator,
  Canvas
} from 'react-native';
import {
  ChevronRight,
  Zap,
  Bookmark,
  Palette,
  X,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  ListPlus,
  RotateCw,
  Lightbulb,
  Info,
  BookOpen
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Space Background Component (Grok Style) ---
const StarField = () => {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      {[...Array(80)].map((_, i) => (
        <MotiView
          key={i}
          from={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 2000 + Math.random() * 3000, loop: true, type: 'timing', delay: Math.random() * 5000 }}
          style={{
            position: 'absolute',
            top: Math.random() * SCREEN_HEIGHT,
            left: Math.random() * SCREEN_WIDTH,
            width: Math.random() * 2 + 1,
            height: Math.random() * 2 + 1,
            backgroundColor: '#fff',
            borderRadius: 1,
          }}
        />
      ))}
      <MotiView
        from={{ translateX: -100, translateY: 0, opacity: 1 }}
        animate={{ translateX: SCREEN_WIDTH + 100, translateY: SCREEN_HEIGHT * 0.5, opacity: 0 }}
        transition={{ duration: 1500, loop: true, repeatReverse: false, delay: 5000, type: 'timing' }}
        style={{
          position: 'absolute',
          top: 50,
          left: 0,
          width: 100,
          height: 2,
          backgroundColor: 'rgba(255,255,255,0.4)',
          transform: [{ rotate: '30deg' }]
        }}
      />
    </View>
  );
};

const themes = {
  amoled: { name: 'Space AMOLED', bg: '#000000', card: 'rgba(20, 20, 25, 0.6)', accent: '#3b82f6', text: '#ffffff', subText: '#60a5fa', isSpace: true },
  verdant: { name: 'Verdant Luxe', bg: '#051c14', card: 'rgba(6, 78, 59, 0.3)', accent: '#10b981', text: '#ecfdf5', subText: '#34d399' },
  crimson: { name: 'Crimson Royal', bg: '#1a0505', card: 'rgba(153, 27, 27, 0.3)', accent: '#dc2626', text: '#fef2f2', subText: '#f87171' },
  onyx: { name: 'Pure Onyx', bg: '#000000', card: 'rgba(39, 39, 42, 0.5)', accent: '#f4f4f5', text: '#f4f4f5', subText: '#71717a' },
  white: { name: 'Pure White', bg: '#f8fafc', card: '#ffffff', accent: '#2563eb', text: '#0f172a', subText: '#64748b' }
};

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'IELTS', 'TOEFL', 'GRE'];

const levelWordsMap = {
  'A1': ['Apple', 'Water', 'Friend', 'School', 'Happy', 'Small', 'Run'],
  'A2': ['Village', 'Journey', 'Kitchen', 'Famous', 'Simple', 'Advice'],
  'B1': ['Confident', 'Opportunity', 'Manage', 'Product', 'Success'],
  'B2': ['Analyze', 'Challenge', 'Distinct', 'Flexible', 'Observe'],
  'C1': ['Acquaint', 'Beneficial', 'Coherent', 'Elaborate', 'Hypothesis'],
  'C2': ['Aesthetic', 'Benevolent', 'Conundrum', 'Epiphany', 'Ineffable'],
  'IELTS': ['Mitigate', 'Substantial', 'Paradigm', 'Advocate', 'Viable'],
  'TOEFL': ['Biodiversity', 'Stratosphere', 'Chronological', 'Symmetry'],
  'GRE': ['Alacrity', 'Bellicose', 'Capricious', 'Ephemeral', 'Loquacious']
};




const BASE_URL = 'http://localhost:3000';
const READFLOW_STORE_KEY = 'readflow_mobile_v1';

const parseReadFlowText = (raw) => {
  const chunks = [];
  const regex = /([^()]+?)\(([^)]+)\)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(raw)) !== null) {
    if (match.index > last) {
      chunks.push({ en: raw.slice(last, match.index), bn: null });
    }

    chunks.push({
      en: match[1],
      bn: match[2].trim()
    });

    last = match.index + match[0].length;
  }

  if (last < raw.length) {
    chunks.push({ en: raw.slice(last), bn: null });
  }

  return chunks;
};

const ReadFlowPage = ({ activeTheme }) => {
  const [rawText, setRawText] = useState('');
  const [chunks, setChunks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [fontSize, setFontSize] = useState(17);
  const [revealedChunk, setRevealedChunk] = useState(null);
  const [visibleQueueId, setVisibleQueueId] = useState(null);

  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loadingBooks, setLoadingBooks] = useState(false);

  useEffect(() => {
    loadReadFlow();
    loadBooks();
  }, []);

  const loadReadFlow = async () => {
    try {
      const saved = await AsyncStorage.getItem(READFLOW_STORE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      setRawText(parsed.rawText || '');
      setChunks(parsed.chunks || []);
      setQueue(parsed.queue || []);
      setFontSize(parsed.fontSize || 17);
    } catch (e) { }
  };

  const loadBooks = async () => {
  try {
    setLoadingBooks(true);

    const res = await fetch(`${BASE_URL}/api/books`);
    const data = await res.json();

    console.log('Books from API:', data);

    if (!res.ok) {
      alert(data.error || 'Books load failed');
      return;
    }

    setBooks(data);
  } catch (e) {
    console.log('Book load error:', e);
    alert('Books load failed. Backend server running আছে কিনা check করো.');
  } finally {
    setLoadingBooks(false);
  }
};

  const persistReadFlow = async (nextState) => {
    try {
      await AsyncStorage.setItem(
        READFLOW_STORE_KEY,
        JSON.stringify({
          rawText,
          chunks,
          queue,
          fontSize,
          ...nextState
        })
      );
    } catch (e) { }
  };

  const loadText = () => {
    const clean = rawText.trim();
    if (!clean) return;

    const parsedChunks = parseReadFlowText(clean);
    setChunks(parsedChunks);
    persistReadFlow({ rawText: clean, chunks: parsedChunks });
  };

  const loadChapterText = async () => {
  if (!selectedBook) {
    alert('Please select a book first');
    return;
  }

  if (!selectedChapter) {
    alert('Please select a chapter first');
    return;
  }

  try {
    const url = `${BASE_URL}/api/books/${selectedBook._id}/chapters/${selectedChapter._id}`;
    console.log('Loading chapter URL:', url);

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Failed to load chapter');
      return;
    }

    if (!data.text) {
      alert('No text found for this chapter');
      return;
    }

    setRawText(data.text);

    const parsedChunks = parseReadFlowText(data.text);
    setChunks(parsedChunks);

    persistReadFlow({
      rawText: data.text,
      chunks: parsedChunks,
      selectedBookId: selectedBook._id,
      selectedChapterId: selectedChapter._id,
    });
  } catch (e) {
    console.log('Chapter load error:', e);
    alert('Chapter load failed. Check console.');
  }
};

  const clearText = () => {
    setRawText('');
    setChunks([]);
    persistReadFlow({ rawText: '', chunks: [] });
  };

  const addToQueue = (chunk, index) => {
    if (!chunk.bn) return;

    setRevealedChunk(index);
    setTimeout(() => setRevealedChunk(null), 5000);

    const item = {
      id: `${Date.now()}-${Math.random()}`,
      en: chunk.en.trim(),
      bn: chunk.bn,
    };

    const nextQueue = [...queue, item];
    setQueue(nextQueue);
    persistReadFlow({ queue: nextQueue });
  };

  const removeFromQueue = (id) => {
    const nextQueue = queue.filter((q) => q.id !== id);
    setQueue(nextQueue);
    persistReadFlow({ queue: nextQueue });
  };

  const sendToEnd = (id) => {
    const index = queue.findIndex((q) => q.id === id);
    if (index < 0) return;

    const nextQueue = [...queue];
    const [item] = nextQueue.splice(index, 1);
    nextQueue.push(item);

    setQueue(nextQueue);
    persistReadFlow({ queue: nextQueue });
  };

  const changeFont = (value) => {
    const next = Math.max(12, Math.min(34, fontSize + value));
    setFontSize(next);
    persistReadFlow({ fontSize: next });
  };

  const showQueueMeaning = (id) => {
    setVisibleQueueId(id);
    setTimeout(() => setVisibleQueueId(null), 5000);
  };

  return (
    <MotiView
      key="readflow"
      from={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      style={styles.viewContainer}
    >
      <View style={[styles.readFlowTopCard, { backgroundColor: '#f5f0e8' }]}>
        <View style={styles.readFlowHeaderRow}>
          <View>
            <Text style={styles.readFlowLogo}>READFLOW</Text>
            <Text style={styles.readFlowSubtitle}>
              Choose a book and chapter, then load reading text
            </Text>
          </View>

          <View style={styles.readFlowFontBox}>
            <TouchableOpacity onPress={() => changeFont(-1)} style={styles.readFlowFontBtn}>
              <Text style={styles.readFlowFontBtnText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.readFlowFontLabel}>{fontSize}</Text>

            <TouchableOpacity onPress={() => changeFont(1)} style={styles.readFlowFontBtn}>
              <Text style={styles.readFlowFontBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.readFlowSectionTitle}>SELECT BOOK</Text>

        {loadingBooks ? (
          <Text style={styles.readFlowEmpty}>Loading books...</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {books.map((book) => (
              <TouchableOpacity
                key={book._id}
                onPress={() => {
                  setSelectedBook(book);
                  setSelectedChapter(null);
                }}
                style={{
                  padding: 12,
                  marginRight: 10,
                  borderRadius: 12,
                  backgroundColor: selectedBook?._id === book._id ? '#c8873a' : '#faf7f2',
                  borderWidth: 1,
                  borderColor: 'rgba(26,20,16,0.18)'
                }}
              >
                <Text style={{ color: selectedBook?._id === book._id ? '#fff' : '#1a1410', fontWeight: '900' }}>
                  {book.coverEmoji} {book.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {selectedBook && (
          <>
            <Text style={styles.readFlowSectionTitle}>SELECT CHAPTER</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {selectedBook.chapters.map((chapter) => (
                <TouchableOpacity
                  key={chapter._id}
                  onPress={() => setSelectedChapter(chapter)}
                  style={{
                    padding: 10,
                    marginRight: 8,
                    borderRadius: 10,
                    backgroundColor: selectedChapter?._id === chapter._id ? '#2e7d52' : '#faf7f2',
                    borderWidth: 1,
                    borderColor: 'rgba(26,20,16,0.18)'
                  }}
                >
                  <Text style={{ color: selectedChapter?._id === chapter._id ? '#fff' : '#1a1410', fontWeight: '800' }}>
                    {chapter.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={loadChapterText}
              style={styles.readFlowPrimaryBtn}
            >
              <Text style={styles.readFlowPrimaryBtnText}>LOAD SELECTED CHAPTER</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={[styles.readFlowSectionTitle, { marginTop: 18 }]}>OR PASTE TEXT MANUALLY</Text>

        <TextInput
          style={styles.readFlowInput}
          multiline
          placeholder={"Example:\nTHE BOY'S NAME WAS (ছেলেটির নাম ছিল) SANTIAGO. DUSK was falling (সন্ধ্যা পড়ছিল)."}
          placeholderTextColor="#9a8e82"
          value={rawText}
          onChangeText={setRawText}
        />

        <View style={styles.readFlowActions}>
          <TouchableOpacity onPress={loadText} style={styles.readFlowPrimaryBtn}>
            <Text style={styles.readFlowPrimaryBtnText}>LOAD MANUAL TEXT</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={clearText} style={styles.readFlowGhostBtn}>
            <Text style={styles.readFlowGhostBtnText}>CLEAR</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.readFlowPanel, { backgroundColor: '#faf7f2' }]}>
        <Text style={styles.readFlowSectionTitle}>READING</Text>

        {chunks.length === 0 ? (
          <Text style={styles.readFlowEmpty}>
            Select a book and chapter, then press Load Selected Chapter.
          </Text>
        ) : (
          <View style={styles.readFlowReadingArea}>
            {chunks.map((chunk, i) => {
              if (!chunk.bn) {
                return (
                  <Text key={i} style={[styles.readFlowPlainText, { fontSize }]}>
                    {chunk.en}
                  </Text>
                );
              }

              return (
                <TouchableOpacity key={i} onPress={() => addToQueue(chunk, i)} activeOpacity={0.7}>
                  <Text style={[styles.readFlowChunkText, { fontSize }]}>
                    {chunk.en.trim()}
                    {revealedChunk === i ? (
                      <Text style={styles.readFlowReveal}> ({chunk.bn})</Text>
                    ) : null}
                    {' '}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={[styles.readFlowPanel, { backgroundColor: '#faf7f2' }]}>
        <View style={styles.readFlowQueueHeader}>
          <Text style={styles.readFlowSectionTitle}>MEANING DISCOVERY</Text>
          <Text style={styles.readFlowBadge}>{queue.length}</Text>
        </View>

        {queue.length === 0 ? (
          <Text style={styles.readFlowEmpty}>
            কোনো phrase-এ tap করলে সেটা practice queue-তে যোগ হবে।
          </Text>
        ) : (
          queue.map((item, i) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => showQueueMeaning(item.id)}
              style={styles.readFlowQueueItem}
              activeOpacity={0.85}
            >
              <Text style={styles.readFlowQueueIndex}>
                {String(i + 1).padStart(2, '0')}
              </Text>

              <View style={{ flex: 1 }}>
                <Text style={[styles.readFlowQueueEnglish, { fontSize: Math.max(13, fontSize - 3) }]}>
                  {item.en}
                </Text>

                {visibleQueueId === item.id ? (
                  <Text style={styles.readFlowQueueBangla}>({item.bn})</Text>
                ) : null}
              </View>

              <View style={styles.readFlowQueueBtns}>
                <TouchableOpacity onPress={() => removeFromQueue(item.id)} style={styles.readFlowSmallBtn}>
                  <CheckCircle2 size={16} color="#2e7d52" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => sendToEnd(item.id)} style={styles.readFlowSmallBtn}>
                  <RotateCw size={15} color="#c8873a" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </MotiView>
  );
};

export default function App() {
  const [themeKey, setThemeKey] = useState('amoled');
  const [currentView, setCurrentView] = useState('home');
  const [level, setLevel] = useState('A2');
  const [inputWord, setInputWord] = useState('');
  const [currentStory, setCurrentStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedWordData, setSelectedWordData] = useState(null);
  const [tappingLoading, setTappingLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [learned, setLearned] = useState([]);

  const activeTheme = themes[themeKey];

  useEffect(() => { loadProgress(); }, []);
  useEffect(() => { refreshSuggestions(level); }, [level]);

  const refreshSuggestions = (currentLevel) => {
    const list = levelWordsMap[currentLevel || level];
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setSuggestions(shuffled.slice(0, 8));
  };

  const wordOfTheDay = useMemo(() => {
    const words = ["Resilient", "Ephemeral", "Luminous", "Eloquent", "Sovereign"];
    return words[new Date().getDay() % words.length];
  }, []);

  const loadProgress = async () => {
    try {
      const b = await AsyncStorage.getItem('vortex_bookmarks');
      const l = await AsyncStorage.getItem('vortex_learned');
      if (b) setBookmarks(JSON.parse(b));
      if (l) setLearned(JSON.parse(l));
    } catch (e) { }
  };

  const saveProgress = async (newB, newL) => {
    try {
      await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(newB));
      await AsyncStorage.setItem('vortex_learned', JSON.stringify(newL));
    } catch (e) { }
  };

  const addBookmark = (word) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
    if (!bookmarks.includes(cleanWord) && !learned.includes(cleanWord)) {
      const next = [...bookmarks, cleanWord];
      setBookmarks(next);
      saveProgress(next, learned);
    }
    setSelectedWordData(null);
  };

  const markLearned = (word) => {
    const newB = bookmarks.filter(w => w !== word);
    const newL = [...learned, word];
    setBookmarks(newB);
    setLearned(newL);
    saveProgress(newB, newL);
  };

  const handleStart = async (wordToUse) => {
    const word = wordToUse || inputWord;
    if (!word) return;
    setLoading(true);
    setCurrentView('reading');
    setSelectedWordData(null);
    try {
      const response = await fetch('http://localhost:3000/api/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, level })
      });
      const data = await response.json();
      setCurrentStory(data);
    } catch (err) {
      setCurrentStory({ word, story: "Error loading vortex content. Is server running?", phonetic: "/error/" });
    } finally {
      setLoading(false);
      setInputWord('');
    }
  };

  const handleTapWord = async (word) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
    setTappingLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: cleanWord, level })
      });
      const data = await response.json();
      setSelectedWordData(data);
    } catch (err) {
      setSelectedWordData({ word: cleanWord, bengaliDefinition: "Detail Load Error", drills: [] });
    } finally {
      setTappingLoading(false);
    }
  };

  const progressPercent = useMemo(() => {
    const total = bookmarks.length + learned.length;
    return total === 0 ? 0 : Math.round((learned.length / total) * 100);
  }, [bookmarks, learned]);

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <StatusBar style="light" />
      {activeTheme.isSpace && <StarField />}

      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Text style={[styles.title, { color: activeTheme.text }]}>VOCAB<Text style={{ color: activeTheme.subText }}>VORTEX</Text></Text>
          </MotiView>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setShowThemePicker(true)} style={[styles.iconButton, { backgroundColor: activeTheme.card }]}><Palette size={20} color={activeTheme.text} /></TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <AnimatePresence exitBeforeEnter>
            {currentView === 'home' && (
              <MotiView key="home" from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.viewContainer}>
                <View style={[styles.heroCard, { backgroundColor: activeTheme.card, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
                  <Text style={[styles.heroTitle, { color: activeTheme.text }]}>Step into{"\n"}<Text style={{ color: activeTheme.subText }}>the Vortex</Text></Text>

                  <View style={styles.levelRow}>
                    {levels.map(lvl => (
                      <TouchableOpacity key={lvl} onPress={() => setLevel(lvl)} style={[styles.levelBtn, level === lvl ? { backgroundColor: activeTheme.accent } : { borderColor: activeTheme.text, borderWidth: 1, opacity: 0.3 }]}>
                        <Text style={[styles.levelBtnText, { color: level === lvl ? '#fff' : activeTheme.text }]}>{lvl}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.suggestionSection}>
                    <View style={styles.suggestHeader}><Text style={styles.suggestLabel}>LEVEL SUGGESTIONS</Text><TouchableOpacity onPress={() => refreshSuggestions()}><RotateCw size={12} color={activeTheme.subText} /></TouchableOpacity></View>
                    <View style={styles.pillContainer}>
                      {suggestions.map((w, i) => (
                        <TouchableOpacity key={i} onPress={() => setInputWord(w)} style={[styles.pill, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }]}>
                          <Text style={[styles.pillText, { color: activeTheme.text }]}>{w}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputWrapper}>
                    <TextInput style={[styles.input, { color: activeTheme.text, backgroundColor: 'rgba(0,0,0,0.3)' }]} placeholder="What word today?" placeholderTextColor="rgba(255,255,255,0.2)" value={inputWord} onChangeText={setInputWord} />
                    <TouchableOpacity onPress={() => handleStart()} style={[styles.exploreBtn, { backgroundColor: activeTheme.accent }]}><ChevronRight size={24} color="#fff" /></TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => setInputWord(wordOfTheDay)} style={styles.wodBtn}><Sparkles size={14} color={activeTheme.subText} /><Text style={styles.wodText}>WORD OF DAY: <Text style={{ textDecorationLine: 'underline' }}>{wordOfTheDay}</Text></Text></TouchableOpacity>
                </View>

                <View style={[styles.dashboardCard, { backgroundColor: activeTheme.card }]}>
                  <View style={styles.dashboardHeader}><LayoutDashboard size={18} color={activeTheme.subText} /><Text style={[styles.dashboardTitle, { color: activeTheme.subText }]}>MASTERY DASHBOARD</Text></View>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}><MotiView from={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={[styles.progressFill, { backgroundColor: activeTheme.accent }]} /></View>
                    <Text style={[styles.progressText, { color: activeTheme.text }]}>{progressPercent}% Progress</Text>
                  </View>
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}><Text style={[styles.statNum, { color: activeTheme.text }]}>{bookmarks.length}</Text><Text style={styles.statLabel}>IN QUEUE</Text></View>
                    <View style={styles.statItem}><Text style={[styles.statNum, { color: activeTheme.text }]}>{learned.length}</Text><Text style={styles.statLabel}>MASTERED</Text></View>
                  </View>
                </View>
              </MotiView>
            )}

            {currentView === 'reading' && (
              <MotiView key="reading" from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.viewContainer}>
                {loading ? (
                  <View style={styles.loader}><RotateCw size={40} color={activeTheme.accent} /><Text style={[styles.loaderText, { color: activeTheme.text, marginTop: 20 }]}>GENERATING VORTEX...</Text></View>
                ) : (
                  <View style={styles.resultStack}>
                    <View style={[styles.dictionaryHeader, { backgroundColor: activeTheme.card }]}>
                      <View style={styles.dictTop}><Text style={[styles.dictWord, { color: activeTheme.text }]}>{currentStory?.word}</Text><TouchableOpacity onPress={() => addBookmark(currentStory?.word)}><Bookmark size={24} color={activeTheme.accent} /></TouchableOpacity></View>
                      <Text style={[styles.dictPhonetic, { color: activeTheme.subText }]}>{currentStory?.phonetic} • {currentStory?.partOfSpeech}</Text>
                      <Text style={[styles.dictBengali, { color: activeTheme.text }]}>{currentStory?.bengaliDefinition}</Text>
                    </View>

                    <View style={[styles.storySection, { backgroundColor: activeTheme.card }]}>
                      <View style={styles.sectionLabel}><Sparkles size={14} color={activeTheme.subText} /><Text style={styles.sectionLabelText}>VORTEX PARAGRAPH (TAP WORDS)</Text></View>
                      <View style={styles.wordFlow}>
                        {currentStory?.story?.split(' ').map((w, i) => {
                          const isTarget = w.toLowerCase().includes(currentStory.word.toLowerCase());
                          return (
                            <TouchableOpacity key={i} onPress={() => handleTapWord(w)}>
                              <Text style={[styles.flowWord, { color: activeTheme.text }, isTarget ? { color: activeTheme.accent, fontWeight: '900', textDecorationLine: 'underline' } : { opacity: 0.8 }]}>{w}{' '}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => setCurrentView('home')} style={[styles.nextBtn, { backgroundColor: activeTheme.accent }]}><Text style={styles.nextBtnText}>BACK TO LAB</Text></TouchableOpacity>
                  </View>
                )}
              </MotiView>
            )}
            {currentView === 'readflow' && (
              <ReadFlowPage activeTheme={activeTheme} />
            )}
            {currentView === 'dashboard' && (
              <MotiView key="dashboard" from={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} style={styles.viewContainer}>
                <Text style={[styles.heroTitle, { color: activeTheme.text }]}>Learning <Text style={{ color: activeTheme.subText }}>Queue</Text></Text>
                <ScrollView style={styles.listScroll}>
                  {bookmarks.length === 0 ? <Text style={{ color: activeTheme.text, opacity: 0.3, textAlign: 'center', marginTop: 100 }}>QUEUE EMPTY</Text> : bookmarks.map((w, i) => (
                    <View key={i} style={[styles.listItem, { backgroundColor: activeTheme.card }]}>
                      <Text style={[styles.listItemText, { color: activeTheme.text }]}>{w}</Text>
                      <TouchableOpacity onPress={() => markLearned(w)}><CheckCircle2 size={24} color={activeTheme.accent} /></TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </MotiView>
            )}
          </AnimatePresence>
        </ScrollView>

        <View style={styles.bottomNav}>
          <View style={[styles.navContainer, { backgroundColor: activeTheme.card, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
            <TouchableOpacity onPress={() => setCurrentView('home')}>
              <Zap size={24} color={currentView === 'home' ? activeTheme.accent : activeTheme.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('readflow')}>
              <BookOpen size={24} color={currentView === 'readflow' ? activeTheme.accent : activeTheme.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('dashboard')}>
              <LayoutDashboard size={24} color={currentView === 'dashboard' ? activeTheme.accent : activeTheme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Popups */}
      <Modal visible={!!selectedWordData || tappingLoading} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <MotiView from={{ translateY: 300, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} style={[styles.detailModal, { backgroundColor: '#0a0a0a', borderColor: activeTheme.accent }]}>
            {tappingLoading ? (
              <View style={styles.modalLoader}><ActivityIndicator color={activeTheme.accent} size="large" /><Text style={[styles.loaderText, { color: '#fff', marginTop: 20 }]}>FETCHING INSIGHTS...</Text></View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeaderInner}>
                  <View><Text style={[styles.modalWord, { color: '#fff' }]}>{selectedWordData?.word}</Text><Text style={[styles.modalPhonetic, { color: activeTheme.subText }]}>{selectedWordData?.phonetic} • {selectedWordData?.partOfSpeech}</Text></View>
                  <TouchableOpacity onPress={() => setSelectedWordData(null)} style={styles.modalClose}><X size={24} color="#fff" /></TouchableOpacity>
                </View>
                <View style={[styles.modalMeaningCard, { backgroundColor: 'rgba(255,255,255,0.05)' }]}><Text style={[styles.modalMeaning, { color: '#fff' }]}>{selectedWordData?.bengaliDefinition}</Text></View>
                <View style={styles.drillSection}>
                  <View style={styles.sectionLabel}><Lightbulb size={16} color={activeTheme.accent} /><Text style={[styles.sectionLabelText, { color: activeTheme.accent }]}>6 CONTEXTUAL DRILLS</Text></View>
                  {selectedWordData?.drills?.map((drill, i) => (
                    <View key={i} style={[styles.drillCard, { borderLeftColor: activeTheme.accent }]}>
                      <Text style={[styles.drillSentence, { color: '#fff' }]}>{drill.sentence}</Text>
                      <View style={styles.drillExplanationRow}><Info size={12} color={activeTheme.subText} /><Text style={styles.drillExplanation}>{drill.explanation}</Text></View>
                    </View>
                  ))}
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => handleStart(selectedWordData?.word)} style={[styles.modalBtn, { backgroundColor: activeTheme.accent }]}><Zap size={18} color="#fff" /><Text style={styles.modalBtnText}>START VORTEX</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => addBookmark(selectedWordData?.word)} style={[styles.modalBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}><Bookmark size={18} color="#fff" /><Text style={[styles.modalBtnText, { color: '#fff' }]}>BOOKMARK</Text></TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </MotiView>
        </View>
      </Modal>

      <AnimatePresence>
        {showThemePicker && (
          <MotiView from={{ opacity: 0, translateY: SCREEN_HEIGHT }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: SCREEN_HEIGHT }} style={styles.modal}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Choose Universe</Text><TouchableOpacity onPress={() => setShowThemePicker(false)}><X size={24} color="#fff" /></TouchableOpacity></View>
            <ScrollView contentContainerStyle={styles.themeGrid}>
              {Object.entries(themes).map(([key, t]) => (
                <TouchableOpacity key={key} onPress={() => { setThemeKey(key); setShowThemePicker(false); }} style={[styles.themeCard, { backgroundColor: t.bg, borderColor: themeKey === key ? '#fff' : 'rgba(255,255,255,0.1)' }]}>
                  <Text style={[styles.themeName, { color: t.text }]}>{t.name}</Text>
                  <View style={[styles.themeColor, { backgroundColor: t.accent }]} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight + 20 : 20 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  headerButtons: { flexDirection: 'row', gap: 10 },
  iconButton: { padding: 12, borderRadius: 16 },
  scrollContent: { paddingBottom: 120 },
  viewContainer: { padding: 24 },
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
  wodBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wodText: { fontSize: 10, fontWeight: '900', opacity: 0.5 },
  dashboardCard: { borderRadius: 32, padding: 24 },
  dashboardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  dashboardTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  progressContainer: { marginBottom: 20 },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 5 },
  progressText: { fontSize: 12, fontWeight: '800' },
  statsRow: { flexDirection: 'row', gap: 20 },
  statItem: { flex: 1 },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 8, fontWeight: '900', opacity: 0.3 },
  loader: { height: 400, justifyContent: 'center', alignItems: 'center' },
  loaderText: { fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  resultStack: { gap: 20 },
  dictionaryHeader: { borderRadius: 32, padding: 32 },
  dictTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  dictWord: { fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  dictPhonetic: { fontSize: 14, fontWeight: '700', marginBottom: 20 },
  dictBengali: { fontSize: 32, fontWeight: '900' },
  storySection: { borderRadius: 32, padding: 32 },
  sectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  sectionLabelText: { fontSize: 10, fontWeight: '900', opacity: 0.5 },
  wordFlow: { flexDirection: 'row', flexWrap: 'wrap' },
  flowWord: { fontSize: 20, lineHeight: 32 },
  nextBtn: { height: 60, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 2 },
  bottomNav: { position: 'absolute', bottom: 30, left: 24, right: 24 },
  navContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 20, borderRadius: 32 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'flex-end' },
  detailModal: { height: '90%', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, borderWidth: 1 },
  modalLoader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalHeaderInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  modalWord: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  modalPhonetic: { fontSize: 16, fontWeight: '700' },
  modalClose: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  modalMeaningCard: { padding: 24, borderRadius: 24, marginBottom: 32 },
  modalMeaning: { fontSize: 28, fontWeight: '900', textAlign: 'center' },
  drillSection: { gap: 16, marginBottom: 40 },
  drillCard: { padding: 20, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, borderLeftWidth: 4 },
  drillSentence: { fontSize: 18, fontWeight: '700', marginBottom: 8, lineHeight: 24 },
  drillExplanationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  drillExplanation: { fontSize: 12, opacity: 0.5, fontStyle: 'italic' },
  modalActions: { flexDirection: 'row', gap: 12, paddingBottom: 20 },
  modalBtn: { flex: 1, height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  modalBtnText: { fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  modal: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '80%', backgroundColor: '#000', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, zIndex: 100 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  themeCard: { width: (SCREEN_WIDTH - 80) / 2, height: 150, borderRadius: 32, padding: 20, justifyContent: 'space-between', borderWidth: 2 },
  themeName: { fontSize: 14, fontWeight: '900' },
  themeColor: { width: 32, height: 32, borderRadius: 16 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 12 },
  listItemText: { fontSize: 18, fontWeight: '800' },
  listScroll: { flex: 1, marginTop: 20 },

  readFlowTopCard: {
    borderRadius: 28,
    padding: 20,
    marginBottom: 18
  },
  readFlowHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12
  },
  readFlowLogo: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#c8873a'
  },
  readFlowSubtitle: {
    fontSize: 11,
    color: '#5a4e42',
    marginTop: 4,
    maxWidth: 210
  },
  readFlowFontBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  readFlowFontBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(26,20,16,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf7f2'
  },
  readFlowFontBtnText: {
    color: '#5a4e42',
    fontSize: 18,
    fontWeight: '900'
  },
  readFlowFontLabel: {
    color: '#9a8e82',
    fontSize: 12,
    fontWeight: '900',
    minWidth: 22,
    textAlign: 'center'
  },
  readFlowInput: {
    minHeight: 150,
    maxHeight: 240,
    textAlignVertical: 'top',
    backgroundColor: '#faf7f2',
    borderWidth: 1,
    borderColor: 'rgba(26,20,16,0.22)',
    borderRadius: 14,
    padding: 14,
    color: '#1a1410',
    fontSize: 13,
    lineHeight: 21
  },
  readFlowActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14
  },
  readFlowPrimaryBtn: {
    backgroundColor: '#c8873a',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12
  },
  readFlowPrimaryBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3
  },
  readFlowGhostBtn: {
    borderWidth: 1,
    borderColor: 'rgba(26,20,16,0.22)',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12
  },
  readFlowGhostBtnText: {
    color: '#5a4e42',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.3
  },
  readFlowPanel: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(26,20,16,0.10)'
  },
  readFlowSectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    color: '#9a8e82',
    marginBottom: 14
  },
  readFlowEmpty: {
    color: '#9a8e82',
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    paddingVertical: 24
  },
  readFlowReadingArea: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  },
  readFlowPlainText: {
    color: '#1a1410',
    lineHeight: 32
  },
  readFlowChunkText: {
    color: '#1a1410',
    lineHeight: 32,
    fontWeight: '500'
  },
  readFlowReveal: {
    color: '#2e7d52',
    fontSize: 14,
    fontWeight: '700'
  },
  readFlowQueueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  readFlowBadge: {
    backgroundColor: '#f5f0e8',
    borderWidth: 1,
    borderColor: 'rgba(26,20,16,0.20)',
    color: '#9a8e82',
    fontSize: 11,
    fontWeight: '900',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 14
  },
  readFlowQueueItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f5f0e8',
    borderWidth: 1,
    borderColor: 'rgba(26,20,16,0.10)',
    marginBottom: 8
  },
  readFlowQueueIndex: {
    color: '#9a8e82',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 2,
    width: 22
  },
  readFlowQueueEnglish: {
    color: '#1a1410',
    lineHeight: 22,
    fontWeight: '700'
  },
  readFlowQueueBangla: {
    color: '#2e7d52',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 3,
    fontWeight: '600'
  },
  readFlowQueueBtns: {
    flexDirection: 'row',
    gap: 6
  },
  readFlowSmallBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(26,20,16,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ede8dc'
  },
});
