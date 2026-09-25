import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '@/src/context/AppContext';
import { colors } from '@/src/theme/colors';

export default function EventChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { activities, messages, currentUserId, getUser, sendMessage, canAccessChat, isActivityEnded } = useApp();
  const [body, setBody] = useState('');
  const activity = activities.find((a) => a.id === id);
  const chatMessages = useMemo(() => messages.filter((m) => m.activityId === id).sort((a, b) => a.createdAt - b.createdAt), [messages, id]);

  if (!activity) return <SafeAreaView style={s.safe}><Text style={s.empty}>Activity not found.</Text></SafeAreaView>;
  const ended = isActivityEnded(activity);
  const allowed = canAccessChat(activity);

  const submit = () => {
    if (!body.trim()) return;
    sendMessage(activity.id, body);
    setBody('');
  };

  return <SafeAreaView style={s.safe}>
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.back}><Ionicons name="chevron-back" size={24} color={colors.text} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{activity.title}</Text>
          <Text style={s.sub}>{ended ? 'Event ended · chat closed' : `${activity.memberIds.length} people in this event`}</Text>
        </View>
      </View>

      {!allowed ? <View style={s.closed}>
        <Ionicons name={ended ? 'lock-closed-outline' : 'people-outline'} size={36} color={colors.muted} />
        <Text style={s.closedTitle}>{ended ? 'This chat has dissolved' : 'Chat unlocks after you join'}</Text>
        <Text style={s.closedText}>{ended ? 'The event is over, so the temporary group chat is no longer active.' : 'Only accepted event attendees can view and send messages here.'}</Text>
      </View> : <>
        <ScrollView contentContainerStyle={s.messages}>
          {chatMessages.length === 0 && <Text style={s.empty}>No messages yet. Use this chat for meetup details and coordination.</Text>}
          {chatMessages.map((message) => {
            const mine = message.senderId === currentUserId;
            const sender = getUser(message.senderId);
            return <View key={message.id} style={[s.messageRow, mine && s.messageRowMine]}>
              {!mine && <Text style={s.sender}>{sender?.name ?? 'Member'}</Text>}
              <View style={[s.bubble, mine ? s.bubbleMine : s.bubbleOther]}><Text style={[s.messageText, mine && s.messageTextMine]}>{message.body}</Text></View>
            </View>;
          })}
        </ScrollView>
        <View style={s.composer}>
          <TextInput value={body} onChangeText={setBody} placeholder="Message the group..." style={s.input} multiline />
          <Pressable onPress={submit} style={s.send}><Ionicons name="arrow-up" size={20} color="#fff" /></Pressable>
        </View>
      </>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: '#fff' },
  back: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  title: { fontSize: 17, fontWeight: '900', color: colors.text },
  sub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  messages: { padding: 16, paddingBottom: 24, gap: 10 },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 28, lineHeight: 20 },
  messageRow: { alignSelf: 'flex-start', maxWidth: '82%' },
  messageRowMine: { alignSelf: 'flex-end' },
  sender: { fontSize: 11, color: colors.muted, marginLeft: 8, marginBottom: 4, fontWeight: '700' },
  bubble: { borderRadius: 18, paddingHorizontal: 13, paddingVertical: 10 },
  bubbleMine: { backgroundColor: colors.accent, borderBottomRightRadius: 5 },
  bubbleOther: { backgroundColor: '#fff', borderWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 5 },
  messageText: { color: colors.text, fontSize: 15, lineHeight: 20 },
  messageTextMine: { color: '#fff' },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: '#fff' },
  input: { flex: 1, minHeight: 44, maxHeight: 110, borderRadius: 22, backgroundColor: colors.bg, paddingHorizontal: 15, paddingVertical: 11, fontSize: 15 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  closed: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 34 },
  closedTitle: { fontSize: 22, fontWeight: '900', color: colors.text, marginTop: 14 },
  closedText: { color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 8 },
});
