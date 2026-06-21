import { Tabs } from 'expo-router';
import { useApp } from '../_layout';
import { Zap, BookOpen, Clapperboard, LayoutDashboard, Gamepad2, Layers, FileText } from 'lucide-react-native';
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
          bottom: 12,
          left: 8,
          right: 8,
          height: 56,
          borderRadius: 28,
          backgroundColor: activeTheme.card,
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          paddingBottom: 0,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => <Zap size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="read"
        options={{
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          tabBarIcon: ({ color }) => <Clapperboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="clause"
        options={{
          tabBarIcon: ({ color }) => <Layers size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          tabBarIcon: ({ color }) => <FileText size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="arena"
        options={{
          tabBarIcon: ({ color }) => <Gamepad2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
