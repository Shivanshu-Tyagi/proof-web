import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const NotFound = () => {
  const { isAuthenticated } = useAuthStore();
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">404</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">We couldn&apos;t find that page.</p>
        <Link
          to={isAuthenticated() ? '/dashboard' : '/login'}
          className="px-5 py-2.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {isAuthenticated() ? 'Back to dashboard' : 'Go to login'}
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
