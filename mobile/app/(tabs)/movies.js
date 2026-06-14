import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { useApp } from '../_layout';
import { Film, Play, Sparkles, ChevronRight, X, Wand2 } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Movies() {
  const { activeTheme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  const movieSuggestions = [
    { id: '1', title: 'The Matrix', year: '1999', genre: 'Sci-Fi' },
    { id: '2', title: 'Inception', year: '2010', genre: 'Action' },
    { id: '3', title: 'Pulp Fiction', year: '1994', genre: 'Crime' },
    { id: '4', title: 'The Dark Knight', year: '2008', genre: 'Action' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]} nativeID="movies-pane">
      <View style={styles.header}>
        <Text style={[styles.title, { color: activeTheme.text }]}>Cinematic <Text style={{ color: activeTheme.accent }}>Vortex</Text></Text>
      </View>

      <View style={styles.searchWrapper}>
        <TextInput 
          style={[styles.searchInput, { backgroundColor: activeTheme.card, color: activeTheme.text, borderColor: activeTheme.border, borderWidth: 1 }]}
          placeholder="Search movie dialogues..."
          placeholderTextColor={activeTheme.subText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          nativeID="movie-search-input"
        />
        <TouchableOpacity style={[styles.searchBtn, { backgroundColor: activeTheme.accent }]}>
          <Sparkles size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: activeTheme.subText }]}>RECENTLY ANALYZED</Text>
        {movieSuggestions.map((m, i) => (
          <MotiView key={m.id} from={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 100 }}>
            <TouchableOpacity style={[styles.movieCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, borderWidth: 1 }]} nativeID={`movie-card-${i}`}>
               <View style={styles.movieIcon}><Film size={24} color={activeTheme.accent} /></View>
               <View style={{ flex: 1 }}>
                 <Text style={[styles.movieTitle, { color: activeTheme.text }]}>{m.title}</Text>
                 <Text style={[styles.movieMeta, { color: activeTheme.subText }]}>{m.genre} • {m.year}</Text>
               </View>
               <ChevronRight size={20} color={activeTheme.subText} />
            </TouchableOpacity>
          </MotiView>
        ))}

        <TouchableOpacity style={[styles.importBtn, { borderColor: activeTheme.accent, borderWidth: 1 }]} nativeID="import-srt-btn">
          <Text style={[styles.importBtnText, { color: activeTheme.accent }]}>IMPORT SRT SUBTITLES</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { marginBottom: 30 },
  title: { fontSize: 32, fontWeight: '900', textTransform: 'uppercase' },
  searchWrapper: { flexDirection: 'row', gap: 10, marginBottom: 30 },
  searchInput: { flex: 1, height: 60, borderRadius: 20, paddingHorizontal: 20, fontWeight: '700' },
  searchBtn: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 150 },
  sectionLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 20, opacity: 0.6 },
  movieCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 25, marginBottom: 15, gap: 15 },
  movieIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  movieTitle: { fontSize: 18, fontWeight: '800' },
  movieMeta: { fontSize: 12, fontWeight: '600' },
  importBtn: { marginTop: 20, padding: 20, borderRadius: 20, alignItems: 'center' },
  importBtnText: { fontWeight: '900', letterSpacing: 1, fontSize: 12 }
});
