import { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, RefreshControl } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../_layout';
import { CheckCircle2, RotateCw, Trophy, Star, TrendingUp, ChevronRight, Palette, Settings, X } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useRouter, useFocusEffect } from 'expo-router';
import { BASE_URL as API_BASE } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Lab() {
  const { activeTheme, user, setTheme, themeKey, themes, avatar, setAvatar, avatars } = useApp();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [learned, setLearned] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState({ xp: 0, level: 1 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const initData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const name = await AsyncStorage.getItem('userName');
    const b = await AsyncStorage.getItem('vortex_bookmarks');
    const l = await AsyncStorage.getItem('vortex_learned');
    
    if (name) setUserName(name);
    if (b) setBookmarks(JSON.parse(b));
    if (l) setLearned(JSON.parse(l));

    await Promise.all([fetchUserData(), fetchLeaderboard()]);
    if (showLoading) setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      initData(false);
    }, [])
  );

  useEffect(() => {
    initData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await initData(false);
    setRefreshing(false);
  };

  const renderAvatar = (source, size = 18, isMain = false) => {
    const isUrl = source?.startsWith('http');
    if (isUrl) {
      return <Image source={{ uri: source }} style={{ width: isMain ? 70 : 40, height: isMain ? 70 : 40, borderRadius: isMain ? 35 : 20 }} />;
    }
    return <Text style={{ fontSize: isMain ? 36 : size }}>{source || '👤'}</Text>
  };

  const fetchUserData = async () => {
    try {
      const email = user?.email || (await AsyncStorage.getItem('userEmail')) || 'guest@vortex.com';
      const res = await fetch(`${API_BASE}/api/user?email=${email}`);
      const data = await res.json();
      if (res.ok) setUserStats({ xp: data.xp || 0, level: data.level || 1 });
      else console.log("User not found in DB yet, will be created on next XP gain.");
    } catch (e) { 
      console.error("Failed to fetch user data:", e);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/leaderboard`);
      const data = await res.json();
      
      if (res.ok && Array.isArray(data)) {
        setLeaderboard(data.sort((a,b) => b.xp - a.xp).slice(0, 10));
      }
    } catch (e) { 
      console.error("Failed to fetch leaderboard:", e);
    }
  };

  const markLearned = async (word) => {
    const nextB = bookmarks.filter(w => w !== word);
    const nextL = learned.includes(word) ? learned : [...learned, word];
    setBookmarks(nextB);
    setLearned(nextL);
    await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(nextB));
    await AsyncStorage.setItem('vortex_learned', JSON.stringify(nextL));
    
    try {
      const email = user?.email || (await AsyncStorage.getItem('userEmail')) || 'guest@vortex.com';
      const name = user?.name || (await AsyncStorage.getItem('userName')) || 'Explorer';
      const currentAvatar = avatar || (await AsyncStorage.getItem('vortex_avatar')) || '🚀';

      await fetch(`${API_BASE}/api/user/xp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          xpToAdd: 50,
          name,
          picture: currentAvatar
        })
      });
      fetchUserData();
      fetchLeaderboard();
    } catch (e) {
      console.error("Failed to sync learned word XP:", e);
    }
  };

  const progressPercent = useMemo(() => {
    const total = bookmarks.length + learned.length;
    return total === 0 ? 0 : Math.round((learned.length / total) * 100);
  }, [bookmarks, learned]);

  if (loading) return <View style={{ flex: 1, backgroundColor: activeTheme.bg }}><LoadingSpinner activeTheme={activeTheme} text="ANALYZING PROGRESS..." /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: activeTheme.bg }} nativeID="trainer-pane">
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activeTheme.accent} />
        }
      >
        <MotiView from={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.viewContainer}>
          
          {/* Header */}
          <View style={styles.headerRow}>
             <Text style={[styles.pageTitle, { color: activeTheme.text }]}>Your <Text style={{ color: activeTheme.accent }}>Lab</Text></Text>
             <TouchableOpacity onPress={() => setShowSettings(true)} style={[styles.iconBtn, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
               <Settings size={20} color={activeTheme.accent} />
             </TouchableOpacity>
          </View>
          
          {/* Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
            <View style={styles.profileHeader}>
              <View style={[styles.avatarMain, { backgroundColor: activeTheme.accent, overflow: 'hidden' }]}>
                 {renderAvatar(user?.picture || avatar, 36, true)}
              </View>
              <View>
                <Text style={[styles.name, { color: activeTheme.text }]}>{user?.name || userName || "Explorer"}</Text>
                <Text style={[styles.levelLabel, { color: activeTheme.subText }]}>Level {userStats.level} Prodigy</Text>
              </View>
            </View>

            <View style={styles.xpBarContainer}>
               <View style={styles.xpLabelRow}>
                 <Text style={[styles.xpText, { color: activeTheme.text }]}>{userStats.xp} XP</Text>
                 <Text style={[styles.xpTarget, { color: activeTheme.subText }]}>{500 - (userStats.xp % 500)} XP to Level {userStats.level + 1}</Text>
               </View>
               <View style={[styles.progressBar, { backgroundColor: activeTheme.bg }]}>
                  <MotiView 
                    from={{ width: 0 }} 
                    animate={{ width: `${(userStats.xp % 500) / 5}%` }} 
                    style={[styles.progressFill, { backgroundColor: activeTheme.accent }]} 
                  />
               </View>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
              <Star size={20} color={activeTheme.accent} />
              <Text style={[styles.statNum, { color: activeTheme.text }]}>{learned.length}</Text>
              <Text style={styles.statLabel}>MASTERED</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
              <TrendingUp size={20} color={activeTheme.accent} />
              <Text style={[styles.statNum, { color: activeTheme.text }]}>{progressPercent}%</Text>
              <Text style={styles.statLabel}>ACCURACY</Text>
            </View>
          </View>

          {/* Leaderboard */}
          <View style={[styles.section, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
            <View style={styles.sectionHeader}>
              <Trophy size={20} color="#fbbf24" />
              <Text style={[styles.sectionTitle, { color: activeTheme.text }]}>GLOBAL LEADERBOARD</Text>
            </View>
            {leaderboard.length === 0 ? <Text style={{ color: activeTheme.subText, textAlign: 'center' }}>No legends yet...</Text> : leaderboard.map((u, i) => (
              <MotiView 
                key={i} 
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ delay: i * 50 }}
                style={[styles.leaderboardItem, { borderBottomColor: 'transparent', marginBottom: 8, backgroundColor: activeTheme.bg, borderRadius: 20, paddingHorizontal: 15, borderWidth: 1, borderColor: activeTheme.border }]}
              >
                <Text style={[styles.rank, { color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : activeTheme.subText }]}>#{i + 1}</Text>
                <View style={[styles.leaderAvatar, { backgroundColor: activeTheme.card, overflow: 'hidden' }]}>
                   {renderAvatar(u.picture || u.avatar)}
                </View>
                <Text style={[styles.leaderName, { color: activeTheme.text }]}>{u.name}</Text>
                <View style={[styles.xpBadgeMini, { backgroundColor: activeTheme.accent }]}>
                   <Text style={styles.xpBadgeMiniText}>{u.xp} XP</Text>
                </View>
              </MotiView>
            ))}
          </View>

          {/* Lab Queue */}
          <View style={[styles.section, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
            <Text style={[styles.sectionTitle, { color: activeTheme.text, marginBottom: 15 }]}>VOCAB LAB</Text>
            {bookmarks.length === 0 ? (
               <Text style={[styles.emptyText, { color: activeTheme.subText }]}>Your lab is empty. Explore words to add them here!</Text>
            ) : bookmarks.map((w, i) => (
              <View key={i} style={[styles.listItem, { backgroundColor: activeTheme.bg, borderColor: activeTheme.border, borderWidth: 1 }]}>
                <Text style={{ color: activeTheme.text, fontWeight: 'bold', flex: 1 }}>{w}</Text>
                <TouchableOpacity onPress={() => markLearned(w)}><CheckCircle2 size={24} color={activeTheme.accent} /></TouchableOpacity>
              </View>
            ))}
          </View>

        </MotiView>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <View style={styles.modalOverlay}>
           <MotiView from={{ translateY: 300 }} animate={{ translateY: 0 }} style={[styles.settingsModal, { backgroundColor: activeTheme.bg, borderColor: activeTheme.accent }]}>
              <View style={styles.modalHeader}>
                 <Text style={[styles.modalTitle, { color: activeTheme.text }]}>Settings & Themes</Text>
                 <TouchableOpacity onPress={() => setShowSettings(false)}><X color={activeTheme.text} size={28} /></TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.settingsTitle, { color: activeTheme.subText }]}>PICK AN AVATAR</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarScroll}>
                  {avatars.map(a => (
                    <TouchableOpacity key={a} onPress={() => setAvatar(a)} style={[styles.avatarPill, { backgroundColor: avatar === a ? activeTheme.accent : activeTheme.card, borderColor: activeTheme.border }]}>
                      <Text style={{ fontSize: 32 }}>{a}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.settingsTitle, { color: activeTheme.subText, marginTop: 30 }]}>CHOOSE UNIVERSE</Text>
                <View style={styles.themeGrid}>
                   {Object.entries(themes).map(([k, t]) => (
                     <TouchableOpacity key={k} onPress={() => setTheme(k)} style={[styles.themeCard, { backgroundColor: t.bg, borderColor: themeKey === k ? t.accent : activeTheme.border }]}>
                        <View style={[styles.colorDot, { backgroundColor: t.accent }]} />
                        <Text style={[styles.themeLabel, { color: t.text }]}>{t.name}</Text>
                     </TouchableOpacity>
                   ))}
                </View>

                <TouchableOpacity 
                   onPress={async () => {
                      const demoBookmarks = ["Resilient", "Eloquent", "Ephemeral", "Luminous", "Sovereign", "Cunning", "Enormous", "Rapid", "Jubilant", "Gloomy"];
                      await AsyncStorage.setItem('userName', 'Vortex Hero');
                      await AsyncStorage.setItem('userAge', '18');
                      await AsyncStorage.setItem('vortex_bookmarks', JSON.stringify(demoBookmarks));
                      alert("Demo data loaded! Restart app to see full changes.");
                      router.replace('/');
                   }}
                   style={[styles.resetBtn, { marginTop: 20, backgroundColor: activeTheme.accent, borderRadius: 15 }]}
                >
                   <Text style={{ color: '#fff', fontWeight: 'bold' }}>Load Demo Data 🚀</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                   onPress={async () => {
                      await AsyncStorage.clear();
                      router.replace('/');
                   }}
                   style={styles.resetBtn}
                >
                   <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Reset Profile & Progress</Text>
                </TouchableOpacity>
              </ScrollView>
           </MotiView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 150 },
  viewContainer: { padding: 24, paddingTop: 40 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle: { fontSize: 28, fontWeight: '900' },
  iconBtn: { padding: 10, borderRadius: 12, borderWidth: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  settingsModal: { height: '80%', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, borderWidth: 2 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  modalTitle: { fontSize: 24, fontWeight: '900' },
  settingsTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 15 },
  avatarScroll: { flexDirection: 'row', marginBottom: 10 },
  avatarPill: { width: 70, height: 70, borderRadius: 35, marginRight: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  themeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  themeCard: { width: (SCREEN_WIDTH - 84) / 2, padding: 18, borderRadius: 20, borderWidth: 2, flexDirection: 'row', alignItems: 'center', gap: 10 },
  colorDot: { width: 14, height: 14, borderRadius: 7 },
  themeLabel: { fontSize: 13, fontWeight: 'bold' },
  profileCard: { borderRadius: 32, padding: 25, marginBottom: 20 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
  avatarMain: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
  avatarMainText: { fontSize: 36 },
  name: { fontSize: 24, fontWeight: '900' },
  levelLabel: { fontSize: 12, fontWeight: '600' },
  xpBarContainer: { width: '100%' },
  xpLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpText: { fontWeight: 'bold', fontSize: 14 },
  xpTarget: { fontSize: 10, fontWeight: '600' },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 25, padding: 20, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900', marginVertical: 5 },
  statLabel: { fontSize: 8, fontWeight: '900', opacity: 0.4, letterSpacing: 1 },
  section: { borderRadius: 32, padding: 25, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  leaderAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  xpBadgeMini: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  xpBadgeMiniText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  rank: { width: 40, fontWeight: 'bold', fontSize: 16 },
  leaderName: { flex: 1, fontWeight: 'bold', fontSize: 16 },
  leaderXP: { fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', paddingVertical: 20 },
  listItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 20, marginBottom: 10 },
  resetBtn: { marginTop: 40, alignItems: 'center', padding: 20 }
});
