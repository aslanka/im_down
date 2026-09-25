import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';
import { Activity, ActivityCategory, AppNotification, EventMessage, FriendGroup, User, Visibility } from '@/src/types';

type NewActivity = Omit<Activity, 'id' | 'hostId' | 'spotsFilled' | 'memberIds' | 'requestedIds' | 'status'>;
type FriendRequest = { id: string; userId: string };

type AppContextValue = {
  session: Session | null;
  authReady: boolean;
  loading: boolean;
  currentUserId: string;
  users: User[];
  activities: Activity[];
  notifications: AppNotification[];
  friendIds: string[];
  friendRequests: FriendRequest[];
  groups: FriendGroup[];
  messages: EventMessage[];
  signUp: (email: string, password: string, displayName: string, username: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  createActivity: (activity: NewActivity) => Promise<void>;
  joinActivity: (activityId: string) => Promise<void>;
  requestActivity: (activityId: string) => Promise<void>;
  acceptRequest: (activityId: string, userId: string) => Promise<void>;
  addFriend: (userId: string) => Promise<void>;
  respondFriendRequest: (requestId: string, accept: boolean) => Promise<void>;
  createGroup: (name: string, memberIds: string[]) => Promise<void>;
  addFriendToGroup: (groupId: string, userId: string) => Promise<void>;
  removeFriendFromGroup: (groupId: string, userId: string) => Promise<void>;
  sendMessage: (activityId: string, body: string) => Promise<void>;
  endActivity: (activityId: string) => Promise<void>;
  isActivityEnded: (activity: Activity) => boolean;
  canAccessChat: (activity: Activity) => boolean;
  getUser: (id: string) => User | undefined;
  relationshipLabel: (userId: string) => string;
  mutualCount: (userId: string) => number;
  canSeeActivity: (activity: Activity) => boolean;
  spotsLeft: (activity: Activity) => number;
  categories: ActivityCategory[];
};

const AppContext = createContext<AppContextValue | null>(null);
const CATEGORIES: ActivityCategory[] = ['Golf', 'Poker', 'Pickleball', 'Basketball', 'Soccer', 'Other'];

function formatWhen(iso: string) {
  const date = new Date(iso);
  return {
    dateLabel: date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }),
    timeLabel: date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
  };
}

function parseStart(dateLabel: string, timeLabel: string) {
  const now = new Date();
  const day = dateLabel.trim().toLowerCase();
  const target = new Date(now);

  if (day === 'tomorrow') target.setDate(target.getDate() + 1);
  else {
    const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const idx = weekdays.findIndex((d) => day.startsWith(d.slice(0, 3)));
    if (idx >= 0) {
      let diff = (idx - now.getDay() + 7) % 7;
      if (diff === 0) diff = 7;
      target.setDate(now.getDate() + diff);
    } else {
      const parsed = new Date(`${dateLabel} ${now.getFullYear()} ${timeLabel}`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  const match = timeLabel.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (match) {
    let hour = Number(match[1]);
    const minute = Number(match[2] ?? 0);
    const meridiem = match[3]?.toUpperCase();
    if (meridiem === 'PM' && hour < 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    target.setHours(hour, minute, 0, 0);
  }
  return target;
}

function relativeTime(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return 'now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [groups, setGroups] = useState<FriendGroup[]>([]);
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [mutuals, setMutuals] = useState<Record<string, number>>({});

  const currentUserId = session?.user.id ?? '';

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    if (!currentUserId) {
      setUsers([]); setActivities([]); setNotifications([]); setFriendIds([]); setFriendRequests([]); setGroups([]); setMessages([]); setMutuals({});
      return;
    }
    setLoading(true);
    try {
      const [profilesRes, interestsRes, friendshipsRes, mutualsRes, groupsRes, groupMembersRes, activitiesRes, membersRes, privateRes, messagesRes, notificationsRes] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('user_interests').select('*'),
        supabase.from('friendships').select('*'),
        supabase.rpc('get_mutuals'),
        supabase.from('friend_groups').select('*').eq('owner_id', currentUserId),
        supabase.from('friend_group_members').select('*'),
        supabase.from('activities').select('*').order('starts_at', { ascending: true }),
        supabase.from('activity_members').select('*'),
        supabase.from('activity_private_details').select('*'),
        supabase.from('activity_messages').select('*').order('created_at', { ascending: true }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      ]);

      const firstError = [profilesRes, interestsRes, friendshipsRes, mutualsRes, groupsRes, groupMembersRes, activitiesRes, membersRes, privateRes, messagesRes, notificationsRes].find((r: any) => r.error)?.error;
      if (firstError) throw firstError;

      const interestsByUser = new Map<string, ActivityCategory[]>();
      (interestsRes.data ?? []).forEach((row: any) => {
        if (!interestsByUser.has(row.user_id)) interestsByUser.set(row.user_id, []);
        interestsByUser.get(row.user_id)!.push(row.interest as ActivityCategory);
      });
      setUsers((profilesRes.data ?? []).map((p: any) => ({
        id: p.id,
        name: p.display_name,
        username: p.username,
        initials: p.initials || p.display_name.slice(0, 2).toUpperCase(),
        interests: interestsByUser.get(p.id) ?? [],
      })));

      const acceptedFriends: string[] = [];
      const incoming: FriendRequest[] = [];
      (friendshipsRes.data ?? []).forEach((f: any) => {
        if (f.status === 'accepted') acceptedFriends.push(f.requester_id === currentUserId ? f.addressee_id : f.requester_id);
        if (f.status === 'pending' && f.addressee_id === currentUserId) incoming.push({ id: f.id, userId: f.requester_id });
      });
      setFriendIds(acceptedFriends);
      setFriendRequests(incoming);

      const mutualMap: Record<string, number> = {};
      (mutualsRes.data ?? []).forEach((m: any) => { mutualMap[m.user_id] = Number(m.mutual_count); });
      setMutuals(mutualMap);

      const groupMembers = groupMembersRes.data ?? [];
      setGroups((groupsRes.data ?? []).map((g: any) => ({
        id: g.id,
        name: g.name,
        ownerId: g.owner_id,
        memberIds: groupMembers.filter((m: any) => m.group_id === g.id).map((m: any) => m.user_id),
        createdAt: new Date(g.created_at).getTime(),
      })));

      const members = membersRes.data ?? [];
      const privates = new Map((privateRes.data ?? []).map((r: any) => [r.activity_id, r.private_location]));
      setActivities((activitiesRes.data ?? []).map((a: any) => {
        const accepted = members.filter((m: any) => m.activity_id === a.id && m.status === 'accepted').map((m: any) => m.user_id);
        const requested = members.filter((m: any) => m.activity_id === a.id && m.status === 'requested').map((m: any) => m.user_id);
        const when = formatWhen(a.starts_at);
        return {
          id: a.id,
          hostId: a.host_id,
          category: a.category as ActivityCategory,
          title: a.title,
          description: a.description ?? undefined,
          ...when,
          publicLocation: a.public_location,
          privateLocation: privates.get(a.id) as string | undefined,
          priceLabel: a.price_label ?? undefined,
          spotsTotal: a.spots_total,
          spotsFilled: accepted.length,
          visibility: a.visibility as Visibility,
          audienceGroupId: a.audience_group_id ?? undefined,
          joinMode: a.join_mode,
          memberIds: accepted,
          requestedIds: requested,
          status: a.status === 'open' ? 'open' : 'ended',
          endsAt: a.ends_at ? new Date(a.ends_at).getTime() : undefined,
          endedAt: a.ended_at ? new Date(a.ended_at).getTime() : undefined,
        } as Activity;
      }));

      setMessages((messagesRes.data ?? []).map((m: any) => ({ id: m.id, activityId: m.activity_id, senderId: m.sender_id, body: m.body, createdAt: new Date(m.created_at).getTime() })));
      setNotifications((notificationsRes.data ?? []).map((n: any) => ({ id: n.id, text: n.text, createdLabel: relativeTime(n.created_at), read: n.read })));
    } catch (error) {
      console.error('Supabase refresh failed', error);
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!currentUserId) return;
    const channel = supabase.channel(`im-down-${currentUserId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_messages' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_members' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, refresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, refresh)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId, refresh]);

  const signUp = async (email: string, password: string, displayName: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: displayName.trim(), username: username.trim().toLowerCase() } } });
    if (error) return error.message;
    return data.session ? null : 'Check your email to confirm your account, then sign in.';
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error?.message ?? null;
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const createActivity = async (input: NewActivity) => {
    const startsAt = parseStart(input.dateLabel, input.timeLabel);
    const endsAt = input.endsAt ? new Date(input.endsAt) : new Date(startsAt.getTime() + 4 * 60 * 60 * 1000);
    const { error } = await supabase.rpc('create_activity', {
      p_category: input.category,
      p_title: input.title,
      p_description: input.description ?? null,
      p_starts_at: startsAt.toISOString(),
      p_ends_at: endsAt.toISOString(),
      p_public_location: input.publicLocation,
      p_private_location: input.privateLocation ?? null,
      p_price_label: input.priceLabel ?? null,
      p_spots_total: input.spotsTotal,
      p_visibility: input.visibility === 'selected' ? 'friends' : input.visibility,
      p_audience_group_id: input.audienceGroupId ?? null,
      p_join_mode: input.joinMode,
    });
    if (error) throw error;
    await refresh();
  };

  const joinOrRequest = async (activityId: string) => {
    const { error } = await supabase.rpc('join_or_request_activity', { p_activity_id: activityId });
    if (error) throw error;
    await refresh();
  };
  const joinActivity = joinOrRequest;
  const requestActivity = joinOrRequest;

  const acceptRequest = async (activityId: string, userId: string) => {
    const { error } = await supabase.rpc('respond_activity_request', { p_activity_id: activityId, p_user_id: userId, p_accept: true });
    if (error) throw error;
    await refresh();
  };

  const addFriend = async (userId: string) => {
    const { error } = await supabase.rpc('request_friend', { p_user_id: userId });
    if (error && !error.message.toLowerCase().includes('duplicate')) throw error;
    await refresh();
  };

  const respondFriendRequest = async (requestId: string, accept: boolean) => {
    const { error } = await supabase.rpc('respond_friend_request', { p_friendship_id: requestId, p_accept: accept });
    if (error) throw error;
    await refresh();
  };

  const createGroup = async (name: string, memberIds: string[]) => {
    const { data, error } = await supabase.from('friend_groups').insert({ owner_id: currentUserId, name: name.trim() }).select().single();
    if (error) throw error;
    if (memberIds.length) {
      const { error: memberError } = await supabase.from('friend_group_members').insert(memberIds.map((userId) => ({ group_id: data.id, user_id: userId })));
      if (memberError) throw memberError;
    }
    await refresh();
  };

  const addFriendToGroup = async (groupId: string, userId: string) => {
    const { error } = await supabase.from('friend_group_members').insert({ group_id: groupId, user_id: userId });
    if (error && !error.message.toLowerCase().includes('duplicate')) throw error;
    await refresh();
  };

  const removeFriendFromGroup = async (groupId: string, userId: string) => {
    const { error } = await supabase.from('friend_group_members').delete().eq('group_id', groupId).eq('user_id', userId);
    if (error) throw error;
    await refresh();
  };

  const sendMessage = async (activityId: string, body: string) => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const { error } = await supabase.from('activity_messages').insert({ activity_id: activityId, sender_id: currentUserId, body: trimmed });
    if (error) throw error;
  };

  const endActivity = async (activityId: string) => {
    const { error } = await supabase.rpc('end_activity', { p_activity_id: activityId });
    if (error) throw error;
    await refresh();
  };

  const isActivityEnded = (activity: Activity) => activity.status === 'ended' || (!!activity.endsAt && Date.now() >= activity.endsAt);
  const canAccessChat = (activity: Activity) => !isActivityEnded(activity) && activity.memberIds.includes(currentUserId);
  const getUser = (id: string) => users.find((u) => u.id === id);
  const mutualCount = (userId: string) => friendIds.includes(userId) ? 0 : (mutuals[userId] ?? 0);
  const relationshipLabel = (userId: string) => userId === currentUserId ? 'You' : friendIds.includes(userId) ? 'Your friend' : mutualCount(userId) ? `${mutualCount(userId)} mutuals` : 'Extended network';
  const canSeeActivity = (_activity: Activity) => true; // Supabase RLS already filters the activity query.

  const value = useMemo<AppContextValue>(() => ({
    session, authReady, loading, currentUserId, users, activities, notifications, friendIds, friendRequests, groups, messages,
    signUp, signIn, signOut, refresh, createActivity, joinActivity, requestActivity, acceptRequest, addFriend, respondFriendRequest,
    createGroup, addFriendToGroup, removeFriendFromGroup, sendMessage, endActivity, isActivityEnded, canAccessChat,
    getUser, relationshipLabel, mutualCount, canSeeActivity,
    spotsLeft: (a: Activity) => Math.max(0, a.spotsTotal - a.spotsFilled),
    categories: CATEGORIES,
  }), [session, authReady, loading, currentUserId, users, activities, notifications, friendIds, friendRequests, groups, messages, mutuals, refresh]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
