import React, { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export const VOCAB_FACTS = [
  "Did you know? The English language has over 170,000 active words.",
  "Tip: Reading subtitles in both languages improves contextual memory.",
  "Fun Fact: 'Pneumonoultramicroscopicsilicovolcanoconiosis' is the longest English word.",
  "Tip: Tap on any word to hear its pronunciation and meaning.",
  "Learning syntax through movies is 40% more effective than flashcards.",
  "Did you know? Shakespeare invented over 1,700 words.",
  "Tip: Add difficult words to your queue and review them later."
];

const LoadingSpinner = ({ activeTheme, text }) => {
  const [fact] = useState(VOCAB_FACTS[Math.floor(Math.random() * VOCAB_FACTS.length)]);
  return (
    <View style={{ padding: 40, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={activeTheme.accent} style={{ marginBottom: 20 }} />
      <Text style={{ color: activeTheme.text, fontWeight: 'bold', marginBottom: 10 }}>{text || "LOADING..."}</Text>
      <Text style={{ color: activeTheme.subText, fontSize: 12, textAlign: 'center' }}>{fact}</Text>
    </View>
  );
};

export default LoadingSpinner;
