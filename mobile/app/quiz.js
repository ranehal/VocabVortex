import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp, authFetch } from './_layout';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check, ArrowRight, Award, Sparkles, AlertCircle } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../components/LoadingSpinner';
import { BASE_URL as API_BASE } from '../constants';

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

export default function Quiz() {
  const { activeTheme, handleTapWord } = useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuizData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    generateQuiz();
  }, []);

  const generateQuiz = async () => {
    setLoading(true);
    const b = await AsyncStorage.getItem('vortex_bookmarks');
    const bookmarks = b ? JSON.parse(b) : [];
    
    let wordPool = bookmarks.length >= 3 ? bookmarks : [
      "Resilient", "Eloquent", "Ephemeral", "Luminous", "Sovereign", 
      "Cunning", "Enormous", "Rapid", "Jubilant", "Gloomy"
    ];

    // Pick 5-10 random words
    const shuffledPool = [...wordPool].sort(() => 0.5 - Math.random()).slice(0, 10);
    const optionsPool = ["Tough", "Fluent", "Short-lived", "Bright", "Ruler", "Clever", "Huge", "Quick", "Happy", "Sad", "Careful", "Practical", "Luck", "Swift", "Brave"];
    
    try {
      const res = await authFetch(`${API_BASE}/api/words/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ words: shuffledPool })
      });
      const data = await res.json();
      
      const qData = data.map(item => {
        let correct = 'Superior';
        if (item.synonyms && item.synonyms.length > 0 && item.synonyms[0] !== '...') {
          correct = item.synonyms[0];
        } else if (SYNONYM_MAP[item.word]) {
          correct = SYNONYM_MAP[item.word];
        } else if (SYNONYM_MAP[item.word.charAt(0).toUpperCase() + item.word.slice(1).toLowerCase()]) {
          correct = SYNONYM_MAP[item.word.charAt(0).toUpperCase() + item.word.slice(1).toLowerCase()];
        }

        const wrong = optionsPool.filter(o => o.toLowerCase() !== correct.toLowerCase()).sort(() => Math.random() - 0.5).slice(0, 3);
        return {
          word: item.word,
          correct,
          options: [...wrong, correct].sort(() => Math.random() - 0.5)
        };
      });

      // Filter out invalid questions
      setQuizData(qData.filter(q => q.word !== '...' && q.correct !== '...'));
    } catch (e) {
      console.error("Failed to generate quiz:", e);
      const fallbackQs = shuffledPool.map(word => {
        const correct = SYNONYM_MAP[word] || "Expert";
        const wrong = optionsPool.filter(o => o !== correct).sort(() => Math.random() - 0.5).slice(0, 3);
        return {
          word,
          correct,
          options: [...wrong, correct].sort(() => Math.random() - 0.5)
        };
      });
      setQuizData(fallbackQs);
    }
    
    setLoading(false);
  };

  const handleAnswer = (option) => {
    if (selectedOption) return;
    setSelectedOption(option);
    if (option === questions[currentIndex].correct) {
      setScore(s => s + 100);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setIsFinished(true);
    try {
      const email = await AsyncStorage.getItem('userEmail') || 'guest@vortex.com';
      const name = await AsyncStorage.getItem('userName') || 'Explorer';
      const avatar = await AsyncStorage.getItem('vortex_avatar') || '🚀';
      
      await authFetch(`${API_BASE}/api/user/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          xpToAdd: score,
          name,
          picture: avatar
        })
      });
    } catch (e) {
      console.error("Failed to sync quiz XP:", e);
    }
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: activeTheme.bg }}><LoadingSpinner activeTheme={activeTheme} text="PREPARING ARENA..." /></View>;

  if (isFinished) {
    return (
      <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
        <MotiView 
          from={{ scale: 0, rotate: '-10deg' }} 
          animate={{ scale: 1, rotate: '0deg' }} 
          style={[styles.resultCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.accent, borderWidth: 2 }]}
        >
          <Award size={100} color="#fbbf24" style={{ marginBottom: 20 }} />
          <Text style={[styles.resultTitle, { color: activeTheme.text }]}>VICTORY!</Text>
          <Text style={[styles.resultScore, { color: activeTheme.accent }]}>+{score} XP</Text>
          <View style={styles.statsRow}>
             <View style={styles.miniStat}><Text style={styles.miniStatLabel}>STREAK</Text><Text style={[styles.miniStatValue, { color: activeTheme.text }]}>{streak} 🔥</Text></View>
             <View style={styles.miniStat}><Text style={styles.miniStatLabel}>ACCURACY</Text><Text style={[styles.miniStatValue, { color: activeTheme.text }]}>{Math.round((score / (questions.length * 100)) * 100)}%</Text></View>
          </View>
          <TouchableOpacity onPress={() => router.replace('/arena')} style={[styles.btn, { backgroundColor: activeTheme.accent }]}>
            <Text style={styles.btnText}>CONTINUE</Text>
          </TouchableOpacity>
        </MotiView>
      </View>
    );
  }

  const q = questions[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}><X color={activeTheme.text} size={24} /></TouchableOpacity>
        <View style={styles.progressTrack}>
           <MotiView 
             animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} 
             style={[styles.progressFill, { backgroundColor: activeTheme.accent }]} 
           />
        </View>
        <View style={styles.scoreBadge}><Text style={{ color: '#fff', fontWeight: 'bold' }}>{score}</Text></View>
      </View>

      <View style={styles.content}>
        <MotiView 
          from={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: 1, scale: 1 }} 
          key={`q-${currentIndex}`} 
          style={styles.questionCard}
        >
          <Text style={[styles.questionLabel, { color: activeTheme.subText }]}>WHAT'S THE MEANING OF</Text>
          <TouchableOpacity onPress={() => handleTapWord(q.word)}>
            <Text style={[styles.word, { color: activeTheme.text }]}>{q.word.toUpperCase()}</Text>
          </TouchableOpacity>
        </MotiView>

        <View style={styles.options}>
          {q.options.map((opt, i) => {
            const isCorrect = opt === q.correct;
            const isSelected = selectedOption === opt;
            let bg = activeTheme.card;
            let border = activeTheme.border;
            
            if (selectedOption) {
              if (isCorrect) { bg = '#10b981'; border = '#059669'; }
              else if (isSelected) { bg = '#ef4444'; border = '#dc2626'; }
            } else {
              if (isSelected) border = activeTheme.accent;
            }

            return (
              <MotiView
                key={i}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: i * 100 }}
              >
                <TouchableOpacity
                  onPress={() => handleAnswer(opt)}
                  activeOpacity={0.7}
                  style={[styles.optionBtn, { backgroundColor: bg, borderColor: border, borderBottomWidth: 5 }]}
                >
                  <Text style={[styles.optionText, { color: selectedOption ? '#fff' : activeTheme.text }]}>{opt}</Text>
                  {selectedOption && isCorrect && <Check size={20} color="#fff" style={styles.optionIcon} />}
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>
      </View>

      <AnimatePresence>
        {selectedOption && (
          <MotiView 
            from={{ translateY: 150 }} 
            animate={{ translateY: 0 }} 
            exit={{ translateY: 150 }}
            style={[styles.footer, { backgroundColor: selectedOption === q.correct ? '#064e3b' : '#450a0a' }]}
          >
             <View style={styles.feedbackRow}>
                {selectedOption === q.correct ? (
                  <View style={styles.feedbackIcon}><Sparkles color="#fff" size={24} /></View>
                ) : (
                  <View style={styles.feedbackIcon}><AlertCircle color="#fff" size={24} /></View>
                )}
                <View>
                  <Text style={styles.feedbackText}>{selectedOption === q.correct ? "AMAZING!" : "OH NO!"}</Text>
                  <Text style={styles.feedbackSub}>{selectedOption === q.correct ? "+100 XP gained" : "Next time will be better!"}</Text>
                </View>
             </View>
             <TouchableOpacity onPress={next} style={styles.nextBtn}>
               <Text style={styles.nextBtnText}>CONTINUE</Text>
             </TouchableOpacity>
          </MotiView>
        )}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, gap: 15, marginBottom: 40 },
  closeBtn: { padding: 8 },
  progressTrack: { flex: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6 },
  scoreBadge: { backgroundColor: '#fbbf24', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  content: { paddingHorizontal: 24 },
  questionCard: { alignItems: 'center', marginBottom: 40 },
  questionLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 10 },
  word: { fontSize: 48, fontWeight: '900', letterSpacing: -2 },
  options: { width: '100%', gap: 15 },
  optionBtn: { padding: 22, borderRadius: 24, borderWidth: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  optionText: { fontSize: 17, fontWeight: '800' },
  optionIcon: { position: 'absolute', right: 20 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 30, borderTopLeftRadius: 40, borderTopRightRadius: 40 },
  feedbackRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  feedbackIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  feedbackText: { color: '#fff', fontSize: 22, fontWeight: '900' },
  feedbackSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  nextBtn: { backgroundColor: '#fff', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
  nextBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
  resultCard: { flex: 1, margin: 24, borderRadius: 40, justifyContent: 'center', alignItems: 'center', padding: 40 },
  resultTitle: { fontSize: 36, fontWeight: '900', marginBottom: 10 },
  resultScore: { fontSize: 54, fontWeight: '900', marginBottom: 40 },
  statsRow: { flexDirection: 'row', gap: 30, marginBottom: 40 },
  miniStat: { alignItems: 'center' },
  miniStatLabel: { fontSize: 10, fontWeight: '900', opacity: 0.5, marginBottom: 5 },
  miniStatValue: { fontSize: 18, fontWeight: '800' },
  btn: { width: '100%', paddingVertical: 20, borderRadius: 25, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 }
});
