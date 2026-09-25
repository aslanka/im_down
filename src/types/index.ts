export type ActivityCategory = 'Golf' | 'Poker' | 'Pickleball' | 'Basketball' | 'Soccer' | 'Other';
export type Visibility = 'friends' | 'friends_mutuals' | 'selected' | 'group';
export type JoinMode = 'instant' | 'approval';
export type ActivityStatus = 'open' | 'ended';

export type User = {
  id: string;
  name: string;
  username: string;
  initials: string;
  interests: ActivityCategory[];
};

export type FriendGroup = {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  createdAt: number;
};

export type Activity = {
  id: string;
  hostId: string;
  category: ActivityCategory;
  title: string;
  dateLabel: string;
  timeLabel: string;
  publicLocation: string;
  privateLocation?: string;
  priceLabel?: string;
  spotsTotal: number;
  spotsFilled: number;
  visibility: Visibility;
  audienceGroupId?: string;
  joinMode: JoinMode;
  memberIds: string[];
  requestedIds: string[];
  description?: string;
  status?: ActivityStatus;
  endsAt?: number;
  endedAt?: number;
};

export type EventMessage = {
  id: string;
  activityId: string;
  senderId: string;
  body: string;
  createdAt: number;
};

export type AppNotification = {
  id: string;
  text: string;
  createdLabel: string;
  read: boolean;
};
