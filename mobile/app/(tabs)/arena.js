import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground, RefreshControl } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../_layout';
import { Target, Zap, Layout, Trophy, ChevronRight, Play } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Arena() {
  const { activeTheme } = useApp();
  
  const games = [
    { id: 'guess', title: 'Vortex Guess', icon: <Zap size={32} color="#fbbf24" />, desc: 'Predict the meaning from context' },
    { id: 'match', title: 'Semantic Match', icon: <Layout size={32} color="#3b82f6" />, desc: 'Connect synonyms in the void' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]} nativeID="games-pane">
      <View style={styles.header}>
        <Text style={[styles.title, { color: activeTheme.text }]}>The <Text style={{ color: activeTheme.accent }}>Arena</Text></Text>
        <Text style={[styles.subtitle, { color: activeTheme.subText }]}>Test your mastery in the void.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gameGrid}>
          {games.map((g, i) => (
            <MotiView key={g.id} from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 150 }}>
              <TouchableOpacity style={[styles.gameCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]} nativeID={`game-card-${g.id}`}>
                <View style={styles.gameIcon}>{g.icon}</View>
                <Text style={[styles.gameTitle, { color: activeTheme.text }]}>{g.title}</Text>
                <Text style={[styles.gameDesc, { color: activeTheme.subText }]}>{g.desc}</Text>
                <View style={[styles.playBtn, { backgroundColor: activeTheme.accent }]}>
                  <Play size={16} color="#fff" fill="#fff" />
                  <Text style={styles.playBtnText}>ENTER</Text>
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        <View style={[styles.statsSection, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]}>
          <View style={styles.statsHeader}>
            <Trophy size={20} color="#fbbf24" />
            <Text style={[styles.statsTitle, { color: activeTheme.text }]}>ARENA PERFORMANCE</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: activeTheme.text }]}>0</Text>
              <Text style={styles.statLabel}>WINS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: activeTheme.text }]}>0%</Text>
              <Text style={styles.statLabel}>RANK</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '900', textTransform: 'uppercase' },
  subtitle: { fontSize: 14, fontWeight: '600', opacity: 0.6 },
  scrollContent: { paddingBottom: 150 },
  gameGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 30 },
  gameCard: { width: (SCREEN_WIDTH - 63) / 2, padding: 25, borderRadius: 35, alignItems: 'center', textAlign: 'center' },
  gameIcon: { marginBottom: 20, width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  gameTitle: { fontSize: 16, fontWeight: '900', marginBottom: 8, textAlign: 'center' },
  gameDesc: { fontSize: 10, fontWeight: '600', textAlign: 'center', opacity: 0.7, marginBottom: 20, height: 30 },
  playBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  playBtnText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  statsSection: { borderRadius: 32, padding: 25 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  statsTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 8, fontWeight: '900', opacity: 0.4, letterSpacing: 1 }
});
