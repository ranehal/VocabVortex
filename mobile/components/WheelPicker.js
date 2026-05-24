import React, { useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Text, Platform } from 'react-native';

const WheelPicker = ({ range, value, onChange, activeTheme }) => {
  const itemHeight = 40;
  const scrollViewRef = useRef(null);

  const handleWheel = (e) => {
    if (Platform.OS !== 'web') return;
    if (e.deltaY > 0) onChange((value + 1) % range);
    else onChange((value - 1 + range) % range);
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: value * itemHeight, animated: true });
    }
  }, [value]);

  return (
    <View 
      style={{ height: itemHeight * 3, overflow: 'hidden', width: 50, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, borderWidth: 1, borderColor: activeTheme.accent }}
      {...(Platform.OS === 'web' ? { onWheel: handleWheel } : {})}
    >
      <View style={{ position: 'absolute', top: itemHeight, height: itemHeight, width: '100%', backgroundColor: activeTheme.accent, opacity: 0.15 }} />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.y / itemHeight);
          if (index >= 0 && index < range && index !== value) onChange(index);
        }}
        contentContainerStyle={{ paddingVertical: itemHeight }}
      >
        {Array.from({ length: range }).map((_, i) => (
          <TouchableOpacity 
             key={i} 
             style={{ height: itemHeight, justifyContent: 'center', alignItems: 'center' }}
             onPress={() => onChange(i)}
          >
            <Text style={{ color: value === i ? activeTheme.accent : activeTheme.subText, fontSize: 22, fontWeight: value === i ? 'bold' : 'normal' }}>
              {i.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default WheelPicker;
