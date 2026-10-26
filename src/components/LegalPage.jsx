import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Brand from './Brand';
import useAuthStore from '../store/authStore';

const OTHER = {
  '/privacy-policy': { to: '/terms-and-conditions', label: 'Terms and Conditions' },
  '/terms-and-conditions': { to: '/privacy-policy', label: 'Privacy Policy' },
};

// Shared reading layout for policy pages. Sections are { heading, paragraphs?, items? }.
const LegalPage = ({ title, path, intro, updated, sections }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const signedIn = isAuthenticated();
  const other = OTHER[path];

  // Opened in a new tab there is nothing to go back to, so fall back to home
  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate(signedIn ? '/dashboard' : '/');
  };

  return (
    <>
      {!signedIn && (
        <header className="border-b border-gray-200 px-5 dark:border-gray-700 md:px-8">
          <div className="mx-auto flex h-16 max-w-2xl items-center justify-between gap-3">
            <Link to="/" aria-label="Twogether home"><Brand /></Link>
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-ghost btn-sm sm:min-h-[44px] sm:text-sm">Sign in</Link>
              <Link to="/signup" className="btn btn-primary btn-sm sm:min-h-[44px] sm:text-sm">Get started</Link>
            </div>
          </div>
        </header>
      )}

      <div className="mx-auto w-full max-w-2xl px-5 pb-12 pt-6 md:px-8 md:pt-8">
        <button type="button" onClick={goBack} className="btn btn-ghost -ml-3 mb-2"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back</button>
        <header className="mb-6">
          <h1 className="page-title">{title}</h1>
          {intro && <p className="mt-3 text-lg leading-relaxed text-gray-700 dark:text-gray-300">{intro}</p>}
          {updated && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Last updated {updated}</p>}
        </header>

        <nav aria-label="On this page" className="mb-8">
          <p className="eyebrow mb-2">Jump to</p>
          <ol className="flex flex-wrap gap-2">
            {sections.map((s, i) => (
              <li key={s.heading}>
                <a href={`#s${i}`} className="chip min-h-[36px] px-3 text-[13px]">{i + 1}. {s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={s.heading} id={`s${i}`} aria-labelledby={`h${i}`} className="scroll-mt-6">
              <h2 id={`h${i}`} className="mb-2 text-xl">{i + 1}. {s.heading}</h2>
              {s.paragraphs?.map((p) => <p key={p} className="mb-3 text-[16px] leading-relaxed text-gray-800 dark:text-gray-200">{p}</p>)}
              {s.items && (
                <ul className="mb-3 list-disc space-y-1.5 pl-5 text-[16px] leading-relaxed text-gray-800 dark:text-gray-200">
                  {s.items.map((it) => <li key={it}>{it}</li>)}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-5 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
          <p>Questions? <Link to="/contact-us" className="font-bold text-rose-700 underline dark:text-rose-300">Contact us</Link>.</p>
          {other && <p>Also read: <Link to={other.to} className="font-bold text-rose-700 underline dark:text-rose-300">{other.label}</Link></p>}
        </div>
      </div>
    </>
  );
};

export default LegalPage;
