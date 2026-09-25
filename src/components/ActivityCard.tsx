import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { Activity } from '@/src/types';
import { colors } from '@/src/theme/colors';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  Golf: 'golf-outline', Poker: 'diamond-outline', Pickleball: 'tennisball-outline',
  Basketball: 'basketball-outline', Soccer: 'football-outline', Other: 'people-outline'
};

export function ActivityCard({ activity }: { activity: Activity }) {
  const { getUser, relationshipLabel, spotsLeft } = useApp();
  const host = getUser(activity.hostId);
  const left = spotsLeft(activity);
  return (
    <Pressable style={styles.card} onPress={() => router.push(`/activity/${activity.id}`)}>
      <View style={styles.topRow}>
        <View style={styles.category}><Ionicons name={iconMap[activity.category]} size={18} color={colors.accent} /><Text style={styles.categoryText}>{activity.category.toUpperCase()}</Text></View>
        <View style={styles.spotPill}><Text style={styles.spotText}>{left === 0 ? 'Full' : `Need ${left}`}</Text></View>
      </View>
      <Text style={styles.title}>{activity.title}</Text>
      <Text style={styles.meta}>{activity.dateLabel} · {activity.timeLabel}</Text>
      <Text style={styles.meta}>{activity.publicLocation}{activity.priceLabel ? ` · ${activity.priceLabel}` : ''}</Text>
      <View style={styles.divider} />
      <View style={styles.hostRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{host?.initials ?? '?'}</Text></View>
        <View><Text style={styles.host}>{host?.name ?? 'Unknown'}</Text><Text style={styles.relationship}>{relationshipLabel(activity.hostId)}</Text></View>
        <Ionicons name="chevron-forward" size={20} color={colors.muted} style={{ marginLeft: 'auto' }} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.line },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  categoryText: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: colors.accent },
  spotPill: { backgroundColor: colors.accentSoft, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  spotText: { color: colors.accent, fontWeight: '800', fontSize: 12 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 14, marginBottom: 8 },
  meta: { color: colors.muted, fontSize: 15, marginBottom: 4 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 14 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '800' },
  host: { fontWeight: '700', color: colors.text },
  relationship: { color: colors.muted, marginTop: 1, fontSize: 13 },
});
