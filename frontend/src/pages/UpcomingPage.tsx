import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Filter } from 'lucide-react';
import { eventsApi } from '../api';
import type { EventWithFriend } from '../types';

export default function UpcomingPage() {
    const [events, setEvents] = useState<EventWithFriend[]>([]);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        eventsApi.upcoming(days).then(setEvents).finally(() => setLoading(false));
    }, [days]);

    const daysUntil = (dateStr: string) => {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr + 'T00:00:00');
        return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const today: EventWithFriend[] = [];
    const thisWeek: EventWithFriend[] = [];
    const later: EventWithFriend[] = [];
    events.forEach((ev) => {
        const d = daysUntil(ev.date);
        if (d <= 0) today.push(ev);
        else if (d <= 7) thisWeek.push(ev);
        else later.push(ev);
    });

    const renderGroup = (title: string, items: EventWithFriend[], badgeClass: string) =>
        items.length > 0 && (
            <section className="space-y-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider">{title}</h3>
                    <span className={`badge ${badgeClass}`}>{items.length}</span>
                </div>
                <div className="panel divide-y divide-border overflow-hidden">
                    {items.map((ev) => {
                        const d = daysUntil(ev.date);
                        return (
                            <Link
                                key={ev.id}
                                to={`/friends/${ev.friend_id}`}
                                className="flex items-center justify-between px-5 py-3.5 hover:bg-bg-hover transition-colors"
                                style={{ transitionDuration: '100ms' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] font-semibold text-accent-text">{ev.friend.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <span className="text-sm font-medium text-text-primary">{ev.title}</span>
                                        <span className="text-text-tertiary text-xs ml-2">{ev.friend.name}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-meta text-text-muted">
                                        {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className={`badge ${d <= 0 ? 'badge-error' : d <= 3 ? 'badge-warning' : 'badge-primary'}`}>
                                        {d <= 0 ? 'Today' : d === 1 ? 'Tomorrow' : `${d}d`}
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        );

    return (
        <div className="p-6 max-w-[1200px] mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl font-bold text-text-primary">Upcoming Events</h1>
                    <p className="text-text-tertiary text-sm mt-0.5">
                        {events.length} event{events.length !== 1 ? 's' : ''} in the next {days} days
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-text-muted" />
                    <select
                        className="input !w-auto"
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                    >
                        <option value={7}>7 days</option>
                        <option value={14}>14 days</option>
                        <option value={30}>30 days</option>
                        <option value={60}>60 days</option>
                        <option value={90}>90 days</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="card text-center py-8">
                    <span className="text-text-muted text-sm animate-pulse">Loading...</span>
                </div>
            ) : events.length === 0 ? (
                <div className="card text-center py-10">
                    <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center mx-auto mb-3">
                        <Clock size={20} className="text-text-muted" />
                    </div>
                    <p className="text-text-secondary text-sm">No upcoming events in the next {days} days.</p>
                    <p className="text-text-muted text-xs mt-1">Add events to your friends to see them here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {renderGroup('Today', today, 'badge-error')}
                    {renderGroup('This Week', thisWeek, 'badge-warning')}
                    {renderGroup('Later', later, 'badge-primary')}
                </div>
            )}
        </div>
    );
}
