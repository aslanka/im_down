import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { ActivityCard } from '@/src/components/ActivityCard';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function HomeScreen() {
  const { activities, currentUserId, relationshipLabel, canSeeActivity } = useApp();
  const [filter, setFilter] = useState<'All' | 'Friends' | 'Mutuals'>('All');
  const visible = useMemo(() => activities.filter(a => {
    if (a.hostId === currentUserId || !canSeeActivity(a)) return false;
    if (filter === 'All') return true;
    const label = relationshipLabel(a.hostId);
    return filter === 'Friends' ? label === 'Your friend' : label.includes('mutual');
  }), [activities, currentUserId, filter, relationshipLabel, canSeeActivity]);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>I'M DOWN</Text>
        <Text style={styles.heading}>Open spots</Text>
        <Text style={styles.sub}>Fill the last seat with people already in your network.</Text>
        <View style={styles.filters}>{(['All','Friends','Mutuals'] as const).map(f => <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filter, filter === f && styles.filterActive]}><Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text></Pressable>)}</View>
        {visible.map(a => <ActivityCard key={a.id} activity={a} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg }, content: { padding: 20, paddingBottom: 120 },
  kicker: { fontWeight: '900', color: colors.accent, letterSpacing: 2, fontSize: 12, marginTop: 10 },
  heading: { fontSize: 34, fontWeight: '900', color: colors.text, marginTop: 7 },
  sub: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 7, marginBottom: 20 },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 18 }, filter: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, backgroundColor: '#ECEAE4' },
  filterActive: { backgroundColor: colors.text }, filterText: { color: colors.muted, fontWeight: '700' }, filterTextActive: { color: '#fff' },
});
