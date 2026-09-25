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
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={() => router.push(`/activity/${activity.id}`)}>
      <View style={styles.topRow}>
        <View style={styles.category}>
          <View style={styles.categoryIcon}><Ionicons name={iconMap[activity.category]} size={17} color={colors.accent} /></View>
          <Text style={styles.categoryText}>{activity.category.toUpperCase()}</Text>
        </View>
        <View style={styles.spotPill}><Text style={styles.spotText}>{left === 0 ? 'FULL' : `NEED ${left}`}</Text></View>
      </View>
      <Text style={styles.title}>{activity.title}</Text>
      <View style={styles.metaRow}><Ionicons name="calendar-outline" size={15} color={colors.subtle}/><Text style={styles.meta}>{activity.dateLabel} · {activity.timeLabel}</Text></View>
      <View style={styles.metaRow}><Ionicons name="location-outline" size={15} color={colors.subtle}/><Text style={styles.meta}>{activity.publicLocation}{activity.priceLabel ? ` · ${activity.priceLabel}` : ''}</Text></View>
      <View style={styles.divider} />
      <View style={styles.hostRow}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{host?.initials ?? '?'}</Text></View>
        <View><Text style={styles.host}>{host?.name ?? 'Unknown'}</Text><Text style={styles.relationship}>{relationshipLabel(activity.hostId)}</Text></View>
        <View style={styles.chevron}><Ionicons name="chevron-forward" size={17} color={colors.muted} /></View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.line, shadowColor: '#000', shadowOpacity: 0.24, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  cardPressed: { transform: [{ scale: 0.992 }], opacity: 0.94 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  categoryIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  categoryText: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, color: colors.accent },
  spotPill: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  spotText: { color: colors.text, fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
  title: { fontSize: 21, lineHeight: 27, fontWeight: '900', color: colors.text, marginTop: 16, marginBottom: 11 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  meta: { color: colors.muted, fontSize: 14, flexShrink: 1 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 15 },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: '#234C8F', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.accent, fontWeight: '900' },
  host: { fontWeight: '800', color: colors.text },
  relationship: { color: colors.muted, marginTop: 2, fontSize: 12 },
  chevron: { marginLeft: 'auto', width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
});
