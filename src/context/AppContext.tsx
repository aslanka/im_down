import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CURRENT_USER_ID, friendIds as initialFriendIds, mutualCounts, starterActivities, starterGroups, starterNotifications, users } from '@/src/data/mock';
import { Activity, ActivityCategory, AppNotification, EventMessage, FriendGroup } from '@/src/types';

type NewActivity = Omit<Activity, 'id' | 'hostId' | 'spotsFilled' | 'memberIds' | 'requestedIds' | 'status'>;

type AppContextValue = {
  currentUserId: string;
  users: typeof users;
  activities: Activity[];
  notifications: AppNotification[];
  friendIds: string[];
  groups: FriendGroup[];
  messages: EventMessage[];
  createActivity: (activity: NewActivity) => void;
  joinActivity: (activityId: string) => void;
  requestActivity: (activityId: string) => void;
  acceptRequest: (activityId: string, userId: string) => void;
  addFriend: (userId: string) => void;
  createGroup: (name: string, memberIds: string[]) => void;
  addFriendToGroup: (groupId: string, userId: string) => void;
  removeFriendFromGroup: (groupId: string, userId: string) => void;
  sendMessage: (activityId: string, body: string) => void;
  endActivity: (activityId: string) => void;
  isActivityEnded: (activity: Activity) => boolean;
  canAccessChat: (activity: Activity) => boolean;
  getUser: (id: string) => (typeof users)[number] | undefined;
  relationshipLabel: (userId: string) => string;
  mutualCount: (userId: string) => number;
  canSeeActivity: (activity: Activity) => boolean;
  spotsLeft: (activity: Activity) => number;
  categories: ActivityCategory[];
};

const AppContext = createContext<AppContextValue | null>(null);
const ACTIVITY_STORAGE_KEY = 'imdown.activities.v3';
const FRIENDS_STORAGE_KEY = 'imdown.friends.v1';
const GROUPS_STORAGE_KEY = 'imdown.groups.v1';
const MESSAGES_STORAGE_KEY = 'imdown.messages.v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(starterActivities);
  const [notifications, setNotifications] = useState<AppNotification[]>(starterNotifications);
  const [friendIds, setFriendIds] = useState<string[]>(initialFriendIds);
  const [groups, setGroups] = useState<FriendGroup[]>(starterGroups);
  const [messages, setMessages] = useState<EventMessage[]>([]);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(ACTIVITY_STORAGE_KEY),
      AsyncStorage.getItem(FRIENDS_STORAGE_KEY),
      AsyncStorage.getItem(GROUPS_STORAGE_KEY),
      AsyncStorage.getItem(MESSAGES_STORAGE_KEY),
    ]).then(([savedActivities, savedFriends, savedGroups, savedMessages]) => {
      if (savedActivities) setActivities(JSON.parse(savedActivities));
      if (savedFriends) setFriendIds(JSON.parse(savedFriends));
      if (savedGroups) setGroups(JSON.parse(savedGroups));
      if (savedMessages) setMessages(JSON.parse(savedMessages));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities)).catch(() => undefined);
  }, [activities]);

  useEffect(() => {
    AsyncStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friendIds)).catch(() => undefined);
  }, [friendIds]);

  useEffect(() => {
    AsyncStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups)).catch(() => undefined);
  }, [groups]);

  useEffect(() => {
    AsyncStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages)).catch(() => undefined);
  }, [messages]);

  const isActivityEnded = (activity: Activity) => activity.status === 'ended' || (!!activity.endsAt && Date.now() >= activity.endsAt);

  useEffect(() => {
    const now = Date.now();
    const hasExpired = activities.some((a) => a.status !== 'ended' && !!a.endsAt && now >= a.endsAt);
    if (hasExpired) {
      setActivities((prev) => prev.map((a) => a.status !== 'ended' && a.endsAt && now >= a.endsAt
        ? { ...a, status: 'ended', endedAt: now }
        : a));
    }
  }, [activities]);

  const createActivity = (input: NewActivity) => {
    const activity: Activity = {
      ...input,
      id: `a-${Date.now()}`,
      hostId: CURRENT_USER_ID,
      spotsFilled: 1,
      memberIds: [CURRENT_USER_ID],
      requestedIds: [],
      status: 'open',
    };
    setActivities((prev) => [activity, ...prev]);
    setNotifications((prev) => [{ id: `n-${Date.now()}`, text: `Your ${activity.category.toLowerCase()} spot is live.`, createdLabel: 'now', read: false }, ...prev]);
  };

  const joinActivity = (activityId: string) => {
    setActivities((prev) => prev.map((a) => {
      if (a.id !== activityId || isActivityEnded(a) || a.memberIds.includes(CURRENT_USER_ID) || a.spotsFilled >= a.spotsTotal) return a;
      return { ...a, memberIds: [...a.memberIds, CURRENT_USER_ID], spotsFilled: a.spotsFilled + 1 };
    }));
  };

  const acceptRequest = (activityId: string, userId: string) => {
    setActivities((prev) => prev.map((a) => {
      if (a.id !== activityId || isActivityEnded(a) || !a.requestedIds.includes(userId) || a.spotsFilled >= a.spotsTotal) return a;
      return { ...a, requestedIds: a.requestedIds.filter((id) => id !== userId), memberIds: [...a.memberIds, userId], spotsFilled: a.spotsFilled + 1 };
    }));
  };

  const requestActivity = (activityId: string) => {
    setActivities((prev) => prev.map((a) => {
      if (a.id !== activityId || isActivityEnded(a) || a.requestedIds.includes(CURRENT_USER_ID)) return a;
      return { ...a, requestedIds: [...a.requestedIds, CURRENT_USER_ID] };
    }));
    setNotifications((prev) => [{ id: `n-${Date.now()}`, text: 'Request sent to the host.', createdLabel: 'now', read: false }, ...prev]);
  };

  const addFriend = (userId: string) => {
    if (userId === CURRENT_USER_ID || friendIds.includes(userId)) return;
    const user = users.find((u) => u.id === userId);
    setFriendIds((prev) => [...prev, userId]);
    setNotifications((prev) => [{ id: `n-${Date.now()}`, text: `${user?.name ?? 'Your mutual'} is now your friend.`, createdLabel: 'now', read: false }, ...prev]);
  };

  const createGroup = (name: string, memberIds: string[]) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const validMembers = memberIds.filter((id) => friendIds.includes(id));
    setGroups((prev) => [{ id: `g-${Date.now()}`, name: trimmed, ownerId: CURRENT_USER_ID, memberIds: Array.from(new Set(validMembers)), createdAt: Date.now() }, ...prev]);
  };

  const addFriendToGroup = (groupId: string, userId: string) => {
    if (!friendIds.includes(userId)) return;
    setGroups((prev) => prev.map((group) => group.id === groupId && !group.memberIds.includes(userId)
      ? { ...group, memberIds: [...group.memberIds, userId] }
      : group));
  };

  const removeFriendFromGroup = (groupId: string, userId: string) => {
    setGroups((prev) => prev.map((group) => group.id === groupId
      ? { ...group, memberIds: group.memberIds.filter((id) => id !== userId) }
      : group));
  };

  const canAccessChat = (activity: Activity) => !isActivityEnded(activity) && activity.memberIds.includes(CURRENT_USER_ID);

  const sendMessage = (activityId: string, body: string) => {
    const trimmed = body.trim();
    const activity = activities.find((a) => a.id === activityId);
    if (!trimmed || !activity || !canAccessChat(activity)) return;
    setMessages((prev) => [...prev, {
      id: `m-${Date.now()}`,
      activityId,
      senderId: CURRENT_USER_ID,
      body: trimmed,
      createdAt: Date.now(),
    }]);
  };

  const endActivity = (activityId: string) => {
    const now = Date.now();
    setActivities((prev) => prev.map((a) => a.id === activityId && a.hostId === CURRENT_USER_ID
      ? { ...a, status: 'ended', endedAt: now }
      : a));
    setNotifications((prev) => [{ id: `n-${Date.now()}`, text: 'Event ended. Its temporary chat is now closed.', createdLabel: 'now', read: false }, ...prev]);
  };

  const getUser = (id: string) => users.find((u) => u.id === id);
  const mutualCount = (userId: string) => friendIds.includes(userId) ? 0 : (mutualCounts[userId] ?? 0);
  const relationshipLabel = (userId: string) => {
    if (userId === CURRENT_USER_ID) return 'You';
    if (friendIds.includes(userId)) return 'Your friend';
    const count = mutualCount(userId);
    return count ? `${count} mutuals` : 'Extended network';
  };

  const canSeeActivity = (activity: Activity) => {
    if (activity.hostId === CURRENT_USER_ID) return true;
    if (activity.visibility === 'friends') return friendIds.includes(activity.hostId);
    if (activity.visibility === 'friends_mutuals') return friendIds.includes(activity.hostId) || mutualCount(activity.hostId) > 0;
    if (activity.visibility === 'group') {
      const group = groups.find((g) => g.id === activity.audienceGroupId);
      return !!group && group.memberIds.includes(CURRENT_USER_ID);
    }
    return false;
  };

  const value = useMemo(() => ({
    currentUserId: CURRENT_USER_ID,
    users,
    activities,
    notifications,
    friendIds,
    groups,
    messages,
    createActivity,
    joinActivity,
    requestActivity,
    acceptRequest,
    addFriend,
    createGroup,
    addFriendToGroup,
    removeFriendFromGroup,
    sendMessage,
    endActivity,
    isActivityEnded,
    canAccessChat,
    getUser,
    relationshipLabel,
    mutualCount,
    canSeeActivity,
    spotsLeft: (a: Activity) => Math.max(0, a.spotsTotal - a.spotsFilled),
    categories: ['Golf', 'Poker', 'Pickleball', 'Basketball', 'Soccer', 'Other'] as ActivityCategory[],
  }), [activities, notifications, friendIds, groups, messages]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
