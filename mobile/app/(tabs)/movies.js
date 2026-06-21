import { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, FlatList, Platform, ActivityIndicator, Dimensions } from 'react-native';
import { MotiView } from 'moti';
import { useApp } from '../_layout';
import { Search, Upload, Clock, X, ChevronRight, Play, FileVideo } from 'lucide-react-native';
import WheelPicker from '../../components/WheelPicker';
import LoadingSpinner from '../../components/LoadingSpinner';
import * as DocumentPicker from 'expo-document-picker';
import { BASE_URL } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEMO_MOVIES = [
  {
    _id: 'demo_forrest_gump',
    title: 'Forrest Gump',
    year: '1994',
    posterEmoji: '🏃',
    dialogues: [
      { timestamp: '00:02:15', speaker: 'FORREST', en: "My mama always said life was like a box of chocolates. You never know what you're gonna get.", bn: null },
      { timestamp: '00:05:30', speaker: 'FORREST', en: "Stupid is as stupid does.", bn: null },
      { timestamp: '00:08:45', speaker: 'JENNY',   en: "Run, Forrest! Run!", bn: null },
      { timestamp: '00:12:00', speaker: 'FORREST', en: "I may not be a smart man, but I know what love is.", bn: null },
      { timestamp: '00:15:20', speaker: 'MRS GUMP', en: "You have to do the best with what God gave you.", bn: null },
      { timestamp: '00:20:30', speaker: 'FORREST', en: "I don't know if we each have a destiny, or if we're all just floating around accidental-like on a breeze.", bn: null },
      { timestamp: '00:25:15', speaker: 'FORREST', en: "Jenny and me was like peas and carrots.", bn: null },
      { timestamp: '00:30:00', speaker: 'FORREST', en: "Now you wouldn't believe me if I told you, but I could run like the wind blows.", bn: null },
      { timestamp: '00:35:45', speaker: 'MRS GUMP', en: "Mama always said dyin' was a part of life. I sure wish it wasn't.", bn: null },
      { timestamp: '00:40:00', speaker: 'FORREST', en: "I am not a smart man, but I know what love is.", bn: null },
      { timestamp: '00:45:20', speaker: 'FORREST', en: "That day, for no particular reason, I decided to go for a little run.", bn: null },
      { timestamp: '00:50:00', speaker: 'DRILL SGT', en: "Gump! What's your sole purpose in this army?", bn: null },
      { timestamp: '00:54:30', speaker: 'FORREST', en: "To do whatever you tell me, drill sergeant!", bn: null },
      { timestamp: '01:00:00', speaker: 'BUBBA',   en: "Shrimp is the fruit of the sea. You can barbecue it, boil it, broil it, bake it, sauté it.", bn: null },
      { timestamp: '01:05:15', speaker: 'FORREST', en: "Mama always had a way of explaining things so I could understand them.", bn: null },
    ],
  },
  {
    _id: 'demo_lion_king',
    title: 'The Lion King',
    year: '1994',
    posterEmoji: '🦁',
    dialogues: [
      { timestamp: '00:03:10', speaker: 'MUFASA',  en: "Everything the light touches is our kingdom.", bn: null },
      { timestamp: '00:07:25', speaker: 'MUFASA',  en: "A king's time as ruler rises and falls like the sun. One day, Simba, the sun will set on my time here and will rise with you as the new king.", bn: null },
      { timestamp: '00:12:40', speaker: 'TIMON',   en: "Hakuna Matata! What a wonderful phrase. It means no worries for the rest of your days.", bn: null },
      { timestamp: '00:18:00', speaker: 'RAFIKI',  en: "Oh yes, the past can hurt. But the way I see it, you can either run from it or learn from it.", bn: null },
      { timestamp: '00:23:15', speaker: 'MUFASA',  en: "Remember who you are. You are my son and the one true king.", bn: null },
      { timestamp: '00:28:30', speaker: 'MUFASA',  en: "Being brave doesn't mean you go looking for trouble.", bn: null },
      { timestamp: '00:33:45', speaker: 'MUFASA',  en: "Look inside yourself, Simba. You are more than what you have become.", bn: null },
      { timestamp: '00:38:00', speaker: 'SIMBA',   en: "I laugh in the face of danger! Ha ha ha ha!", bn: null },
      { timestamp: '00:43:20', speaker: 'RAFIKI',  en: "The question is: who are you?", bn: null },
      { timestamp: '00:48:35', speaker: 'MUFASA',  en: "Everything you see exists together in a delicate balance. As king, you need to understand that balance.", bn: null },
      { timestamp: '00:53:50', speaker: 'MUFASA',  en: "While others search for what they can take, a true king searches for what he can give.", bn: null },
      { timestamp: '00:58:10', speaker: 'SIMBA',   en: "I know what I have to do. But going back means I'll have to face my past.", bn: null },
      { timestamp: '01:03:25', speaker: 'RAFIKI',  en: "It doesn't matter; it's in the past!", bn: null },
      { timestamp: '01:08:40', speaker: 'SIMBA',   en: "I am Simba, son of Mufasa!", bn: null },
    ],
  },
  {
    _id: 'demo_happyness',
    title: 'The Pursuit of Happyness',
    year: '2006',
    posterEmoji: '💼',
    dialogues: [
      { timestamp: '00:05:00', speaker: 'CHRIS',    en: "Don't ever let somebody tell you you can't do something. Not even me.", bn: null },
      { timestamp: '00:10:15', speaker: 'CHRIS',    en: "You got a dream, you gotta protect it.", bn: null },
      { timestamp: '00:15:30', speaker: 'CHRIS',    en: "You want something, go get it. Period.", bn: null },
      { timestamp: '00:20:45', speaker: 'CHRIS SR', en: "This part of my life — this little part — is called happiness.", bn: null },
      { timestamp: '00:25:00', speaker: 'CHRIS',    en: "I'm the type of person that if you ask me a question, I'm gonna tell you the truth.", bn: null },
      { timestamp: '00:30:15', speaker: 'CHRIS SR', en: "It was right then that I started thinking about Thomas Jefferson and the pursuit of happiness.", bn: null },
      { timestamp: '00:35:30', speaker: 'CHRIS',    en: "And that maybe happiness is something that we can only pursue, and maybe we can actually never have it.", bn: null },
      { timestamp: '00:40:45', speaker: 'CHRIS',    en: "Hey. Don't ever let somebody tell you you can't do something.", bn: null },
      { timestamp: '00:45:00', speaker: 'CHRIS SR', en: "I met my father for the first time when I was 28 years old. I made up my mind that when I had children, my children were going to know who their father was.", bn: null },
      { timestamp: '00:50:15', speaker: 'INTERVIEWER', en: "What would you say if a man walked in here with no shirt, and I hired him? What would you say?", bn: null },
      { timestamp: '00:54:30', speaker: 'CHRIS',    en: "He must have had on some really nice pants.", bn: null },
      { timestamp: '00:59:45', speaker: 'CHRIS SR', en: "We're just having a rough patch. Things are gonna get better. I promise.", bn: null },
      { timestamp: '01:05:00', speaker: 'CHRIS',    en: "I just want to say, as a person: this is the greatest moment of my life.", bn: null },
    ],
  },
];

function parseSRT(srt) {
  const lines = srt.replace(/\r/g, '').split('\n');
  const dialogues = [];
  let current = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    if (/^\d+$/.test(line)) {
      if (current.en) dialogues.push(current);
      current = {};
    } else if (line.includes('-->')) {
      const parts = line.split(' --> ');
      current.timestamp = parts[0].split(',')[0];
      // Store full timestamps for precision
      current.startTime = timeToSecondsPrecision(parts[0].replace(',', '.'));
      current.endTime = timeToSecondsPrecision(parts[1].replace(',', '.'));
    } else {
      current.en = current.en ? `${current.en} ${line}` : line;
    }
  }
  if (current.en) dialogues.push(current);
  return dialogues;
}

function timeToSecondsPrecision(ts) {
  if (!ts) return 0;
  const parts = ts.split(':');
  const h = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  const s = parseFloat(parts[2]);
  return (h * 3600) + (m * 60) + s;
}

export default function Movies() {
  const { activeTheme, handleTapWord } = useApp();
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

  // Local Movie State
  const [localVideoUri, setLocalVideoUri] = useState(null);
  const [localSubtitles, setLocalSubtitles] = useState([]);
  const [showSubPicker, setShowSubPicker] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const videoRef = useRef(null);

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

  const currentDialogue = useMemo(() => {
    if (!localVideoUri || dialogues.length === 0) return null;
    return dialogues.find(d => playbackPosition >= (d.startTime || 0) && playbackPosition <= (d.endTime || 0));
  }, [dialogues, playbackPosition, localVideoUri]);

  useEffect(() => {
    if (currentDialogue && flatListRef.current) {
        const index = dialogues.indexOf(currentDialogue);
        if (index !== -1) {
            flatListRef.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }
    }
  }, [currentDialogue]);

  const timeToSeconds = (ts) => {
    if (!ts) return 0;
    const pts = ts.split(':');
    return (parseInt(pts[0]) * 3600) + (parseInt(pts[1]) * 60) + parseInt(pts[2] || 0);
  };

  useEffect(() => { fetchMovies(''); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) fetchMovieSuggestions(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchMovies = async (q = '') => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/movies${q ? `?q=${q}` : ''}`);
      const data = await res.json();
      const dbMovies = Array.isArray(data) ? data : [];
      // Always prepend demo movies; filter out if DB already has same title
      const demoTitles = new Set(dbMovies.map(m => m.title.toLowerCase()));
      const filtered = DEMO_MOVIES.filter(m => !demoTitles.has(m.title.toLowerCase()));
      setMovies([...filtered, ...dbMovies]);
    } catch (e) {
      setMovies(DEMO_MOVIES);
    } finally { setLoading(false); }
  };

  const fetchMovieSuggestions = async (query = '') => {
    try {
      const q = query.toLowerCase();
      const demoMatches = DEMO_MOVIES.filter(m => m.title.toLowerCase().includes(q));
      let dbMovies = [];
      let external = [];
      try {
        const res = await fetch(`${BASE_URL}/api/movies${query ? `?q=${query}` : ''}`);
        dbMovies = await res.json();
        if (!Array.isArray(dbMovies)) dbMovies = [];
      } catch (_) {}
      try {
        if (query.length >= 3) {
          const extRes = await fetch(`${BASE_URL}/api/movies/external-search?q=${encodeURIComponent(query)}`);
          const extData = await extRes.json();
          external = (extData || []).map(m => ({ ...m, isExternal: true, posterEmoji: '🌐' }));
        }
      } catch (_) {}
      const demoTitles = new Set([...dbMovies.map(m => m.title.toLowerCase())]);
      const filteredDemo = demoMatches.filter(m => !demoTitles.has(m.title.toLowerCase()));
      setMovieSuggestions([...filteredDemo, ...dbMovies, ...external]);
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
    // Demo movies have full dialogues already — no server call needed
    if (movie._id?.startsWith('demo_')) {
      setSelectedMovie(movie);
      setDialogues(movie.dialogues || []);
      setFilterSpeaker('All');
      return;
    }
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
    let index = filteredDialogues.findIndex(d => timeToSeconds(d.timestamp) >= targetSec);
    if (index === -1) index = filteredDialogues.length - 1; // clamp to last subtitle
    if (index >= 0) {
      flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
      setHighlightedIndex(index);
      setTimeout(() => setHighlightedIndex(null), 3000);
      const target = filteredDialogues[index];
      const realIndex = dialogues.indexOf(target);
      if (realIndex !== -1 && !target.bn) translateLine(realIndex, target.en);
    }
  };

  const renderDialogueText = (text) => {
    return (
      <Text style={{ color: activeTheme.text, fontSize: 16, lineHeight: 24 }}>
        {text.split(' ').map((word, i) => (
          <Text key={i} onPress={() => handleTapWord(word)}>
            {word}{' '}
          </Text>
        ))}
      </Text>
    );
  };

  const handleSelectLocalMovie = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
      if (result.canceled) return;

      const file = result.assets[0];
      setLocalVideoUri(file.uri);
      setLoading(true);
      
      // Search for subtitles based on filename
      const res = await fetch(`${BASE_URL}/api/subtitles-search?q=${encodeURIComponent(file.name)}`);
      if (!res.ok) throw new Error("Search failed");
      const subs = await res.json();
      setLocalSubtitles(subs);
      setShowSubPicker(true);
      setLoading(false);
    } catch (e) {
      alert("Failed to pick movie");
      setLoading(false);
    }
  };

  const selectSubtitle = async (sub) => {
    setLoading(true);
    try {
        // If it's a mock, we don't have a real URL, but for demo we can mock the content
        let srtContent = "";
        if (sub.isMock) {
            srtContent = `1\n00:00:01,000 --> 00:00:05,000\nHello, welcome to VocabVortex!\n\n2\n00:00:06,000 --> 00:00:10,000\nEnjoy your movie with live subtitles.`;
        } else {
            const res = await fetch(sub.url);
            srtContent = await res.text();
        }

        const parsed = parseSRT(srtContent);
        setDialogues(parsed);
        setSelectedMovie({ title: sub.filename, isLocal: true });
        setShowSubPicker(false);
    } catch (e) {
        alert("Failed to load subtitle");
    } finally {
        setLoading(false);
    }
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis / 1000);
    }
  };

  const renderItem = ({ item: d, index: i }) => {
    const realIndex = dialogues.indexOf(d);
    const isHighlighted = (highlightedIndex === i) || (currentDialogue === d);
    return (
      <TouchableOpacity 
        activeOpacity={0.8} 
        onPress={() => {
            if (localVideoUri && videoRef.current) {
                videoRef.current.setPositionAsync((d.startTime || 0) * 1000);
            } else if (!d.bn) {
                translateLine(realIndex, d.en);
            }
        }} 
        style={[styles.itemCard, { backgroundColor: isHighlighted ? activeTheme.accent : activeTheme.card, borderColor: activeTheme.border }]}
      >
        <View style={styles.itemHeader}>
          <Text style={{ color: isHighlighted ? '#fff' : activeTheme.accent, fontWeight: 'bold', fontSize: 11 }}>{d.speaker?.toUpperCase() || ''}</Text>
          <Text style={{ color: isHighlighted ? '#fff' : activeTheme.subText, fontSize: 10 }}>{d.timestamp}</Text>
        </View>
        <View>
          {renderDialogueText(d.en)}
        </View>
        {d.bn && <Text style={{ color: isHighlighted ? '#fff' : activeTheme.accent, marginTop: 8, fontSize: 14, fontWeight: '600', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 10 }}>{d.bn}</Text>}
        {translatingLine === realIndex && <ActivityIndicator size="small" color={isHighlighted ? '#fff' : activeTheme.accent} style={styles.loaderIcon} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: activeTheme.bg }]}>
      <View style={styles.header}>
        <Text style={{ color: activeTheme.text, fontSize: 24, fontWeight: '900' }}>MOVIE <Text style={{ color: activeTheme.accent }}>DIALOGUES</Text></Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
            {!selectedMovie && <TouchableOpacity onPress={handleSelectLocalMovie} style={[styles.iconButton, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}><FileVideo size={20} color={activeTheme.accent} /></TouchableOpacity>}
            {!selectedMovie && <TouchableOpacity onPress={() => setShowImport(true)} style={[styles.iconButton, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}><Upload size={20} color={activeTheme.accent} /></TouchableOpacity>}
        </View>
      </View>

      {!selectedMovie ? (
        <View style={{ flex: 1 }}>
          <View style={[styles.searchContainer, { borderBottomColor: activeTheme.border }]}>
            <TextInput style={{ flex: 1, color: activeTheme.text, height: 60, fontSize: 16, paddingHorizontal: 20 }} placeholder="Search Movies..." placeholderTextColor={activeTheme.subText} value={searchQuery} onChangeText={setSearchQuery} />
            <Search size={24} color={activeTheme.accent} style={{ marginRight: 20 }} />
          </View>
          
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {movieSuggestions.length > 0 && searchQuery.length > 0 && (
              <View style={[styles.suggestions, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                {movieSuggestions.slice(0, 5).map(m => (
                  <TouchableOpacity key={m._id || m.imdbId} onPress={() => selectSuggestion(m)} style={[styles.suggestionItem, { borderBottomColor: activeTheme.border }]}>
                    <Text style={{ fontSize: 24 }}>{m.posterEmoji}</Text>
                    <View><Text style={{ color: activeTheme.text, fontWeight: 'bold' }}>{m.title}</Text><Text style={{ color: activeTheme.subText, fontSize: 12 }}>{m.year}</Text></View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ marginTop: 20 }}>
              {movies.map(m => (
                <TouchableOpacity key={m._id} onPress={() => selectMovie(m)} style={[styles.movieListItem, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                  <Text style={{ fontSize: 30 }}>{m.posterEmoji}</Text>
                  <View style={{ flex: 1 }}><Text style={{ color: activeTheme.text, fontWeight: 'bold', fontSize: 18 }}>{m.title}</Text><Text style={{ color: activeTheme.subText }}>{m.year}</Text></View>
                  <ChevronRight size={20} color={activeTheme.subText} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {showSubPicker && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)', padding: 20, justifyContent: 'center' }]}>
                <View style={[styles.subPicker, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                        <Text style={{ color: activeTheme.text, fontSize: 18, fontWeight: 'bold' }}>Select Subtitle</Text>
                        <TouchableOpacity onPress={() => setShowSubPicker(false)}><X size={24} color={activeTheme.subText} /></TouchableOpacity>
                    </View>
                    <ScrollView>
                        {localSubtitles.map(sub => (
                            <TouchableOpacity key={sub.id} onPress={() => selectSubtitle(sub)} style={[styles.subItem, { borderBottomColor: activeTheme.border }]}>
                                <Text style={{ color: activeTheme.text }}>{sub.filename}</Text>
                                <Text style={{ color: activeTheme.subText, fontSize: 12 }}>{sub.language} - Rating: {sub.rating}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredDialogues}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 24 }}
          onScrollToIndexFailed={info => {
            flatListRef.current?.scrollToOffset({ offset: info.index * 122, animated: true });
          }}
          ListHeaderComponent={() => (
            <View>
              <TouchableOpacity onPress={() => { setSelectedMovie(null); setLocalVideoUri(null); }} style={styles.backBtn}>
                <X size={20} color={activeTheme.subText} />
                <Text style={{ color: activeTheme.subText, fontWeight: 'bold' }}>BACK TO GALLERY</Text>
              </TouchableOpacity>

              {localVideoUri ? (
                <View style={[styles.videoContainer, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' }]}>
                  <Text style={{ color: '#fff', fontSize: 16, opacity: 0.6 }}>🎬 Subtitles loaded below</Text>
                  {currentDialogue && (
                    <View style={styles.subtitleOverlay}>
                      <Text style={styles.subtitleText}>{currentDialogue.en}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={[styles.heroCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                  <Text style={{ color: activeTheme.text, fontSize: 20, fontWeight: 'bold' }} numberOfLines={1}>{selectedMovie.title}</Text>
                  <View style={[styles.jumpBox, { backgroundColor: activeTheme.bg, borderColor: activeTheme.border }]}>
                    <Clock size={16} color={activeTheme.accent} />
                    <View style={styles.wheelContainer}>
                      <WheelPicker range={4} value={jumpH} onChange={setJumpH} activeTheme={activeTheme} />
                      <Text style={{ color: activeTheme.text, fontWeight: 'bold', fontSize: 24 }}>:</Text>
                      <WheelPicker range={60} value={jumpM} onChange={setJumpM} activeTheme={activeTheme} />
                      <Text style={{ color: activeTheme.text, fontWeight: 'bold', fontSize: 24 }}>:</Text>
                      <WheelPicker range={60} value={jumpS} onChange={setJumpS} activeTheme={activeTheme} />
                    </View>
                    <TouchableOpacity onPress={handleJump} style={[styles.jumpBtn, { backgroundColor: activeTheme.accent }]}>
                      <Text style={styles.jumpBtnText}>JUMP</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={[styles.findWordBox, { backgroundColor: activeTheme.card, borderColor: activeTheme.border, marginTop: 15, marginBottom: 15 }]}>
                <Search size={16} color={activeTheme.subText} />
                <TextInput
                  placeholder="Find word in subtitles..."
                  placeholderTextColor={activeTheme.subText}
                  style={{ flex: 1, height: 44, color: activeTheme.text, marginLeft: 10 }}
                  value={subtitleSearch}
                  onChangeText={setSubtitleSearch}
                />
              </View>
            </View>
          )}
        />
      )}
      {loading && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }]}><LoadingSpinner activeTheme={activeTheme} /></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 },
  iconButton: { padding: 12, borderRadius: 16, borderWidth: 1 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 150 },
  suggestions: { borderRadius: 16, padding: 10, marginTop: 10, borderWidth: 1 },
  suggestionItem: { padding: 15, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  movieListItem: { padding: 20, borderRadius: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15, paddingVertical: 10 },
  heroCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 15 },
  jumpBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 15, borderRadius: 16, padding: 12, borderWidth: 1 },
  wheelContainer: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  jumpBtn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  jumpBtnText: { color: '#fff', fontWeight: 'bold' },
  findWordBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1 },
  itemCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 16, justifyContent: 'center', minHeight: 110 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  loaderIcon: { position: 'absolute', right: 15, bottom: 15 },
  subPicker: { padding: 20, borderRadius: 24, borderWidth: 1, maxHeight: '80%' },
  subItem: { paddingVertical: 15, borderBottomWidth: 1 },
  videoContainer: { width: '100%', aspectRatio: 16/9, borderRadius: 20, overflow: 'hidden', backgroundColor: '#000' },
  video: { flex: 1 },
  subtitleOverlay: { position: 'absolute', bottom: 40, left: 10, right: 10, alignItems: 'center' },
  subtitleText: { color: '#fff', backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, fontSize: 16, textAlign: 'center', borderRadius: 5 }
});

