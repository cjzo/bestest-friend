import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Plus, Clock } from 'lucide-react';
import { friendsApi, eventsApi } from '../api';
import type { Friend, EventWithFriend } from '../types';

export default function DashboardPage() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [upcoming, setUpcoming] = useState<EventWithFriend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([friendsApi.list(), eventsApi.upcoming(14)])
            .then(([f, u]) => { setFriends(f); setUpcoming(u); })
            .finally(() => setLoading(false));
    }, []);

    const daysUntil = (dateStr: string) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr + 'T00:00:00');
        return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <span className="text-text-muted text-sm animate-pulse">Loading...</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-display text-2xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-text-tertiary text-sm mt-1">Keep up with the people who matter most.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="card card-hover">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
                            <Users size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="font-mono text-2xl font-semibold text-text-primary leading-none">{friends.length}</p>
                            <p className="text-text-muted text-xs mt-1">Friends</p>
                        </div>
                    </div>
                </div>
                <div className="card card-hover">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
                            <Calendar size={20} className="text-accent" />
                        </div>
                        <div>
                            <p className="font-mono text-2xl font-semibold text-text-primary leading-none">{upcoming.length}</p>
                            <p className="text-text-muted text-xs mt-1">Events (2 wks)</p>
                        </div>
                    </div>
                </div>
                <Link to="/friends" className="card card-hover group">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
                            <Plus size={20} className="text-accent" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors" style={{ transitionDuration: '100ms' }}>
                                Add a friend
                            </p>
                            <p className="text-text-muted text-xs mt-0.5">Get started</p>
                        </div>
                        <ArrowRight size={14} className="text-text-muted" />
                    </div>
                </Link>
            </div>

            {/* Upcoming Events */}
            <section>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-text-primary font-display">Upcoming Events</h2>
                    <Link to="/upcoming" className="text-xs text-text-tertiary hover:text-accent transition-colors flex items-center gap-1" style={{ transitionDuration: '100ms' }}>
                        View all <ArrowRight size={10} />
                    </Link>
                </div>

                {upcoming.length === 0 ? (
                    <div className="card text-center py-8">
                        <Clock size={24} className="text-text-muted mx-auto mb-3" />
                        <p className="text-text-secondary text-sm">No upcoming events in the next 2 weeks.</p>
                        <p className="text-text-muted text-xs mt-1">Add friends and events to get reminders.</p>
                    </div>
                ) : (
                    <div className="panel divide-y divide-border overflow-hidden">
                        {upcoming.slice(0, 5).map((event) => {
                            const d = daysUntil(event.date);
                            return (
                                <Link
                                    key={event.id}
                                    to={`/friends/${event.friend_id}`}
                                    className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-hover transition-colors"
                                    style={{ transitionDuration: '100ms' }}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`w-2 h-2 rounded-full ${d <= 1 ? 'bg-error' : d <= 3 ? 'bg-warning' : 'bg-accent'
                                            }`} />
                                        <div>
                                            <span className="text-sm font-medium text-text-primary">{event.title}</span>
                                            <span className="text-text-tertiary text-xs ml-2">{event.friend.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-meta text-text-muted">
                                            {new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className={`badge ${d <= 1 ? 'badge-error' : d <= 3 ? 'badge-warning' : 'badge-primary'
                                            }`}>
                                            {d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d}d`}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Friends */}
            {friends.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-text-primary font-display">Your Friends</h2>
                        <Link to="/friends" className="text-xs text-text-tertiary hover:text-accent transition-colors flex items-center gap-1" style={{ transitionDuration: '100ms' }}>
                            View all <ArrowRight size={10} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {friends.slice(0, 8).map((friend) => (
                            <Link key={friend.id} to={`/friends/${friend.id}`} className="card card-hover group">
                                <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center mb-2.5">
                                    <span className="text-xs font-semibold text-accent-text">{friend.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <p className="text-sm font-medium text-text-primary group-hover:text-accent truncate transition-colors" style={{ transitionDuration: '100ms' }}>
                                    {friend.name}
                                </p>
                                {friend.birthday && (
                                    <p className="text-meta text-text-muted mt-1">
                                        {new Date(friend.birthday + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
