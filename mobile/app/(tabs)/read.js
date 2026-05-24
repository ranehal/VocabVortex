import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { useApp } from '../_layout';
import { CheckCircle2, RotateCw } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../components/LoadingSpinner';

const BASE_URL = 'http://localhost:3000';
const READFLOW_STORE_KEY = 'readflow_mobile_v1';

const parseReadFlowText = (raw) => {
  const chunks = [];
  const regex = /([^()]+?)\(([^)]+)\)/g;
  let last = 0;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    if (match.index > last) chunks.push({ en: raw.slice(last, match.index), bn: null });
    chunks.push({ en: match[1], bn: match[2].trim() });
    last = match.index + match[0].length;
  }
  if (last < raw.length) chunks.push({ en: raw.slice(last), bn: null });
  return chunks;
};

export default function ReadFlow() {
  const { activeTheme, handleTapWord } = useApp();
  const [rawText, setRawText] = useState('');
  const [chunks, setChunks] = useState([]);
  const [queue, setQueue] = useState([]);
  const [fontSize, setFontSize] = useState(17);
  const [revealedChunk, setRevealedChunk] = useState(null);
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
    setLoadingBooks(true);
    try {
      const res = await fetch(`${BASE_URL}/api/books`);
      const data = await res.json();
      if (res.ok) setBooks(data);
    } catch (e) { } finally { setLoadingBooks(false); }
  };

  const persistReadFlow = async (nextState) => {
    try {
      await AsyncStorage.setItem(READFLOW_STORE_KEY, JSON.stringify({ rawText, chunks, queue, fontSize, ...nextState }));
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
    if (!selectedBook || !selectedChapter) return;
    try {
      const res = await fetch(`${BASE_URL}/api/books/${selectedBook._id}/chapters/${selectedChapter._id}`);
      const data = await res.json();
      if (res.ok && data.text) {
        setRawText(data.text);
        const parsed = parseReadFlowText(data.text);
        setChunks(parsed);
        persistReadFlow({ rawText: data.text, chunks: parsed });
      }
    } catch (e) { }
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
    const item = { id: `${Date.now()}-${Math.random()}`, en: chunk.en.trim(), bn: chunk.bn };
    const nextQueue = [...queue, item];
    setQueue(nextQueue);
    persistReadFlow({ queue: nextQueue });
  };

  return (
    <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: activeTheme.bg }]} showsVerticalScrollIndicator={false}>
      <MotiView from={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={styles.viewContainer}>
        <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
          <Text style={[styles.title, { color: activeTheme.accent }]}>READFLOW</Text>
          <View style={styles.fontBox}>
            <TouchableOpacity onPress={() => setFontSize(s => Math.max(12, s-1))} style={[styles.fontBtn, { borderColor: activeTheme.border, backgroundColor: activeTheme.bg }]}><Text style={{ color: activeTheme.text }}>−</Text></TouchableOpacity>
            <Text style={{ color: activeTheme.text, fontWeight: 'bold' }}>{fontSize}</Text>
            <TouchableOpacity onPress={() => setFontSize(s => Math.min(34, s+1))} style={[styles.fontBtn, { borderColor: activeTheme.border, backgroundColor: activeTheme.bg }]}><Text style={{ color: activeTheme.text }}>+</Text></TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
            {books.map(b => (
              <TouchableOpacity key={b._id} onPress={() => { setSelectedBook(b); setSelectedChapter(null); }} style={[styles.pill, { backgroundColor: selectedBook?._id === b._id ? activeTheme.accent : activeTheme.bg, borderColor: activeTheme.border, borderWidth: 1 }]}>
                <Text style={{ color: selectedBook?._id === b._id ? '#fff' : activeTheme.text }}>{b.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedBook && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillScroll}>
              {selectedBook.chapters.map(c => (
                <TouchableOpacity key={c._id} onPress={() => setSelectedChapter(c)} style={[styles.pill, { backgroundColor: selectedChapter?._id === c._id ? activeTheme.accent : activeTheme.bg, borderColor: activeTheme.border, borderWidth: 1 }]}>
                  <Text style={{ color: selectedChapter?._id === c._id ? '#fff' : activeTheme.text }}>{c.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity onPress={loadChapterText} style={[styles.primaryBtn, { backgroundColor: activeTheme.accent }]}><Text style={styles.btnText}>LOAD CONTENT</Text></TouchableOpacity>
          
          <TextInput
            style={[styles.input, { color: activeTheme.text, backgroundColor: activeTheme.bg, borderColor: activeTheme.border, borderWidth: 1, marginTop: 15 }]}
            multiline
            placeholder="Or paste text manually..."
            placeholderTextColor={activeTheme.subText}
            value={rawText}
            onChangeText={setRawText}
          />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <TouchableOpacity onPress={loadText} style={[styles.primaryBtn, { backgroundColor: activeTheme.accent, flex: 1 }]}><Text style={styles.btnText}>LOAD MANUAL</Text></TouchableOpacity>
            <TouchableOpacity onPress={clearText} style={[styles.ghostBtn, { borderColor: activeTheme.border, backgroundColor: activeTheme.bg }]}><Text style={{ color: activeTheme.text }}>CLEAR</Text></TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
          <Text style={[styles.sectionLabel, { color: activeTheme.subText }]}>READING AREA</Text>
          <View style={styles.readingArea}>
            {chunks.map((c, i) => {
               if (!c.bn) return <Text key={i} style={{ fontSize, color: activeTheme.text, lineHeight: fontSize * 1.6 }}>{c.en}</Text>;
               return (
                <TouchableOpacity key={i} onPress={() => addToQueue(c, i)}>
                  <Text style={{ fontSize, color: activeTheme.text, lineHeight: fontSize * 1.6, fontWeight: '700' }}>
                    {c.en}
                    {revealedChunk === i && <Text style={{ color: activeTheme.accent }}> ({c.bn})</Text>}
                    {' '}
                  </Text>
                </TouchableOpacity>
               );
            })}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
           <Text style={[styles.sectionLabel, { color: activeTheme.subText }]}>DISCOVERY QUEUE ({queue.length})</Text>
           {queue.map(item => (
             <View key={item.id} style={[styles.queueItem, { backgroundColor: activeTheme.bg, borderColor: activeTheme.border, borderWidth: 1 }]}>
               <View style={{ flex: 1 }}>
                 {item.en.split(' ').map((w, idx) => (
                    <TouchableOpacity key={idx} onPress={() => handleTapWord(w)} style={{ display: 'inline' }}>
                      <Text style={{ color: activeTheme.text, fontWeight: '700' }}>{w} </Text>
                    </TouchableOpacity>
                 ))}
               </View>
               <Text style={{ color: activeTheme.accent, fontWeight: 'bold' }}>{item.bn}</Text>
             </View>
           ))}
        </View>
      </MotiView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 150 },
  viewContainer: { padding: 24, paddingTop: 60 },
  card: { borderRadius: 32, padding: 25, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 15 },
  fontBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  fontBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillScroll: { marginBottom: 10 },
  pill: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  primaryBtn: { height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  ghostBtn: { height: 50, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  input: { minHeight: 100, borderRadius: 15, padding: 15, textAlignVertical: 'top' },
  sectionLabel: { fontSize: 10, fontWeight: '900', opacity: 0.5, marginBottom: 15, letterSpacing: 1 },
  readingArea: { flexDirection: 'row', flexWrap: 'wrap' },
  queueItem: { flexDirection: 'row', padding: 15, borderRadius: 20, marginBottom: 10, alignItems: 'center' }
});
