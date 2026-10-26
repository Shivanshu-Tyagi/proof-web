import { Home, Users, Award, Bell, User, FileText, Target, Activity, MessagesSquare, MessageSquarePlus } from 'lucide-react';

// Five top-level places, so the labels fit on a phone. Agreements, milestones and moments live inside each relationship.
export const mainNav = [
  { to: '/dashboard', label: 'Home', icon: Home, match: ['/dashboard'] },
  { to: '/relationships', label: 'People', icon: Users, match: ['/relationships', '/find-someone'] },
  { to: '/messages', label: 'Messages', icon: MessagesSquare, match: ['/messages'], badge: 'messages' },
  { to: '/notifications', label: 'Inbox', icon: Bell, match: ['/notifications'], badge: 'unread' },
  { to: '/profile', label: 'You', icon: User, match: ['/profile'] },
];

// Cross-relationship lists, shown in the laptop sidebar
export const sharedNav = [
  { to: '/certificates', label: 'Certificates', icon: Award, match: ['/certificates', '/certificate2'] },
  { to: '/terms', label: 'Agreements', icon: FileText, match: ['/terms'] },
  { to: '/milestones', label: 'Milestones', icon: Target, match: ['/milestones'] },
  { to: '/activities', label: 'Moments', icon: Activity, match: ['/activities'] },
  { to: '/feedback', label: 'Feedback', icon: MessageSquarePlus, match: ['/feedback'] },
];

export const isActivePath = (pathname, item) =>
  item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
