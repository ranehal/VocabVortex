import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ImageBackground } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../_layout';
import { Gamepad2, Brain, Trophy, Zap, Target, Star, Flame, Sword } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Arena() {
  const { activeTheme, user } = useApp();
  const router = useRouter();

  const games = [
    {
      id: 'match',
      title: 'Word Match',
      desc: 'Connect synonyms at high speed',
      icon: <Target size={34} color="#fff" />,
      color: '#10b981',
      xp: '+100 XP',
      route: '/games/match',
      tags: ['POPULAR', 'SPEED']
    },
    {
      id: 'guess',
      title: 'Vortex Guess',
      desc: 'Crack the code from clues',
      icon: <Brain size={34} color="#fff" />,
      color: '#3b82f6',
      xp: '+150 XP',
      route: '/games/guess',
      tags: ['SMART']
    },
    {
      id: 'speed',
      title: 'Arena Quiz',
      desc: 'Ultimate vocabulary showdown',
      icon: <Sword size={34} color="#fff" />,
      color: '#ef4444',
      xp: '+200 XP',
      route: '/quiz',
      tags: ['ELITE']
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <MotiView from={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.viewContainer}>
          
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: activeTheme.text }]}>THE <Text style={{ color: activeTheme.accent }}>ARENA</Text></Text>
              <Text style={[styles.subtitle, { color: activeTheme.subText }]}>Master words, earn XP, rule the world</Text>
            </View>
            <MotiView animate={{ scale: [1, 1.1, 1] }} transition={{ loop: true, duration: 2000 }} style={styles.streakBadge}>
               <Flame size={20} color="#f97316" fill="#f97316" />
               <Text style={styles.streakText}>5</Text>
            </MotiView>
          </View>

          <View style={styles.dailyChallenge}>
             <MotiView 
               from={{ scale: 0.9, opacity: 0 }} 
               animate={{ scale: 1, opacity: 1 }}
               style={[styles.dailyCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.accent }]}
             >
                <View style={styles.dailyInfo}>
                   <Trophy size={32} color="#fbbf24" style={{ marginBottom: 10 }} />
                   <Text style={[styles.dailyTitle, { color: activeTheme.text }]}>DAILY BOSS</Text>
                   <Text style={[styles.dailyDesc, { color: activeTheme.subText }]}>Beat the 5-minute drill for bonus 500 XP!</Text>
                </View>
                <TouchableOpacity style={[styles.dailyBtn, { backgroundColor: activeTheme.accent }]}>
                   <Text style={styles.dailyBtnText}>BATTLE</Text>
                </TouchableOpacity>
             </MotiView>
          </View>

          <Text style={[styles.sectionTitle, { color: activeTheme.subText }]}>CHOOSE YOUR CHALLENGE</Text>

          <View style={styles.gameGrid}>
            {games.map((game, i) => (
              <TouchableOpacity 
                key={game.id} 
                onPress={() => router.push(game.route)}
                activeOpacity={0.9}
                style={[styles.gameCard, { backgroundColor: game.color }]}
              >
                <MotiView
                  from={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 300 + (i * 100) }}
                >
                  <View style={styles.cardTop}>
                    <View style={styles.iconCircle}>
                      {game.icon}
                    </View>
                    <View style={styles.tagRow}>
                       {game.tags.map(tag => (
                         <View key={tag} style={styles.tag}><Text style={styles.tagText}>{tag}</Text></View>
                       ))}
                    </View>
                  </View>

                  <View style={styles.cardBottom}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{game.title}</Text>
                      <Text style={styles.cardDesc}>{game.desc}</Text>
                    </View>
                    <View style={styles.xpBadge}>
                       <Text style={styles.xpText}>{game.xp}</Text>
                    </View>
                  </View>
                </MotiView>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.footerBanner, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
             <Star size={24} color="#fbbf24" fill="#fbbf24" />
             <Text style={[styles.footerText, { color: activeTheme.text }]}>New Season starts in 2 days!</Text>
          </View>

        </MotiView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 150 },
  viewContainer: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
  title: { fontSize: 34, fontWeight: '900', letterSpacing: -1.5 },
  subtitle: { fontSize: 13, marginTop: 4, fontWeight: '700', opacity: 0.8 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(249, 115, 22, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#f97316' },
  streakText: { color: '#f97316', fontWeight: '900', fontSize: 16 },
  dailyChallenge: { marginBottom: 35 },
  dailyCard: { borderRadius: 32, padding: 25, borderStyle: 'dashed', borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dailyTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  dailyDesc: { fontSize: 12, fontWeight: '600', maxWidth: 160 },
  dailyBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, elevation: 4 },
  dailyBtnText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 20 },
  gameGrid: { gap: 20 },
  gameCard: { borderRadius: 35, padding: 25, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  iconCircle: { width: 65, height: 65, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  tagRow: { flexDirection: 'row', gap: 6 },
  tag: { backgroundColor: 'rgba(0,0,0,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  tagText: { color: '#fff', fontSize: 9, fontWeight: '900' },
  cardBottom: { flexDirection: 'row', alignItems: 'flex-end', gap: 15 },
  cardTitle: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5 },
  cardDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, fontWeight: '600' },
  xpBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  xpText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  footerBanner: { marginTop: 30, padding: 25, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1 },
  footerText: { fontSize: 14, fontWeight: '800' }
});
