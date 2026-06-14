import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Dimensions, RefreshControl, Alert } from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { useApp } from '../_layout';
import { Sparkles, Save, Trash2, Check, Wand2, Type, Highlighter, Languages, Zap, FileText, ChevronLeft, Plus, Cloud, CloudOff, Clock, Hash, AlignLeft, Volume2, VolumeX } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { BASE_URL } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Notes() {
  const { activeTheme, user } = useApp();
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState({ _id: null, title: '', content: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const saveTimeoutRef = useRef(null);

  const userEmail = useMemo(() => user?.email || 'guest@vortex.com', [user]);

  // Load notes on mount
  useEffect(() => {
    fetchNotes();
    return () => Speech.stop(); // Stop speech on unmount
  }, [userEmail]);

  const toggleSpeech = async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      if (!currentNote.content) return;
      setIsSpeaking(true);
      Speech.speak(currentNote.content, {
        language: 'en-US',
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const fetchNotes = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${BASE_URL}/api/notes?email=${userEmail}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotes(data);
        await AsyncStorage.setItem(`vortex_notes_${userEmail}`, JSON.stringify(data));
      }
    } catch (e) {
      console.error("Fetch Notes Failed:", e);
      const local = await AsyncStorage.getItem(`vortex_notes_${userEmail}`);
      if (local) setNotes(JSON.parse(local));
    } finally {
      setIsSyncing(false);
      setRefreshing(false);
    }
  };

  const syncNoteToServer = async (noteData) => {
    try {
      const res = await fetch(`${BASE_URL}/api/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userEmail, 
          title: noteData.title, 
          content: noteData.content, 
          noteId: noteData._id 
        })
      });
      const savedNote = await res.json();
      if (savedNote._id) {
        if (!noteData._id) setCurrentNote(savedNote);
        setNotes(prev => {
           const index = prev.findIndex(n => n._id === savedNote._id);
           if (index > -1) {
             const next = [...prev];
             next[index] = savedNote;
             return next;
           }
           return [savedNote, ...prev];
        });
      }
    } catch (e) {
      console.error("Sync Failed:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const triggerSave = (updatedNote) => {
    setIsSaving(true);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      syncNoteToServer(updatedNote);
    }, 2000);
  };

  const handleTitleChange = (text) => {
    const updated = { ...currentNote, title: text };
    setCurrentNote(updated);
    triggerSave(updated);
  };

  const handleContentChange = (text) => {
    const updated = { ...currentNote, content: text };
    setCurrentNote(updated);
    triggerSave(updated);
  };

  const createNewNote = () => {
    setCurrentNote({ _id: null, title: '', content: '' });
    setView('editor');
  };

  const openNote = (note) => {
    setCurrentNote(note);
    setView('editor');
  };

  const deleteNote = async (id) => {
    if (!id) { setView('list'); return; }
    Alert.alert("Delete Note", "Are you sure you want to delete this note forever?", [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
            try {
                await fetch(`${BASE_URL}/api/notes/${id}?email=${userEmail}`, { method: 'DELETE' });
                setNotes(prev => prev.filter(n => n._id !== id));
                setView('list');
            } catch (e) { console.error("Delete Failed:", e); }
        }}
    ]);
  };

  const handleAiAction = async (action) => {
    if (!currentNote.content.trim()) return;
    setIsProcessing(true);
    setShowAiMenu(false);
    try {
      const response = await fetch(`${BASE_URL}/api/ai/process-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: currentNote.content, action })
      });
      const data = await response.json();
      if (data.processedNote) { handleContentChange(data.processedNote); }
    } catch (error) { console.error("AI Action Failed:", error);
    } finally { setIsProcessing(false); }
  };

  const stats = useMemo(() => {
    const text = currentNote.content || '';
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readingTime = Math.ceil(words / 200);
    return { chars, words, readingTime };
  }, [currentNote.content]);

  const aiOptions = [
    { id: 'fix', label: 'Fix Grammar', icon: <Wand2 size={18} color="#fff" />, color: '#8b5cf6' },
    { id: 'summarize', label: 'Summarize', icon: <Type size={18} color="#fff" />, color: '#3b82f6' },
    { id: 'highlight', label: 'Key Vocab', icon: <Highlighter size={18} color="#fff" />, color: '#f59e0b' },
    { id: 'expand', label: 'Expand Content', icon: <AlignLeft size={18} color="#fff" />, color: '#d946ef' },
    { id: 'simplify', label: 'Simplify', icon: <Zap size={18} color="#fff" />, color: '#10b981' },
    { id: 'translate', label: 'To Bengali', icon: <Languages size={18} color="#fff" />, color: '#ef4444' },
    { id: 'read', label: isSpeaking ? 'Stop Reading' : 'Read Aloud', icon: isSpeaking ? <VolumeX size={18} color="#fff" /> : <Volume2 size={18} color="#fff" />, color: '#6366f1' },
  ];

  const handleAiActionInternal = (id) => {
    if (id === 'read') { setShowAiMenu(false); toggleSpeech(); }
    else { handleAiAction(id); }
  };

  if (view === 'list') {
    return (
      <View style={{ flex: 1, backgroundColor: activeTheme.bg }} nativeID="notes-pane">
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: activeTheme.text }]}>My <Text style={{ color: activeTheme.accent }}>Notes</Text></Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {isSyncing && <ActivityIndicator size="small" color={activeTheme.accent} />}
            <TouchableOpacity onPress={createNewNote} style={[styles.addBtn, { backgroundColor: activeTheme.accent }]}>
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.listContent} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNotes(); }} tintColor={activeTheme.accent} />}>
          {notes.length === 0 && !isSyncing ? (
            <View style={styles.emptyContainer}>
                <FileText size={64} color={activeTheme.subText} style={{ opacity: 0.2, marginBottom: 20 }} />
                <Text style={{ color: activeTheme.subText, textAlign: 'center' }}>No notes yet. Start writing your brilliant ideas!</Text>
            </View>
          ) : notes.map((n, i) => (
            <MotiView key={n._id || i} from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: i * 50 }}>
              <TouchableOpacity onPress={() => openNote(n)} style={[styles.noteCard, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}>
                <Text style={[styles.noteCardTitle, { color: activeTheme.text }]} numberOfLines={1}>{n.title || 'Untitled Document'}</Text>
                <Text style={[styles.noteCardPreview, { color: activeTheme.subText }]} numberOfLines={2}>{n.content || 'No content yet...'}</Text>
                <View style={styles.noteCardFooter}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Clock size={10} color={activeTheme.subText} /><Text style={[styles.noteDate, { color: activeTheme.subText }]}>{new Date(n.updatedAt).toLocaleDateString()}</Text></View>
                   <Text style={[styles.noteDate, { color: activeTheme.subText }]}>{Math.ceil((n.content?.split(' ').length || 0) / 200)} min read</Text>
                </View>
              </TouchableOpacity>
            </MotiView>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: activeTheme.bg }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setView('list')} style={styles.backBtn}><ChevronLeft size={28} color={activeTheme.text} /></TouchableOpacity>
          <TextInput style={[styles.titleInput, { color: activeTheme.text }]} value={currentNote.title} onChangeText={handleTitleChange} placeholder="Untitled Document" placeholderTextColor={activeTheme.subText} />
          <View style={styles.statusContainer}>{isSaving ? <ActivityIndicator size="small" color={activeTheme.accent} /> : <Check size={16} color={activeTheme.subText} />}</View>
        </View>
        <View style={styles.toolbar}>
            <View style={styles.toolItem}><Hash size={12} color={activeTheme.subText} /><Text style={[styles.toolText, { color: activeTheme.subText }]}>{stats.chars} Chars</Text></View>
            <View style={styles.toolItem}><AlignLeft size={12} color={activeTheme.subText} /><Text style={[styles.toolText, { color: activeTheme.subText }]}>{stats.words} Words</Text></View>
            <View style={styles.toolItem}><Clock size={12} color={activeTheme.subText} /><Text style={[styles.toolText, { color: activeTheme.subText }]}>{stats.readingTime}m Read</Text></View>
        </View>
        <View style={[styles.editorContainer, { backgroundColor: activeTheme.card, borderColor: activeTheme.border }]}><TextInput style={[styles.input, { color: activeTheme.text }]} multiline placeholder="Start writing your thoughts..." placeholderTextColor={activeTheme.subText} value={currentNote.content} onChangeText={handleContentChange} textAlignVertical="top" /></View>
        <View style={styles.fabContainer}>
          <AnimatePresence>
            {showAiMenu && (
              <MotiView from={{ opacity: 0, scale: 0.5, translateY: 20 }} animate={{ opacity: 1, scale: 1, translateY: 0 }} exit={{ opacity: 0, scale: 0.5, translateY: 20 }} style={[styles.aiMenu, { backgroundColor: activeTheme.card, borderColor: activeTheme.accent }]}>
                {aiOptions.map((opt) => (
                  <TouchableOpacity key={opt.id} onPress={() => handleAiActionInternal(opt.id)} style={[styles.aiOption, { borderBottomColor: activeTheme.border }]}>
                    <View style={[styles.optIcon, { backgroundColor: opt.color }]}>{opt.icon}</View>
                    <Text style={[styles.optLabel, { color: activeTheme.text }]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </MotiView>
            )}
          </AnimatePresence>
          <TouchableOpacity onPress={() => setShowAiMenu(!showAiMenu)} disabled={isProcessing} style={[styles.fab, { backgroundColor: activeTheme.accent }]}>{isProcessing ? <ActivityIndicator color="#fff" /> : <Sparkles color="#fff" size={28} />}</TouchableOpacity>
        </View>
        <View style={styles.footerActions}>
            <TouchableOpacity onPress={() => deleteNote(currentNote._id)} style={[styles.actionBtn, { borderColor: '#ef444422' }]}><Trash2 size={18} color="#ef4444" /><Text style={[styles.actionBtnText, { color: '#ef4444' }]}>Delete</Text></TouchableOpacity>
            <View style={styles.syncStatus}><Cloud size={14} color={activeTheme.subText} /><Text style={[styles.syncText, { color: activeTheme.subText }]}>Cloud Synced</Text></View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  backBtn: { padding: 5, marginLeft: -10 },
  titleInput: { fontSize: 20, fontWeight: '800', flex: 1, padding: 0 },
  statusContainer: { width: 30, alignItems: 'center' },
  toolbar: { flexDirection: 'row', gap: 15, marginBottom: 15, paddingHorizontal: 5 },
  toolItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  toolText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  editorContainer: { flex: 1, borderRadius: 32, borderWidth: 1, padding: 25, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 },
  input: { flex: 1, fontSize: 16, lineHeight: 26, fontWeight: '500' },
  fabContainer: { position: 'absolute', bottom: 110, right: 24, alignItems: 'flex-end', zIndex: 9999, elevation: 20 },
  fab: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  aiMenu: { marginBottom: 16, borderRadius: 24, borderWidth: 2, overflow: 'hidden', width: 200, elevation: 20, zIndex: 10000 },
  aiOption: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, gap: 12 },
  optIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  optLabel: { fontWeight: '700', fontSize: 13 },
  footerActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 100 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontWeight: 'bold' },
  syncStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncText: { fontSize: 11, fontWeight: '600', opacity: 0.6 },
  listHeader: { padding: 24, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listTitle: { fontSize: 32, fontWeight: '900' },
  addBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  listContent: { padding: 24, paddingBottom: 150 },
  noteCard: { borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1 },
  noteCardTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
  noteCardPreview: { fontSize: 14, lineHeight: 20, opacity: 0.7, marginBottom: 15 },
  noteCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noteDate: { fontSize: 10, fontWeight: '600' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 }
});
