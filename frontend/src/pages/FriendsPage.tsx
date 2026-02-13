import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, UserPlus, Calendar } from 'lucide-react';
import { friendsApi } from '../api';
import type { Friend } from '../types';

export default function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [query, setQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', birthday: '', phone: '', email: '' });
    const [loading, setLoading] = useState(true);

    const load = (q = '') => friendsApi.list(q).then(setFriends).finally(() => setLoading(false));
    useEffect(() => { load(query); }, [query]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        await friendsApi.create({
            name: form.name,
            birthday: form.birthday || undefined,
            phone: form.phone || undefined,
            email: form.email || undefined,
        });
        setForm({ name: '', birthday: '', phone: '', email: '' });
        setShowForm(false);
        load(query);
    };

    const daysUntilBirthday = (dateStr: string) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const bday = new Date(dateStr + 'T00:00:00');
        bday.setFullYear(today.getFullYear());
        if (bday < today) bday.setFullYear(today.getFullYear() + 1);
        return Math.ceil((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-text-primary">Friends</h1>
                    <p className="text-text-tertiary text-sm mt-0.5">
                        {friends.length} {friends.length === 1 ? 'person' : 'people'}
                    </p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="btn btn-accent">
                    <UserPlus size={16} /> Add Friend
                </button>
            </div>

            {/* Add Form */}
            {showForm && (
                <form onSubmit={submit} className="card space-y-4" style={{ animation: 'slide-up 200ms ease-out' }}>
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">New Friend</span>
                    <div className="grid grid-cols-2 gap-3">
                        <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
                        <input className="input" type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} />
                        <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        <input className="input" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="btn btn-accent">Save</button>
                        <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
                    </div>
                </form>
            )}

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                    className="input !pl-10"
                    placeholder="Search friends..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Friends List */}
            {loading ? (
                <div className="card text-center py-8">
                    <span className="text-text-muted text-sm animate-pulse">Loading...</span>
                </div>
            ) : friends.length === 0 ? (
                <div className="card text-center py-10">
                    <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3">
                        <Plus size={20} className="text-text-muted" />
                    </div>
                    <p className="text-text-secondary text-sm">{query ? 'No results found.' : 'No friends yet.'}</p>
                    <p className="text-text-muted text-xs mt-1">
                        {query ? 'Try a different search.' : 'Click "Add Friend" to get started.'}
                    </p>
                </div>
            ) : (
                <div className="panel divide-y divide-border overflow-hidden">
                    {friends.map((friend) => {
                        const days = friend.birthday ? daysUntilBirthday(friend.birthday) : null;
                        return (
                            <Link
                                key={friend.id}
                                to={`/friends/${friend.id}`}
                                className="flex items-center gap-3 px-5 py-3.5 hover:bg-bg-hover transition-colors group"
                                style={{ transitionDuration: '100ms' }}
                            >
                                <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-semibold text-accent-text">
                                        {friend.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors" style={{ transitionDuration: '100ms' }}>
                                        {friend.name}
                                    </span>
                                    {(friend.email || friend.phone) && (
                                        <span className="text-text-muted text-xs ml-2.5">{friend.email || friend.phone}</span>
                                    )}
                                </div>
                                {days !== null && (
                                    <span className={`badge ${days <= 7 ? 'badge-warning' : days <= 30 ? 'badge-primary' : ''
                                        }`}>
                                        <Calendar size={11} className="mr-1" />
                                        {days === 0 ? 'Today!' : `${days}d`}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
