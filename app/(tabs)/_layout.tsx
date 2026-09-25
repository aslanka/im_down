import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '@/src/theme/colors';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.subtle,
      tabBarLabelStyle: { fontSize: 11, fontWeight: '800', marginTop: 2 },
      tabBarStyle: {
        height: 84,
        paddingTop: 8,
        paddingBottom: 10,
        backgroundColor: colors.tab,
        borderTopColor: colors.line,
        borderTopWidth: 1,
      },
    }}>
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} /> }} />
      <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: ({ color }) => <Ionicons name="add-circle" color={color} size={34} /> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'notifications' : 'notifications-outline'} color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} color={color} size={size} /> }} />
    </Tabs>
  );
}
