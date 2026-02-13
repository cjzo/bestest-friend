import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft, Calendar, StickyNote, Repeat, Plus, Trash2, Edit3,
    Check, X, Phone, Mail, Gift,
} from 'lucide-react';
import { friendsApi, eventsApi, notesApi, reciprocityApi } from '../api';
import type { Friend, Event, Note, ReciprocityLog } from '../types';

type Tab = 'events' | 'notes' | 'reciprocity';

export default function FriendDetailPage() {
    const { id } = useParams<{ id: string }>();
    const friendId = Number(id);

    const [friend, setFriend] = useState<Friend | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [logs, setLogs] = useState<ReciprocityLog[]>([]);
    const [tab, setTab] = useState<Tab>('events');
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', birthday: '', phone: '', email: '' });

    const [showEventForm, setShowEventForm] = useState(false);
    const [eventForm, setEventForm] = useState({ title: '', date: '', event_type: 'birthday', recurrence: 'yearly' });
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [noteForm, setNoteForm] = useState({ category: 'general', content: '' });
    const [showLogForm, setShowLogForm] = useState(false);
    const [logForm, setLogForm] = useState({ action: 'sent_wish', notes: '' });

    useEffect(() => {
        Promise.all([
            friendsApi.get(friendId),
            eventsApi.listForFriend(friendId),
            notesApi.list(friendId),
            reciprocityApi.list(friendId),
        ])
            .then(([f, e, n, l]) => {
                setFriend(f);
                setEditForm({ name: f.name, birthday: f.birthday || '', phone: f.phone || '', email: f.email || '' });
                setEvents(e); setNotes(n); setLogs(l);
            })
            .finally(() => setLoading(false));
    }, [friendId]);

    const saveFriend = async () => {
        await friendsApi.update(friendId, {
            name: editForm.name,
            birthday: editForm.birthday || undefined,
            phone: editForm.phone || undefined,
            email: editForm.email || undefined,
        });
        setFriend(await friendsApi.get(friendId));
        setEditing(false);
    };

    const addEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        await eventsApi.create(friendId, eventForm as any);
        setEvents(await eventsApi.listForFriend(friendId));
        setEventForm({ title: '', date: '', event_type: 'birthday', recurrence: 'yearly' });
        setShowEventForm(false);
    };
    const addNote = async (e: React.FormEvent) => {
        e.preventDefault();
        await notesApi.create(friendId, noteForm as any);
        setNotes(await notesApi.list(friendId));
        setNoteForm({ category: 'general', content: '' });
        setShowNoteForm(false);
    };
    const addLog = async (e: React.FormEvent) => {
        e.preventDefault();
        await reciprocityApi.create(friendId, {
            action: logForm.action as any,
            date: new Date().toISOString().split('T')[0],
            notes: logForm.notes || undefined,
        });
        setLogs(await reciprocityApi.list(friendId));
        setLogForm({ action: 'sent_wish', notes: '' });
        setShowLogForm(false);
    };
    const deleteEvent = async (eid: number) => { await eventsApi.delete(eid); setEvents(await eventsApi.listForFriend(friendId)); };
    const deleteNote = async (nid: number) => { await notesApi.delete(nid); setNotes(await notesApi.list(friendId)); };

    const actionLabels: Record<string, string> = {
        sent_wish: 'Sent wish', received_wish: 'Received wish',
        sent_gift: 'Sent gift', received_gift: 'Received gift',
        sent_message: 'Sent message', received_message: 'Received message',
        hangout: 'Hangout',
    };

    if (loading) return <div className="flex items-center justify-center h-full"><span className="text-text-muted text-sm animate-pulse">Loading...</span></div>;
    if (!friend) return <div className="flex items-center justify-center h-full"><span className="text-text-muted text-sm">Friend not found.</span></div>;

    const tabs: { key: Tab; icon: typeof Calendar; label: string; count: number }[] = [
        { key: 'events', icon: Calendar, label: 'Events', count: events.length },
        { key: 'notes', icon: StickyNote, label: 'Notes', count: notes.length },
        { key: 'reciprocity', icon: Repeat, label: 'Reciprocity', count: logs.length },
    ];

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-5">
            {/* Back */}
            <Link to="/friends" className="inline-flex items-center gap-1.5 text-text-tertiary hover:text-accent text-sm transition-colors" style={{ transitionDuration: '100ms' }}>
                <ArrowLeft size={14} /> Friends
            </Link>

            {/* Profile Card */}
            <div className="card">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-bold text-accent-text">{friend.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        {editing ? (
                            <div className="space-y-3">
                                <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} autoFocus />
                                <div className="grid grid-cols-3 gap-2">
                                    <input className="input" type="date" value={editForm.birthday} onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })} />
                                    <input className="input" placeholder="Phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                                    <input className="input" placeholder="Email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={saveFriend} className="btn btn-accent"><Check size={14} /> Save</button>
                                    <button onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-2.5">
                                    <h1 className="text-xl font-bold text-text-primary font-display">{friend.name}</h1>
                                    <button onClick={() => setEditing(true)} className="btn-ghost p-1 rounded-md text-text-muted"><Edit3 size={14} /></button>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-text-secondary">
                                    {friend.birthday && (
                                        <span className="flex items-center gap-1.5">
                                            <Gift size={14} className="text-text-muted" />
                                            {new Date(friend.birthday + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    )}
                                    {friend.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-text-muted" />{friend.phone}</span>}
                                    {friend.email && <span className="flex items-center gap-1.5"><Mail size={14} className="text-text-muted" />{friend.email}</span>}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-border">
                {tabs.map(({ key, icon: TabIcon, label, count }) => (
                    <button
                        key={key}
                        onClick={() => setTab(key)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key
                                ? 'border-accent text-accent'
                                : 'border-transparent text-text-tertiary hover:text-text-secondary'
                            }`}
                        style={{ transitionDuration: '100ms' }}
                    >
                        <TabIcon size={16} /> {label}
                        <span className="badge ml-1">{count}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div style={{ animation: 'fade-in 150ms ease-out' }}>
                {tab === 'events' && (
                    <div className="space-y-3">
                        <div className="flex justify-end">
                            <button onClick={() => setShowEventForm(!showEventForm)} className="btn btn-secondary">
                                <Plus size={14} /> Add Event
                            </button>
                        </div>
                        {showEventForm && (
                            <form onSubmit={addEvent} className="card space-y-3" style={{ animation: 'slide-up 200ms ease-out' }}>
                                <div className="grid grid-cols-2 gap-3">
                                    <input className="input" placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required autoFocus />
                                    <input className="input" type="date" value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} required />
                                    <select className="input" value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value })}>
                                        <option value="birthday">Birthday</option><option value="anniversary">Anniversary</option><option value="custom">Custom</option>
                                    </select>
                                    <select className="input" value={eventForm.recurrence} onChange={(e) => setEventForm({ ...eventForm, recurrence: e.target.value })}>
                                        <option value="none">One-time</option><option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <button type="submit" className="btn btn-accent">Add Event</button>
                            </form>
                        )}
                        {events.length === 0 ? (
                            <div className="card text-center py-8 text-text-muted text-sm">No events yet.</div>
                        ) : (
                            <div className="panel divide-y divide-border overflow-hidden">
                                {events.map((ev) => (
                                    <div key={ev.id} className="flex items-center justify-between px-5 py-3.5 group hover:bg-bg-hover transition-colors" style={{ transitionDuration: '100ms' }}>
                                        <div className="flex items-center gap-3">
                                            <Calendar size={14} className="text-text-muted" />
                                            <div>
                                                <span className="text-sm font-medium text-text-primary">{ev.title}</span>
                                                <span className="text-meta text-text-muted ml-2">
                                                    {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                {ev.recurrence !== 'none' && <span className="badge badge-primary ml-2">{ev.recurrence}</span>}
                                            </div>
                                        </div>
                                        <button onClick={() => deleteEvent(ev.id)} className="btn-ghost p-1.5 rounded-md text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all" style={{ transitionDuration: '100ms' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'notes' && (
                    <div className="space-y-3">
                        <div className="flex justify-end">
                            <button onClick={() => setShowNoteForm(!showNoteForm)} className="btn btn-secondary"><Plus size={14} /> Add Note</button>
                        </div>
                        {showNoteForm && (
                            <form onSubmit={addNote} className="card space-y-3" style={{ animation: 'slide-up 200ms ease-out' }}>
                                <select className="input" value={noteForm.category} onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}>
                                    <option value="general">General</option><option value="favorites">Favorites</option><option value="gift_ideas">Gift Ideas</option><option value="memories">Memories</option>
                                </select>
                                <textarea className="input resize-none" placeholder="Write a note..." value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} rows={3} required />
                                <button type="submit" className="btn btn-accent">Add Note</button>
                            </form>
                        )}
                        {notes.length === 0 ? (
                            <div className="card text-center py-8 text-text-muted text-sm">No notes yet.</div>
                        ) : (
                            <div className="space-y-2">
                                {notes.map((note) => (
                                    <div key={note.id} className="card group">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <span className="badge badge-primary">{note.category.replace('_', ' ')}</span>
                                                <p className="text-sm text-text-secondary mt-2 leading-relaxed">{note.content}</p>
                                            </div>
                                            <button onClick={() => deleteNote(note.id)} className="btn-ghost p-1.5 rounded-md text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" style={{ transitionDuration: '100ms' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {tab === 'reciprocity' && (
                    <div className="space-y-3">
                        <div className="flex justify-end">
                            <button onClick={() => setShowLogForm(!showLogForm)} className="btn btn-secondary"><Plus size={14} /> Log Action</button>
                        </div>
                        {showLogForm && (
                            <form onSubmit={addLog} className="card space-y-3" style={{ animation: 'slide-up 200ms ease-out' }}>
                                <select className="input" value={logForm.action} onChange={(e) => setLogForm({ ...logForm, action: e.target.value })}>
                                    {Object.entries(actionLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                </select>
                                <input className="input" placeholder="Notes (optional)" value={logForm.notes} onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })} />
                                <button type="submit" className="btn btn-accent">Log</button>
                            </form>
                        )}
                        {logs.length === 0 ? (
                            <div className="card text-center py-8 text-text-muted text-sm">No actions logged yet.</div>
                        ) : (
                            <div className="panel divide-y divide-border overflow-hidden">
                                {logs.map((log) => (
                                    <div key={log.id} className="flex items-center justify-between px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <span className={`w-2 h-2 rounded-full ${log.action.startsWith('sent') ? 'bg-accent' : log.action === 'hangout' ? 'bg-success' : 'bg-warning'
                                                }`} />
                                            <span className="text-sm text-text-primary">{actionLabels[log.action] || log.action}</span>
                                            {log.notes && <span className="text-text-muted text-xs">— {log.notes}</span>}
                                        </div>
                                        <span className="text-meta text-text-muted">
                                            {new Date(log.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
