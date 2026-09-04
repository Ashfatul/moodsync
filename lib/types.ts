export interface Profile {
  id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Couple {
  id: string;
  invite_code?: string | null;
  invite_expires_at?: string | null;
  retention_days: number;
  created_at: string;
  updated_at?: string;
}

export interface CoupleMember {
  couple_id: string;
  user_id: string;
  joined_at: string;
  profile?: Profile;
}

export interface MoodEvent {
  id: string;
  couple_id: string;
  user_id: string;
  mood_id: string;
  need_id?: string | null;
  intimacy_mood_id?: string | null;
  note?: string | null;
  created_at: string;
}

export interface MoodEventWithDetails extends MoodEvent {
  authorName?: string;
  isCurrentUser?: boolean;
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface UserPresenceState {
  userId: string;
  onlineAt: string;
  status: 'online' | 'away';
}
