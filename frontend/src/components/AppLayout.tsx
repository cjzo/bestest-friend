import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Calendar,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Search,
    X,
} from 'lucide-react';
import ChatDrawer from './ChatDrawer';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/friends', icon: Users, label: 'Friends' },
    { to: '/upcoming', icon: Calendar, label: 'Upcoming' },
];

function Breadcrumb() {
    const location = useLocation();
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return <span className="text-sm text-text-secondary">Dashboard</span>;
    return (
        <div className="flex items-center gap-1.5 text-sm">
            <NavLink to="/" className="text-text-tertiary hover:text-text-primary transition-colors" style={{ transitionDuration: '100ms' }}>
                Home
            </NavLink>
            {parts.map((p, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    <span className="text-text-muted">/</span>
                    <span className={i === parts.length - 1 ? 'text-text-primary font-medium' : 'text-text-tertiary'}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                    </span>
                </span>
            ))}
        </div>
    );
}

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-bg-secondary">
            {/* ── Left Sidebar ── */}
            <aside
                className="drawer flex flex-col flex-shrink-0"
                style={{
                    width: sidebarOpen ? 224 : 56,
                    transition: 'width 200ms ease-in-out',
                }}
            >
                {/* Logo */}
                <div className="flex items-center justify-between h-14 px-3 border-b border-border">
                    {sidebarOpen && (
                        <span className="font-display text-sm font-semibold text-text-primary tracking-tight">
                            bestest friend
                        </span>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="btn-ghost p-1.5 rounded-md"
                        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-3 px-2 space-y-0.5">
                    {sidebarOpen && (
                        <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider px-2.5 mb-1 block">
                            Core
                        </span>
                    )}
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={({ isActive }) =>
                                `flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? 'bg-bg-active text-accent-text'
                                    : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                                }`
                            }
                            style={{ transitionDuration: '100ms' }}
                        >
                            <Icon size={16} className="flex-shrink-0" />
                            {sidebarOpen && <span>{label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Chat toggle */}
                <div className="p-2 border-t border-border">
                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm font-medium transition-colors ${chatOpen
                                ? 'bg-bg-active text-accent-text'
                                : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary'
                            }`}
                        style={{ transitionDuration: '100ms' }}
                    >
                        <MessageCircle size={16} className="flex-shrink-0" />
                        {sidebarOpen && <span>Chat</span>}
                    </button>
                </div>
            </aside>

            {/* ── Center column ── */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top bar — h-14 per spec */}
                <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-bg-primary flex-shrink-0">
                    <Breadcrumb />
                    <div className="flex items-center gap-2">
                        <button className="btn-ghost p-2 rounded-md" aria-label="Search">
                            <Search size={16} />
                        </button>
                        <button
                            onClick={() => setChatOpen(!chatOpen)}
                            className={`btn-ghost p-2 rounded-md ${chatOpen ? 'text-accent' : ''}`}
                            aria-label="Toggle chat"
                        >
                            <MessageCircle size={16} />
                        </button>
                    </div>
                </header>

                {/* Workspace */}
                <main className="flex-1 overflow-y-auto bg-bg-secondary">
                    <Outlet />
                </main>
            </div>

            {/* ── Right Drawer (Chat) ── */}
            {chatOpen && (
                <div className="drawer-right flex flex-col flex-shrink-0 w-80">
                    <div className="flex items-center justify-between h-14 px-4 border-b border-border">
                        <span className="text-sm font-semibold text-text-primary">Assistant</span>
                        <button onClick={() => setChatOpen(false)} className="btn-ghost p-1.5 rounded-md">
                            <X size={16} />
                        </button>
                    </div>
                    <ChatDrawer />
                </div>
            )}
        </div>
    );
}
