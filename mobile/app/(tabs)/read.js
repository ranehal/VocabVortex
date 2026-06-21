import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useApp } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Storage keys ──────────────────────────────────────────────────────────────
const READER_KEY = 'readflow_reader_v1';
const QUEUE_KEY = 'readflow_discovery_queue_v1';

// ── Hardcoded books ───────────────────────────────────────────────────────────
const READFLOW_BOOKS = [
  {
    _id: 'alchemist',
    title: 'The Alchemist',
    coverEmoji: '📘',
    chapters: [
      { _id: 'ch1', title: 'Chapter 1 — The Shepherd', text: "THE BOY'S NAME WAS (ছেলেটির নাম ছিল) SANTIAGO. DUSK was falling (সন্ধ্যা নামছিল), and he arrived (এবং সে পৌঁছাল) with his herd (তার পশুপাল নিয়ে) at an abandoned church (একটি পরিত্যক্ত গির্জায়). The roof had fallen in (ছাদ ভেঙে পড়েছিল), and an enormous sycamore had grown (এবং একটি বিশাল ডুমুর গাছ জন্মেছিল) on the spot (সেই জায়গায়) where the sacristy had once stood (যেখানে একসময় পবিত্র কক্ষ ছিল)." },
      { _id: 'ch2', title: 'Chapter 2 — The Dream', text: "He had learned (সে শিখেছিল) that the world was full of signs (পৃথিবী সংকেতে পূর্ণ), but people often ignored them (কিন্তু মানুষ প্রায়ই সেগুলো উপেক্ষা করে). The boy fell asleep (ছেলেটি ঘুমিয়ে পড়ল) and dreamed (এবং স্বপ্ন দেখল) once again (আবারও) about the treasure (ধনের কথা). He saw the same child (সে একই শিশুকে দেখল) and the Egyptian pyramids (এবং মিশরীয় পিরামিড)." },
      { _id: 'ch3', title: 'Chapter 3 — The Old King', text: "The old man (বৃদ্ধ লোকটি) said his name was Melchizedek (বলল তার নাম মেলকিজেডেক) and that he was the king of Salem (এবং সে সালেমের রাজা). Everyone (প্রত্যেকে) at some point in their lives (জীবনের কোনো এক সময়) discovers their Personal Legend (তাদের ব্যক্তিগত কিংবদন্তি আবিষ্কার করে). When you want something (যখন তুমি কিছু চাও), all the universe conspires (সমগ্র মহাবিশ্ব ষড়যন্ত্র করে) in helping you to achieve it (তোমাকে তা অর্জনে সাহায্য করতে)." },
      { _id: 'ch4', title: 'Chapter 4 — The Desert', text: "The desert (মরুভূমি) is a capricious (খামখেয়ালি) and dangerous place (এবং বিপজ্জনক জায়গা). Every stone (প্রতিটি পাথর) and every grain of sand (এবং প্রতিটি বালিকণা) was speaking to him (তার সাথে কথা বলছিল). He understood (সে বুঝল) that the Soul of the World (বিশ্বের আত্মা) was nourishing him (তাকে পুষ্টি দিচ্ছিল) because it was also his dream (কারণ এটাও তার স্বপ্ন ছিল)." },
    ],
  },
  {
    _id: 'easy',
    title: 'Easy English',
    coverEmoji: '📗',
    chapters: [
      { _id: 'e1', title: 'A Simple Morning', text: "I wake up early (আমি সকালে তাড়াতাড়ি উঠি). I drink water (আমি পানি পান করি). Then I go to school (তারপর আমি স্কুলে যাই). My teacher is kind (আমার শিক্ষক দয়ালু). I like to read (আমি পড়তে পছন্দ করি) and learn new words (এবং নতুন শব্দ শিখতে)." },
      { _id: 'e2', title: 'At the Market', text: "The market is busy (বাজার ব্যস্ত). People are buying (মানুষজন কিনছে) fruits and vegetables (ফল এবং সবজি). The seller is shouting (বিক্রেতা চিৎকার করছে). My mother picks the best ones (আমার মা সবচেয়ে ভালোগুলো বেছে নেন). We carry the bags (আমরা ব্যাগগুলো বহন করি) and walk back home (এবং বাড়ি ফিরে হাঁটি)." },
    ],
  },
  {
    _id: 'proverbs',
    title: 'English Proverbs',
    coverEmoji: '📙',
    chapters: [
      { _id: 'p1', title: 'Wisdom & Life', text: "Actions speak (কাজই বলে) louder than words (কথার চেয়ে জোরে). Every cloud (প্রতিটি মেঘের) has a silver lining (একটি রুপালি আস্তরণ আছে). Time and tide (সময় এবং জোয়ার) wait for no man (কারো জন্য অপেক্ষা করে না). Knowledge is power (জ্ঞানই শক্তি). The early bird (ভোরের পাখি) catches the worm (কীট ধরে)." },
      { _id: 'p2', title: 'Success & Failure', text: "No pain (কোনো কষ্ট নেই), no gain (কোনো লাভ নেই). Practice makes (অনুশীলন করে) a man perfect (মানুষকে নিখুঁত). Fortune favors (ভাগ্য পক্ষপাত করে) the brave (সাহসীদের). Look before (দেখো আগে) you leap (তুমি লাফ দেওয়ার). Better late (দেরি হওয়া ভালো) than never (না আসার চেয়ে)." },
    ],
  },
];

// ── Parse annotated text: "English (Bengali)" → chunks ───────────────────────
function parseText(raw) {
  const chunks = [];
  const regex = /([^()]+?)\(([^)]+)\)/g;
  let last = 0, match;
  while ((match = regex.exec(raw)) !== null) {
    if (match.index > last) chunks.push({ en: raw.slice(last, match.index), bn: null });
    chunks.push({ en: match[1].trim(), bn: match[2].trim() });
    last = match.index + match[0].length;
  }
  if (last < raw.length) chunks.push({ en: raw.slice(last), bn: null });
  return chunks;
}

// ── Meaning Discovery queue helpers ──────────────────────────────────────────
async function loadQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

async function saveQueue(q) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── BOOK READER ───────────────────────────────────────────────────────────────
function BookReader({ activeTheme, chapter, onBack, onAddToQueue }) {
  const [fontSize, setFontSize] = useState(17);
  const [revealed, setRevealed] = useState(null);
  const chunks = useMemo(() => parseText(chapter.text), [chapter.text]);

  const tapChunk = (chunk, idx) => {
    if (!chunk.bn) return;
    setRevealed(idx);
    setTimeout(() => setRevealed(null), 4000);
    onAddToQueue({ id: `${chunk.en.trim()}-${Date.now()}`, en: chunk.en.trim(), bn: chunk.bn });
  };

  return (
    <View style={{ flex: 1, backgroundColor: activeTheme.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 20, gap: 12, borderBottomWidth: 1, borderBottomColor: activeTheme.border }}>
        <TouchableOpacity onPress={onBack} style={{ padding: 8, backgroundColor: activeTheme.card, borderRadius: 10 }}>
          <Text style={{ color: activeTheme.text, fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ color: activeTheme.text, fontWeight: '700', fontSize: 15, flex: 1 }} numberOfLines={1}>{chapter.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity onPress={() => setFontSize(f => Math.max(12, f - 1))} style={[s.fontBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Text style={{ color: activeTheme.text }}>A−</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setFontSize(f => Math.min(30, f + 1))} style={[s.fontBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
            <Text style={{ color: activeTheme.text }}>A+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ backgroundColor: activeTheme.card, marginHorizontal: 16, marginTop: 10, borderRadius: 10, padding: 10, borderWidth: 1, borderColor: activeTheme.border }}>
        <Text style={{ color: activeTheme.accent, fontSize: 11, fontWeight: '700' }}>💡 Bold phrase ট্যাপ করুন → Bengali অর্থ দেখুন + Discovery Queue-এ যাবে</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {chunks.map((chunk, i) => {
            if (!chunk.bn) return <Text key={i} style={{ fontSize, color: activeTheme.text, lineHeight: fontSize * 1.7 }}>{chunk.en}</Text>;
            return (
              <TouchableOpacity key={i} onPress={() => tapChunk(chunk, i)} activeOpacity={0.7}>
                <Text style={{ fontSize, color: activeTheme.accent, lineHeight: fontSize * 1.7, fontWeight: '700' }}>
                  {chunk.en}
                  {revealed === i && <Text style={{ color: activeTheme.text, fontWeight: '400' }}> ({chunk.bn})</Text>}
                  {' '}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// ── BOOKS TAB ─────────────────────────────────────────────────────────────────
function BooksTab({ activeTheme, onAddToQueue }) {
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  if (selectedChapter) {
    return <BookReader activeTheme={activeTheme} chapter={selectedChapter} onBack={() => setSelectedChapter(null)} onAddToQueue={onAddToQueue} />;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: activeTheme.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 14 }}>

      {!selectedBook ? (
        <>
          <Text style={[s.sectionLabel, { color: activeTheme.subText }]}>📖 ইংরেজি বই</Text>
          {READFLOW_BOOKS.map(book => (
            <TouchableOpacity key={book._id} onPress={() => setSelectedBook(book)} activeOpacity={0.85}
              style={[s.bookCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
              <View style={[s.coverCircle, { backgroundColor: activeTheme.bg }]}>
                <Text style={{ fontSize: 30 }}>{book.coverEmoji}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: activeTheme.text, fontSize: 16, fontWeight: '700' }}>{book.title}</Text>
                <Text style={{ color: activeTheme.subText, fontSize: 13 }}>{book.chapters.length} chapters</Text>
                <Text style={{ color: activeTheme.accent, fontSize: 12, fontWeight: '600' }}>✓ Owned</Text>
              </View>
              <Text style={{ color: activeTheme.subText, fontSize: 22 }}>›</Text>
            </TouchableOpacity>
          ))}
        </>
      ) : (
        <>
          <TouchableOpacity onPress={() => setSelectedBook(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ color: activeTheme.accent, fontSize: 15, fontWeight: '700' }}>← Back</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Text style={{ fontSize: 28 }}>{selectedBook.coverEmoji}</Text>
            <Text style={{ color: activeTheme.text, fontSize: 18, fontWeight: '800' }}>{selectedBook.title}</Text>
          </View>
          <Text style={[s.sectionLabel, { color: activeTheme.subText, marginBottom: 4 }]}>CHAPTERS</Text>
          {selectedBook.chapters.map(ch => (
            <TouchableOpacity key={ch._id} onPress={() => setSelectedChapter(ch)} activeOpacity={0.85}
              style={[s.chapterCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
              <Text style={{ color: activeTheme.text, fontSize: 15, fontWeight: '600', flex: 1 }}>{ch.title}</Text>
              <Text style={{ color: activeTheme.subText, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// ── MEANING DISCOVERY TAB ─────────────────────────────────────────────────────
const ROUND_SIZE = 5;

function MeaningDiscoveryTab({ activeTheme, queue, onQueueUpdate }) {
  const roundItems = useMemo(() => queue.slice(0, ROUND_SIZE), [queue]);
  const shuffledBn = useMemo(() => shuffleArr(roundItems.map(r => r.id)), [roundItems]);

  const [pairs, setPairs] = useState({});       // engId → benId
  const [selectedEng, setSelectedEng] = useState(null);
  const [verified, setVerified] = useState(false);
  const [taint, setTaint] = useState(new Set());
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [removing, setRemoving] = useState(false);

  // Reverse map: benId → engId
  const engByBn = useMemo(() => {
    const m = {};
    Object.entries(pairs).forEach(([eng, ben]) => { m[ben] = eng; });
    return m;
  }, [pairs]);

  const allPaired = roundItems.length > 0 && roundItems.every(it => pairs[it.id] !== undefined);
  const engNumber = useCallback(engId => roundItems.findIndex(r => r.id === engId) + 1, [roundItems]);

  const handleEngTap = (engId) => {
    if (verified) return;
    setSelectedEng(prev => prev === engId ? null : engId);
  };

  const handleBnTap = (benId) => {
    if (verified || selectedEng === null) return;
    setPairs(prev => {
      const next = { ...prev };
      for (const e of Object.keys(next)) if (next[e] === benId) delete next[e];
      next[selectedEng] = benId;
      return next;
    });
    setSelectedEng(null);
  };

  const handleVerify = () => {
    if (!allPaired || verified) return;
    const wrongIds = roundItems.filter(it => pairs[it.id] !== it.id).map(it => it.id);
    const correctIds = roundItems.filter(it => pairs[it.id] === it.id).map(it => it.id);
    let gained = 0;
    correctIds.forEach(id => { if (!taint.has(id)) gained += 0.5; });
    if (gained > 0) setEarnedPoints(p => p + gained);
    if (wrongIds.length) setTaint(prev => new Set([...prev, ...wrongIds]));
    setVerified(true);
  };

  const handleNextRound = async () => {
    setRemoving(true);
    const correctIds = roundItems.filter(it => pairs[it.id] === it.id).map(it => it.id);
    const updated = queue.filter(it => !correctIds.includes(it.id));
    await saveQueue(updated);
    onQueueUpdate(updated);
    setPairs({}); setSelectedEng(null); setVerified(false);
    setRemoving(false);
  };

  const totalRounds = queue.length > 0 ? Math.ceil(queue.length / ROUND_SIZE) : 0;
  const allCorrect = verified && roundItems.every(it => pairs[it.id] === it.id);
  const isLastRound = queue.length <= roundItems.length;

  if (queue.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: activeTheme.bg, gap: 12 }}>
        <Text style={{ fontSize: 40, opacity: 0.4 }}>✦</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: activeTheme.text }}>Meaning Discovery</Text>
        <Text style={{ fontSize: 13, color: activeTheme.subText, textAlign: 'center', lineHeight: 22 }}>
          Books tab-এ বই পড়তে পড়তে bold phrase ট্যাপ করুন — এখানে জমা হবে।
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: activeTheme.bg }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: activeTheme.card, borderBottomWidth: 1, borderBottomColor: activeTheme.border }}>
        <View>
          <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.6, color: activeTheme.subText }}>MEANING DISCOVERY</Text>
          <Text style={{ fontSize: 12, color: activeTheme.accent, fontWeight: '700', marginTop: 2 }}>{queue.length} বাকি · {totalRounds} round</Text>
        </View>
        <View style={{ backgroundColor: activeTheme.bg, borderWidth: 1, borderColor: activeTheme.border, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontSize: 12, color: activeTheme.text, fontWeight: '700' }}>{queue.length}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 12, color: activeTheme.subText, textAlign: 'center', paddingVertical: 8, fontStyle: 'italic' }}>
        প্রতিটি English-এর সাথে Bengali মিলান, তারপর যাচাই করুন
      </Text>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Matching grid */}
        <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 4 }}>
          {/* English column */}
          <View style={{ flex: 1, gap: 8 }}>
            {roundItems.map(item => {
              const paired = pairs[item.id];
              const isSelected = selectedEng === item.id;
              const correct = pairs[item.id] === item.id;
              const num = paired ? engNumber(item.id) : null;
              return (
                <TouchableOpacity key={`en-${item.id}`}
                  style={[s.matchChip, { backgroundColor: activeTheme.card, borderColor: activeTheme.border },
                    !verified && isSelected && s.chipSelected,
                    !verified && paired && !isSelected && s.chipPaired,
                    verified && (correct ? s.chipMatched : s.chipWrong),
                  ]}
                  onPress={() => handleEngTap(item.id)} disabled={verified} activeOpacity={0.75}>
                  {num ? <View style={s.pairNumBadge}><Text style={s.pairNumText}>{num}</Text></View> : null}
                  <Text style={{ fontSize: 14, color: activeTheme.text, fontWeight: '600', textAlign: 'center' }}>{item.en}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Bengali column (shuffled) */}
          <View style={{ flex: 1, gap: 8 }}>
            {shuffledBn.map(benId => {
              const item = roundItems.find(r => r.id === benId);
              const pairedEng = engByBn[benId];
              const correct = pairedEng === benId;
              const num = pairedEng ? engNumber(pairedEng) : null;
              return (
                <TouchableOpacity key={`bn-${benId}`}
                  style={[s.matchChip, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, opacity: 0.9 },
                    !verified && pairedEng && s.chipPaired,
                    verified && pairedEng && (correct ? s.chipMatched : s.chipWrong),
                  ]}
                  onPress={() => handleBnTap(benId)} disabled={verified || selectedEng === null} activeOpacity={0.75}>
                  {num ? <View style={s.pairNumBadge}><Text style={s.pairNumText}>{num}</Text></View> : null}
                  <Text style={{ fontSize: 14, color: activeTheme.subText, fontWeight: '600', textAlign: 'center' }}>{item?.bn}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Verify / Next */}
        <View style={{ padding: 16, gap: 12 }}>
          {!verified ? (
            <TouchableOpacity
              style={[s.primaryBtn, { backgroundColor: activeTheme.accent, opacity: allPaired ? 1 : 0.45 }]}
              onPress={handleVerify} disabled={!allPaired}>
              <Text style={s.primaryBtnText}>যাচাই করুন</Text>
            </TouchableOpacity>
          ) : (
            <View style={[s.resultBox, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: activeTheme.text, textAlign: 'center' }}>
                {allCorrect ? '🎉 সব সঠিক!' : '❌ কিছু ভুল হয়েছে — ভুলগুলো আবার আসবে।'}
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: activeTheme.accent, textAlign: 'center' }}>
                অর্জিত পয়েন্ট: +{earnedPoints.toFixed(1)}
              </Text>
              <TouchableOpacity
                style={[s.primaryBtn, { backgroundColor: activeTheme.accent, opacity: removing ? 0.5 : 1 }]}
                onPress={handleNextRound} disabled={removing}>
                {removing
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.primaryBtnText}>{allCorrect && isLastRound ? 'সম্পন্ন করুন ✓' : 'পরবর্তী রাউন্ড →'}</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── MAIN READFLOW SCREEN ──────────────────────────────────────────────────────
export default function ReadFlow() {
  const { activeTheme } = useApp();
  const [activeTab, setActiveTab] = useState('books');
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    loadQueue().then(setQueue);
  }, []);

  const handleAddToQueue = useCallback(async (item) => {
    setQueue(prev => {
      if (prev.some(q => q.en === item.en)) return prev;
      const updated = [...prev, item];
      saveQueue(updated);
      return updated;
    });
  }, []);

  const TABS = [
    { key: 'books', label: 'Books' },
    { key: 'meaning', label: `Meaning Discovery${queue.length ? ` (${queue.length})` : ''}` },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: activeTheme.bg }}>
      {/* Tab bar */}
      <View style={{ flexDirection: 'row', backgroundColor: activeTheme.card, borderBottomWidth: 1, borderBottomColor: activeTheme.border }}>
        {TABS.map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} activeOpacity={0.8}
            style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: activeTab === tab.key ? activeTheme.accent : 'transparent' }}>
            <Text style={{ fontSize: 13, fontWeight: activeTab === tab.key ? '700' : '600', color: activeTab === tab.key ? activeTheme.accent : activeTheme.subText }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'books'
        ? <BooksTab activeTheme={activeTheme} onAddToQueue={handleAddToQueue} />
        : <MeaningDiscoveryTab activeTheme={activeTheme} queue={queue} onQueueUpdate={setQueue} />}
    </View>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  primaryBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  bookCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 14, gap: 12, borderWidth: 1 },
  coverCircle: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chapterCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 16, borderWidth: 1, gap: 10 },

  fontBtn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },

  matchChip: {
    borderWidth: 1.5, borderRadius: 12,
    paddingVertical: 10, paddingHorizontal: 10,
    minHeight: 52, justifyContent: 'center', alignItems: 'center',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2,
  },
  chipSelected: { borderColor: '#2D6A4F', backgroundColor: '#E8F5EE' },
  chipPaired: { borderColor: '#52B788', backgroundColor: '#EEF6F1' },
  chipMatched: { borderColor: '#2D6A4F', backgroundColor: '#D4EDDA' },
  chipWrong: { borderColor: '#dc2626', backgroundColor: '#FDECEA' },

  pairNumBadge: {
    position: 'absolute', top: 4, left: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#2D6A4F', alignItems: 'center', justifyContent: 'center',
  },
  pairNumText: { fontSize: 10, color: '#fff', fontWeight: '800' },

  resultBox: { borderRadius: 16, padding: 20, gap: 10, alignItems: 'center', borderWidth: 1 },
});
