import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../_layout';
import { Sparkles, ChevronRight, GraduationCap, Target, User, Heart, Zap, Play } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Onboarding() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { activeTheme, avatars, setAvatar } = useApp();
  const [step, setStep] = useState(0); // Step 0 is the new Welcome/Survey start
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('A2');
  const [interests, setInterests] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');

  const goals = [
    { id: 'casual', label: 'Fun & Casual', icon: '🌈' },
    { id: 'academic', label: 'Academic/Exam', icon: '📚' },
    { id: 'pro', label: 'Professional', icon: '💼' },
  ];

  const interestList = [
    { id: 'gaming', label: 'Gaming', icon: '🎮' },
    { id: 'movies', label: 'Movies', icon: '🎬' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'art', label: 'Art', icon: '🎨' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
  ];

  const toggleInterest = (id) => {
    setInterests(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  const nextStep = () => setStep(s => s + 1);

  const skipSurvey = async () => {
    const dName = name || 'Voyager';
    const dAge = age || '20';
    const dGoal = goal || 'casual';
    const dLevel = level || 'A2';
    const dInterests = interests.length > 0 ? interests : ['movies'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];
    const dAvatar = selectedAvatar || randomAvatar;
    const guestEmail = `guest_${Math.random().toString(36).substring(7)}@vortex.com`;
    
    const demoBookmarks = [
      "Resilient", "Eloquent", "Ephemeral", "Luminous", "Sovereign", 
      "Cunning", "Enormous", "Rapid", "Jubilant", "Gloomy",
      "Meticulous", "Pragmatic", "Ineffable", "Serendipity", "Melancholy"
    ];

    await AsyncStorage.setItem('userEmail', guestEmail);
    await AsyncStorage.setItem('userName', dName);
    await AsyncStorage.setItem('userAge', dAge);
    await AsyncStorage.setItem('userGoal', dGoal);
    await AsyncStorage.setItem('userLevel', dLevel);
    await AsyncStorage.setItem('userInterests', JSON.stringify(dInterests));
    await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(demoBookmarks));
    await setAvatar(dAvatar);
    
    router.replace('/home');
  };

  const finish = async () => {
    if (!name || !age) return alert('Please fill in your details!');
    
    const guestEmail = `guest_${Math.random().toString(36).substring(7)}@vortex.com`;
    
    const demoBookmarks = [
      "Resilient", "Eloquent", "Ephemeral", "Luminous", "Sovereign", 
      "Cunning", "Enormous", "Rapid", "Jubilant", "Gloomy",
      "Meticulous", "Pragmatic", "Ineffable", "Serendipity", "Melancholy"
    ];
    
    await AsyncStorage.setItem('userEmail', guestEmail);
    await AsyncStorage.setItem('userName', name);
    await AsyncStorage.setItem('userAge', age);
    await AsyncStorage.setItem('userGoal', goal);
    await AsyncStorage.setItem('userLevel', level);
    await AsyncStorage.setItem('userInterests', JSON.stringify(interests));
    await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(demoBookmarks));
    await setAvatar(selectedAvatar);
    
    router.replace('/home');
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      {step > 0 && (
        <TouchableOpacity 
          onPress={skipSurvey} 
          style={styles.skipBtn}
        >
          <Text style={[styles.skipBtnText, { color: activeTheme.subText }]}>Skip</Text>
        </TouchableOpacity>
      )}
      <AnimatePresence exitBeforeEnter>
        {step === 0 && (
          <MotiView
            key="step0"
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={styles.stepContainer}
          >
            <View style={styles.welcomeCircle}>
               <Sparkles size={60} color={activeTheme.accent} />
            </View>
            <Text style={[styles.welcomeTitle, { color: activeTheme.text }]}>Welcome to the{"\n"}<Text style={{ color: activeTheme.accent }}>Vortex Journey</Text></Text>
            <Text style={[styles.welcomeSub, { color: activeTheme.subText }]}>Let's personalize your learning path in 30 seconds.</Text>
            
            <TouchableOpacity onPress={nextStep} style={[styles.mainBtn, { backgroundColor: activeTheme.accent }]}>
              <Text style={styles.mainBtnText}>START JOURNEY</Text>
              <Play size={20} color="#fff" fill="#fff" />
            </TouchableOpacity>
          </MotiView>
        )}

        {step === 1 && (
          <MotiView
            key="step1"
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -50 }}
            style={styles.stepContainer}
          >
            <User size={48} color={activeTheme.accent} style={styles.icon} />
            <Text style={[styles.title, { color: activeTheme.text }]}>
              Pick your <Text style={{ color: activeTheme.accent }}>Identity</Text>
            </Text>
            <View style={styles.avatarGrid}>
               {avatars.slice(0, 8).map(a => (
                 <TouchableOpacity 
                   key={a} 
                   onPress={() => setSelectedAvatar(a)}
                   style={[styles.avatarPill, { backgroundColor: selectedAvatar === a ? activeTheme.accent : activeTheme.card, borderColor: activeTheme.border }]}
                 >
                   <Text style={{ fontSize: 32 }}>{a}</Text>
                 </TouchableOpacity>
               ))}
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: activeTheme.card, color: activeTheme.text, borderColor: activeTheme.border, borderWidth: 2 }]}
              placeholder="What should we call you?"
              placeholderTextColor={activeTheme.subText}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: activeTheme.card, color: activeTheme.text, borderColor: activeTheme.border, borderWidth: 2 }]}
              placeholder="Your age?"
              placeholderTextColor={activeTheme.subText}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
            <TouchableOpacity onPress={nextStep} style={[styles.button, { backgroundColor: activeTheme.accent, borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.2)' }]}>
              <Text style={styles.buttonText}>Next Step</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </MotiView>
        )}

        {step === 2 && (
          <MotiView
            key="step2"
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -50 }}
            style={styles.stepContainer}
          >
            <Target size={48} color={activeTheme.accent} style={styles.icon} />
            <Text style={[styles.title, { color: activeTheme.text }]}>What's your <Text style={{ color: activeTheme.accent }}>Mission</Text>?</Text>
            <View style={styles.grid}>
              {goals.map(g => (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setGoal(g.id)}
                  style={[styles.card, { backgroundColor: activeTheme.card, borderColor: goal === g.id ? activeTheme.accent : activeTheme.border, borderWidth: 3 }]}
                >
                  <Text style={styles.cardEmoji}>{g.icon}</Text>
                  <Text style={[styles.cardLabel, { color: activeTheme.text }]}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={nextStep} style={[styles.button, { backgroundColor: activeTheme.accent, borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.2)' }]}>
              <Text style={styles.buttonText}>Continue</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </MotiView>
        )}

        {step === 3 && (
          <MotiView
            key="step3"
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -50 }}
            style={styles.stepContainer}
          >
            <Zap size={48} color={activeTheme.accent} style={styles.icon} />
            <Text style={[styles.title, { color: activeTheme.text }]}>Your <Text style={{ color: activeTheme.accent }}>Interests</Text>?</Text>
            <Text style={[styles.subtitle, { color: activeTheme.subText, marginBottom: 15 }]}>We'll use these to suggest movie dialogues!</Text>
            <View style={styles.grid}>
              {interestList.map(i => (
                <TouchableOpacity
                  key={i.id}
                  onPress={() => toggleInterest(i.id)}
                  style={[styles.card, { width: (SCREEN_WIDTH - 80) / 3.3, height: 100, backgroundColor: activeTheme.card, borderColor: interests.includes(i.id) ? activeTheme.accent : activeTheme.border, borderWidth: 3 }]}
                >
                  <Text style={{ fontSize: 24 }}>{i.icon}</Text>
                  <Text style={[styles.cardLabel, { fontSize: 10, color: activeTheme.text }]}>{i.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={nextStep} style={[styles.button, { backgroundColor: activeTheme.accent, borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.2)' }]}>
              <Text style={styles.buttonText}>Almost there</Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </MotiView>
        )}

        {step === 4 && (
          <MotiView
            key="step4"
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            exit={{ opacity: 0, translateX: -50 }}
            style={styles.stepContainer}
          >
            <GraduationCap size={48} color={activeTheme.accent} style={styles.icon} />
            <Text style={[styles.title, { color: activeTheme.text }]}>English <Text style={{ color: activeTheme.accent }}>Level</Text>?</Text>
            <View style={styles.levelRow}>
              {levels.map(l => (
                <TouchableOpacity
                  key={l}
                  onPress={() => setLevel(l)}
                  style={[styles.levelBtn, { backgroundColor: level === l ? activeTheme.accent : activeTheme.card, borderColor: activeTheme.border, borderWidth: 3 }]}
                >
                  <Text style={[styles.levelBtnText, { color: level === l ? '#fff' : activeTheme.text }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={finish} style={[styles.button, { backgroundColor: activeTheme.accent, borderBottomWidth: 5, borderBottomColor: 'rgba(0,0,0,0.2)' }]}>
              <Text style={styles.buttonText}>Enter the Vortex 🚀</Text>
            </TouchableOpacity>
          </MotiView>
        )}
      </AnimatePresence>
      
      {step > 0 && (
         <View style={styles.progressContainer}>
            <View style={[styles.progressBg, { backgroundColor: activeTheme.card }]}>
               <MotiView 
                 animate={{ width: `${(step / 4) * 100}%` }} 
                 style={[styles.progressFill, { backgroundColor: activeTheme.accent }]} 
               />
            </View>
            <Text style={[styles.progressText, { color: activeTheme.subText }]}>{step} / 4</Text>
         </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, justifyContent: 'center' },
  stepContainer: { width: '100%', alignItems: 'center' },
  welcomeCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 30, borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)' },
  welcomeTitle: { fontSize: 36, fontWeight: '900', textAlign: 'center', lineHeight: 42, marginBottom: 15 },
  welcomeSub: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40, paddingHorizontal: 20 },
  mainBtn: { flexDirection: 'row', alignItems: 'center', gap: 15, paddingHorizontal: 40, paddingVertical: 22, borderRadius: 30, elevation: 10 },
  mainBtnText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  icon: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 30, lineHeight: 24, textAlign: 'center' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 25, justifyContent: 'center' },
  avatarPill: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', borderWidth: 3 },
  input: { width: '100%', height: 65, borderRadius: 20, paddingHorizontal: 20, fontSize: 16, fontWeight: '700', marginBottom: 15 },
  button: { width: '100%', height: 65, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, gap: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  grid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginBottom: 20, justifyContent: 'center' },
  card: { width: (SCREEN_WIDTH - 90) / 2, height: 130, borderRadius: 30, justifyContent: 'center', alignItems: 'center', padding: 15 },
  cardEmoji: { fontSize: 38, marginBottom: 10 },
  cardLabel: { fontSize: 14, fontWeight: '900', textAlign: 'center' },
  levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 25, justifyContent: 'center' },
  levelBtn: { width: 70, height: 70, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  levelBtnText: { fontSize: 20, fontWeight: '900' },
  progressContainer: { position: 'absolute', bottom: 50, left: 30, right: 30, alignItems: 'center' },
  progressBg: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  skipBtn: { position: 'absolute', top: 50, right: 30, zIndex: 10, padding: 10 },
  skipBtnText: { fontSize: 16, fontWeight: '700' }
});
