import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TabBar from './TabBar';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import useMessageStore from '../../store/messageStore';

// Signed-in: sidebar on laptop, tab bar on phone. Signed-out pages bring their own layout.
const AppShell = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const signedIn = isAuthenticated();
  const { unreadCount, getUnreadCount } = useNotificationStore();
  const { unreadTotal, loadThreads } = useMessageStore();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!signedIn) return undefined;
    getUnreadCount();
    loadThreads();
    const timer = setInterval(() => { getUnreadCount(); loadThreads(); }, 30_000);
    return () => clearInterval(timer);
  }, [signedIn, getUnreadCount, loadThreads]);

  // The landing page has its own header and footer
  if (!signedIn && pathname === '/') return children;

  if (!signedIn) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <footer className="flex flex-wrap justify-center gap-x-5 gap-y-1 border-t border-gray-200 px-4 py-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
          <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
          <Link to="/terms-and-conditions" className="hover:underline">Terms</Link>
          <Link to="/contact-us" className="hover:underline">Contact</Link>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar badges={{ unread: unreadCount, messages: unreadTotal }} />
      <div className="pb-24 md:pb-0 md:pl-64">{children}</div>
      <TabBar badges={{ unread: unreadCount, messages: unreadTotal }} />
    </div>
  );
};

export default AppShell;
