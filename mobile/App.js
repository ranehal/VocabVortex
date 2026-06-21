import './global.css';
import { GROQ_API_KEY } from './constants';
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

// ── Hardcoded ReadFlow books (no backend needed) ──────────────────────────────
const READFLOW_BOOKS = [
  {
    _id: 'alchemist',
    title: 'The Alchemist',
    coverEmoji: '📘',
    chapters: [
      {
        _id: 'ch1',
        title: 'Chapter 1 — The Shepherd',
        text: "THE BOY'S NAME WAS (ছেলেটির নাম ছিল) SANTIAGO. DUSK was falling (সন্ধ্যা নামছিল), and he arrived (এবং সে পৌঁছাল) with his herd (তার পশুপাল নিয়ে) at an abandoned church (একটি পরিত্যক্ত গির্জায়). The roof had fallen in (ছাদ ভেঙে পড়েছিল), and an enormous sycamore had grown (এবং একটি বিশাল ডুমুর গাছ জন্মেছিল) on the spot (সেই জায়গায়) where the sacristy had once stood (যেখানে একসময় পবিত্র কক্ষ ছিল).",
      },
      {
        _id: 'ch2',
        title: 'Chapter 2 — The Dream',
        text: "He had learned (সে শিখেছিল) that the world was full of signs (পৃথিবী সংকেতে পূর্ণ), but people often ignored them (কিন্তু মানুষ প্রায়ই সেগুলো উপেক্ষা করে). The boy fell asleep (ছেলেটি ঘুমিয়ে পড়ল) and dreamed (এবং স্বপ্ন দেখল) once again (আবারও) about the treasure (ধনের কথা). He saw the same child (সে একই শিশুকে দেখল) and the Egyptian pyramids (এবং মিশরীয় পিরামিড).",
      },
      {
        _id: 'ch3',
        title: 'Chapter 3 — The Old King',
        text: "The old man (বৃদ্ধ লোকটি) said his name was Melchizedek (বলল তার নাম মেলকিজেডেক) and that he was the king of Salem (এবং সে সালেমের রাজা). Everyone (প্রত্যেকে) at some point in their lives (জীবনের কোনো এক সময়) discovers their Personal Legend (তাদের ব্যক্তিগত কিংবদন্তি আবিষ্কার করে). It is their only real obligation (এটাই তাদের একমাত্র প্রকৃত দায়িত্ব). When you want something (যখন তুমি কিছু চাও), all the universe conspires (সমগ্র মহাবিশ্ব ষড়যন্ত্র করে) in helping you to achieve it (তোমাকে তা অর্জনে সাহায্য করতে).",
      },
      {
        _id: 'ch4',
        title: 'Chapter 4 — The Desert',
        text: "The desert (মরুভূমি) is a capricious (খামখেয়ালি) and dangerous place (এবং বিপজ্জনক জায়গা). Every stone (প্রতিটি পাথর) and every grain of sand (এবং প্রতিটি বালিকণা) was speaking to him (তার সাথে কথা বলছিল). He understood (সে বুঝল) that the Soul of the World (যে বিশ্বের আত্মা) was nourishing him (তাকে পুষ্টি দিচ্ছিল) because it was also his dream (কারণ এটাও তার স্বপ্ন ছিল).",
      },
    ],
  },
  {
    _id: 'easy',
    title: 'Easy English',
    coverEmoji: '📗',
    chapters: [
      {
        _id: 'e1',
        title: 'A Simple Morning',
        text: "I wake up early (আমি সকালে তাড়াতাড়ি উঠি). I drink water (আমি পানি পান করি). Then I go to school (তারপর আমি স্কুলে যাই). My teacher is kind (আমার শিক্ষক দয়ালু). I like to read (আমি পড়তে পছন্দ করি) and learn new words (এবং নতুন শব্দ শিখতে).",
      },
      {
        _id: 'e2',
        title: 'At the Market',
        text: "The market is busy (বাজার ব্যস্ত). People are buying (মানুষজন কিনছে) fruits and vegetables (ফল এবং সবজি). The seller is shouting (বিক্রেতা চিৎকার করছে). My mother picks the best ones (আমার মা সবচেয়ে ভালোগুলো বেছে নেন). We carry the bags (আমরা ব্যাগগুলো বহন করি) and walk back home (এবং বাড়ি ফিরে হাঁটি).",
      },
    ],
  },
  {
    _id: 'proverbs',
    title: 'English Proverbs',
    coverEmoji: '📙',
    chapters: [
      {
        _id: 'p1',
        title: 'Wisdom & Life',
        text: "Actions speak (কাজই বলে) louder than words (কথার চেয়ে জোরে). Every cloud (প্রতিটি মেঘের) has a silver lining (একটি রুপালি আস্তরণ আছে). Time and tide (সময় এবং জোয়ার) wait for no man (কারো জন্য অপেক্ষা করে না). Knowledge is power (জ্ঞানই শক্তি). The early bird (ভোরের পাখি) catches the worm (কীট ধরে).",
      },
      {
        _id: 'p2',
        title: 'Success & Failure',
        text: "No pain (কোনো কষ্ট নেই), no gain (কোনো লাভ নেই). Practice makes (অনুশীলন করে) a man perfect (মানুষকে নিখুঁত). Fortune favors (ভাগ্য পক্ষপাত করে) the brave (সাহসীদের). Look before (দেখো আগে) you leap (তুমি লাফ দেওয়ার)। Better late (দেরি হওয়া ভালো) than never (না আসার চেয়ে).",
      },
    ],
  },
];

// ── Hardcoded LexFlow passages (no backend needed) ────────────────────────────
const LEXFLOW_PASSAGES = [
  {
    _id: 'lp1',
    order: 1,
    level: 'A2',
    passage: "Santiago was a young shepherd boy who traveled across the land with his sheep. He had a dream about finding treasure near the Egyptian pyramids. His journey taught him that the world has a language that everyone can understand.",
    words: [
      { english: 'shepherd', bengali: 'রাখাল' },
      { english: 'treasure', bengali: 'ধন' },
      { english: 'journey', bengali: 'যাত্রা' },
      { english: 'dream', bengali: 'স্বপ্ন' },
      { english: 'language', bengali: 'ভাষা' },
      { english: 'pyramids', bengali: 'পিরামিড' },
      { english: 'traveled', bengali: 'ভ্রমণ করেছিল' },
      { english: 'understand', bengali: 'বোঝা' },
      { english: 'taught', bengali: 'শিখিয়েছিল' },
      { english: 'world', bengali: 'পৃথিবী' },
    ],
  },
  {
    _id: 'lp2',
    order: 2,
    level: 'B1',
    passage: "The alchemist told Santiago that when you want something with all your heart, the entire universe conspires to help you achieve it. Personal legend is the path that destiny has chosen for each person on Earth.",
    words: [
      { english: 'alchemist', bengali: 'আলকেমিস্ট' },
      { english: 'universe', bengali: 'মহাবিশ্ব' },
      { english: 'conspires', bengali: 'ষড়যন্ত্র করে' },
      { english: 'achieve', bengali: 'অর্জন করা' },
      { english: 'destiny', bengali: 'ভাগ্য' },
      { english: 'legend', bengali: 'কিংবদন্তি' },
      { english: 'personal', bengali: 'ব্যক্তিগত' },
      { english: 'chosen', bengali: 'বেছে নেওয়া' },
      { english: 'entire', bengali: 'সম্পূর্ণ' },
      { english: 'heart', bengali: 'হৃদয়' },
    ],
  },
  {
    _id: 'lp3',
    order: 3,
    level: 'B1',
    passage: "Fatima was a woman of the desert who believed that love should never hold a person back from pursuing their personal legend. True love supports freedom and growth rather than creating fear or dependency.",
    words: [
      { english: 'desert', bengali: 'মরুভূমি' },
      { english: 'believed', bengali: 'বিশ্বাস করতেন' },
      { english: 'pursuing', bengali: 'অনুসরণ করা' },
      { english: 'freedom', bengali: 'স্বাধীনতা' },
      { english: 'growth', bengali: 'বিকাশ' },
      { english: 'dependency', bengali: 'নির্ভরতা' },
      { english: 'supports', bengali: 'সমর্থন করে' },
      { english: 'creating', bengali: 'তৈরি করা' },
      { english: 'rather', bengali: 'বরং' },
      { english: 'woman', bengali: 'নারী' },
    ],
  },
  {
    _id: 'lp4',
    order: 4,
    level: 'B2',
    passage: "Omens are signs that the universe sends to guide people toward their destiny. A wise person learns to read these signs in everyday events — the flight of birds, the movement of the wind, or a conversation with a stranger.",
    words: [
      { english: 'omens', bengali: 'শুভ-অশুভ লক্ষণ' },
      { english: 'guide', bengali: 'পথ দেখানো' },
      { english: 'everyday', bengali: 'প্রতিদিনকার' },
      { english: 'stranger', bengali: 'অপরিচিত' },
      { english: 'movement', bengali: 'গতি' },
      { english: 'conversation', bengali: 'কথোপকথন' },
      { english: 'flight', bengali: 'উড়ান' },
      { english: 'sends', bengali: 'পাঠায়' },
      { english: 'toward', bengali: 'দিকে' },
      { english: 'wise', bengali: 'জ্ঞানী' },
    ],
  },
  {
    _id: 'lp5',
    order: 5,
    level: 'B2',
    passage: "The Soul of the World is a positive force that communicates through universal language. It exists within everything — in minerals, plants, animals, and people alike. Recognizing it requires patience and a silent mind.",
    words: [
      { english: 'force', bengali: 'শক্তি' },
      { english: 'communicates', bengali: 'যোগাযোগ করে' },
      { english: 'universal', bengali: 'সর্বজনীন' },
      { english: 'minerals', bengali: 'খনিজ পদার্থ' },
      { english: 'patience', bengali: 'ধৈর্য' },
      { english: 'recognizing', bengali: 'চেনা' },
      { english: 'requires', bengali: 'দরকার' },
      { english: 'silent', bengali: 'নীরব' },
      { english: 'positive', bengali: 'ইতিবাচক' },
      { english: 'exists', bengali: 'বিদ্যমান' },
    ],
  },
];

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

// ─── ReadFlow: Book Reader (Pathdhara-style) ─────────────────────────────────

const RF_BG = '#f5f0e8';
const RF_BG2 = '#faf7f2';
const RF_ACCENT = '#2e7d52';
const RF_AMBER = '#c8873a';
const RF_TEXT = '#1a1410';
const RF_TEXT2 = '#5a4a3a';
const RF_BORDER = 'rgba(26,20,16,0.12)';

// Meaning Discovery matching game (like Pathdhara's MeaningDiscoveryTab)
const RF_ROUND = 5;

const RFMeaningDiscovery = ({ queue, onRemove, onSendToEnd, activeTheme }) => {
  const [pairs, setPairs] = useState({});
  const [selectedEn, setSelectedEn] = useState(null);
  const [verified, setVerified] = useState(false);
  const [taint, setTaint] = useState(new Set());
  const [earnedPts, setEarnedPts] = useState(0);
  const [removing, setRemoving] = useState(false);

  const roundItems = useMemo(() => queue.slice(0, RF_ROUND), [queue]);
  const shuffledBn = useMemo(() => shuffleArray(roundItems.map(r => r.id)), [roundItems]);
  const engByBn = useMemo(() => {
    const m = {};
    Object.entries(pairs).forEach(([en, bn]) => { m[bn] = en; });
    return m;
  }, [pairs]);

  const allPaired = roundItems.length > 0 && roundItems.every(it => pairs[it.id] !== undefined);
  const allCorrect = verified && roundItems.every(it => pairs[it.id] === it.id);

  const tapEn = (id) => {
    if (verified) return;
    setSelectedEn(prev => prev === id ? null : id);
  };

  const tapBn = (benId) => {
    if (verified || !selectedEn) return;
    setPairs(prev => {
      const next = { ...prev };
      for (const e of Object.keys(next)) if (next[e] === benId) delete next[e];
      next[selectedEn] = benId;
      return next;
    });
    setSelectedEn(null);
  };

  const verify = () => {
    if (!allPaired || verified) return;
    const wrongIds = roundItems.filter(it => pairs[it.id] !== it.id).map(it => it.id);
    const correctIds = roundItems.filter(it => pairs[it.id] === it.id).map(it => it.id);
    let gained = 0;
    correctIds.forEach(id => { if (!taint.has(id)) gained += 0.5; });
    if (gained > 0) setEarnedPts(p => p + gained);
    if (wrongIds.length) setTaint(prev => new Set([...prev, ...wrongIds]));
    setVerified(true);
  };

  const nextRound = () => {
    setRemoving(true);
    const correctIds = roundItems.filter(it => pairs[it.id] === it.id).map(it => it.id);
    correctIds.forEach(id => onRemove(id));
    setPairs({});
    setSelectedEn(null);
    setVerified(false);
    setRemoving(false);
  };

  if (queue.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, backgroundColor: RF_BG2 }}>
        <Text style={{ fontSize: 36, opacity: 0.3 }}>✦</Text>
        <Text style={{ fontSize: 15, fontWeight: '800', color: RF_TEXT }}>Meaning Discovery</Text>
        <Text style={{ fontSize: 13, color: RF_TEXT2, textAlign: 'center', lineHeight: 22 }}>
          বই পড়তে পড়তে phrase-এ tap করলে এখানে জমা হবে।
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: RF_BG2 }} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: RF_BG, borderBottomWidth: 1, borderBottomColor: RF_BORDER }}>
        <View>
          <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: RF_TEXT2 }}>MEANING DISCOVERY</Text>
          <Text style={{ fontSize: 12, color: RF_ACCENT, fontWeight: '700', marginTop: 2 }}>{queue.length} বাকি</Text>
        </View>
        <View style={{ backgroundColor: RF_BG, borderWidth: 1, borderColor: RF_BORDER, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 }}>
          <Text style={{ fontSize: 12, color: RF_TEXT2 }}>{queue.length}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 12, color: RF_TEXT2, textAlign: 'center', paddingVertical: 10, fontStyle: 'italic' }}>
        প্রতিটি English-এর সাথে Bengali মিলান, তারপর "যাচাই করুন" চাপুন
      </Text>

      {/* Matching grid */}
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 12, paddingTop: 4 }}>
        {/* English col */}
        <View style={{ flex: 1, gap: 8 }}>
          {roundItems.map(item => {
            const paired = pairs[item.id];
            const isSelected = selectedEn === item.id;
            const correct = pairs[item.id] === item.id;
            return (
              <TouchableOpacity key={`en-${item.id}`} onPress={() => tapEn(item.id)} disabled={verified} activeOpacity={0.75}
                style={{
                  backgroundColor: verified ? (correct ? '#E8F8ED' : '#FDECEA') : isSelected ? '#E8F5EE' : paired ? '#EEF6F1' : '#fff',
                  borderWidth: 1.5,
                  borderColor: verified ? (correct ? '#2e7d52' : '#dc2626') : isSelected ? RF_ACCENT : paired ? '#a3d9b1' : RF_BORDER,
                  borderRadius: 10, minHeight: 52, justifyContent: 'center', alignItems: 'center', padding: 8,
                }}>
                <Text style={{ fontSize: 14, color: RF_TEXT, fontWeight: '700', textAlign: 'center' }}>{item.en}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Bengali col */}
        <View style={{ flex: 1, gap: 8 }}>
          {shuffledBn.map(benId => {
            const item = roundItems.find(r => r.id === benId);
            const pairedEng = engByBn[benId];
            const correct = pairedEng === benId;
            return (
              <TouchableOpacity key={`bn-${benId}`} onPress={() => tapBn(benId)} disabled={verified || !selectedEn} activeOpacity={0.75}
                style={{
                  backgroundColor: verified ? (pairedEng ? (correct ? '#E8F8ED' : '#FDECEA') : '#faf7f2') : pairedEng ? '#EEF6F1' : '#faf7f2',
                  borderWidth: 1.5,
                  borderColor: verified ? (pairedEng ? (correct ? '#2e7d52' : '#dc2626') : RF_BORDER) : pairedEng ? '#a3d9b1' : RF_BORDER,
                  borderRadius: 10, minHeight: 52, justifyContent: 'center', alignItems: 'center', padding: 8,
                }}>
                <Text style={{ fontSize: 14, color: RF_TEXT2, fontWeight: '700', textAlign: 'center' }}>{item?.bn}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Verify / Next */}
      <View style={{ padding: 16 }}>
        {!verified ? (
          <TouchableOpacity onPress={verify} disabled={!allPaired}
            style={{ backgroundColor: allPaired ? RF_ACCENT : 'rgba(0,0,0,0.1)', borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: allPaired ? '#fff' : RF_TEXT2, fontWeight: '700', fontSize: 15 }}>যাচাই করুন</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ gap: 10 }}>
            <View style={{ backgroundColor: allCorrect ? '#E8F8ED' : '#FDECEA', borderRadius: 12, padding: 14, alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: allCorrect ? '#2e7d52' : '#dc2626' }}>
                {allCorrect ? '🎉 সব সঠিক!' : '❌ কিছু ভুল — ভুলগুলো আবার আসবে'}
              </Text>
              <Text style={{ fontSize: 13, color: RF_TEXT2, fontWeight: '600' }}>অর্জিত: +{earnedPts.toFixed(1)} pts</Text>
            </View>
            <TouchableOpacity onPress={nextRound} disabled={removing}
              style={{ backgroundColor: RF_ACCENT, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                {allCorrect && queue.length <= roundItems.length ? 'সম্পন্ন ✓' : 'পরবর্তী রাউন্ড →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// Book Reader Screen (full-screen, like Pathdhara's BookReaderScreen)
const RFBookReader = ({ book, chapter, onBack, queue, onAddToQueue, activeTheme }) => {
  const [fontSize, setFontSize] = useState(17);
  const [revealedIdx, setRevealedIdx] = useState(null);
  const chunks = useMemo(() => parseReadFlowText(chapter.text), [chapter.text]);

  const handleChunkTap = (chunk, i) => {
    if (!chunk.bn) return;
    setRevealedIdx(i);
    setTimeout(() => setRevealedIdx(null), 4000);
    Speech.speak(chunk.en.trim(), { language: 'en-US' });
    onAddToQueue(chunk);
  };

  return (
    <View style={{ flex: 1, backgroundColor: RF_BG2 }}>
      {/* Toolbar */}
      <View style={{ backgroundColor: RF_BG, borderBottomWidth: 1, borderBottomColor: RF_BORDER, paddingHorizontal: 12, paddingVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={onBack} style={{ padding: 6, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.05)' }}>
            <Text style={{ fontSize: 18, color: RF_TEXT }}>‹ Back</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '900', color: RF_TEXT }} numberOfLines={1}>{chapter.title}</Text>
            <Text style={{ fontSize: 11, color: RF_TEXT2 }}>{book.coverEmoji} {book.title}</Text>
          </View>
          {/* Font size */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10, overflow: 'hidden' }}>
            <TouchableOpacity onPress={() => setFontSize(f => Math.max(12, f - 1))} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ fontSize: 16, color: RF_TEXT, fontWeight: '700' }}>−</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 13, color: RF_TEXT, fontWeight: '700', minWidth: 24, textAlign: 'center' }}>{fontSize}</Text>
            <TouchableOpacity onPress={() => setFontSize(f => Math.min(34, f + 1))} style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ fontSize: 16, color: RF_TEXT, fontWeight: '700' }}>+</Text>
            </TouchableOpacity>
          </View>
          {/* Queue badge */}
          {queue.length > 0 && (
            <View style={{ backgroundColor: RF_ACCENT, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{queue.length} saved</Text>
            </View>
          )}
        </View>
        <Text style={{ fontSize: 11, color: RF_TEXT2, marginTop: 6, fontStyle: 'italic' }}>
          💡 Tap any highlighted phrase to reveal meaning & save
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 60 }}>
        <Text style={{ fontSize: fontSize, lineHeight: fontSize * 2.1, color: RF_TEXT, flexWrap: 'wrap' }}>
          {chunks.map((chunk, i) => {
            if (!chunk.bn) {
              return <Text key={i} style={{ fontFamily: 'serif' }}>{chunk.en}</Text>;
            }
            const revealed = revealedIdx === i;
            return (
              <Text key={i}>
                <Text
                  onPress={() => handleChunkTap(chunk, i)}
                  suppressHighlighting
                  style={{ color: revealed ? RF_ACCENT : RF_AMBER, fontWeight: '700', textDecorationLine: 'underline', textDecorationColor: 'rgba(200,135,58,0.4)' }}
                >
                  {chunk.en.trim()}
                </Text>
                {revealed ? (
                  <Text style={{ color: RF_ACCENT, fontSize: fontSize * 0.85, fontWeight: '600' }}> ({chunk.bn})</Text>
                ) : null}
                <Text>{' '}</Text>
              </Text>
            );
          })}
        </Text>
      </ScrollView>
    </View>
  );
};

// Main ReadFlow Page (2 tabs: Books | Meaning Discovery)
const ReadFlowPage = ({ activeTheme }) => {
  const [activeTab, setActiveTab] = useState('books');
  const [queue, setQueue] = useState([]);
  const [reader, setReader] = useState(null); // { book, chapter }

  useEffect(() => {
    AsyncStorage.getItem(READFLOW_STORE_KEY).then(saved => {
      if (saved) {
        try { setQueue(JSON.parse(saved).queue || []); } catch (e) {}
      }
    });
  }, []);

  const persistQueue = async (q) => {
    try { await AsyncStorage.setItem(READFLOW_STORE_KEY, JSON.stringify({ queue: q })); } catch (e) {}
  };

  const addToQueue = (chunk) => {
    if (!chunk.bn) return;
    const item = { id: `${Date.now()}-${Math.random()}`, en: chunk.en.trim(), bn: chunk.bn };
    setQueue(prev => {
      const next = [...prev, item];
      persistQueue(next);
      return next;
    });
  };

  const removeFromQueue = (id) => {
    setQueue(prev => {
      const next = prev.filter(q => q.id !== id);
      persistQueue(next);
      return next;
    });
  };

  const sendToEnd = (id) => {
    setQueue(prev => {
      const idx = prev.findIndex(q => q.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.push(item);
      persistQueue(next);
      return next;
    });
  };

  // Full-screen reader
  if (reader) {
    return (
      <RFBookReader
        book={reader.book}
        chapter={reader.chapter}
        onBack={() => setReader(null)}
        queue={queue}
        onAddToQueue={addToQueue}
        activeTheme={activeTheme}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: RF_BG }}>
      {/* Tab bar */}
      <View style={{ flexDirection: 'row', backgroundColor: RF_BG, borderBottomWidth: 1, borderBottomColor: RF_BORDER }}>
        {[{ key: 'books', label: 'Books' }, { key: 'meaning', label: 'Meaning Discovery' }].map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} activeOpacity={0.8}
            style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: activeTab === tab.key ? RF_ACCENT : 'transparent' }}>
            <Text style={{ fontSize: 12, fontWeight: activeTab === tab.key ? '800' : '600', color: activeTab === tab.key ? RF_ACCENT : RF_TEXT2, letterSpacing: 0.3 }}>
              {tab.label}{tab.key === 'meaning' && queue.length > 0 ? ` (${queue.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Books tab */}
      {activeTab === 'books' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
          <Text style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1.5, color: RF_TEXT2, marginBottom: 4 }}>SELECT A BOOK</Text>
          {READFLOW_BOOKS.map(book => (
            <View key={book._id} style={{ backgroundColor: RF_BG2, borderRadius: 14, borderWidth: 1, borderColor: RF_BORDER, overflow: 'hidden' }}>
              {/* Book header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, backgroundColor: RF_BG, borderBottomWidth: 1, borderBottomColor: RF_BORDER }}>
                <View style={{ width: 48, height: 48, backgroundColor: RF_BG2, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: RF_BORDER }}>
                  <Text style={{ fontSize: 26 }}>{book.coverEmoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '900', color: RF_TEXT }}>{book.title}</Text>
                  <Text style={{ fontSize: 12, color: RF_TEXT2, marginTop: 2 }}>{book.chapters.length} chapters</Text>
                </View>
              </View>
              {/* Chapters */}
              {book.chapters.map((ch, ci) => (
                <TouchableOpacity key={ch._id} onPress={() => setReader({ book, chapter: ch })} activeOpacity={0.85}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: ci < book.chapters.length - 1 ? 1 : 0, borderBottomColor: RF_BORDER, gap: 10 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: RF_ACCENT, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>{ci + 1}</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, color: RF_TEXT, fontWeight: '600' }}>{ch.title}</Text>
                  <Text style={{ fontSize: 18, color: RF_TEXT2 }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Meaning Discovery tab */}
      {activeTab === 'meaning' && (
        <RFMeaningDiscovery
          queue={queue}
          onRemove={removeFromQueue}
          onSendToEnd={sendToEnd}
          activeTheme={activeTheme}
        />
      )}
    </View>
  );
};

// ─── LexFlow Word Matching ───────────────────────────────────────────────────

const ROUND_SIZE = 5;

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LexFlowPage = ({ activeTheme }) => {
  const [passages, setPassages] = useState([]);
  const [loadingPassages, setLoadingPassages] = useState(true);
  const [viewIndex, setViewIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const [roundIndex, setRoundIndex] = useState(0);
  const [selEng, setSelEng] = useState(null);
  const [selBen, setSelBen] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState(new Set());
  const [wrongPair, setWrongPair] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(new Set());
  const [roundDone, setRoundDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => { loadPassages(); }, []);

  useEffect(() => {
    setRoundIndex(0);
    setMatchedPairs(new Set());
    setSelEng(null);
    setSelBen(null);
    setWrongPair(null);
    setRoundDone(false);
    setEarnedPoints(0);
    setWrongAttempts(new Set());
    setBusy(false);
  }, [viewIndex]);

  const loadPassages = () => {
    setPassages(LEXFLOW_PASSAGES);
    setLoadingPassages(false);
  };

  const currentPassage = passages[viewIndex] ?? null;
  const totalPassages = passages.length;
  const totalRounds = currentPassage ? Math.ceil(currentPassage.words.length / ROUND_SIZE) : 0;
  const isReviewing = viewIndex < progress;

  const roundWords = useMemo(() => {
    if (!currentPassage) return [];
    const start = roundIndex * ROUND_SIZE;
    return currentPassage.words.slice(start, start + ROUND_SIZE).map((w, i) => ({
      ...w,
      idx: start + i,
    }));
  }, [currentPassage, roundIndex]);

  const shuffledBengali = useMemo(() => shuffleArray(roundWords.map(w => w.idx)), [roundWords]);

  const tryMatch = (eng, ben) => {
    setBusy(true);
    if (eng === ben) {
      const next = new Set(matchedPairs).add(eng);
      setMatchedPairs(next);
      const done = next.size === roundWords.length;
      if (!isReviewing && !wrongAttempts.has(eng)) setEarnedPoints(p => p + 0.5);
      setTimeout(() => {
        setSelEng(null); setSelBen(null); setBusy(false);
        if (done) setRoundDone(true);
      }, 400);
    } else {
      setWrongAttempts(prev => new Set(prev).add(eng));
      setWrongPair({ eng, ben });
      setTimeout(() => { setWrongPair(null); setSelEng(null); setSelBen(null); setBusy(false); }, 700);
    }
  };

  const handleEngTap = (idx, word) => {
    if (matchedPairs.has(idx) || roundDone || busy) return;
    setSelEng(idx); setWrongPair(null);
    Speech.speak(word, { language: 'en-US' });
    if (selBen !== null) tryMatch(idx, selBen);
  };

  const handleBenTap = (idx) => {
    if (matchedPairs.has(idx) || roundDone || busy) return;
    setSelBen(idx); setWrongPair(null);
    if (selEng !== null) tryMatch(selEng, idx);
  };

  const handleNextRound = () => {
    setRoundIndex(r => r + 1);
    setMatchedPairs(new Set()); setSelEng(null); setSelBen(null);
    setWrongPair(null); setRoundDone(false); setWrongAttempts(new Set()); setBusy(false);
  };

  const handleComplete = () => {
    const next = progress + 1;
    setProgress(next);
    setViewIndex(next < totalPassages ? next : viewIndex);
    setRoundIndex(0); setMatchedPairs(new Set()); setSelEng(null); setSelBen(null);
    setWrongPair(null); setRoundDone(false); setWrongAttempts(new Set()); setBusy(false);
    setEarnedPoints(0);
  };

  const canGoPrev = viewIndex > 0;
  const canGoNext = viewIndex < progress && viewIndex < totalPassages - 1;
  const isLastRound = roundIndex >= totalRounds - 1;

  if (loadingPassages) {
    return (
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={[styles.viewContainer, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
        <ActivityIndicator size="large" color={activeTheme.accent} />
        <Text style={{ color: activeTheme.subText, marginTop: 16, fontWeight: '700' }}>Loading LexFlow...</Text>
      </MotiView>
    );
  }

  if (!currentPassage) {
    return (
      <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={[styles.viewContainer, { alignItems: 'center', justifyContent: 'center', flex: 1 }]}>
        <Text style={{ color: activeTheme.text, fontSize: 40, marginBottom: 16 }}>📚</Text>
        <Text style={{ color: activeTheme.subText, textAlign: 'center' }}>
          No passages found.{'\n'}Visit {BASE_URL}/api/seed-lexflow to seed data.
        </Text>
        <TouchableOpacity onPress={loadPassages} style={{ marginTop: 20, backgroundColor: activeTheme.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Retry</Text>
        </TouchableOpacity>
      </MotiView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: activeTheme.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: activeTheme.text, fontSize: 22, fontWeight: '900' }}>
          LEX<Text style={{ color: activeTheme.accent }}>FLOW</Text>
        </Text>
        <Text style={{ color: activeTheme.subText, fontSize: 11, fontWeight: '700' }}>
          P{viewIndex + 1}/{totalPassages} · R{roundIndex + 1}/{totalRounds}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
        <View style={{ width: `${totalPassages > 0 ? (progress / totalPassages) * 100 : 0}%`, height: '100%', backgroundColor: activeTheme.accent, borderRadius: 2 }} />
      </View>

      {/* Nav + speak row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setViewIndex(i => Math.max(i - 1, 0))}
          disabled={!canGoPrev}
          style={{ borderWidth: 1, borderColor: activeTheme.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, opacity: canGoPrev ? 1 : 0.3 }}
        >
          <Text style={{ color: activeTheme.accent, fontWeight: '700' }}>◀</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (speaking) { Speech.stop(); setSpeaking(false); }
            else { Speech.speak(currentPassage.passage, { language: 'en-US', onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false) }); setSpeaking(true); }
          }}
          style={{ flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingVertical: 6, alignItems: 'center' }}
        >
          <Text style={{ color: activeTheme.subText, fontSize: 12, fontWeight: '700' }}>{speaking ? '⏹ Stop' : '🔊 Read Aloud'}</Text>
        </TouchableOpacity>
        <View style={{ backgroundColor: activeTheme.accent, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>+{earnedPoints.toFixed(1)}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setViewIndex(i => Math.min(i + 1, progress, totalPassages - 1))}
          disabled={!canGoNext}
          style={{ borderWidth: 1, borderColor: activeTheme.accent, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, opacity: canGoNext ? 1 : 0.3 }}
        >
          <Text style={{ color: activeTheme.accent, fontWeight: '700' }}>▶</Text>
        </TouchableOpacity>
      </View>

      {isReviewing && (
        <View style={{ backgroundColor: '#FFF4E5', borderRadius: 10, padding: 10, marginBottom: 12 }}>
          <Text style={{ color: '#9A5B00', fontWeight: '700', textAlign: 'center', fontSize: 12 }}>🔁 রিভিউ মোড — পয়েন্ট নেই</Text>
        </View>
      )}

      {/* Passage card */}
      <View style={{ backgroundColor: activeTheme.card, borderRadius: 20, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        <Text style={{ color: activeTheme.subText, fontSize: 9, fontWeight: '900', letterSpacing: 2, marginBottom: 10 }}>PASSAGE · {currentPassage.level}</Text>
        <Text style={{ color: activeTheme.text, fontSize: 15, lineHeight: 26 }}>{currentPassage.passage}</Text>
      </View>

      {/* Match grid label */}
      <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 }}>শব্দ মেলান</Text>

      {/* Match grid */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {/* English column */}
        <View style={{ flex: 1, gap: 10 }}>
          {roundWords.map(w => {
            const matched = matchedPairs.has(w.idx);
            const selected = selEng === w.idx;
            const wrong = wrongPair?.eng === w.idx;
            return (
              <TouchableOpacity
                key={`eng-${w.idx}`}
                onPress={() => handleEngTap(w.idx, w.english)}
                onLongPress={() => Speech.speak(w.english, { language: 'en-US' })}
                disabled={matched || roundDone}
                activeOpacity={0.75}
                style={{
                  backgroundColor: matched ? 'transparent' : selected ? '#E8F5EE' : wrong ? '#FDECEA' : activeTheme.card,
                  borderWidth: 1.5,
                  borderColor: matched ? 'transparent' : selected ? '#2e7d52' : wrong ? '#dc2626' : 'rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: matched ? 0 : 1,
                }}
              >
                <Text style={{ fontSize: 14, color: matched ? '#2e7d52' : activeTheme.text, fontWeight: '600', textAlign: 'center' }}>
                  {w.english}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bengali column (shuffled) */}
        <View style={{ flex: 1, gap: 10 }}>
          {shuffledBengali.map(origIdx => {
            const w = currentPassage.words[origIdx];
            const matched = matchedPairs.has(origIdx);
            const selected = selBen === origIdx;
            const wrong = wrongPair?.ben === origIdx;
            return (
              <TouchableOpacity
                key={`ben-${origIdx}`}
                onPress={() => handleBenTap(origIdx)}
                disabled={matched || roundDone}
                activeOpacity={0.75}
                style={{
                  backgroundColor: matched ? 'transparent' : selected ? '#E8F0FF' : wrong ? '#FDECEA' : 'rgba(255,255,255,0.05)',
                  borderWidth: 1.5,
                  borderColor: matched ? 'transparent' : selected ? activeTheme.accent : wrong ? '#dc2626' : 'rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 10,
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: matched ? 0 : 1,
                }}
              >
                <Text style={{ fontSize: 14, color: matched ? '#2e7d52' : activeTheme.text, fontWeight: '600', textAlign: 'center' }}>
                  {w.bengali}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Round done */}
      {roundDone && (
        <View style={{ backgroundColor: '#D4EDDA', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#A3D9B1' }}>
          <Text style={{ fontSize: 28 }}>🎉</Text>
          <Text style={{ color: '#155724', fontWeight: '700', textAlign: 'center', marginTop: 6 }}>
            {isReviewing ? 'সম্পূর্ণ! (রিভিউ — কোনো পয়েন্ট নয়)' : `সম্পূর্ণ! +${earnedPoints.toFixed(1)} পয়েন্ট`}
          </Text>
        </View>
      )}

      {roundDone && (
        !isLastRound ? (
          <TouchableOpacity onPress={handleNextRound} style={{ backgroundColor: activeTheme.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Next Round →</Text>
          </TouchableOpacity>
        ) : isReviewing ? (
          canGoNext ? (
            <TouchableOpacity onPress={() => setViewIndex(i => i + 1)} style={{ backgroundColor: activeTheme.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>পরের Passage ▶</Text>
            </TouchableOpacity>
          ) : null
        ) : (
          <TouchableOpacity onPress={handleComplete} style={{ backgroundColor: activeTheme.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>Complete Passage ✓</Text>
          </TouchableOpacity>
        )
      )}
    </ScrollView>
  );
};

// ─── ClauseFlow: Sentence Word Scramble ──────────────────────────────────────

// ── ClauseFlow — Groq direct call (no server needed) ─────────────────────────

const CLAUSE_SYSTEM_PROMPT = `You are an English grammar analysis assistant. Analyze the given English sentence and break it into clauses and/or phrases.

Return ONLY valid JSON array (no markdown, no explanation):
[
  {
    "text": "<the clause or phrase text>",
    "type": "<e.g. main clause, subordinate clause, noun phrase, verb phrase, prepositional phrase, etc.>",
    "syntax": "<grammatical role: e.g. Subject + Verb + Object>",
    "meaning": "<Bengali meaning of this part>",
    "buildUp": ["<shortest form>", "<add more>", "<full form>"]
  }
]
Return 2–5 segments. BuildUp should show how the clause is built step by step (1–4 lines).`;

async function analyzeClause(sentence) {
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: CLAUSE_SYSTEM_PROMPT },
          { role: 'user', content: `Sentence: "${sentence.trim()}"` },
        ],
        temperature: 0.5,
        max_tokens: 1200,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error: ${err}`);
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? '';
    const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`বিশ্লেষণ ব্যর্থ হয়েছে: ${e.message}`);
  }
}

// Type → color palette
const TYPE_PALETTE = {
  'main clause':          { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  'independent clause':   { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  'subordinate clause':   { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  'dependent clause':     { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  'relative clause':      { bg: '#FFE4E6', text: '#9F1239', border: '#FDA4AF' },
  'adverbial clause':     { bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE' },
  'noun clause':          { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
  'noun phrase':          { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
  'verb phrase':          { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  'prepositional phrase': { bg: '#FFF7ED', text: '#9A3412', border: '#FDBA74' },
  'adjective phrase':     { bg: '#FEFCE8', text: '#854D0E', border: '#FDE047' },
  'subject':              { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  'predicate':            { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  'object':               { bg: '#ECFEFF', text: '#155E75', border: '#67E8F9' },
};
const DEFAULT_CLR = { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
const BUILDUP_COLORS = ['#EFF6FF', '#F0FDF4', '#FFFBEB', '#FDF4FF', '#FFF1F2', '#ECFEFF'];

function getClauseColor(type) {
  return TYPE_PALETTE[type?.toLowerCase().trim()] ?? DEFAULT_CLR;
}

// ── ClauseFlow Practice Tab (word scramble) ───────────────────────────────────

const ClausePracticePanel = ({ sentence, activeTheme, onGoToAnalysis, alreadyRewarded, onPointsEarned }) => {
  const [originalWords, setOriginalWords] = useState([]);
  const [pool, setPool] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const [earnedThis, setEarnedThis] = useState(false);
  const [speakingP, setSpeakingP] = useState(false);

  useEffect(() => {
    if (!sentence) return;
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    setOriginalWords(words);
    setPool(shuffleArray(words));
    setAnswer([]);
    setDone(false);
    setCorrect(false);
    setAwarded(false);
    setEarnedThis(false);
    Speech.stop();
    setSpeakingP(false);
  }, [sentence]);

  if (!sentence) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Text style={{ fontSize: 44 }}>✏️</Text>
        <Text style={{ color: activeTheme.subText, textAlign: 'center', marginTop: 14, lineHeight: 22 }}>
          Texts tab-এ একটি বাক্য analyze করুন, তারপর Practice করুন।
        </Text>
      </View>
    );
  }

  const tapPool = (word, idx) => {
    if (done) return;
    const p = [...pool]; p.splice(idx, 1);
    setPool(p); setAnswer(a => [...a, word]);
  };

  const tapAnswer = (word, idx) => {
    if (done) return;
    const a = [...answer]; a.splice(idx, 1);
    setAnswer(a); setPool(p => [...p, word]);
  };

  const verify = () => {
    const ok = answer.join(' ') === originalWords.join(' ');
    setCorrect(ok); setDone(true);
    const award = ok && !awarded && !alreadyRewarded;
    setEarnedThis(award);
    if (award) { onPointsEarned(2); setAwarded(true); }
  };

  const reset = () => {
    setPool(shuffleArray(originalWords));
    setAnswer([]); setDone(false); setCorrect(false); setEarnedThis(false);
  };

  const handleSpeak = () => {
    if (speakingP) { Speech.stop(); setSpeakingP(false); }
    else { Speech.speak(sentence, { language: 'en-US', onDone: () => setSpeakingP(false), onStopped: () => setSpeakingP(false) }); setSpeakingP(true); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: activeTheme.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
      {/* Instruction row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: activeTheme.text, fontSize: 15, fontWeight: '700', flex: 1 }}>শব্দগুলো সঠিক ক্রমে সাজান</Text>
        <TouchableOpacity
          onPress={handleSpeak}
          style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}
        >
          <Text style={{ color: activeTheme.subText, fontSize: 13, fontWeight: '700' }}>{speakingP ? '⏹ থামান' : '🔊 শুনুন'}</Text>
        </TouchableOpacity>
      </View>

      {/* Answer area */}
      <View style={{
        minHeight: 72, borderWidth: 2,
        borderColor: done ? (correct ? '#2e7d52' : '#dc2626') : 'rgba(255,255,255,0.2)',
        borderStyle: done ? 'solid' : 'dashed',
        borderRadius: 14, padding: 12,
        justifyContent: 'center', backgroundColor: activeTheme.card, marginBottom: 12,
      }}>
        {answer.length === 0
          ? <Text style={{ color: activeTheme.subText, textAlign: 'center', fontSize: 13, fontStyle: 'italic' }}>এখানে শব্দ ট্যাপ করে সাজান…</Text>
          : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {answer.map((w, i) => (
                <TouchableOpacity key={`ans-${i}`} onPress={() => tapAnswer(w, i)} disabled={done} activeOpacity={0.7}
                  style={{ backgroundColor: '#E8F5EE', borderWidth: 1.5, borderColor: '#2e7d52', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 }}>
                  <Text style={{ color: '#1a5e30', fontWeight: '700', fontSize: 14 }}>{w}</Text>
                </TouchableOpacity>
              ))}
            </View>
        }
      </View>

      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 12 }} />

      {/* Word pool */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10,
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 14, minHeight: 56, marginBottom: 18 }}>
        {pool.map((w, i) => (
          <TouchableOpacity key={`pool-${i}`} onPress={() => tapPool(w, i)} disabled={done} activeOpacity={0.7}
            style={{ backgroundColor: activeTheme.card, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 }}>
            <Text style={{ color: activeTheme.text, fontWeight: '600', fontSize: 14 }}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!done && (
        <TouchableOpacity onPress={verify} disabled={answer.length !== originalWords.length}
          style={{ backgroundColor: activeTheme.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: answer.length !== originalWords.length ? 0.4 : 1 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>যাচাই করুন ✓</Text>
        </TouchableOpacity>
      )}

      {done && (
        <View style={{ backgroundColor: correct ? '#D4EDDA' : '#FDECEA', borderRadius: 16, padding: 20, alignItems: 'center',
          borderWidth: 1, borderColor: correct ? '#A3D9B1' : '#FFCCCC' }}>
          <Text style={{ fontSize: 30, marginBottom: 8 }}>{correct ? '🎉' : '❌'}</Text>
          <Text style={{ color: correct ? '#155724' : '#721c24', fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
            {correct ? (earnedThis ? 'সঠিক! +২ পয়েন্ট' : 'সঠিক! (আগেই পয়েন্ট পেয়েছেন)') : 'ভুল হয়েছে'}
          </Text>
          {!correct && <Text style={{ color: '#856404', marginTop: 10, fontSize: 13, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 }}>{sentence}</Text>}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity onPress={reset} style={{ backgroundColor: '#6c757d', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>আবার চেষ্টা</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onGoToAnalysis} style={{ borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: activeTheme.subText, fontWeight: '600' }}>Analysis-এ ফিরুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

// ── ClauseFlow Analysis Tab ───────────────────────────────────────────────────

const ClauseAnalysisPanel = ({ sentence, segments, activeTheme, onPractice }) => {
  const [sentenceSpeaking, setSentenceSpeaking] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [spoken, setSpoken] = useState(new Set());

  useEffect(() => { setSpoken(new Set()); setSentenceSpeaking(false); setSpeakingIdx(null); }, [sentence]);

  if (!sentence || !segments.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <Text style={{ fontSize: 44 }}>🔬</Text>
        <Text style={{ color: activeTheme.subText, textAlign: 'center', marginTop: 14, lineHeight: 22 }}>
          Texts tab থেকে একটি বাক্য analyze করুন।
        </Text>
      </View>
    );
  }

  const speakSequence = (segIdx, lines) => {
    if (speakingIdx === segIdx) { Speech.stop(); setSpeakingIdx(null); return; }
    setSpeakingIdx(segIdx);
    setSpoken(prev => new Set(prev).add(segIdx));
    const playLine = (i) => {
      if (i >= lines.length) { setSpeakingIdx(null); return; }
      Speech.speak(lines[i], { language: 'en-US', onDone: () => setTimeout(() => playLine(i + 1), 600), onError: () => setSpeakingIdx(null) });
    };
    playLine(0);
  };

  const handleSpeakSentence = () => {
    if (sentenceSpeaking) { Speech.stop(); setSentenceSpeaking(false); }
    else { Speech.speak(sentence, { language: 'en-US', onDone: () => setSentenceSpeaking(false), onStopped: () => setSentenceSpeaking(false) }); setSentenceSpeaking(true); }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: activeTheme.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 14 }}>
      {/* Original sentence card */}
      <View style={{ backgroundColor: activeTheme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>SENTENCE</Text>
          <TouchableOpacity onPress={handleSpeakSentence}>
            <Text style={{ fontSize: 20 }}>{sentenceSpeaking ? '⏹' : '🔊'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: activeTheme.text, fontSize: 15, fontStyle: 'italic', lineHeight: 24 }}>{sentence}</Text>
      </View>

      {/* Breakdown chips */}
      <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>BREAKDOWN</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, backgroundColor: activeTheme.card, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
        {segments.map((seg, i) => {
          const c = getClauseColor(seg.type);
          return (
            <View key={i} style={{ borderRadius: 8, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg, paddingVertical: 4, paddingHorizontal: 10 }}>
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>{seg.text}</Text>
            </View>
          );
        })}
      </View>

      {/* Detail cards */}
      <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>DETAILS</Text>
      {segments.map((seg, segIdx) => {
        const c = getClauseColor(seg.type);
        const buildUp = seg.buildUp?.length ? seg.buildUp : [seg.text];
        const isSpeaking = speakingIdx === segIdx;
        return (
          <View key={segIdx} style={{ backgroundColor: activeTheme.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 10 }}>
            {/* Header: text + type badge */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <Text style={{ flex: 1, color: activeTheme.text, fontSize: 15, fontWeight: '700', lineHeight: 22 }}>{seg.text}</Text>
              <View style={{ borderRadius: 6, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg, paddingVertical: 3, paddingHorizontal: 8 }}>
                <Text style={{ color: c.text, fontSize: 11, fontWeight: '700' }}>{seg.type}</Text>
              </View>
            </View>
            {/* Syntax */}
            {seg.syntax ? <Text style={{ color: activeTheme.accent, fontSize: 13, fontStyle: 'italic' }}>({seg.syntax})</Text> : null}
            {/* Meaning */}
            <Text style={{ color: activeTheme.subText, fontSize: 13, lineHeight: 20 }}>{seg.meaning}</Text>
            {/* Build-up */}
            <View style={{ gap: 4 }}>
              {buildUp.map((line, li) => (
                <View key={li} style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 8,
                  paddingVertical: 6, paddingHorizontal: 10, gap: 8,
                  backgroundColor: BUILDUP_COLORS[li % BUILDUP_COLORS.length] }}>
                  <Text style={{ color: '#888', fontSize: 11, fontWeight: '700', width: 16, textAlign: 'center' }}>{li + 1}</Text>
                  <Text style={{ color: '#333', fontSize: 13, fontWeight: '500', flex: 1 }}>{line}</Text>
                </View>
              ))}
            </View>
            {/* Speak All button */}
            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 10 }}>
              <TouchableOpacity
                onPress={() => speakSequence(segIdx, buildUp)}
                style={{ borderWidth: 1, borderColor: isSpeaking ? '#dc2626' : 'rgba(255,255,255,0.2)',
                  borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, alignSelf: 'flex-start',
                  backgroundColor: isSpeaking ? '#FEF2F2' : 'transparent' }}>
                <Text style={{ color: isSpeaking ? '#dc2626' : activeTheme.subText, fontSize: 12, fontWeight: '600' }}>
                  {isSpeaking ? '⏹ Stop' : '🔊 Speak All'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      {/* Practice button */}
      <TouchableOpacity
        onPress={onPractice}
        disabled={spoken.size < segments.length}
        style={{ backgroundColor: spoken.size < segments.length ? '#666' : activeTheme.accent,
          borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: spoken.size < segments.length ? 0.6 : 1 }}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
          {spoken.size < segments.length
            ? `🔊 সব অংশ "Speak All" দিয়ে শুনুন (${spoken.size}/${segments.length})`
            : '✏️ Practice এই sentence'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ── ClauseFlow Main Page ──────────────────────────────────────────────────────

const ClauseFlowPage = ({ activeTheme }) => {
  const [activeTab, setActiveTab] = useState('texts');
  const [input, setInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentSentence, setCurrentSentence] = useState('');
  const [segments, setSegments] = useState([]);
  const [score, setScore] = useState(0);
  const [rewarded, setRewarded] = useState(new Set());

  const handleAnalyze = async (sentence) => {
    const trimmed = (sentence || input).trim();
    if (!trimmed) return;
    setAnalyzing(true);
    try {
      const result = await analyzeClause(trimmed);
      if (!Array.isArray(result) || !result.length) throw new Error('বিশ্লেষণ ব্যর্থ হয়েছে।');
      setCurrentSentence(trimmed);
      setSegments(result);
      setHistory(prev => [{ id: Date.now().toString(), sentence: trimmed }, ...prev.filter(h => h.sentence !== trimmed)].slice(0, 20));
      setActiveTab('analysis');
      setInput('');
    } catch (e) {
      Alert.alert('Error', e.message ?? 'Analysis failed. Backend চলছে কিনা check করো।');
    } finally {
      setAnalyzing(false);
    }
  };

  const handlePointsEarned = (pts) => {
    if (!rewarded.has(currentSentence)) {
      setScore(s => s + pts);
      setRewarded(prev => new Set(prev).add(currentSentence));
    }
  };

  const TABS_CF = [
    { key: 'texts', label: 'Texts' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'practice', label: 'Practice' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: activeTheme.bg }}>
      {/* Tab bar */}
      <View style={{ flexDirection: 'row', backgroundColor: activeTheme.card, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
        {TABS_CF.map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} activeOpacity={0.8}
            style={{ flex: 1, paddingVertical: 14, alignItems: 'center',
              borderBottomWidth: 3, borderBottomColor: activeTab === tab.key ? activeTheme.accent : 'transparent' }}>
            <Text style={{ fontSize: 13, fontWeight: activeTab === tab.key ? '700' : '600',
              color: activeTab === tab.key ? activeTheme.accent : activeTheme.subText }}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Score badge */}
        <View style={{ justifyContent: 'center', paddingHorizontal: 14 }}>
          <View style={{ backgroundColor: activeTheme.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{score}pt</Text>
          </View>
        </View>
      </View>

      {/* Texts tab */}
      {activeTab === 'texts' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 14 }} keyboardShouldPersistTaps="handled">
          {/* Input card */}
          <View style={{ backgroundColor: activeTheme.card, borderRadius: 16, padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Text style={{ color: activeTheme.subText, fontSize: 11, fontWeight: '900', letterSpacing: 1 }}>ENGLISH SENTENCE লিখুন</Text>
            <TextInput
              style={{ borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12,
                fontSize: 15, color: activeTheme.text, minHeight: 80, backgroundColor: activeTheme.bg, lineHeight: 22, textAlignVertical: 'top' }}
              placeholder="e.g. Although she was tired, she kept working…"
              placeholderTextColor={activeTheme.subText}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity onPress={() => handleAnalyze()} disabled={!input.trim() || analyzing}
              style={{ backgroundColor: activeTheme.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center', opacity: (!input.trim() || analyzing) ? 0.45 : 1 }}>
              {analyzing
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>🔍 Analyze</Text>}
            </TouchableOpacity>
          </View>

          {/* History */}
          {history.length > 0 && (
            <>
              <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>RECENT SENTENCES</Text>
              {history.map(item => (
                <TouchableOpacity key={item.id} onPress={() => handleAnalyze(item.sentence)} disabled={analyzing} activeOpacity={0.7}
                  style={{ backgroundColor: activeTheme.card, borderRadius: 14, padding: 14, gap: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                  <Text style={{ color: activeTheme.text, fontSize: 14, fontWeight: '500', lineHeight: 20 }} numberOfLines={2}>{item.sentence}</Text>
                  <Text style={{ color: activeTheme.accent, fontSize: 12, fontWeight: '600' }}>Tap to re-analyze →</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {history.length === 0 && !analyzing && (
            <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
              <Text style={{ fontSize: 44 }}>💬</Text>
              <Text style={{ color: activeTheme.text, fontSize: 15, fontWeight: '600' }}>একটি বাক্য লিখে Analyze চাপুন।</Text>
              <Text style={{ color: activeTheme.subText, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                Clause, phrase, ও এদের meaning ভেঙে দেখানো হবে।
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Analysis tab */}
      {activeTab === 'analysis' && (
        <ClauseAnalysisPanel
          sentence={currentSentence}
          segments={segments}
          activeTheme={activeTheme}
          onPractice={() => setActiveTab('practice')}
        />
      )}

      {/* Practice tab */}
      {activeTab === 'practice' && (
        <ClausePracticePanel
          sentence={currentSentence}
          activeTheme={activeTheme}
          onGoToAnalysis={() => setActiveTab('analysis')}
          alreadyRewarded={rewarded.has(currentSentence)}
          onPointsEarned={handlePointsEarned}
        />
      )}
    </View>
  );
};

// ─── WriteFlow: Type-to-Translate ─────────────────────────────────────────────

const WRITING_TASKS = [
  { bn: 'আমি প্রতিদিন ইংরেজি পড়ি।', en: 'I read English every day.' },
  { bn: 'সে স্কুলে যায়।', en: 'He goes to school.' },
  { bn: 'পাখিটি গান গায়।', en: 'The bird sings.' },
  { bn: 'আমরা একসাথে পড়াশোনা করি।', en: 'We study together.' },
  { bn: 'বাচ্চাটি খুব খুশি।', en: 'The child is very happy.' },
  { bn: 'আজকের আবহাওয়া ভালো।', en: 'The weather is nice today.' },
  { bn: 'সে একটি বই পড়ছে।', en: 'She is reading a book.' },
  { bn: 'আমি চা পান করতে পছন্দ করি।', en: 'I like to drink tea.' },
  { bn: 'ছেলেটির নাম সান্তিয়াগো।', en: "The boy's name is Santiago." },
  { bn: 'স্বপ্ন সবসময় সত্যি হয় না।', en: 'Dreams do not always come true.' },
  { bn: 'জ্ঞান হলো শক্তি।', en: 'Knowledge is power.' },
  { bn: 'পরিশ্রম সৌভাগ্যের চাবিকাঠি।', en: 'Hard work is the key to success.' },
  { bn: 'সূর্য পূর্বদিকে ওঠে।', en: 'The sun rises in the east.' },
  { bn: 'সে প্রতিদিন ব্যায়াম করে।', en: 'He exercises every day.' },
  { bn: 'সত্য সবসময় জয়ী হয়।', en: 'Truth always wins.' },
  { bn: 'মায়ের ভালোবাসা অতুলনীয়।', en: "A mother's love is incomparable." },
  { bn: 'সময় একবার গেলে ফেরে না।', en: 'Time once gone never returns.' },
  { bn: 'পড়াশোনা ছাড়া জীবনে উন্নতি নেই।', en: 'There is no progress in life without education.' },
];

const WF_HEARTS = 3;
const WF_XP = 10;

function wfNormalize(s) {
  return s.trim().toLowerCase().replace(/[.,!?;:'"]/g, '').replace(/\s+/g, ' ');
}

function wfCloseMatch(input, correct) {
  const a = wfNormalize(input).split(' ');
  const b = wfNormalize(correct).split(' ');
  const matches = a.filter(w => b.includes(w)).length;
  return matches / b.length;
}

const WritingPracticePage = ({ activeTheme }) => {
  const [taskIndex, setTaskIndex] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(WF_HEARTS);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [rewarded, setRewarded] = useState(new Set());
  const [speaking, setSpeaking] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

  const task = WRITING_TASKS[taskIndex];
  const totalTasks = WRITING_TASKS.length;
  const progress = taskIndex / totalTasks;

  const similarity = checked ? wfCloseMatch(input, task.en) : 0;

  useEffect(() => {
    setInput('');
    setChecked(false);
    setIsCorrect(false);
    setShowHint(false);
    Speech.stop();
    setSpeaking(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [taskIndex]);

  const checkAnswer = () => {
    if (!input.trim() || checked) return;
    const ok = wfNormalize(input) === wfNormalize(task.en);
    setIsCorrect(ok);
    setChecked(true);
    if (ok) {
      if (!rewarded.has(taskIndex)) {
        setXp(x => x + WF_XP);
        setRewarded(r => new Set(r).add(taskIndex));
      }
      setStreak(s => s + 1);
    } else {
      setHearts(h => Math.max(0, h - 1));
      setStreak(0);
    }
  };

  const nextTask = () => {
    if (hearts === 0 && !isCorrect) {
      setHearts(WF_HEARTS); setTaskIndex(0); setXp(0); setStreak(0); setRewarded(new Set());
      return;
    }
    if (taskIndex + 1 >= totalTasks) { setCompleted(true); return; }
    setTaskIndex(i => i + 1);
  };

  const handleSpeak = () => {
    if (speaking) { Speech.stop(); setSpeaking(false); }
    else { Speech.speak(task.en, { language: 'en-US', onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false) }); setSpeaking(true); }
  };

  const restart = () => {
    setTaskIndex(0); setXp(0); setHearts(WF_HEARTS); setStreak(0); setRewarded(new Set()); setCompleted(false);
  };

  if (completed) {
    return (
      <View style={{ flex: 1, backgroundColor: activeTheme.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🏆</Text>
        <Text style={{ color: activeTheme.text, fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 8 }}>অসাধারণ!</Text>
        <Text style={{ color: activeTheme.subText, fontSize: 15, textAlign: 'center', marginBottom: 28, lineHeight: 24 }}>
          সব {totalTasks}টি বাক্য translate করেছ।
        </Text>
        <View style={{ flexDirection: 'row', gap: 28, marginBottom: 32 }}>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ color: activeTheme.accent, fontSize: 30, fontWeight: '900' }}>{xp}</Text>
            <Text style={{ color: activeTheme.subText, fontSize: 12 }}>XP</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 28 }}>{'❤️'.repeat(hearts)}{'🖤'.repeat(WF_HEARTS - hearts)}</Text>
            <Text style={{ color: activeTheme.subText, fontSize: 12 }}>Hearts</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 4 }}>
            <Text style={{ color: '#f59e0b', fontSize: 30, fontWeight: '900' }}>🔥{streak}</Text>
            <Text style={{ color: activeTheme.subText, fontSize: 12 }}>Streak</Text>
          </View>
        </View>
        <TouchableOpacity onPress={restart} style={{ backgroundColor: activeTheme.accent, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 40 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>আবার শুরু করো 🔄</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const borderColor = !checked
    ? (input.length > 0 ? activeTheme.accent : 'rgba(255,255,255,0.15)')
    : isCorrect ? '#22c55e' : '#ef4444';

  return (
    <View style={{ flex: 1, backgroundColor: activeTheme.bg }}>
      {/* Top bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', gap: 3 }}>
            {Array.from({ length: WF_HEARTS }).map((_, i) => (
              <Text key={i} style={{ fontSize: 19 }}>{i < hearts ? '❤️' : '🖤'}</Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {streak >= 2 && (
              <View style={{ backgroundColor: '#f59e0b', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>🔥 {streak}</Text>
              </View>
            )}
            <View style={{ backgroundColor: activeTheme.accent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>⚡ {xp} XP</Text>
            </View>
          </View>
        </View>
        {/* Progress bar */}
        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
          <MotiView animate={{ width: `${progress * 100}%` }} transition={{ type: 'timing', duration: 400 }}
            style={{ height: '100%', backgroundColor: activeTheme.accent, borderRadius: 3 }} />
        </View>
        <Text style={{ color: activeTheme.subText, fontSize: 10, marginTop: 4, fontWeight: '600' }}>{taskIndex + 1} / {totalTasks}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">

        <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1.5, textAlign: 'center', marginBottom: 16 }}>
          TRANSLATE THIS SENTENCE
        </Text>

        {/* Bengali sentence card */}
        <View style={{ backgroundColor: activeTheme.card, borderRadius: 20, padding: 24, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 22 }}>🇧🇩</Text>
          <Text style={{ color: activeTheme.text, fontSize: 22, fontWeight: '900', lineHeight: 34, textAlign: 'center' }}>
            {task.bn}
          </Text>
          {/* Hint: first word */}
          {showHint && !checked && (
            <View style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6, marginTop: 4 }}>
              <Text style={{ color: activeTheme.subText, fontSize: 13 }}>
                💡 Starts with: <Text style={{ color: activeTheme.text, fontWeight: '800' }}>{task.en.split(' ')[0]}</Text>
              </Text>
            </View>
          )}
        </View>

        {/* Text input */}
        <View style={{ marginBottom: 14 }}>
          <TextInput
            ref={inputRef}
            style={{
              backgroundColor: activeTheme.card,
              borderWidth: 2,
              borderColor,
              borderRadius: 16,
              padding: 16,
              color: activeTheme.text,
              fontSize: 17,
              minHeight: 90,
              textAlignVertical: 'top',
              lineHeight: 26,
            }}
            placeholder="Type your English translation…"
            placeholderTextColor={activeTheme.subText}
            value={input}
            onChangeText={setInput}
            multiline
            editable={!checked}
            onSubmitEditing={checkAnswer}
          />
          {/* Live character count / partial match indicator */}
          {!checked && input.length > 0 && (
            <Text style={{ color: activeTheme.subText, fontSize: 11, marginTop: 5, textAlign: 'right' }}>
              {input.length} chars
            </Text>
          )}
        </View>

        {/* Action buttons */}
        {!checked ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={checkAnswer} disabled={!input.trim()}
              style={{ flex: 1, backgroundColor: input.trim() ? activeTheme.accent : 'rgba(255,255,255,0.08)', borderRadius: 14, paddingVertical: 15, alignItems: 'center' }}>
              <Text style={{ color: input.trim() ? '#fff' : activeTheme.subText, fontWeight: '900', fontSize: 16 }}>
                CHECK ✓
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowHint(h => !h)}
              style={{ borderWidth: 1.5, borderColor: showHint ? activeTheme.accent : 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>💡</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Result */}
        {checked && (
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 300 }}>
            <View style={{
              borderRadius: 18, borderWidth: 2,
              borderColor: isCorrect ? '#22c55e' : '#ef4444',
              backgroundColor: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              padding: 18, gap: 12,
            }}>
              {/* Status row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 28 }}>{isCorrect ? '🎉' : '❌'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: isCorrect ? '#22c55e' : '#ef4444', fontSize: 17, fontWeight: '900' }}>
                    {isCorrect ? `সঠিক! +${WF_XP} XP` : 'ভুল হয়েছে'}
                  </Text>
                  {!isCorrect && similarity > 0 && (
                    <Text style={{ color: activeTheme.subText, fontSize: 12, marginTop: 2 }}>
                      {Math.round(similarity * 100)}% শব্দ মিলেছে — কাছাকাছি ছিলে!
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={handleSpeak} style={{ padding: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <Text style={{ fontSize: 20 }}>{speaking ? '⏹' : '🔊'}</Text>
                </TouchableOpacity>
              </View>

              {/* Correct answer */}
              {!isCorrect && (
                <View style={{ backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 12, padding: 12 }}>
                  <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 6 }}>CORRECT ANSWER</Text>
                  <Text style={{ color: activeTheme.text, fontSize: 16, fontWeight: '700', lineHeight: 24 }}>{task.en}</Text>
                </View>
              )}

              {hearts === 0 && !isCorrect && (
                <View style={{ backgroundColor: 'rgba(127,29,29,0.5)', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#fca5a5', fontWeight: '700' }}>হার্ট শেষ! আবার শুরু হবে।</Text>
                </View>
              )}

              <TouchableOpacity onPress={nextTask}
                style={{ backgroundColor: activeTheme.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 16 }}>
                  {hearts === 0 && !isCorrect ? 'আবার শুরু 🔄' : taskIndex + 1 >= totalTasks ? 'সম্পন্ন! 🏆' : 'পরবর্তী →'}
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}
      </ScrollView>
    </View>
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
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
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
    const words = [
      "Resilient", "Ephemeral", "Luminous", "Eloquent", "Sovereign",
      "Tenacious", "Serendipity", "Melancholy", "Perseverance", "Ubiquitous",
      "Pragmatic", "Ambiguous", "Profound", "Diligent", "Inevitable",
      "Catalyst", "Meticulous", "Euphoria", "Integrity", "Paradigm",
      "Nostalgia", "Fortitude", "Empathy", "Discern", "Flourish",
      "Articulate", "Benevolent", "Cognizant", "Exuberant", "Frugal",
    ];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return words[dayOfYear % words.length];
  }, []);


  const loadProgress = async () => {
    // loadLocalData already handles bookmarks/learned — this is a no-op kept for safety
  };

const loadUser = async () => {

  const loggedIn = await AsyncStorage.getItem('isLoggedIn');

  const savedName = await AsyncStorage.getItem('userName');
  const savedAge = await AsyncStorage.getItem('userAge');

  if (savedName) setUserName(savedName);
  if (savedAge) setUserAge(savedAge);

  if (loggedIn === 'true') {
    setCurrentView('home');
  } else {
    setCurrentView('onboarding');
  }

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
    
    <Text style={{
  fontSize: 38,
  fontWeight: '900',
  color: activeTheme.text,
  textAlign: 'center'
}}>
  Vocab<Text style={{ color: activeTheme.accent }}>Vortex</Text>
</Text>

<Text style={{
  color: activeTheme.subText,
  textAlign: 'center',
  marginTop: 10,
  fontSize: 14
}}>
  Expand your vocabulary journey
</Text>

<Text style={{
  color: activeTheme.subText,
  textAlign: 'center',
  marginTop: 40,
  marginBottom: 25,
  fontSize: 12,
  letterSpacing: 2
}}>
  AUTHENTICATION
</Text>
    <Text style={{
  color: activeTheme.subText,
  marginBottom: 20,
  textAlign: 'center'
}}>
  {isLogin ? 'Login to continue' : 'Create a new account'}
</Text>

{/* NAME INPUT (ONLY FOR SIGNUP) */}
{!isLogin && (
  <TextInput
    placeholder="Full Name"
    placeholderTextColor="gray"
    value={userName}
    onChangeText={setUserName}
    style={{
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: 14,
  paddingHorizontal: 15,
  height: 55,
  color: activeTheme.text,
  marginTop: 20
}}
  />
)}

{/* AGE INPUT (ONLY FOR SIGNUP) */}
{!isLogin && (
  <TextInput
    placeholder="Age"
    placeholderTextColor="gray"
    value={userAge}
    onChangeText={setUserAge}
    keyboardType="numeric"
    style={{
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: 14,
  paddingHorizontal: 15,
  height: 55,
  color: activeTheme.text,
  marginTop: 15
}}
  />
)}

{/* EMAIL */}
<TextInput
  placeholder="Email"
  placeholderTextColor="gray"
  value={userEmail}
  onChangeText={setUserEmail}
  style={{
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: 14,
  paddingHorizontal: 15,
  height: 55,
  color: activeTheme.text,
  marginTop: 20
}}
/>

{/* PASSWORD */}
<TextInput
  placeholder="Password"
  placeholderTextColor="gray"
  secureTextEntry
  value={userPassword}
  onChangeText={setUserPassword}
 style={{
  backgroundColor: 'rgba(255,255,255,0.06)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: 14,
  paddingHorizontal: 15,
  height: 55,
  color: activeTheme.text,
  marginTop: 15
}}
/>

{/* LOGIN / SIGNUP BUTTON */}
<TouchableOpacity
  onPress={async () => {

    if (isLogin) {

      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPassword = await AsyncStorage.getItem('userPassword');
      const savedName = await AsyncStorage.getItem('userName');
      const savedAge = await AsyncStorage.getItem('userAge');

      if (
        userEmail === savedEmail &&
        userPassword === savedPassword
      ) {
        setUserName(savedName || '');
        setUserAge(savedAge || '');
        await AsyncStorage.setItem('isLoggedIn', 'true');
        setCurrentView('home');
      } else {
        alert('Invalid email or password');
      }

    } else {

      if (!userName || !userAge || !userEmail || !userPassword) {
        alert('Please fill all fields');
        return;
      }

      await AsyncStorage.setItem('userName', userName);
      await AsyncStorage.setItem('userAge', userAge);
      await AsyncStorage.setItem('userEmail', userEmail);
      await AsyncStorage.setItem('userPassword', userPassword);

      alert('Account created successfully! Please login.');

  setIsLogin(true);

  setUserPassword('');
    }

  }}
 style={{
  backgroundColor: '#2563eb',
  paddingVertical: 16,
  borderRadius: 14,
  alignItems: 'center',
  marginTop: 25,
  width: '100%'
}}
>

<Text style={{
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16
}}>
  {isLogin ? 'Login' : 'Sign Up'}
</Text>

</TouchableOpacity>

{/* TOGGLE */}
<TouchableOpacity
  onPress={() => setIsLogin(!isLogin)}
  style={{ marginTop: 20 }}
>
  <Text style={{
    color: activeTheme.accent,
    textAlign: 'center'
  }}>
    {isLogin
      ? "Don't have an account? Sign Up"
      : "Already have an account? Login"}
  </Text>
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
            {currentView === 'lexflow' && (
              <LexFlowPage activeTheme={activeTheme} />
            )}
            {currentView === 'clauseflow' && (
              <ClauseFlowPage activeTheme={activeTheme} />
            )}
            {currentView === 'writeflow' && (
              <WritingPracticePage activeTheme={activeTheme} />
            )}
            {currentView === 'dashboard' && (
              <MotiView key="dashboard" from={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'timing', duration: 300 }} style={[styles.viewContainer, { backgroundColor: activeTheme.bg }]}>
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100, gap: 14 }} showsVerticalScrollIndicator={false}>

                  {/* Profile card */}
                  <View style={{ backgroundColor: activeTheme.card, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
                    {/* Cover strip */}
                    <View style={{ height: 72, backgroundColor: activeTheme.accent, opacity: 0.85 }} />
                    {/* Avatar row */}
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, marginTop: -28, marginBottom: 12, gap: 12 }}>
                      <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: activeTheme.bg, borderWidth: 3, borderColor: activeTheme.card, alignItems: 'center', justifyContent: 'center' }}>
                        {user?.picture
                          ? <Image source={{ uri: user.picture }} style={{ width: 54, height: 54, borderRadius: 27 }} />
                          : <Text style={{ fontSize: 26 }}>👤</Text>}
                      </View>
                      <View style={{ paddingBottom: 4, flex: 1 }}>
                        <Text style={{ color: activeTheme.text, fontSize: 17, fontWeight: '900' }}>{user?.name || userName || 'Guest'}</Text>
                        {userAge ? <Text style={{ color: activeTheme.subText, fontSize: 12 }}>Age {userAge} · Level {level}</Text>
                          : <Text style={{ color: activeTheme.subText, fontSize: 12 }}>Level {level}</Text>}
                      </View>
                    </View>

                    {/* Stats row */}
                    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
                      {[
                        { label: 'IN QUEUE', value: bookmarks.length, emoji: '📌' },
                        { label: 'MASTERED', value: learned.length, emoji: '✅' },
                        { label: 'PROGRESS', value: `${progressPercent}%`, emoji: '📈' },
                      ].map((s, i) => (
                        <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: i < 2 ? 1 : 0, borderRightColor: 'rgba(255,255,255,0.06)' }}>
                          <Text style={{ fontSize: 18 }}>{s.emoji}</Text>
                          <Text style={{ color: activeTheme.text, fontSize: 18, fontWeight: '900', marginTop: 2 }}>{s.value}</Text>
                          <Text style={{ color: activeTheme.subText, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, marginTop: 1 }}>{s.label}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Progress bar card */}
                  <View style={{ backgroundColor: activeTheme.card, borderRadius: 16, padding: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>WORD MASTERY</Text>
                      <Text style={{ color: activeTheme.accent, fontSize: 12, fontWeight: '700' }}>{learned.length} / {bookmarks.length + learned.length} words</Text>
                    </View>
                    <View style={{ height: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
                      <MotiView from={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ type: 'timing', duration: 800 }}
                        style={{ height: '100%', backgroundColor: activeTheme.accent, borderRadius: 5 }} />
                    </View>
                    <Text style={{ color: activeTheme.subText, fontSize: 11 }}>
                      {progressPercent === 0 ? 'Start exploring words from HOME to track progress.' :
                       progressPercent === 100 ? '🎉 All saved words mastered!' :
                       `${100 - progressPercent}% বাকি আছে — চালিয়ে যাও!`}
                    </Text>
                  </View>

                  {/* Word of the day */}
                  <View style={{ backgroundColor: activeTheme.card, borderRadius: 16, padding: 16, gap: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 28 }}>☀️</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>WORD OF THE DAY</Text>
                      <Text style={{ color: activeTheme.text, fontSize: 20, fontWeight: '900', marginTop: 2 }}>{wordOfTheDay}</Text>
                    </View>
                    <TouchableOpacity onPress={() => { speak(wordOfTheDay); handleStart(wordOfTheDay); }}
                      style={{ backgroundColor: activeTheme.accent, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 }}>
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>Explore →</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Theme picker shortcut */}
                  <TouchableOpacity onPress={() => setShowThemePicker(true)}
                    style={{ backgroundColor: activeTheme.card, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' }}>
                    <Text style={{ fontSize: 24 }}>🎨</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: activeTheme.text, fontSize: 14, fontWeight: '700' }}>App Theme</Text>
                      <Text style={{ color: activeTheme.subText, fontSize: 12, marginTop: 2 }}>Current: {activeTheme.name}</Text>
                    </View>
                    <Text style={{ color: activeTheme.accent, fontSize: 18 }}>›</Text>
                  </TouchableOpacity>

                  {/* Word Queue */}
                  <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>📌 WORD QUEUE</Text>
                      {bookmarks.length > 0 && <Text style={{ color: activeTheme.subText, fontSize: 11 }}>{bookmarks.length} words · tap ✅ to mark mastered</Text>}
                    </View>
                    {bookmarks.length === 0 ? (
                      <View style={{ backgroundColor: activeTheme.card, borderRadius: 14, padding: 20, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                        <Text style={{ fontSize: 28 }}>📭</Text>
                        <Text style={{ color: activeTheme.subText, fontSize: 13, textAlign: 'center' }}>Queue empty — bookmark words from HOME to track them here.</Text>
                      </View>
                    ) : bookmarks.map((w, i) => (
                      <View key={i} style={{ backgroundColor: activeTheme.card, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
                        <Text style={{ color: activeTheme.subText, fontSize: 11, fontWeight: '700', width: 24 }}>{String(i + 1).padStart(2, '0')}</Text>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => handleStart(w)}>
                          <Text style={{ color: activeTheme.text, fontSize: 15, fontWeight: '700' }}>{w}</Text>
                          <Text style={{ color: activeTheme.accent, fontSize: 11, marginTop: 2 }}>Tap to explore →</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => markLearned(w)} style={{ padding: 6 }}>
                          <CheckCircle2 size={22} color={activeTheme.accent} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  {/* Mastered words */}
                  {learned.length > 0 && (
                    <View style={{ gap: 8 }}>
                      <Text style={{ color: activeTheme.subText, fontSize: 10, fontWeight: '900', letterSpacing: 1 }}>✅ MASTERED WORDS</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {learned.map((w, i) => (
                          <View key={i} style={{ backgroundColor: 'rgba(34,197,94,0.1)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' }}>
                            <Text style={{ color: '#22c55e', fontSize: 13, fontWeight: '600' }}>✓ {w}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Logout */}
                  <TouchableOpacity
                    onPress={async () => { await AsyncStorage.removeItem('isLoggedIn'); await logout(); setCurrentView('onboarding'); }}
                    style={{ backgroundColor: 'rgba(220,38,38,0.12)', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(220,38,38,0.25)', marginTop: 4 }}>
                    <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 14 }}>Logout / Reset</Text>
                  </TouchableOpacity>

                </ScrollView>
              </MotiView>
            )}
          </AnimatePresence>
        </ScrollView>

        <View style={{ display: currentView === 'movie' ? 'flex' : 'none', flex: 1 }}>
          <MovieDialoguePage activeTheme={activeTheme} handleTapWord={handleTapWord} />
        </View>

{currentView !== 'onboarding' && (
        <View style={styles.bottomNav}>
          <View style={[styles.navContainer, { backgroundColor: activeTheme.card, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }]}>
            <TouchableOpacity onPress={() => setCurrentView('home')} style={{ alignItems: 'center' }}>
              <Zap size={22} color={currentView === 'home' ? activeTheme.accent : activeTheme.text} />
              <Text style={{ color: currentView === 'home' ? activeTheme.accent : activeTheme.subText, fontSize: 8, fontWeight: '700', marginTop: 3 }}>HOME</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('readflow')} style={{ alignItems: 'center' }}>
              <BookOpen size={22} color={currentView === 'readflow' ? activeTheme.accent : activeTheme.text} />
              <Text style={{ color: currentView === 'readflow' ? activeTheme.accent : activeTheme.subText, fontSize: 8, fontWeight: '700', marginTop: 3 }}>READ</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('lexflow')} style={{ alignItems: 'center' }}>
              <Sparkles size={22} color={currentView === 'lexflow' ? activeTheme.accent : activeTheme.text} />
              <Text style={{ color: currentView === 'lexflow' ? activeTheme.accent : activeTheme.subText, fontSize: 8, fontWeight: '700', marginTop: 3 }}>LEX</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('clauseflow')} style={{ alignItems: 'center' }}>
              <ListPlus size={22} color={currentView === 'clauseflow' ? activeTheme.accent : activeTheme.text} />
              <Text style={{ color: currentView === 'clauseflow' ? activeTheme.accent : activeTheme.subText, fontSize: 8, fontWeight: '700', marginTop: 3 }}>CLAUSE</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('writeflow')} style={{ alignItems: 'center' }}>
              <Lightbulb size={22} color={currentView === 'writeflow' ? activeTheme.accent : activeTheme.text} />
              <Text style={{ color: currentView === 'writeflow' ? activeTheme.accent : activeTheme.subText, fontSize: 8, fontWeight: '700', marginTop: 3 }}>WRITE</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('movie')} style={{ alignItems: 'center' }}>
              <Clapperboard size={22} color={currentView === 'movie' ? activeTheme.accent : activeTheme.text} />
              <Text style={{ color: currentView === 'movie' ? activeTheme.accent : activeTheme.subText, fontSize: 8, fontWeight: '700', marginTop: 3 }}>MOVIE</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentView('dashboard')} style={{ alignItems: 'center' }}>
              <LayoutDashboard size={22} color={currentView === 'dashboard' ? activeTheme.accent : activeTheme.text} />
              <Text style={{ color: currentView === 'dashboard' ? activeTheme.accent : activeTheme.subText, fontSize: 8, fontWeight: '700', marginTop: 3 }}>ME</Text>
            </TouchableOpacity>
          </View>
        </View>)}
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
       Logout
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
