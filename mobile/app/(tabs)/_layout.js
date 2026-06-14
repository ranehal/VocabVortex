import { Tabs } from 'expo-router';
import { useApp } from '../_layout';
import { Zap, BookOpen, Clapperboard, LayoutDashboard, Gamepad2, StickyNote } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { Platform, View } from 'react-native';

export default function TabLayout() {
  const { activeTheme } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeTheme.accent,
        tabBarInactiveTintColor: activeTheme.subText,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          height: 64,
          borderRadius: 32,
          backgroundColor: activeTheme.card,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          paddingBottom: 0, // Centering icons
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => <Zap size={24} color={color} />,
          tabBarAccessibilityLabel: 'nav-home-btn'
        }}
      />
      <Tabs.Screen
        name="read"
        options={{
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
          tabBarAccessibilityLabel: 'nav-read-btn'
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          tabBarIcon: ({ color }) => <Clapperboard size={24} color={color} />,
          tabBarAccessibilityLabel: 'nav-movies-btn'
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          tabBarIcon: ({ color }) => <StickyNote size={24} color={color} />,
          tabBarAccessibilityLabel: 'nav-notes-btn'
        }}
      />
      <Tabs.Screen
        name="arena"
        options={{
          tabBarIcon: ({ color }) => <Gamepad2 size={24} color={color} />,
          tabBarAccessibilityLabel: 'nav-arena-btn'
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
          tabBarAccessibilityLabel: 'nav-lab-btn'
        }}
      />
    </Tabs>
  );
}
