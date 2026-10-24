import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Moon, Sun } from 'lucide-react';
import Brand from '../Brand';
import useAuthStore from '../../store/authStore';
import useThemeStore from '../../store/themeStore';
import { mainNav, sharedNav, isActivePath } from './navItems';

const itemClass = (active) =>
  `flex min-h-[44px] items-center gap-3 rounded-xl px-3.5 text-[15px] font-bold transition-colors ${
    active
      ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
  }`;

const Sidebar = ({ badges = {} }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || 'ME';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col gap-6 border-r border-gray-200 bg-white px-4 py-6 dark:border-gray-700 dark:bg-gray-900 md:flex">
      <Link to="/dashboard" className="px-2" aria-label="Proof home">
        <Brand />
      </Link>

      <nav aria-label="Main" className="flex flex-col gap-1">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item);
          return (
            <NavLink key={item.to} to={item.to} className={itemClass(active)} aria-current={active ? 'page' : undefined}>
              <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
              {badges[item.badge] > 0 && (
                <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-extrabold text-white" aria-label={`${badges[item.badge]} unread`}>
                  {badges[item.badge]}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <nav aria-label="Across all relationships" className="flex flex-col gap-1">
        <span className="eyebrow px-3.5 pb-1">Across everything</span>
        {sharedNav.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(pathname, item);
          return (
            <NavLink key={item.to} to={item.to} className={itemClass(active)} aria-current={active ? 'page' : undefined}>
              <Icon className="h-5 w-5" aria-hidden="true" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="card flex items-center gap-3 p-3">
          <span className="avatar bg-teal-200 dark:bg-teal-300">{initials}</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-extrabold">{user?.firstName} {user?.lastName}</p>
            <p className="truncate text-xs text-gray-600 dark:text-gray-400">@{user?.username}</p>
          </div>
          <button type="button" onClick={toggleTheme} className="btn btn-ghost btn-icon" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button type="button" onClick={handleLogout} className="btn btn-ghost btn-icon" aria-label="Sign out">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <p className="flex flex-wrap gap-x-3 px-2 text-xs text-gray-600 dark:text-gray-400">
          <Link to="/privacy-policy" className="hover:underline">Privacy</Link>
          <Link to="/terms-and-conditions" className="hover:underline">Terms</Link>
          <Link to="/contact-us" className="hover:underline">Help</Link>
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
