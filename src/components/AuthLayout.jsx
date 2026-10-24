import Brand from './Brand';
import Scene from './Scene';

// Shared frame for sign in, sign up and password screens: photo on top (phone) or left (laptop)
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <div className="min-h-screen md:grid md:grid-cols-2">
    <Scene seed="auth" className="h-64 md:h-auto md:min-h-screen">
      <div className="absolute left-6 top-6 md:left-10 md:top-10"><Brand light /></div>
      <p className="absolute bottom-10 left-6 right-6 hidden text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow md:block md:left-10 md:right-10 md:text-4xl">
        A record of the people who matter, that only you two control.
      </p>
    </Scene>

    <div className="relative -mt-6 rounded-t-[28px] bg-white px-6 pb-10 pt-8 dark:bg-gray-900 md:mt-0 md:flex md:items-center md:justify-center md:rounded-none md:px-12">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mb-6 mt-2 text-[15px] leading-relaxed text-gray-600 dark:text-gray-400">{subtitle}</p>}
        {children}
        {footer && <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">{footer}</div>}
      </div>
    </div>
  </div>
);

export default AuthLayout;
