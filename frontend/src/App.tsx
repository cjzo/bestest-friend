import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/DashboardPage';
import FriendsPage from './pages/FriendsPage';
import FriendDetailPage from './pages/FriendDetailPage';
import UpcomingPage from './pages/UpcomingPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/friends/:id" element={<FriendDetailPage />} />
          <Route path="/upcoming" element={<UpcomingPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
