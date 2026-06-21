import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useApp } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { BASE_URL } from '../../constants';

const HISTORY_KEY  = 'clauseflow_history_v1';
const ANALYSIS_KEY = 'clauseflow_last_analysis_v1';

async function analyzeClause(sentence) {
  const res = await fetch(`${BASE_URL}/api/ai/analyze-clause`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sentence }),
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data.clauses) || !data.clauses.length) throw new Error('No analysis returned');
  return data.clauses;
}

// ── Grammar type → colour ─────────────────────────────────────────────────────
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
  'adverb phrase':        { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  'subject':              { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  'predicate':            { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
  'conjunction':          { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
  'object':               { bg: '#ECFEFF', text: '#155E75', border: '#67E8F9' },
};
const DEFAULT_CLR = { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
const BUILDUP_COLORS = ['#EFF6FF', '#F0FDF4', '#FFFBEB', '#FDF4FF', '#FFF1F2', '#ECFEFF'];

function typeColor(type) {
  return TYPE_PALETTE[type?.toLowerCase().trim()] ?? DEFAULT_CLR;
}

// ── Segment text with optional highlight ──────────────────────────────────────
function SegmentText({ text, highlight, style }) {
  if (!highlight) return <Text style={style}>{text}</Text>;
  const idx = text.indexOf(highlight);
  if (idx === -1) return <Text style={style}>{text}</Text>;
  return (
    <Text style={style}>
      {text.slice(0, idx)}
      <Text style={[style, { textDecorationLine: 'underline', color: '#2D6A4F' }]}>
        {text.slice(idx, idx + highlight.length)}
      </Text>
      {text.slice(idx + highlight.length)}
    </Text>
  );
}

// ── TEXTS TAB ─────────────────────────────────────────────────────────────────
function TextsTab({ activeTheme, history, onAnalyze, onDeleteHistory }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // item to delete

  const handleAnalyze = async (sentence) => {
    const trimmed = (sentence || input).trim();
    if (!trimmed) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const segments = await analyzeClause(trimmed);
      if (!Array.isArray(segments) || !segments.length) throw new Error('API returned no segments. Try again.');
      onAnalyze(trimmed, segments);
      setInput('');
    } catch (e) {
      setErrorMsg(e.message ?? 'Analysis failed. Check your internet and try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (item) => setDeleteConfirm(item);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: activeTheme.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 14 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Input card */}
      <View style={[s.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <Text style={[s.label, { color: activeTheme.subText }]}>ENGLISH SENTENCE লিখুন</Text>
        <TextInput
          style={[s.input, { color: activeTheme.text, borderColor: activeTheme.border, backgroundColor: activeTheme.bg }]}
          placeholder="e.g. Although she was tired, she kept working…"
          placeholderTextColor={activeTheme.subText}
          value={input}
          onChangeText={setInput}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: activeTheme.accent, opacity: (!input.trim() || loading) ? 0.45 : 1 }]}
          onPress={() => handleAnalyze()}
          disabled={!input.trim() || loading}
        >
          {loading
            ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={s.primaryBtnText}>Analyzing…</Text>
              </View>
            : <Text style={s.primaryBtnText}>🔍 Analyze</Text>}
        </TouchableOpacity>

        {/* Inline error — replaces Alert.alert (browser blocks popups) */}
        {errorMsg ? (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FECACA', marginTop: 6 }}>
            <Text style={{ flex: 1, color: '#991B1B', fontSize: 13, lineHeight: 19 }}>❌ {errorMsg}</Text>
            <TouchableOpacity onPress={() => setErrorMsg('')}>
              <Text style={{ color: '#991B1B', fontWeight: '700', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* Delete confirmation — replaces Alert.confirm */}
      {deleteConfirm && (
        <View style={[s.card, { backgroundColor: '#FEF2F2', borderColor: '#FECACA', gap: 12 }]}>
          <Text style={{ color: '#991B1B', fontSize: 14, fontWeight: '600' }}>
            এই বাক্যটি মুছে ফেলবেন?
          </Text>
          <Text style={{ color: '#7f1d1d', fontSize: 13 }} numberOfLines={2}>"{deleteConfirm.sentence}"</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setDeleteConfirm(null)}
              style={{ flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' }}>
              <Text style={{ color: '#991B1B', fontWeight: '700' }}>বাতিল</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { onDeleteHistory(deleteConfirm.id); setDeleteConfirm(null); }}
              style={{ flex: 1, borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: '#dc2626' }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>মুছুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* History */}
      {history.length > 0 && (
        <>
          <Text style={[s.sectionLabel, { color: activeTheme.subText }]}>RECENT SENTENCES</Text>
          {history.map((item) => (
            <View key={item.id} style={[s.historyRow, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
              <TouchableOpacity style={{ flex: 1, padding: 14, gap: 4 }} onPress={() => handleAnalyze(item.sentence)} disabled={loading} activeOpacity={0.7}>
                <Text style={{ color: activeTheme.text, fontSize: 14, fontWeight: '500', lineHeight: 20 }} numberOfLines={2}>{item.sentence}</Text>
                <Text style={{ color: activeTheme.accent, fontSize: 12, fontWeight: '600' }}>Tap to re-analyze</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 14 }} onPress={() => confirmDelete(item)}>
                <Text style={{ color: activeTheme.subText, fontSize: 14 }}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </>
      )}

      {history.length === 0 && !loading && (
        <View style={{ alignItems: 'center', paddingVertical: 48, gap: 10 }}>
          <Text style={{ fontSize: 44 }}>💬</Text>
          <Text style={{ color: activeTheme.text, fontSize: 15, fontWeight: '600' }}>একটি বাক্য লিখে Analyze চাপুন।</Text>
          <Text style={{ color: activeTheme.subText, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
            Clause, phrase, ও এদের meaning ভেঙে দেখানো হবে।
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ── ANALYSIS TAB ──────────────────────────────────────────────────────────────
function AnalysisTab({ activeTheme, sentence, segments, onPractice }) {
  const [sentenceSpeaking, setSentenceSpeaking] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [spoken, setSpoken] = useState(new Set());
  const [highlight, setHighlight] = useState(null); // { segIdx, words }
  const hlTimer = useRef(null);
  const stopRef = useRef(false);

  useEffect(() => { setSpoken(new Set()); setSentenceSpeaking(false); setSpeakingIdx(null); }, [sentence]);

  const speakSentence = () => {
    if (sentenceSpeaking) { Speech.stop(); setSentenceSpeaking(false); }
    else {
      Speech.speak(sentence, { language: 'en-US', onDone: () => setSentenceSpeaking(false), onStopped: () => setSentenceSpeaking(false) });
      setSentenceSpeaking(true);
    }
  };

  const speakBuildUp = (segIdx, lines) => {
    if (speakingIdx === segIdx) { stopRef.current = true; Speech.stop(); setSpeakingIdx(null); return; }
    stopRef.current = false;
    setSpeakingIdx(segIdx);
    setSpoken(prev => new Set(prev).add(segIdx));
    const playLine = (i) => {
      if (stopRef.current || i >= lines.length) { setSpeakingIdx(null); return; }
      Speech.speak(lines[i], { language: 'en-US', onDone: () => setTimeout(() => playLine(i + 1), 650), onError: () => setSpeakingIdx(null) });
    };
    playLine(0);
  };

  const tapSyntaxTerm = (segIdx, words) => {
    if (hlTimer.current) clearTimeout(hlTimer.current);
    setHighlight({ segIdx, words });
    hlTimer.current = setTimeout(() => setHighlight(null), 500);
  };

  if (!sentence || !segments.length) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: activeTheme.bg }}>
        <Text style={{ fontSize: 44 }}>🔬</Text>
        <Text style={{ color: activeTheme.subText, textAlign: 'center', marginTop: 14, lineHeight: 22 }}>
          Texts tab থেকে একটি বাক্য analyze করুন।
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: activeTheme.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 14 }}>

      {/* Sentence card */}
      <View style={[s.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text style={[s.sectionLabel, { color: activeTheme.subText }]}>SENTENCE</Text>
          <TouchableOpacity onPress={speakSentence}>
            <Text style={{ fontSize: 20 }}>{sentenceSpeaking ? '⏹' : '🔊'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: activeTheme.text, fontSize: 15, fontStyle: 'italic', lineHeight: 24 }}>{sentence}</Text>
      </View>

      {/* Breakdown chips */}
      <Text style={[s.sectionLabel, { color: activeTheme.subText }]}>BREAKDOWN</Text>
      <View style={[s.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }]}>
        {segments.map((seg, i) => {
          const c = typeColor(seg.type);
          return (
            <View key={i} style={{ borderRadius: 8, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg, paddingVertical: 4, paddingHorizontal: 10 }}>
              <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>{seg.text}</Text>
            </View>
          );
        })}
      </View>

      {/* Detail cards */}
      <Text style={[s.sectionLabel, { color: activeTheme.subText }]}>DETAILS</Text>
      {segments.map((seg, segIdx) => {
        const c = typeColor(seg.type);
        const isSpeaking = speakingIdx === segIdx;
        const buildUp = seg.buildUp?.length ? seg.buildUp : [seg.text];
        const isHL = highlight?.segIdx === segIdx;

        return (
          <View key={segIdx} style={[s.card, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, gap: 10 }]}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <SegmentText
                text={seg.text}
                highlight={isHL ? highlight.words : null}
                style={{ flex: 1, color: activeTheme.text, fontSize: 15, fontWeight: '700', lineHeight: 22 }}
              />
              <View style={{ borderRadius: 6, borderWidth: 1, borderColor: c.border, backgroundColor: c.bg, paddingVertical: 3, paddingHorizontal: 8 }}>
                <Text style={{ color: c.text, fontSize: 11, fontWeight: '700' }}>{seg.type}</Text>
              </View>
            </View>

            {/* Syntax map — tappable terms */}
            {seg.syntaxMap?.length ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <Text style={{ color: activeTheme.subText, fontStyle: 'italic', fontSize: 13 }}>(</Text>
                {seg.syntaxMap.map((item, mi) => (
                  <View key={mi} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {mi > 0 && <Text style={{ color: activeTheme.subText, fontSize: 13 }}> + </Text>}
                    <TouchableOpacity onPress={() => tapSyntaxTerm(segIdx, item.words)} activeOpacity={0.6}>
                      <Text style={{ color: activeTheme.accent, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }}>{item.term}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <Text style={{ color: activeTheme.subText, fontStyle: 'italic', fontSize: 13 }}>)</Text>
              </View>
            ) : seg.syntax ? (
              <Text style={{ color: activeTheme.accent, fontSize: 13, fontStyle: 'italic' }}>({seg.syntax})</Text>
            ) : null}

            {/* Meaning */}
            <Text style={{ color: activeTheme.subText, fontSize: 13, lineHeight: 20 }}>{seg.meaning}</Text>

            {/* Build-up */}
            <View style={{ gap: 4 }}>
              {buildUp.map((line, li) => (
                <View key={li} style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, gap: 8, backgroundColor: BUILDUP_COLORS[li % BUILDUP_COLORS.length] }}>
                  <Text style={{ color: '#888', fontSize: 11, fontWeight: '700', width: 16, textAlign: 'center' }}>{li + 1}</Text>
                  <Text style={{ color: '#333', fontSize: 13, fontWeight: '500', flex: 1 }}>{line}</Text>
                </View>
              ))}
            </View>

            {/* Speak All */}
            <View style={{ borderTopWidth: 1, borderTopColor: activeTheme.border, paddingTop: 10 }}>
              <TouchableOpacity
                style={{ borderWidth: 1, borderColor: isSpeaking ? '#dc2626' : activeTheme.border, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 14, alignSelf: 'flex-start', backgroundColor: isSpeaking ? '#FEF2F2' : 'transparent' }}
                onPress={() => speakBuildUp(segIdx, buildUp)}
              >
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
        style={[s.primaryBtn, { backgroundColor: spoken.size < segments.length ? '#666' : activeTheme.accent, opacity: spoken.size < segments.length ? 0.6 : 1 }]}
        onPress={onPractice}
        disabled={spoken.size < segments.length}
      >
        <Text style={s.primaryBtnText}>
          {spoken.size < segments.length
            ? `🔊 সব অংশ "Speak All" দিয়ে শুনুন (${spoken.size}/${segments.length})`
            : '✏️ Practice এই sentence'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── PRACTICE TAB ──────────────────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function PracticeTab({ activeTheme, sentence, onGoToAnalysis, alreadyRewarded, onPointsEarned }) {
  const [originalWords, setOriginalWords] = useState([]);
  const [pool, setPool] = useState([]);
  const [answer, setAnswer] = useState([]);
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const [earnedThis, setEarnedThis] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!sentence) return;
    const words = sentence.trim().split(/\s+/).filter(Boolean);
    setOriginalWords(words);
    setPool(shuffle(words));
    setAnswer([]);
    setDone(false);
    setCorrect(false);
    setAwarded(false);
    setEarnedThis(false);
    Speech.stop();
    setSpeaking(false);
  }, [sentence]);

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
    setPool(shuffle(originalWords));
    setAnswer([]); setDone(false); setCorrect(false); setEarnedThis(false);
  };

  const handleSpeak = () => {
    if (speaking) { Speech.stop(); setSpeaking(false); }
    else { Speech.speak(sentence, { language: 'en-US', onDone: () => setSpeaking(false), onStopped: () => setSpeaking(false) }); setSpeaking(true); }
  };

  if (!sentence) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: activeTheme.bg }}>
        <Text style={{ fontSize: 44 }}>✏️</Text>
        <Text style={{ color: activeTheme.subText, textAlign: 'center', marginTop: 14, lineHeight: 22 }}>
          Texts tab-এ একটি বাক্য analyze করুন, তারপর Practice করুন।
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: activeTheme.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 14 }}>

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: activeTheme.text, fontSize: 15, fontWeight: '700', flex: 1 }}>শব্দগুলো সঠিক ক্রমে সাজান</Text>
        <TouchableOpacity style={{ borderWidth: 1, borderColor: activeTheme.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }} onPress={handleSpeak}>
          <Text style={{ color: activeTheme.subText, fontSize: 13, fontWeight: '700' }}>{speaking ? '⏹ থামান' : '🔊 শুনুন'}</Text>
        </TouchableOpacity>
      </View>

      {/* Answer area */}
      <View style={{
        minHeight: 72, borderWidth: 2,
        borderColor: done ? (correct ? '#2e7d52' : '#dc2626') : activeTheme.border,
        borderStyle: done ? 'solid' : 'dashed',
        borderRadius: 14, padding: 12, justifyContent: 'center',
        backgroundColor: activeTheme.card,
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
            </View>}
      </View>

      <View style={{ height: 1, backgroundColor: activeTheme.border }} />

      {/* Word pool */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, backgroundColor: activeTheme.card, borderRadius: 14, padding: 14, minHeight: 56 }}>
        {pool.map((w, i) => (
          <TouchableOpacity key={`pool-${i}`} onPress={() => tapPool(w, i)} disabled={done} activeOpacity={0.7}
            style={{ backgroundColor: activeTheme.bg, borderWidth: 1.5, borderColor: activeTheme.border, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 }}>
            <Text style={{ color: activeTheme.text, fontWeight: '600', fontSize: 14 }}>{w}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Verify */}
      {!done && (
        <TouchableOpacity onPress={verify} disabled={answer.length !== originalWords.length}
          style={[s.primaryBtn, { backgroundColor: activeTheme.accent, opacity: answer.length !== originalWords.length ? 0.4 : 1 }]}>
          <Text style={s.primaryBtnText}>যাচাই করুন ✓</Text>
        </TouchableOpacity>
      )}

      {/* Result */}
      {done && (
        <View style={{ backgroundColor: correct ? '#D4EDDA' : '#FDECEA', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: correct ? '#A3D9B1' : '#FFCCCC' }}>
          <Text style={{ fontSize: 30, marginBottom: 8 }}>{correct ? '🎉' : '❌'}</Text>
          <Text style={{ color: correct ? '#155724' : '#721c24', fontWeight: '700', fontSize: 15, textAlign: 'center' }}>
            {correct ? (earnedThis ? 'সঠিক! +২ পয়েন্ট' : 'সঠিক! (আগেই পয়েন্ট পেয়েছেন)') : 'ভুল হয়েছে'}
          </Text>
          {!correct && <Text style={{ color: '#856404', marginTop: 10, fontSize: 13, fontStyle: 'italic', textAlign: 'center', lineHeight: 22 }}>{sentence}</Text>}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
            <TouchableOpacity onPress={reset} style={{ backgroundColor: '#6c757d', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>আবার চেষ্টা</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onGoToAnalysis} style={{ borderWidth: 1.5, borderColor: activeTheme.border, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: activeTheme.subText, fontWeight: '600' }}>Analysis-এ ফিরুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── MAIN CLAUSEFLOW SCREEN ────────────────────────────────────────────────────
export default function ClauseFlow() {
  const { activeTheme } = useApp();
  const [activeTab, setActiveTab] = useState('texts');
  const [history, setHistory] = useState([]);
  const [currentSentence, setCurrentSentence] = useState('');
  const [segments, setSegments] = useState([]);
  const [score, setScore] = useState(0);
  const [rewarded, setRewarded] = useState(new Set());

  // Load history + last analysis from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));

      const saved = await AsyncStorage.getItem(ANALYSIS_KEY);
      if (saved) {
        const { sentence, segs } = JSON.parse(saved);
        if (sentence && Array.isArray(segs) && segs.length) {
          setCurrentSentence(sentence);
          setSegments(segs);
        }
      }
    })();
  }, []);

  const saveHistory = async (updated) => {
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const handleAnalyze = useCallback((sentence, segs) => {
    setCurrentSentence(sentence);
    setSegments(segs);
    // Persist so the result survives tab navigation
    AsyncStorage.setItem(ANALYSIS_KEY, JSON.stringify({ sentence, segs }));
    const updated = [
      { id: Date.now().toString(), sentence },
      ...history.filter(h => h.sentence !== sentence),
    ].slice(0, 20);
    saveHistory(updated);
    setActiveTab('analysis');
  }, [history]);

  const handleDeleteHistory = useCallback((id) => {
    const updated = history.filter(h => h.id !== id);
    saveHistory(updated);
  }, [history]);

  const handlePointsEarned = useCallback((pts) => {
    if (!rewarded.has(currentSentence)) {
      setScore(s => s + pts);
      setRewarded(prev => new Set(prev).add(currentSentence));
    }
  }, [currentSentence, rewarded]);

  const TABS = [
    { key: 'texts', label: 'Texts' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'practice', label: 'Practice' },
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
        {/* Score badge */}
        <View style={{ justifyContent: 'center', paddingHorizontal: 14 }}>
          <View style={{ backgroundColor: activeTheme.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{score}pt</Text>
          </View>
        </View>
      </View>

      {/* Tab content */}
      {activeTab === 'texts' && (
        <TextsTab
          activeTheme={activeTheme}
          history={history}
          onAnalyze={handleAnalyze}
          onDeleteHistory={handleDeleteHistory}
        />
      )}
      {activeTab === 'analysis' && (
        <AnalysisTab
          activeTheme={activeTheme}
          sentence={currentSentence}
          segments={segments}
          onPractice={() => setActiveTab('practice')}
        />
      )}
      {activeTab === 'practice' && (
        <PracticeTab
          activeTheme={activeTheme}
          sentence={currentSentence}
          onGoToAnalysis={() => setActiveTab('analysis')}
          alreadyRewarded={rewarded.has(currentSentence)}
          onPointsEarned={handlePointsEarned}
        />
      )}
    </View>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  sectionLabel: { fontSize: 10, fontWeight: '900', opacity: 0.6, letterSpacing: 1, textTransform: 'uppercase' },
  input: { borderWidth: 1.5, borderRadius: 12, padding: 12, fontSize: 15, minHeight: 80, lineHeight: 22 },
  primaryBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  historyRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
});
