import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../_layout';
import { useRouter } from 'expo-router';
import { X, Award, HelpCircle, Zap, Sparkles, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../components/LoadingSpinner';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WORD_DETAILS = {
  'RESILIENT': 'Able to withstand or recover quickly from difficult conditions.',
  'ELOQUENT': 'Fluent or persuasive in speaking or writing.',
  'EPHEMERAL': 'Lasting for a very short time.',
  'LUMINOUS': 'Full of or shedding light; bright or shining.',
  'SOVEREIGN': 'Possessing supreme or ultimate power.',
  'CUNNING': 'Having or showing skill in achieving one\'s ends by deceit.',
  'ENORMOUS': 'Very large in size, quantity, or extent.',
  'RAPID': 'Happening in a short time or at a great rate.',
  'JUBILANT': 'Feeling or expressing great happiness and triumph.',
  'GLOOMY': 'Dark or poorly lit, especially so as to appear depressing.',
  'METICULOUS': 'Showing great attention to detail; very careful and precise.',
  'PRAGMATIC': 'Dealing with things sensibly and realistically.',
  'INEFFABLE': 'Too great or extreme to be expressed or described in words.',
  'SERENDIPITY': 'The occurrence of events by chance in a happy way.',
  'MELANCHOLY': 'A feeling of pensive sadness with no obvious cause.'
};

export default function VortexGuess() {
  const { activeTheme } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isFinished, setIsFinished] = useState(false);
  const [showError, setShowError] = useState(false);
  const [gameData, setGameData] = useState([]);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    setLoading(true);
    const b = await AsyncStorage.getItem('vortex_bookmarks');
    const bookmarks = b ? JSON.parse(b) : [];
    
    let words = bookmarks.length >= 2 ? bookmarks.slice(0, 5) : ["Resilient", "Eloquent", "Ephemeral", "Luminous", "Sovereign"];
    
    const data = words.map(word => {
      const upper = word.toUpperCase();
      return {
        word: upper,
        clue: WORD_DETAILS[upper] || "Personalized challenge from your Lab!"
      };
    });

    setGameData(data);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleGuess = () => {
    const target = gameData[currentIndex].word;
    if (input.toUpperCase() === target) {
      setScore(s => s + 150);
      if (currentIndex < gameData.length - 1) {
        setCurrentIndex(c => c + 1);
        setInput('');
      } else {
        finishGame(score + 150);
      }
    } else {
      setLives(l => l - 1);
      setShowError(true);
      if (lives <= 1) {
        setTimeout(() => finishGame(score), 500);
      }
      setTimeout(() => setShowError(false), 500);
    }
  };

  const finishGame = async (finalScore) => {
    setIsFinished(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || 'guest@vortex.com';
      await fetch(`http://localhost:3000/api/user/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, xpToAdd: finalScore })
      });
    } catch (e) { }
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: activeTheme.bg }}><LoadingSpinner activeTheme={activeTheme} text="BREWING PERSONALIZED CLUES..." /></View>;

  if (isFinished) {
    return (
      <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
        <MotiView from={{ scale: 0, rotate: '15deg' }} animate={{ scale: 1, rotate: '0deg' }} style={[styles.resultCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.accent, borderWidth: 2 }]}>
          {lives > 0 ? <Award size={100} color="#fbbf24" style={{ marginBottom: 20 }} /> : <X size={100} color="#ef4444" style={{ marginBottom: 20 }} />}
          <Text style={[styles.resultTitle, { color: activeTheme.text }]}>{lives > 0 ? "UNSTOPPABLE!" : "GAME OVER"}</Text>
          <Text style={[styles.resultScore, { color: activeTheme.accent }]}>+{score} XP Earned</Text>
          <TouchableOpacity onPress={() => router.back()} style={[styles.btn, { backgroundColor: activeTheme.accent }]}>
            <Text style={styles.btnText}>CONTINUE</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    );
  }

  const current = gameData[currentIndex];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}><X color={activeTheme.text} size={28} /></TouchableOpacity>
        
        <View style={styles.headerCenter}>
           {[...Array(3)].map((_, i) => (
             <MotiView 
               key={i} 
               animate={{ scale: i < lives ? 1 : 0.8, opacity: i < lives ? 1 : 0.2 }}
               transition={{ type: 'spring' }}
             >
               <Heart size={20} color="#ef4444" fill={i < lives ? "#ef4444" : "transparent"} />
             </MotiView>
           ))}
        </View>

        <View style={styles.scoreBox}>
           <Zap size={16} color="#fbbf24" fill="#fbbf24" />
           <Text style={[styles.scoreText, { color: activeTheme.text }]}>{score}</Text>
        </View>
      </View>

      <View style={styles.gameContent}>
        <MotiView 
           from={{ scale: 0.8, opacity: 0 }} 
           animate={{ scale: 1, opacity: 1 }} 
           key={`clue-${currentIndex}`}
           style={styles.clueCard}
        >
          <HelpCircle size={48} color={activeTheme.accent} style={{ marginBottom: 15 }} />
          <Text style={[styles.clueLabel, { color: activeTheme.subText }]}>GUESS THE WORD</Text>
          <Text style={[styles.clueText, { color: activeTheme.text }]}>{current.clue}</Text>
          <View style={[styles.badge, { backgroundColor: activeTheme.accent }]}>
             <Text style={styles.badgeText}>{current.word.length} LETTERS</Text>
          </View>
        </MotiView>

        <MotiView 
           animate={{ translateX: showError ? [0, -10, 10, -10, 10, 0] : 0 }}
           style={styles.wordDisplay}
        >
           {current.word.split('').map((char, i) => (
             <View key={i} style={[styles.charBox, { backgroundColor: activeTheme.card, borderColor: showError ? '#ef4444' : activeTheme.border }]}>
               <Text style={[styles.charText, { color: activeTheme.text }]}>{input[i]?.toUpperCase() || ''}</Text>
             </View>
           ))}
        </MotiView>

        <TextInput
          style={styles.hiddenInput}
          autoFocus
          value={input}
          onChangeText={(t) => setInput(t.slice(0, current.word.length))}
          autoCapitalize="characters"
          maxLength={current.word.length}
        />

        <TouchableOpacity onPress={handleGuess} activeOpacity={0.8} style={[styles.submitBtn, { backgroundColor: activeTheme.accent, borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.2)' }]}>
           <Text style={styles.btnText}>CHECK WORD</Text>
        </TouchableOpacity>

        <Text style={[styles.hint, { color: activeTheme.subText }]}>Personalized from your bookmarked list!</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerCenter: { flexDirection: 'row', gap: 5 },
  closeBtn: { padding: 5 },
  scoreBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  scoreText: { fontSize: 18, fontWeight: '900' },
  gameContent: { flex: 1, justifyContent: 'center' },
  clueCard: { alignItems: 'center', padding: 30, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.03)', marginBottom: 40, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  clueLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  clueText: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginTop: 10, lineHeight: 32 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 20 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  wordDisplay: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' },
  charBox: { width: 45, height: 55, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  charText: { fontSize: 24, fontWeight: '900' },
  hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
  submitBtn: { height: 65, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: 1 },
  hint: { textAlign: 'center', marginTop: 20, fontSize: 12, fontWeight: '600' },
  resultCard: { flex: 1, marginVertical: 60, borderRadius: 40, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultTitle: { fontSize: 36, fontWeight: '900', marginVertical: 20 },
  resultScore: { fontSize: 24, fontWeight: '800', marginBottom: 40 },
  btn: { width: '100%', paddingVertical: 20, borderRadius: 25, alignItems: 'center' }
});
