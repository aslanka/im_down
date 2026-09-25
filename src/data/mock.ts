import { Activity, AppNotification, FriendGroup, User } from '@/src/types';

export const CURRENT_USER_ID = 'u1';

export const users: User[] = [
  { id: 'u1', name: 'Ayush', username: 'ayush', initials: 'AL', interests: ['Golf', 'Poker', 'Soccer'] },
  { id: 'u2', name: 'Jake', username: 'jake', initials: 'JK', interests: ['Golf', 'Poker'] },
  { id: 'u3', name: 'Ryan', username: 'ryan', initials: 'RY', interests: ['Poker', 'Basketball'] },
  { id: 'u4', name: 'Maya', username: 'maya', initials: 'MY', interests: ['Pickleball', 'Golf'] },
  { id: 'u5', name: 'Sam', username: 'sam', initials: 'SM', interests: ['Soccer', 'Basketball'] },
  { id: 'u6', name: 'Tyler', username: 'tyler', initials: 'TY', interests: ['Golf', 'Pickleball'] },
];

export const friendIds = ['u2', 'u3', 'u5'];
export const mutualCounts: Record<string, number> = { u4: 5, u6: 3 };

export const starterGroups: FriendGroup[] = [
  { id: 'g-golf', name: 'Golf Crew', ownerId: CURRENT_USER_ID, memberIds: ['u2', 'u5'], createdAt: 1 },
];

export const starterActivities: Activity[] = [
  {
    id: 'a4', hostId: 'u1', category: 'Soccer', title: 'Need 2 subs for Sunday',
    dateLabel: 'Sun, Oct 4', timeLabel: '5:00 PM', publicLocation: 'Raleigh',
    privateLocation: 'WRAL Soccer Park', priceLabel: 'Free',
    spotsTotal: 9, spotsFilled: 7, visibility: 'friends_mutuals', joinMode: 'approval',
    memberIds: ['u1', 'u2', 'u3'], requestedIds: ['u4'], description: 'Casual 7v7. Looking for two subs.'
  },
  {
    id: 'a1', hostId: 'u2', category: 'Golf', title: 'Need 1 for a Saturday tee time',
    dateLabel: 'Sat, Oct 3', timeLabel: '2:40 PM', publicLocation: 'Cary',
    privateLocation: 'Prestonwood Country Club', priceLabel: '$62/person',
    spotsTotal: 4, spotsFilled: 3, visibility: 'friends_mutuals', joinMode: 'instant',
    memberIds: ['u2', 'u5', 'u6'], requestedIds: [], description: 'Casual round. Around a 15–20 handicap group.'
  },
  {
    id: 'a2', hostId: 'u3', category: 'Poker', title: 'Need 2 for Friday poker',
    dateLabel: 'Fri, Oct 2', timeLabel: '8:00 PM', publicLocation: 'Cary',
    privateLocation: 'Private home — address unlocks after approval', priceLabel: '$20 buy-in',
    spotsTotal: 8, spotsFilled: 6, visibility: 'friends_mutuals', joinMode: 'approval',
    memberIds: ['u3', 'u2', 'u5'], requestedIds: [], description: 'Friendly home game. Mostly casual players.'
  },
  {
    id: 'a3', hostId: 'u4', category: 'Pickleball', title: 'Need a fourth for doubles',
    dateLabel: 'Tomorrow', timeLabel: '6:30 PM', publicLocation: 'Raleigh',
    privateLocation: 'Method Community Park', priceLabel: 'Free',
    spotsTotal: 4, spotsFilled: 3, visibility: 'friends_mutuals', joinMode: 'approval',
    memberIds: ['u4', 'u6'], requestedIds: [], description: 'Intermediate-ish. Just looking for a solid fourth.'
  },
];

export const starterNotifications: AppNotification[] = [
  { id: 'n1', text: 'Jake needs 1 more for golf Saturday.', createdLabel: '18m', read: false },
  { id: 'n2', text: 'Ryan posted a poker game for Friday night.', createdLabel: '1h', read: false },
];
