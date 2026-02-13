// ── Types matching backend schemas ──

export interface Friend {
    id: number;
    name: string;
    birthday: string | null;
    phone: string | null;
    email: string | null;
    photo_url: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface FriendCreate {
    name: string;
    birthday?: string | null;
    phone?: string | null;
    email?: string | null;
    photo_url?: string | null;
}

export interface Event {
    id: number;
    friend_id: number;
    title: string;
    date: string;
    event_type: string;
    recurrence: string;
    reminder_days_before: number;
    created_at: string | null;
}

export interface EventWithFriend extends Event {
    friend: Friend;
}

export interface EventCreate {
    title: string;
    date: string;
    event_type?: string;
    recurrence?: string;
    reminder_days_before?: number;
}

export interface Note {
    id: number;
    friend_id: number;
    category: string;
    content: string;
    created_at: string | null;
    updated_at: string | null;
}

export interface NoteCreate {
    category?: string;
    content: string;
}

export interface ReciprocityLog {
    id: number;
    friend_id: number;
    action: string;
    date: string;
    notes: string | null;
    created_at: string | null;
}

export interface ReciprocityCreate {
    action: string;
    date: string;
    notes?: string | null;
}

export interface ChatRequest {
    message: string;
    friend_id?: number | null;
}

export interface ChatResponse {
    reply: string;
    suggestions: string[];
}

export interface ReciprocitySummary {
    friend_id: number;
    name: string;
    actions: Record<string, number>;
}
