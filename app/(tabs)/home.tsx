import { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.kicker}>I'M DOWN</Text>
            <Text style={styles.heading}>Find your crew.</Text>
          </View>
          <View style={styles.logo}><Ionicons name="flash" size={20} color={colors.accent}/></View>
        </View>
        <Text style={styles.sub}>Open spots from friends and people one connection away.</Text>

        <View style={styles.filters}>{(['All','Friends','Mutuals'] as const).map(f => <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filter, filter === f && styles.filterActive]}><Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text></Pressable>)}</View>

        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Open spots</Text><Text style={styles.count}>{visible.length}</Text></View>
        {visible.length ? visible.map(a => <ActivityCard key={a.id} activity={a} />) : <View style={styles.empty}><Ionicons name="sparkles-outline" size={25} color={colors.accent}/><Text style={styles.emptyTitle}>Nothing open right now</Text><Text style={styles.emptyText}>When someone in your network needs another person, it’ll show up here.</Text></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 120 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  kicker: { fontWeight: '900', color: colors.accent, letterSpacing: 2.2, fontSize: 11 },
  heading: { fontSize: 34, lineHeight: 40, fontWeight: '900', color: colors.text, marginTop: 6, letterSpacing: -0.8 },
  logo: { width: 44, height: 44, borderRadius: 16, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: '#244B89', alignItems: 'center', justifyContent: 'center' },
  sub: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 22, maxWidth: '90%' },
  filters: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface, padding: 5, borderRadius: 16, borderWidth: 1, borderColor: colors.line, marginBottom: 24 },
  filter: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  filterActive: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: '#244B89' },
  filterText: { color: colors.muted, fontWeight: '800', fontSize: 13 },
  filterTextActive: { color: '#DCE9FF' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: colors.text },
  count: { color: colors.accent, backgroundColor: colors.accentSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, fontWeight: '900', fontSize: 11 },
  empty: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 24, alignItems: 'center', padding: 28, marginTop: 2 },
  emptyTitle: { color: colors.text, fontWeight: '900', fontSize: 17, marginTop: 12 },
  emptyText: { color: colors.muted, textAlign: 'center', lineHeight: 20, marginTop: 6 },
});
