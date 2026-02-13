import type {
    Friend,
    FriendCreate,
    Event,
    EventWithFriend,
    EventCreate,
    Note,
    NoteCreate,
    ReciprocityLog,
    ReciprocityCreate,
    ReciprocitySummary,
    ChatRequest,
    ChatResponse,
} from './types';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || 'Request failed');
    }
    if (res.status === 204) return undefined as T;
    return res.json();
}

// ── Friends ──
export const friendsApi = {
    list: (q = '') => request<Friend[]>(`/friends?q=${encodeURIComponent(q)}`),
    get: (id: number) => request<Friend>(`/friends/${id}`),
    create: (data: FriendCreate) =>
        request<Friend>('/friends', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<FriendCreate>) =>
        request<Friend>(`/friends/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
        request<void>(`/friends/${id}`, { method: 'DELETE' }),
};

// ── Events ──
export const eventsApi = {
    listForFriend: (friendId: number) =>
        request<Event[]>(`/friends/${friendId}/events`),
    create: (friendId: number, data: EventCreate) =>
        request<Event>(`/friends/${friendId}/events`, { method: 'POST', body: JSON.stringify(data) }),
    upcoming: (days = 30) =>
        request<EventWithFriend[]>(`/events/upcoming?days=${days}`),
    update: (id: number, data: Partial<EventCreate>) =>
        request<Event>(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
        request<void>(`/events/${id}`, { method: 'DELETE' }),
};

// ── Notes ──
export const notesApi = {
    listForFriend: (friendId: number, category = '') =>
        request<Note[]>(`/friends/${friendId}/notes${category ? `?category=${category}` : ''}`),
    create: (friendId: number, data: NoteCreate) =>
        request<Note>(`/friends/${friendId}/notes`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Partial<NoteCreate>) =>
        request<Note>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
        request<void>(`/notes/${id}`, { method: 'DELETE' }),
};

// ── Reciprocity ──
export const reciprocityApi = {
    listForFriend: (friendId: number) =>
        request<ReciprocityLog[]>(`/friends/${friendId}/reciprocity`),
    log: (friendId: number, data: ReciprocityCreate) =>
        request<ReciprocityLog>(`/friends/${friendId}/reciprocity`, { method: 'POST', body: JSON.stringify(data) }),
    summary: () => request<ReciprocitySummary[]>('/reciprocity/summary'),
};

// ── Chat ──
export const chatApi = {
    send: (data: ChatRequest) =>
        request<ChatResponse>('/chat', { method: 'POST', body: JSON.stringify(data) }),
};
