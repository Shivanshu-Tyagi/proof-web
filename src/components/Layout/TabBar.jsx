import { NavLink, useLocation } from 'react-router-dom';
import { mainNav, isActivePath } from './navItems';

// Phone navigation: five labelled destinations, always visible
const TabBar = ({ badges = {} }) => {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-gray-200 bg-white/95 px-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 md:hidden"
    >
      {mainNav.map((item) => {
        const Icon = item.icon;
        const active = isActivePath(pathname, item);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            aria-current={active ? 'page' : undefined}
            className={`flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
              active ? 'text-rose-500' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span className="relative">
              <Icon className="h-6 w-6" aria-hidden="true" />
              {badges[item.badge] > 0 && (
                <span className="absolute -right-2 -top-1 rounded-full bg-rose-500 px-1.5 text-[10px] font-extrabold leading-4 text-white" aria-label={`${badges[item.badge]} unread`}>
                  {badges[item.badge]}
                </span>
              )}
            </span>
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default TabBar;
