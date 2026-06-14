import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../_layout';
import { useRouter } from 'expo-router';
import { X, Check, Award, Sparkles, Zap, Star, Heart } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { BASE_URL } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SYNONYM_MAP = {
  'Resilient': 'Tough',
  'Eloquent': 'Fluent',
  'Ephemeral': 'Short-lived',
  'Luminous': 'Bright',
  'Sovereign': 'Ruler',
  'Cunning': 'Clever',
  'Enormous': 'Huge',
  'Rapid': 'Quick',
  'Jubilant': 'Happy',
  'Gloomy': 'Sad',
  'Meticulous': 'Careful',
  'Pragmatic': 'Practical',
  'Ineffable': 'Unutterable',
  'Serendipity': 'Luck',
  'Melancholy': 'Sorrowful',
  'Apple': 'Fruit',
  'Water': 'Liquid',
  'School': 'Academy'
};

export default function WordMatch() {
  const { activeTheme } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matches, setMatches] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isFinished, setIsFinished] = useState(false);
  const [errorPair, setErrorPair] = useState(null);
  const [pairs, setPairs] = useState([]);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = async () => {
    setLoading(true);
    const b = await AsyncStorage.getItem('vortex_bookmarks');
    const bookmarks = b ? JSON.parse(b) : [];
    
    // Pick 6 random words from bookmarks or defaults
    let wordPool = bookmarks.length >= 6 ? bookmarks : [
      "Resilient", "Eloquent", "Ephemeral", "Luminous", "Sovereign", 
      "Cunning", "Enormous", "Rapid", "Jubilant", "Gloomy"
    ];
    
    // Shuffle and take 6
    const shuffled = [...wordPool].sort(() => 0.5 - Math.random()).slice(0, 6);
    
    try {
      // Fetch details for synonyms
      const res = await fetch(`${BASE_URL}/api/words/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: shuffled })
      });
      const data = await res.json();
      
      const gamePairs = data.map(item => {
        let match = 'Expert';
        if (item.synonyms && item.synonyms.length > 0 && item.synonyms[0] !== '...') {
          match = item.synonyms[0];
        } else if (SYNONYM_MAP[item.word]) {
          match = SYNONYM_MAP[item.word];
        } else if (SYNONYM_MAP[item.word.charAt(0).toUpperCase() + item.word.slice(1).toLowerCase()]) {
          match = SYNONYM_MAP[item.word.charAt(0).toUpperCase() + item.word.slice(1).toLowerCase()];
        }
        
        return {
          word: item.word,
          match: match
        };
      });

      // Filter out any placeholders that might have slipped through
      setPairs(gamePairs.filter(p => p.match !== '...' && p.word !== '...'));
    } catch (e) {
      console.error("Failed to fetch game details:", e);
      // Basic fallback
      const fallbackPairs = shuffled.map(w => ({ word: w, match: SYNONYM_MAP[w] || 'Genius' }));
      setPairs(fallbackPairs);
    }
    
    setTimeout(() => setLoading(false), 800);
  };

  const leftColumn = useMemo(() => pairs.map(p => p.word).sort(() => Math.random() - 0.5), [pairs]);
  const rightColumn = useMemo(() => pairs.map(p => p.match).sort(() => Math.random() - 0.5), [pairs]);

  const handleSelectWord = (word) => {
    if (matches.includes(word) || lives <= 0) return;
    setSelectedWord(word);
    if (selectedMatch) checkMatch(word, selectedMatch);
  };

  const handleSelectMatch = (match) => {
    if (matches.some(word => pairs.find(p => p.word === word).match === match) || lives <= 0) return;
    setSelectedMatch(match);
    if (selectedWord) checkMatch(selectedWord, match);
  };

  const checkMatch = (word, match) => {
    const pair = pairs.find(p => p.word === word && p.match === match);
    if (pair) {
      setMatches([...matches, word]);
      setScore(s => s + 50);
      setSelectedWord(null);
      setSelectedMatch(null);
      if (matches.length + 1 === pairs.length) {
        setTimeout(() => finishGame(score + 50), 600);
      }
    } else {
      setLives(l => l - 1);
      setErrorPair([word, match]);
      if (lives <= 1) {
        setTimeout(() => finishGame(score), 600);
      }
      setTimeout(() => {
        setErrorPair(null);
        setSelectedWord(null);
        setSelectedMatch(null);
      }, 500);
    }
  };

  const finishGame = async (finalScore) => {
    setIsFinished(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || 'guest@vortex.com';
      const name = await AsyncStorage.getItem('userName') || 'Explorer';
      const avatar = await AsyncStorage.getItem('vortex_avatar') || '🚀';

      await fetch(`${BASE_URL}/api/user/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          xpToAdd: finalScore,
          name,
          picture: avatar
        })
      });
    } catch (e) {
      console.error("Failed to sync match XP:", e);
    }
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: activeTheme.bg }}><LoadingSpinner activeTheme={activeTheme} text="PREPARING ARENA..." /></View>;

  if (isFinished) {
    return (
      <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
        <MotiView 
          from={{ scale: 0, translateY: 100 }} 
          animate={{ scale: 1, translateY: 0 }} 
          style={[styles.resultCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.accent, borderWidth: 3 }]}
        >
          {lives > 0 ? <Award size={100} color="#fbbf24" style={{ marginBottom: 20 }} /> : <X size={100} color="#ef4444" style={{ marginBottom: 20 }} />}
          <Text style={[styles.resultTitle, { color: activeTheme.text }]}>{lives > 0 ? "GENIUS!" : "OUT OF LIVES"}</Text>
          <Text style={[styles.resultScore, { color: activeTheme.accent }]}>+{score} XP Earned</Text>
          <View style={styles.badgeRow}>
             {[...Array(3)].map((_, i) => (
               <Heart key={i} size={24} color={i < lives ? "#ef4444" : "#333"} fill={i < lives ? "#ef4444" : "transparent"} />
             ))}
          </View>
          <TouchableOpacity onPress={() => router.back()} style={[styles.btn, { backgroundColor: activeTheme.accent }]} nativeID="match-continue-btn">
            <Text style={styles.btnText}>CONTINUE</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
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

        <MotiView animate={{ scale: [1, 1.2, 1] }} transition={{ type: 'spring' }} key={score} style={styles.scoreBox}>
           <Zap size={16} color="#fbbf24" fill="#fbbf24" />
           <Text style={[styles.scoreText, { color: activeTheme.text }]}>{score}</Text>
        </MotiView>
      </View>

      <View style={styles.instructionBox}>
        <Text style={[styles.instruction, { color: activeTheme.text }]}>PERSONALIZED CHALLENGE</Text>
        <Text style={[styles.subInstruction, { color: activeTheme.subText }]}>Match words from your Lab list</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.column}>
          {leftColumn.map(word => {
            const isMatched = matches.includes(word);
            const isSelected = selectedWord === word;
            const isError = errorPair?.includes(word);
            
            return (
              <MotiView
                key={word}
                animate={{ 
                  scale: isSelected ? 1.05 : 1,
                  translateX: isError ? [0, -10, 10, -10, 10, 0] : 0,
                  opacity: isMatched ? 0 : 1
                }}
              >
                <TouchableOpacity
                  onPress={() => handleSelectWord(word)}
                  disabled={isMatched}
                  activeOpacity={0.7}
                  style={[
                    styles.wordCard,
                    { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderBottomWidth: 5 },
                    isSelected && { borderColor: activeTheme.accent, backgroundColor: activeTheme.bg },
                    isError && { borderColor: '#ef4444' }
                  ]}
                  nativeID={`match-left-${word}`}
                >
                  <Text style={[styles.wordText, { color: activeTheme.text }]}>{word}</Text>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>

        <View style={styles.column}>
          {rightColumn.map(match => {
            const isMatched = matches.some(word => pairs.find(p => p.word === word).match === match);
            const isSelected = selectedMatch === match;
            const isError = errorPair?.includes(match);
            
            return (
              <MotiView
                key={match}
                animate={{ 
                  scale: isSelected ? 1.05 : 1,
                  translateX: isError ? [0, -10, 10, -10, 10, 0] : 0,
                  opacity: isMatched ? 0 : 1
                }}
              >
                <TouchableOpacity
                  onPress={() => handleSelectMatch(match)}
                  disabled={isMatched}
                  activeOpacity={0.7}
                  style={[
                    styles.wordCard,
                    { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderBottomWidth: 5 },
                    isSelected && { borderColor: activeTheme.accent, backgroundColor: activeTheme.bg },
                    isError && { borderColor: '#ef4444' }
                  ]}
                  nativeID={`match-right-${match}`}
                >
                  <Text style={[styles.wordText, { color: activeTheme.text }]}>{match}</Text>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomStatus}>
         <View style={styles.progressBarBg}>
            <MotiView 
               animate={{ width: `${(matches.length / pairs.length) * 100}%` }} 
               style={[styles.progressBarFill, { backgroundColor: activeTheme.accent }]} 
            />
         </View>
         <Text style={{ color: activeTheme.subText, fontWeight: '900', fontSize: 12, marginTop: 10 }}>{matches.length} / {pairs.length} COMPLETED</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerCenter: { flexDirection: 'row', gap: 5 },
  closeBtn: { padding: 5 },
  scoreBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  scoreText: { fontSize: 18, fontWeight: '900' },
  instructionBox: { alignItems: 'center', marginBottom: 30 },
  instruction: { fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  subInstruction: { fontSize: 12, fontWeight: '700', marginTop: 4 },
  gameArea: { flexDirection: 'row', gap: 15, flex: 1 },
  column: { flex: 1, gap: 15 },
  wordCard: { height: 85, borderRadius: 24, borderWidth: 2, justifyContent: 'center', alignItems: 'center', padding: 10 },
  wordText: { fontSize: 16, fontWeight: '900', textAlign: 'center' },
  bottomStatus: { marginBottom: 50, alignItems: 'center' },
  progressBarBg: { width: '100%', height: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  resultCard: { flex: 1, marginVertical: 60, borderRadius: 40, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultTitle: { fontSize: 42, fontWeight: '900', marginVertical: 10 },
  resultScore: { fontSize: 24, fontWeight: '800', marginBottom: 30 },
  badgeRow: { flexDirection: 'row', gap: 15, marginBottom: 40 },
  btn: { width: '100%', paddingVertical: 20, borderRadius: 25, alignItems: 'center', elevation: 5 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
