import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { MotiView } from 'moti';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const StarField = () => {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: '#000' }]}>
      {[...Array(80)].map((_, i) => {
        const size = Math.random() * 3 + 1;
        return (
          <MotiView
            key={i}
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
            transition={{ duration: 1500 + Math.random() * 2000, loop: true, type: 'timing', delay: Math.random() * 3000 }}
            style={{
              position: 'absolute',
              top: Math.random() * SCREEN_HEIGHT,
              left: Math.random() * SCREEN_WIDTH,
              width: size,
              height: size,
              backgroundColor: '#fff',
              borderRadius: size / 2,
              shadowColor: '#fff',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.8,
              shadowRadius: size,
              elevation: 5
            }}
          />
        );
      })}
    </View>
  );
};

export default StarField;
