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
  Canvas,
  Alert,
  Keyboard,
  FlatList,
  Image
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
  User as UserIcon,
  Volume2,
  BookOpen,
  Clapperboard,
  Search,
  Upload,
  Clock
} from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Speech from 'expo-speech';

WebBrowser.maybeCompleteAuthSession();

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const API_BASE = "http://localhost:3000"; 

const StarField = () => {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      {[...Array(80)].map((_, i) => {
        const size = Math.random() * 3 + 1;
        return (
          <MotiView
            key={i}
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 1500 + Math.random() * 2000, loop: true, type: 'timing', delay: Math.random() * 3000 }}
            style={{
              position: 'absolute',
              top: Math.random() * SCREEN_HEIGHT,
              left: Math.random() * SCREEN_WIDTH,
              width: size,
              height: size,
              backgroundColor: '#fff',
              borderRadius: size / 2,
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: size,
              elevation: 5
            }}
          />
        );
      })}
    </View>
  );
};

const themes = {
  amoled: { name: 'Space AMOLED', bg: '#000000', card: 'rgba(20, 20, 25, 0.7)', accent: '#3b82f6', text: '#ffffff', subText: '#60a5fa', isSpace: true },
  verdant: { name: 'Verdant Luxe', bg: '#051c14', card: 'rgba(6, 78, 59, 0.4)', accent: '#10b981', text: '#ecfdf5', subText: '#34d399' },
  crimson: { name: 'Crimson Royal', bg: '#1a0505', card: 'rgba(153, 27, 27, 0.4)', accent: '#dc2626', text: '#fef2f2', subText: '#f87171' },
  onyx: { name: 'Pure Onyx', bg: '#000000', card: 'rgba(39, 39, 42, 0.6)', accent: '#f4f4f5', text: '#f4f4f5', subText: '#71717a' },
  white: { name: 'Pure White', bg: '#f8fafc', card: '#ffffff', accent: '#2563eb', text: '#0f172a', subText: '#64748b' }
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

      if (!res.ok) {
        alert(data.error || 'Books load failed');
        return;
      }

      setBooks(data);
    } catch (e) {
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

const WheelPicker = ({ range, value, onChange, activeTheme }) => {
  const itemHeight = 40;
  const scrollViewRef = useRef(null);

  const handleWheel = (e) => {
    if (Platform.OS !== 'web') return;
    if (e.deltaY > 0) onChange((value + 1) % range);
    else onChange((value - 1 + range) % range);
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: value * itemHeight, animated: true });
    }
  }, [value]);

  return (
    <View 
      style={{ height: itemHeight * 3, overflow: 'hidden', width: 50, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1, borderColor: activeTheme.accent }}
      {...(Platform.OS === 'web' ? { onWheel: handleWheel } : {})}
    >
      <View style={{ position: 'absolute', top: itemHeight, height: itemHeight, width: '100%', backgroundColor: activeTheme.accent, opacity: 0.15 }} />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / itemHeight);
          if (index >= 0 && index < range && index !== value) onChange(index);
        }}
        contentContainerStyle={{ paddingVertical: itemHeight }}
      >
        {Array.from({ length: range }).map((_, i) => (
          <TouchableOpacity 
             key={i} 
             style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}
             onPress={() => onChange(i)}
          >
            <Text style={{ color: value === i ? activeTheme.accent : activeTheme.subText, fontSize: value === i ? 22 : 16, fontWeight: value === i ? 'bold' : 'normal' }}>
              {i.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const MovieDialoguePage = ({ activeTheme, handleTapWord }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [movieSuggestions, setMovieSuggestions] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dialogues, setDialogues] = useState([]);
  const [filterSpeaker, setFilterSpeaker] = useState('All');
  const [subtitleSearch, setSubtitleSearch] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState({ title: '', year: '', srt: '', translate: false });
  const [onlineQuery, setOnlineQuery] = useState('');
  const [onlineResults, setOnlineResults] = useState([]);
  const [selectedOnline, setSelectedOnline] = useState(null);
  const [onlineSubs, setOnlineSubs] = useState([]);
  
  const [jumpH, setJumpH] = useState(0);
  const [jumpM, setJumpM] = useState(0);
  const [jumpS, setJumpS] = useState(0);
  const [translatingLine, setTranslatingLine] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(null);
  const flatListRef = useRef(null);
  const webScrollRef = useRef(null);

  const speakers = useMemo(() => {
    const s = new Set(dialogues.map(d => d.speaker).filter(Boolean));
    return ['All', ...Array.from(s)];
  }, [dialogues]);

  const filteredDialogues = useMemo(() => {
    let result = dialogues;
    if (filterSpeaker !== 'All') result = result.filter(d => d.speaker === filterSpeaker);
    if (subtitleSearch) {
      const q = subtitleSearch.toLowerCase();
      result = result.filter(d => d.en.toLowerCase().includes(q) || (d.bn && d.bn.toLowerCase().includes(q)));
    }
    return result;
  }, [dialogues, filterSpeaker, subtitleSearch]);

  const timeToSeconds = (ts) => {
    if (!ts) return 0;
    const pts = ts.split(':');
    return (parseInt(pts[0]) * 3600) + (parseInt(pts[1]) * 60) + parseInt(pts[2] || 0);
  };

  useEffect(() => { fetchMovies(''); }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchMovieSuggestions(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onlineQuery.length >= 3) searchOnline(onlineQuery);
      else if (onlineQuery.length === 0) setOnlineResults([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [onlineQuery]);

  const fetchMovies = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/movies${q ? `?q=${q}` : ''}`);
      const data = await res.json();
      setMovies(Array.isArray(data) ? data : []);
    } catch (e) { } finally { setLoading(false); }
  };

  const fetchMovieSuggestions = async (query = '') => {
    try {
      const res = await fetch(`${BASE_URL}/api/movies${query ? `?q=${query}` : ''}`);
      const local = await res.json();
      let external = [];
      if (query.length >= 3) {
        const extRes = await fetch(`${BASE_URL}/api/movies/external-search?q=${encodeURIComponent(query)}`);
        const extData = await extRes.json();
        external = (extData || []).map(m => ({ ...m, isExternal: true, posterEmoji: '🌐' }));
      }
      setMovieSuggestions([...(local || []), ...external]);
    } catch (e) { }
  };

  const selectSuggestion = async (movie) => {
    setLoading(true);
    setSearchQuery('');
    setMovieSuggestions([]);
    if (!movie.isExternal) return selectMovie(movie);
    try {
      const res = await fetch(`${BASE_URL}/api/movies/import-external`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imdbId: movie.imdbId, title: movie.title, year: movie.year })
      });
      const data = await res.json();
      if (!res.ok) alert(data.error);
      else selectMovie(data);
    } catch (e) { alert("Import failed"); setLoading(false); }
  };

  const selectMovie = async (movie) => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/movies/${movie._id}`);
      const data = await res.json();
      setSelectedMovie(data);
      setDialogues(data.dialogues || []);
      setFilterSpeaker('All');
    } catch (e) { } finally { setLoading(false); }
  };

  const translateLine = async (index, text) => {
    setTranslatingLine(index);
    try {
      const res = await fetch(`${BASE_URL}/api/movies/translate-line`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.bn) {
        setDialogues(prev => {
          const next = [...prev];
          next[index] = { ...next[index], bn: data.bn };
          return next;
        });
      }
    } catch (e) { } finally { setTranslatingLine(null); }
  };

  const handleJump = () => {
    const targetSec = (jumpH * 3600) + (jumpM * 60) + jumpS;
    const index = filteredDialogues.findIndex(d => timeToSeconds(d.timestamp) >= targetSec);
    if (index !== -1) {
      try {
        const offset = index * 122; // matches getItemLayout length

        if (Platform.OS === 'web' && webScrollRef.current) {
          if (typeof webScrollRef.current.scrollTo === 'function') webScrollRef.current.scrollTo({ y: offset, animated: true });
          else webScrollRef.current.scrollTop = offset;
        } else if (flatListRef.current && typeof flatListRef.current.scrollToIndex === 'function') {
          flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0 });
        } else if (flatListRef.current && typeof flatListRef.current.scrollToOffset === 'function') {
          flatListRef.current.scrollToOffset({ offset, animated: true });
        } else if (flatListRef.current && typeof flatListRef.current.scrollTo === 'function') {
          flatListRef.current.scrollTo({ y: offset, animated: true });
        }

        setHighlightedIndex(index);
        setTimeout(() => setHighlightedIndex(null), 3000); // Highlight for 3s

        const realIdx = dialogues.indexOf(filteredDialogues[index]);
        if (realIdx !== -1 && !filteredDialogues[index].bn) translateLine(realIdx, filteredDialogues[index].en);
      } catch (err) {
        console.warn('Jump failed', err);
        alert('Unable to jump to the requested time.');
      }
    } else { alert("Time beyond subtitles."); }
  };

  const searchOnline = async (q) => {
    try {
      const res = await fetch(`${BASE_URL}/api/movies/external-search?q=${encodeURIComponent(q)}`);
      setOnlineResults(await res.json());
    } catch (e) { }
  };

  const fetchOnlineSubs = async (movie) => {
    setSelectedOnline(movie);
    try {
      const res = await fetch(`${BASE_URL}/api/movies/external-subtitles?imdbId=${movie.imdbId}`);
      setOnlineSubs(await res.json());
    } catch (e) { }
  };

  const loadExternalSrt = (sub) => {
     setImportData({ title: selectedOnline.title, year: selectedOnline.year, srt: `1\n00:00:01,000 --> 00:00:04,000\nExternal Subtitle Loaded.\n\n2\n00:00:05,000 --> 00:00:08,000\nTap any card to translate.`, translate: false });
     setSelectedOnline(null);
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/movies/import-srt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(importData)
      });
      if (res.ok) { setShowImport(false); fetchMovies(''); }
    } catch (e) { } finally { setLoading(false); }
  };

  const renderDialogueText = (text) => {
    return text.split(' ').map((word, i) => (
      <TouchableOpacity key={i} onPress={() => handleTapWord(word)}>
        <Text style={{ color: activeTheme.text, fontSize: 16, lineHeight: 24 }}>{word}{' '}</Text>
      </TouchableOpacity>
    ));
  };

  const renderItem = ({ item: d, index: i }) => {
    const realIndex = dialogues.indexOf(d);
    const isHighlighted = highlightedIndex === i;
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => !d.bn && translateLine(realIndex, d.en)} 
        style={{ 
          padding: 20, 
          backgroundColor: isHighlighted ? activeTheme.accent : activeTheme.card, 
          borderRadius: 24, 
          borderWidth: 1, 
          borderColor: activeTheme.border,
          marginBottom: 16,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ color: isHighlighted ? '#fff' : activeTheme.accent, fontWeight: 'bold', fontSize: 11, letterSpacing: 0.5 }}>{d.speaker?.toUpperCase() || ''}</Text>
          <Text style={{ color: isHighlighted ? '#fff' : activeTheme.subText, fontSize: 11, fontFamily: 'monospace' }}>{d.timestamp}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {renderDialogueText(d.en)}
        </View>
        {d.bn && (
          <Text style={{ 
            color: isHighlighted ? '#fff' : activeTheme.accent, 
            marginTop: 12, 
            fontSize: 15, 
            fontWeight: '600', 
            lineHeight: 22,
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.05)',
            paddingTop: 10
          }}>
            {d.bn}
          </Text>
        )}
        {translatingLine === realIndex && (
          <View style={{ marginTop: 10, alignSelf: 'center' }}>
            <ActivityIndicator size="small" color={isHighlighted ? '#fff' : activeTheme.accent} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <MotiView from={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.viewContainer}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ color: activeTheme.text, fontSize: 24, fontWeight: '900' }}>MOVIE <Text style={{ color: activeTheme.accent }}>DIALOGUES</Text></Text>
        {!selectedMovie && <TouchableOpacity onPress={() => setShowImport(true)} style={[styles.iconButton, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}><Upload size={20} color={activeTheme.accent} /></TouchableOpacity>}
      </View>

      {!selectedMovie ? (
        <>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            <TextInput style={{ flex: 1, borderRadius: 20, paddingHorizontal: 20, height: 60, fontSize: 16, fontWeight: '700', backgroundColor: activeTheme.card, color: activeTheme.text, borderColor: activeTheme.border, borderWidth: 1 }} placeholder="Search Local & Global Movies..." placeholderTextColor={activeTheme.subText} value={searchQuery} onChangeText={setSearchQuery} />
          </View>
          {movieSuggestions.length > 0 && searchQuery.length > 0 && (
            <View style={{ backgroundColor: activeTheme.card, borderRadius: 16, padding: 10, marginTop: 10, borderWidth: 1, borderColor: activeTheme.border }}>
              {movieSuggestions.slice(0, 5).map(m => (
                <TouchableOpacity key={m._id || m.imdbId} onPress={() => selectSuggestion(m)} style={{ padding: 15, borderBottomWidth: 1, borderBottomColor: activeTheme.border, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ fontSize: 24 }}>{m.posterEmoji}</Text>
                  <View><Text style={{ color: activeTheme.text, fontWeight: 'bold' }}>{m.title}</Text><Text style={{ color: activeTheme.subText, fontSize: 12 }}>{m.year}</Text></View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <ScrollView style={{ marginTop: 20 }}>
            {movies.map(m => (
              <TouchableOpacity key={m._id} onPress={() => selectMovie(m)} style={{ padding: 20, backgroundColor: activeTheme.card, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1, borderColor: activeTheme.border }}>
                <Text style={{ fontSize: 30 }}>{m.posterEmoji}</Text>
                <View style={{ flex: 1 }}><Text style={{ color: activeTheme.text, fontWeight: 'bold', fontSize: 18 }}>{m.title}</Text><Text style={{ color: activeTheme.subText }}>{m.year}</Text></View>
                <ChevronRight size={20} color={activeTheme.subText} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={() => setSelectedMovie(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 }}><X size={20} color={activeTheme.subText} /><Text style={{ color: activeTheme.subText, fontWeight: 'bold' }}>BACK</Text></TouchableOpacity>
          <View style={[styles.heroCard, { backgroundColor: activeTheme.card, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: activeTheme.border }]}>
            <Text style={{ color: activeTheme.text, fontSize: 22, fontWeight: 'bold' }} numberOfLines={1}>{selectedMovie.title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: activeTheme.accent }}>
              <Clock size={16} color={activeTheme.accent} />
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                <WheelPicker range={24} value={jumpH} onChange={setJumpH} activeTheme={activeTheme} />
                <Text style={{ color: activeTheme.text, fontWeight: 'bold', fontSize: 24 }}>:</Text>
                <WheelPicker range={60} value={jumpM} onChange={setJumpM} activeTheme={activeTheme} />
                <Text style={{ color: activeTheme.text, fontWeight: 'bold', fontSize: 24 }}>:</Text>
                <WheelPicker range={60} value={jumpS} onChange={setJumpS} activeTheme={activeTheme} />
              </View>
              <TouchableOpacity onPress={handleJump} style={{ backgroundColor: activeTheme.accent, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>JUMP</Text></TouchableOpacity>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: activeTheme.card, borderRadius: 14, paddingHorizontal: 15, marginVertical: 15, borderWidth: 1, borderColor: activeTheme.border }}>
             <Search size={16} color={activeTheme.subText} /><TextInput placeholder="Find word..." placeholderTextColor={activeTheme.subText} style={{ flex: 1, height: 44, color: activeTheme.text, marginLeft: 10 }} value={subtitleSearch} onChangeText={setSubtitleSearch} />
          </View>
          {Platform.OS === 'web' ? (
            <ScrollView
              ref={webScrollRef}
              style={{ maxHeight: '70vh', overflowY: 'auto' }}
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={true}
            >
              {filteredDialogues.map((d, i) => renderItem({ item: d, index: i }))}
            </ScrollView>
          ) : (
            <FlatList
              ref={flatListRef}
              data={filteredDialogues}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderItem}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 100 }}
              onScrollToIndexFailed={info => {
                const offset = info.index * 130; // Rough estimate for fallback
                try {
                  if (flatListRef.current?.scrollToOffset) flatListRef.current.scrollToOffset({ offset, animated: true });
                } catch (e) {
                  console.warn('onScrollToIndexFailed fallback failed', e);
                }
              }}
            />
          )}
        </View>
      )}

      <Modal visible={showImport} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View style={{ height: '90%', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, backgroundColor: '#0a0a0a', borderColor: activeTheme.border, borderWidth: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}><Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>IMPORT SUBTITLES</Text><TouchableOpacity onPress={() => setShowImport(false)}><X size={24} color="#fff" /></TouchableOpacity></View>
            <ScrollView>
              <TextInput placeholder="Movie Title" placeholderTextColor="#666" style={{ borderRadius: 12, padding: 15, backgroundColor: '#1a1a1a', color: '#fff', borderColor: activeTheme.border, borderWidth: 1, marginBottom: 12 }} value={importData.title} onChangeText={t => setImportData({ ...importData, title: t })} />
              <TextInput multiline placeholder="Paste SRT..." placeholderTextColor="#666" style={{ borderRadius: 12, padding: 15, backgroundColor: '#1a1a1a', color: '#fff', height: 150, borderColor: activeTheme.border, borderWidth: 1, textAlignVertical: 'top' }} value={importData.srt} onChangeText={t => setImportData({ ...importData, srt: t })} />
              <TouchableOpacity onPress={handleImport} style={{ backgroundColor: activeTheme.accent, width: '100%', marginTop: 20, padding: 15, borderRadius: 12, alignItems: 'center' }}><Text style={{ color: '#fff', fontWeight: 'bold' }}>FINALIZE IMPORT</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </MotiView>
  );
};

export default function App() {
  const [themeKey, setThemeKey] = useState('amoled');
  const [currentView, setCurrentView] = useState('onboarding');
  const [userName, setUserName] = useState('');
  const [userAge, setUserAge] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [level, setLevel] = useState('A2');
  const [inputWord, setInputWord] = useState('');
  const [currentStory, setCurrentStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedWordData, setSelectedWordData] = useState(null);
  const [tappingLoading, setTappingLoading] = useState(false);
  
  const [user, setUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [learned, setLearned] = useState([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    webClientId: "YOUR_WEB_CLIENT_ID",
  });

  const activeTheme = themes[themeKey];


useEffect(() => {
  const init = async () => {
    await loadProgress();
    await loadUser();
    await loadLocalData();   // 👈 ADD THIS LINE
  };
  init();
}, []);

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      getUserInfo(authentication.accessToken);
    }
  }, [response]);

  useEffect(() => { refreshSuggestions(level); }, [level]);

  const speak = (word) => {
    if (!word) return;
    Speech.speak(word, { language: 'en-US', pitch: 1.0, rate: 0.9 });
  };

  const getUserInfo = async (token) => {
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userInfo = await res.json();
      setUser(userInfo);
      await AsyncStorage.setItem('vortex_user', JSON.stringify(userInfo));
      syncWithBackend(userInfo);
    } catch (e) { console.error(e); }
  };

  const syncWithBackend = async (userData) => {
    try {
      const res = await fetch(`${API_BASE}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          picture: userData.picture,
          googleId: userData.id,
          bookmarks,
          learned
        })
      });
      const data = await res.json();
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.learned) setLearned(data.learned);
    } catch (e) { console.warn("Sync failed"); }
  };

  const loadLocalData = async () => {
    try {
      const u = await AsyncStorage.getItem('vortex_user');
      const b = await AsyncStorage.getItem('vortex_bookmarks');
      const l = await AsyncStorage.getItem('vortex_learned');
      if (u) {
        const parsedUser = JSON.parse(u);
        setUser(parsedUser);
        syncWithBackend(parsedUser);
      }
      if (b) setBookmarks(JSON.parse(b));
      if (l) setLearned(JSON.parse(l));
    } catch (e) {}
  };

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
    } catch (e) {}
  };

  const loadUser = async () => {
  try {
    const name = await AsyncStorage.getItem('userName');
    const age = await AsyncStorage.getItem('userAge');

    if (name) setUserName(name);
    if (age) setUserAge(age);

    if (name && age) {
      setCurrentView('home');
    }
  } catch (e) {}
};


  const saveLocalProgress = async (newB, newL) => {
 
    try {
      await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(newB));
      await AsyncStorage.setItem('vortex_learned', JSON.stringify(newL));
      if (user) syncWithBackend(user);
    } catch (e) {}
  };

  const addBookmark = (word) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
    if (!bookmarks.includes(cleanWord) && !learned.includes(cleanWord)) {
      const next = [...bookmarks, cleanWord];
      setBookmarks(next);
      saveLocalProgress(next, learned);
    }
    setSelectedWordData(null);
  };

  const markLearned = (word) => {
    const newB = bookmarks.filter(w => w !== word);
    const newL = [...learned, word];
    setBookmarks(newB);
    setLearned(newL);
    saveLocalProgress(newB, newL);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('vortex_user');
    setUser(null);
    setBookmarks([]);
    setLearned([]);
  };

  const handleStart = async (wordToUse) => {
    const word = wordToUse || inputWord;
    if (!word) return;
    setLoading(true);
    setCurrentView('reading');
    setSelectedWordData(null);
    try {
      const response = await fetch(`${API_BASE}/api/word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, level })
      });
      const data = await response.json();
      setCurrentStory(data);
    } catch (err) {
      setCurrentStory({ word, story: "Vortex logic fail korsi... server check koren.", phonetic: "/err/" });
    } finally {
      setLoading(false);
      setInputWord('');
    }
  };

  const handleTapWord = async (word) => {
    const cleanWord = word.replace(/[.,!?;:]/g, '').trim();
    setTappingLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: cleanWord, level })
      });
      const data = await response.json();
      setSelectedWordData(data);
    } catch (err) {
      setSelectedWordData({ word: cleanWord, bengaliDefinition: "Detail load error", drills: [] });
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
            {user ? (
              <TouchableOpacity onPress={() => logout()} style={[styles.iconButton, { backgroundColor: activeTheme.card }]}>
                <Image source={{ uri: user.picture }} style={{ width: 24, height: 24, borderRadius: 12 }} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => promptAsync()} style={[styles.iconButton, { backgroundColor: activeTheme.card }]}>
                <UserIcon size={20} color={activeTheme.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setShowThemePicker(true)} style={[styles.iconButton, { backgroundColor: activeTheme.card }]}><Palette size={20} color={activeTheme.text} /></TouchableOpacity>
          </View>
        </View>

        <ScrollView style={{ display: currentView !== 'movie' ? 'flex' : 'none' }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <AnimatePresence exitBeforeEnter>
            {currentView === 'onboarding' && (
  <MotiView key="onboarding" from={{ opacity: 0 }} animate={{ opacity: 1 }} style={[styles.viewContainer, { flex: 1, justifyContent: 'center' }]}>
    
    <Text style={[styles.heroTitle, { color: activeTheme.text }]}>
      Welcome to <Text style={{ color: activeTheme.subText }}>VocabVortex</Text>
    </Text>

    <TextInput
      placeholder="Enter your name"
      placeholderTextColor="gray"
      value={userName}
      onChangeText={setUserName}
       style={[
    styles.input,
    { 
      marginBottom: 20,
      color: activeTheme.text,
      backgroundColor: 'rgba(255,255,255,0.1)'
    }
  ]}
/>
    <TextInput
      placeholder="Enter your age"
      placeholderTextColor="gray"
      value={userAge}
      onChangeText={setUserAge}
      keyboardType="numeric"
       style={[
    styles.input,
    { 
      marginBottom: 20,
      color: activeTheme.text,
      backgroundColor: 'rgba(255,255,255,0.1)'
    }
  ]}
/>

    <TouchableOpacity
     onPress={async () => {
  if (!userName || !userAge) {
    alert("Please fill all fields");
    return;
  }

  await AsyncStorage.setItem('userName', userName);
  await AsyncStorage.setItem('userAge', userAge);

  setShowWelcomeModal(true);
}}
      style={[styles.exploreBtn, { alignSelf: 'center' }]}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit</Text>
    </TouchableOpacity>

  </MotiView>
)}
            {currentView === 'home' && (
              <MotiView key="home" from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.viewContainer}>
                <View style={[styles.heroCard, { backgroundColor: activeTheme.card }]}>
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

                  {!user && (
                    <TouchableOpacity onPress={() => promptAsync()} style={styles.loginBanner}>
                      <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900' }}>SIGN IN WITH GOOGLE TO SYNC PROGRESS</Text>
                    </TouchableOpacity>
                  )}
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
                  <View style={styles.loader}><RotateCw size={40} color={activeTheme.accent} /><Text style={[styles.loaderText, { color: activeTheme.text, marginTop: 20 }]}>BREWING THE VORTEX...</Text></View>
                ) : (
                  <View style={styles.resultStack}>
                    <View style={[styles.dictionaryHeader, { backgroundColor: activeTheme.card }]}>
                      <View style={styles.dictTop}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={[styles.dictWord, { color: activeTheme.text }]}>{currentStory?.word}</Text>
                          <TouchableOpacity onPress={() => speak(currentStory?.word)} style={styles.speakerBtn}>
                            <Volume2 size={24} color={activeTheme.accent} />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => addBookmark(currentStory?.word)}><Bookmark size={24} color={activeTheme.accent} /></TouchableOpacity>
                      </View>
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

                 <View style={{ marginBottom: 60 }}>

  {/* COVER */}
  <View style={{
    height: 120,
    backgroundColor: activeTheme.accent,
    borderRadius: 20
  }} />

  {/* AVATAR */}
  <View style={{
    position: 'absolute',
    top: 70,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000'
  }}>
    <Text style={{ fontSize: 30 }}>👤</Text>
  </View>

</View>

{/* NAME + AGE */}
<View style={{ alignItems: 'center', marginBottom: 20 }}>
  <View style={{
  flexDirection: 'row',
  justifyContent: 'space-around',
  marginBottom: 20
}}>

  <View style={{ alignItems: 'center' }}>
    <Text style={{ color: activeTheme.text, fontSize: 18, fontWeight: 'bold' }}>
      {bookmarks.length}
    </Text>
    <Text style={{ color: activeTheme.subText, fontSize: 10 }}>
      IN QUEUE
    </Text>
  </View>

  <View style={{ alignItems: 'center' }}>
    <Text style={{ color: activeTheme.text, fontSize: 18, fontWeight: 'bold' }}>
      {learned.length}
    </Text>
    <Text style={{ color: activeTheme.subText, fontSize: 10 }}>
      LEARNED
    </Text>
  </View>

  <View style={{ alignItems: 'center' }}>
    <Text style={{ color: activeTheme.text, fontSize: 18, fontWeight: 'bold' }}>
      {progressPercent}%
    </Text>
    <Text style={{ color: activeTheme.subText, fontSize: 10 }}>
      PROGRESS
    </Text>
  </View>

</View>
<View style={{
  backgroundColor: activeTheme.card,
  padding: 16,
  borderRadius: 16,
  marginBottom: 20
}}>
  <Text style={{ color: activeTheme.subText, fontSize: 10 }}>
    WORD OF THE DAY
  </Text>

  <Text style={{
    color: activeTheme.text,
    fontSize: 20,
    fontWeight: 'bold'
  }}>
    {wordOfTheDay}
  </Text>
</View>

  <Text style={{
    color: activeTheme.text,
    fontSize: 20,
    fontWeight: 'bold'
  }}>
    {userName || "Guest"}
  </Text>

  <Text style={{
    color: activeTheme.subText,
    fontSize: 14
  }}>
    Age: {userAge || "N/A"}
  </Text>

</View>

{/* ACTION BUTTONS */}
<View style={{
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 10,
  marginBottom: 20
}}>

  <TouchableOpacity
    onPress={() => setShowResetConfirm(true)}
    style={{
      backgroundColor: '#dc2626',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10
    }}
  >
    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
      Reset
    </Text>
  </TouchableOpacity>

</View>

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

        <View style={{ display: currentView === 'movie' ? 'flex' : 'none', flex: 1 }}>
          <MovieDialoguePage activeTheme={activeTheme} handleTapWord={handleTapWord} />
        </View>

        <View style={styles.bottomNav}>
          <View style={[styles.navContainer, { backgroundColor: activeTheme.card, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
            <TouchableOpacity onPress={() => setCurrentView('home')}>
              <Zap size={24} color={currentView === 'home' ? activeTheme.accent : activeTheme.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('readflow')}>
              <BookOpen size={24} color={currentView === 'readflow' ? activeTheme.accent : activeTheme.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('movie')}>
              <Clapperboard size={24} color={currentView === 'movie' ? activeTheme.accent : activeTheme.text} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('dashboard')}>
              <LayoutDashboard size={24} color={currentView === 'dashboard' ? activeTheme.accent : activeTheme.text} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>


      <Modal visible={showWelcomeModal} transparent animationType="fade">
  <View style={{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    
    <View style={{
      width: '80%',
      backgroundColor: '#111',
      padding: 20,
      borderRadius: 20,
      alignItems: 'center'
    }}>
      
      <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        🎉 Welcome, {userName}!
      </Text>

      <Text style={{ color: '#aaa', marginBottom: 20 }}>
        Your learning journey starts now 🚀
      </Text>

      <TouchableOpacity
        onPress={() => {
          setShowWelcomeModal(false);
          setCurrentView('home');
        }}
        style={{
          backgroundColor: '#3b82f6',
          padding: 14,
          borderRadius: 12,
          width: '100%',
          alignItems: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          Let’s Go 🚀
        </Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>

      <Modal visible={showResetConfirm} transparent animationType="fade">
  <View style={{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    
    <View style={{
      width: '80%',
      backgroundColor: '#111',
      padding: 20,
      borderRadius: 20
    }}>
      
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
        Reset Profile
      </Text>

      <Text style={{ color: '#aaa', marginVertical: 15 }}>
        Are you sure you want to reset?
      </Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        
        <TouchableOpacity
          onPress={() => setShowResetConfirm(false)}
          style={{ flex: 1, padding: 12, backgroundColor: '#333', borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff' }}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            await AsyncStorage.removeItem('userName');
            await AsyncStorage.removeItem('userAge');

            setUserName('');
            setUserAge('');
            setShowResetConfirm(false);
            setCurrentView('onboarding');
          }}
          style={{ flex: 1, padding: 12, backgroundColor: '#dc2626', borderRadius: 10, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff' }}>Reset</Text>
        </TouchableOpacity>

      </View>
    </View>
  </View>
</Modal>

      {/* Popups */}

      {/* Word Insight Modal */}
 
      <Modal visible={!!selectedWordData || tappingLoading} transparent animationType="slide">
        <View style={styles.modalOverlay}>
           <MotiView from={{ translateY: 300, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} style={[styles.detailModal, { backgroundColor: '#0a0a0a', borderColor: activeTheme.accent }]}>
              {tappingLoading ? (
                <View style={styles.modalLoader}><ActivityIndicator color={activeTheme.accent} size="large" /><Text style={[styles.loaderText, { color: '#fff', marginTop: 20 }]}>FETCHING INSIGHTS...</Text></View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeaderInner}>
                    <View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Text style={[styles.modalWord, { color: '#fff' }]}>{selectedWordData?.word}</Text>
                        <TouchableOpacity onPress={() => speak(selectedWordData?.word)} style={styles.modalSpeakerBtn}>
                          <Volume2 size={32} color={activeTheme.accent} />
                        </TouchableOpacity>
                      </View>
                      <Text style={[styles.modalPhonetic, { color: activeTheme.subText }]}>{selectedWordData?.phonetic} • {selectedWordData?.partOfSpeech}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setSelectedWordData(null)} style={styles.modalClose}><X size={24} color="#fff"/></TouchableOpacity>
                  </View>
                  
                  <View style={[styles.modalMeaningCard, { backgroundColor: 'rgba(255,255,255,0.08)' }]}><Text style={[styles.modalMeaning, { color: '#fff' }]}>{selectedWordData?.bengaliDefinition}</Text></View>
                  
                  <View style={styles.drillSection}>
                    <View style={styles.sectionLabel}><Lightbulb size={16} color={activeTheme.accent} /><Text style={[styles.sectionLabelText, { color: activeTheme.accent }]}>6 CONTEXTUAL DRILLS</Text></View>
                    {selectedWordData?.drills?.map((drill, i) => (
                      <View key={i} style={[styles.drillCard, { borderLeftColor: activeTheme.accent }]}>
                        <Text style={[styles.drillSentence, { color: '#fff' }]}>{drill.sentence}</Text>
                        <View style={styles.drillExplanationRow}>
                          <Info size={14} color={activeTheme.subText}/>
                          <Text style={[styles.drillExplanation, { color: '#bbb' }]}>{drill.explanation}</Text>
                        </View>
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
  shootingStarLine: {
    position: 'absolute',
    width: 120,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    transform: [{ rotate: '35deg' }],
    borderRadius: 1,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight + 20 : 20 },
  title: { fontSize: 24, fontWeight: '900', letterSpacing: -1 },
  headerButtons: { flexDirection: 'row', gap: 10 },
  iconButton: { padding: 12, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
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
  loginBanner: { marginTop: 10, opacity: 0.5 },
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
  speakerBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
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
  dashboardProfile: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 30 },
  profilePic: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  detailModal: { 
    width: Platform.OS === 'web' ? Math.min(SCREEN_WIDTH * 0.9, 500) : '94%', 
    maxHeight: '90%', 
    borderRadius: 35, 
    padding: 20, 
    borderWidth: 1,
    overflow: 'hidden'
  },
  modalLoader: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  modalHeaderInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  modalWord: { fontSize: 38, fontWeight: '900', letterSpacing: -1 },
  modalSpeakerBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16 },
  modalPhonetic: { fontSize: 14, fontWeight: '700' },
  modalClose: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },
  modalMeaningCard: { padding: 20, borderRadius: 20, marginBottom: 25 },
  modalMeaning: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
  drillSection: { gap: 12, marginBottom: 30 },
  drillCard: { padding: 15, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, borderLeftWidth: 4 },
  drillSentence: { fontSize: 16, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
  drillExplanationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  drillExplanation: { fontSize: 12, flex: 1, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 12, paddingBottom: 10 },
  modalBtn: { flex: 1, height: 55, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
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
