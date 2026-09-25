import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CURRENT_USER_ID, friendIds, mutualCounts, starterActivities, starterNotifications, users } from '@/src/data/mock';
import { Activity, ActivityCategory, AppNotification } from '@/src/types';

type NewActivity = Omit<Activity, 'id' | 'hostId' | 'spotsFilled' | 'memberIds' | 'requestedIds'>;

type AppContextValue = {
  currentUserId: string;
  users: typeof users;
  activities: Activity[];
  notifications: AppNotification[];
  createActivity: (activity: NewActivity) => void;
  joinActivity: (activityId: string) => void;
  requestActivity: (activityId: string) => void;
  acceptRequest: (activityId: string, userId: string) => void;
  getUser: (id: string) => (typeof users)[number] | undefined;
  relationshipLabel: (userId: string) => string;
  spotsLeft: (activity: Activity) => number;
  categories: ActivityCategory[];
};

const AppContext = createContext<AppContextValue | null>(null);
const STORAGE_KEY = 'imdown.activities.v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>(starterActivities);
  const [notifications, setNotifications] = useState<AppNotification[]>(starterNotifications);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved) setActivities(JSON.parse(saved));
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(activities)).catch(() => undefined);
  }, [activities]);

  const createActivity = (input: NewActivity) => {
    const activity: Activity = {
      ...input,
      id: `a-${Date.now()}`,
      hostId: CURRENT_USER_ID,
      spotsFilled: 1,
      memberIds: [CURRENT_USER_ID],
      requestedIds: [],
    };
    setActivities((prev) => [activity, ...prev]);
    setNotifications((prev) => [{ id: `n-${Date.now()}`, text: `Your ${activity.category.toLowerCase()} spot is live.`, createdLabel: 'now', read: false }, ...prev]);
  };

  const joinActivity = (activityId: string) => {
    setActivities((prev) => prev.map((a) => {
      if (a.id !== activityId || a.memberIds.includes(CURRENT_USER_ID) || a.spotsFilled >= a.spotsTotal) return a;
      return { ...a, memberIds: [...a.memberIds, CURRENT_USER_ID], spotsFilled: a.spotsFilled + 1 };
    }));
  };

  const acceptRequest = (activityId: string, userId: string) => {
    setActivities((prev) => prev.map((a) => {
      if (a.id !== activityId || !a.requestedIds.includes(userId) || a.spotsFilled >= a.spotsTotal) return a;
      return { ...a, requestedIds: a.requestedIds.filter((id) => id !== userId), memberIds: [...a.memberIds, userId], spotsFilled: a.spotsFilled + 1 };
    }));
  };

  const requestActivity = (activityId: string) => {
    setActivities((prev) => prev.map((a) => {
      if (a.id !== activityId || a.requestedIds.includes(CURRENT_USER_ID)) return a;
      return { ...a, requestedIds: [...a.requestedIds, CURRENT_USER_ID] };
    }));
    setNotifications((prev) => [{ id: `n-${Date.now()}`, text: 'Request sent to the host.', createdLabel: 'now', read: false }, ...prev]);
  };

  const getUser = (id: string) => users.find((u) => u.id === id);
  const relationshipLabel = (userId: string) => {
    if (userId === CURRENT_USER_ID) return 'You';
    if (friendIds.includes(userId)) return 'Your friend';
    const count = mutualCounts[userId];
    return count ? `${count} mutuals` : 'Extended network';
  };

  const value = useMemo(() => ({
    currentUserId: CURRENT_USER_ID,
    users,
    activities,
    notifications,
    createActivity,
    joinActivity,
    requestActivity,
    acceptRequest,
    getUser,
    relationshipLabel,
    spotsLeft: (a: Activity) => Math.max(0, a.spotsTotal - a.spotsFilled),
    categories: ['Golf', 'Poker', 'Pickleball', 'Basketball', 'Soccer', 'Other'] as ActivityCategory[],
  }), [activities, notifications]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
