import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, ArrowRight, Award, Check, ChevronDown, EyeOff, FileText, Lock, MessagesSquare,
  Moon, ShieldCheck, Sun, Target, UserPlus, Users, X,
} from 'lucide-react';
import Brand from '../components/Brand';
import Scene from '../components/Scene';
import useThemeStore from '../store/themeStore';

const NAV = [
  ['what', 'What is Proof?'],
  ['example', 'See an example'],
  ['how', 'How it works'],
  ['words', 'Words we use'],
  ['faq', 'Questions'],
];

// Three pictures of the idea, for someone who has never heard of the app
const IDEA = [
  { icon: Users, title: 'Pick one person you trust', text: 'A friend, a partner, a family member, a mentor, a flatmate. Each relationship is its own private space for just the two of you.' },
  { icon: FileText, title: 'Write things down together', text: 'Promises you make, goals you share and good moments you want to remember. It is a shared notebook, only the two of you can open it.' },
  { icon: Check, title: 'Both tap “Agree”', text: 'Nothing counts until you both say yes. No more “I never said that”. And it stays between you.' },
];

// One situation per tab. Each shows the same three building blocks.
const SITUATIONS = [
  {
    id: 'friends', label: 'Friends', title: 'Weekend hikers', who: 'with Jonas · Friend',
    agreement: 'Leave the trailhead by 8am', milestone: 'Finish the ridge trail · by 30 Nov', moment: 'Found the hidden lake',
  },
  {
    id: 'partners', label: 'Couples', title: 'Me and Sam', who: 'with Sam · Partner',
    agreement: 'Phones away at dinner', milestone: 'One year together · 14 Feb', moment: 'Our first trip to the coast',
  },
  {
    id: 'flatmates', label: 'Flatmates', title: 'Flat 4B', who: 'with Priya · Friend',
    agreement: 'Dishes done before bed', milestone: 'Deep-clean the flat · this Sunday', moment: 'Movie night on the sofa',
  },
  {
    id: 'mentor', label: 'Mentor', title: 'Career coaching', who: 'with Dana · Mentor',
    agreement: 'Meet every second Friday', milestone: 'Finish the portfolio draft · 15 Dec', moment: 'Got my first interview',
  },
];

const BLOCKS = [
  { key: 'agreement', icon: FileText, name: 'Agreement', tint: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200', explain: 'Something you both promise. It counts once each of you taps Agree.' },
  { key: 'milestone', icon: Target, name: 'Milestone', tint: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200', explain: 'A goal or a date worth marking. You both confirm when it happens.' },
  { key: 'moment', icon: Activity, name: 'Moment', tint: 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200', explain: 'A memory you add to your shared timeline, with a mood and a place if you like.' },
];

const STEPS = [
  { icon: ShieldCheck, title: 'Create your account', text: 'It takes about a minute: your name, a username, your email and a password. You also get a Registration ID, a short code that lets people find you without knowing your email.', see: 'You land on your home page. It is empty, and that is normal.' },
  { icon: UserPlus, title: 'Invite someone', text: 'Type their Registration ID or email, give the relationship a name (like “Weekend hikers”) and choose what you are to each other.', see: 'They get a notification. Nothing starts yet.' },
  { icon: Check, title: 'They accept', text: 'Your invite waits until they say yes. They can also say no, and nobody else is told.', see: 'The relationship turns “Active” and you both see it.' },
  { icon: FileText, title: 'Add your first agreement', text: 'Write one thing you both expect. The other person taps Agree.', see: 'It shows “Agreed by both” once you have each confirmed.' },
  { icon: Award, title: 'Keep adding', text: 'Set milestones, add moments, chat in Messages, and generate a certificate when you want a keepsake.', see: 'Your relationship page fills up and becomes your shared record.' },
];

const WORDS = [
  ['Relationship', 'A private space shared by exactly two people. You can have many, each with a different person.'],
  ['Agreement', 'A promise or rule you both write down. It only counts when both of you have agreed.'],
  ['Milestone', 'A goal or special date, like “first month together”. Both of you confirm when it is done.'],
  ['Moment', 'A memory you save to your shared timeline. You can add a mood, a place and comments.'],
  ['Certificate', 'A keepsake for a relationship. It is private unless you choose to share a link that proves it is real.'],
  ['Registration ID', 'A short code that belongs to your account. Share it so someone can invite you without needing your email.'],
];

const NOT = [
  { title: 'Not social media', text: 'There is no feed, no followers and no likes. Nobody outside the relationship can see anything.' },
  { title: 'Not a legal contract', text: 'It is a record of what you both agreed to, kept in good faith. It cannot create or prove a marriage, a contract or any legal status.' },
  { title: 'Not for groups', text: 'Each relationship is between two people. You can have several relationships, but each one is just two.' },
];

const PRIVACY = [
  { icon: EyeOff, text: 'Only the two people in a relationship can see it.' },
  { icon: Lock, text: 'Your past relationships stay private unless you allow someone to see them, for as long as you choose.' },
  { icon: ShieldCheck, text: 'No ads and no advertising trackers. We do not sell your information.' },
  { icon: Check, text: 'You can download everything we hold about you, or delete your account, whenever you like.' },
];

const FAQ = [
  ['Do I have to invite someone to use it?', 'Yes. Proof is built for two people, so you start by inviting one person. Until they accept, there is nothing to fill in. You can invite more people later, one relationship each.'],
  ['What if the other person does not accept?', 'Nothing happens. The invite stays waiting, and nothing is shared. They can also decline, and nobody else is told.'],
  ['Can other people see what we write?', 'No. Agreements, milestones, moments and messages are visible only to the two of you. The one optional exception is a certificate link that you switch on yourself, which shows just names, level and date.'],
  ['Can I use it with more than one person?', 'Yes. Each person gets their own private relationship, so your flatmate and your best friend never see each other’s space.'],
  ['What if we fall out, or one of us wants to stop?', 'Either of you can ask to end the relationship and the other confirms. It stays on both records as ended, so neither of you loses the history, and messaging closes.'],
  ['Is this legally binding?', 'No. It is a friendly record of what you both agreed, not a legal contract.'],
  ['Does it work on my phone?', 'Yes. Open it in your phone’s browser. The page adjusts to the screen, with a dark mode if you prefer it.'],
  ['Can I get my data out or delete my account?', 'Yes, both, yourself, from your account settings. You can download a copy of everything we hold about you, and delete your account any time.'],
];

const Section = ({ id, eyebrow, title, intro, children, className = '' }) => (
  <section id={id} className={`scroll-mt-20 px-5 py-16 md:px-10 md:py-24 ${className}`} aria-labelledby={id ? `${id}-title` : undefined}>
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
        {eyebrow && <p className="eyebrow mb-3 !text-rose-600 dark:!text-rose-300">{eyebrow}</p>}
        <h2 id={id ? `${id}-title` : undefined} className="text-balance text-3xl leading-tight md:text-4xl">{title}</h2>
        {intro && <p className="page-sub mt-3 text-lg">{intro}</p>}
      </div>
      {children}
    </div>
  </section>
);

// A small picture of the app for the hero
const Preview = () => (
  <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
    <Scene seed="landing" className="h-60 rounded-[28px]">
      <span className="badge badge-ok absolute left-4 top-4 bg-white text-gray-900">Active</span>
      <div className="absolute bottom-14 left-5 right-5 text-white drop-shadow">
        <p className="text-xl font-extrabold">Weekend hikers</p>
        <p className="text-sm font-semibold">with Jonas · Friend</p>
      </div>
    </Scene>
    <div className="relative z-10 -mt-10 space-y-3 px-3">
      <div className="card flex items-center gap-3 p-4 shadow-lift">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"><FileText className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1 leading-snug"><p className="font-extrabold">Leave the trailhead by 8am</p><p className="text-sm text-gray-600 dark:text-gray-400">Both of you agreed</p></div>
        <span className="badge badge-ok"><Check className="mr-1 h-3.5 w-3.5" />Agreed</span>
      </div>
      <div className="card flex items-center gap-3 p-4 shadow-lift">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200"><Target className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1 leading-snug"><p className="font-extrabold">Finish the ridge trail</p><p className="text-sm text-gray-600 dark:text-gray-400">Due 30 Nov</p></div>
        <span className="badge badge-warn">Coming up</span>
      </div>
    </div>
  </div>
);

const Example = () => {
  const [active, setActive] = useState(SITUATIONS[0].id);
  const s = SITUATIONS.find((x) => x.id === active);
  return (
    <div>
      <div role="tablist" aria-label="Pick a situation" className="mb-8 flex flex-wrap justify-center gap-2">
        {SITUATIONS.map((x) => (
          <button
            key={x.id}
            id={`tab-${x.id}`}
            type="button"
            role="tab"
            aria-selected={active === x.id}
            aria-controls="example-panel"
            onClick={() => setActive(x.id)}
            className={`chip ${active === x.id ? 'chip-on' : ''}`}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div id="example-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="mx-auto max-w-4xl">
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gray-50 p-4 dark:bg-gray-800/60">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white"><Users className="h-5 w-5" aria-hidden="true" /></span>
          <p className="leading-snug"><span className="block text-lg font-extrabold">{s.title}</span><span className="text-sm text-gray-600 dark:text-gray-400">{s.who}. A private space for two.</span></p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {BLOCKS.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.key} className="card p-5">
                <span className={`mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-extrabold ${b.tint}`}><Icon className="h-4 w-4" aria-hidden="true" />{b.name}</span>
                <p className="text-lg font-extrabold leading-snug">{s[b.key]}</p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{b.explain}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const { theme, toggleTheme } = useThemeStore();
  return (
    <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:text-gray-900">Skip to content</a>

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 px-5 backdrop-blur dark:border-gray-700 dark:bg-gray-900/90 md:px-10">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4">
          <Link to="/" aria-label="Proof home"><Brand /></Link>
          <nav aria-label="Page sections" className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-lg px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">{label}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={toggleTheme} className="btn btn-ghost btn-icon hidden sm:inline-flex" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
            </button>
            <Link to="/login" className="btn btn-ghost btn-sm sm:min-h-[44px] sm:text-sm">Sign in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm sm:min-h-[44px] sm:text-sm">Get started</Link>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero: say what it is in one breath */}
        <section className="overflow-hidden px-5 pb-16 pt-12 md:px-10 md:pb-24 md:pt-20" aria-labelledby="hero-title">
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-center lg:text-left">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-rose-100 px-3.5 py-1.5 text-sm font-bold text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />New here? Here is the idea in one line
              </p>
              <h1 id="hero-title" className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                A private notebook for <span className="text-rose-600 dark:text-rose-400">two people.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300 lg:mx-0 lg:text-xl">
                Write down promises, save memories and celebrate milestones with someone you trust. Nothing is public, and nothing counts until you both agree.
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link to="/signup" className="btn btn-primary btn-lg">Create your account<ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
                <a href="#what" className="btn btn-secondary btn-lg">Show me how it works</a>
              </div>
              <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-bold text-gray-600 dark:text-gray-400 lg:justify-start">
                {['Nothing is public', 'No ads or trackers', 'Delete anytime'].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5"><Check className="h-4 w-4 text-green-700 dark:text-green-400" aria-hidden="true" />{t}</li>
                ))}
              </ul>
            </div>
            <Preview />
          </div>
        </section>

        {/* What is it */}
        <Section id="what" eyebrow="What is Proof?" title="Think of it as a shared notebook that you both have to sign" intro="Here is the whole idea in three steps." className="bg-gray-50 dark:bg-gray-800/40">
          <ol className="grid gap-5 md:grid-cols-3">
            {IDEA.map((it, i) => {
              const Icon = it.icon;
              return (
                <li key={it.title} className="card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500 text-white"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="eyebrow">{i + 1} of 3</span>
                  </div>
                  <h3 className="text-xl">{it.title}</h3>
                  <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{it.text}</p>
                </li>
              );
            })}
          </ol>
          <p className="mx-auto mt-8 max-w-2xl text-center text-lg text-gray-700 dark:text-gray-300">
            Why bother? Because “I thought we agreed…” is the start of most small arguments, and good memories are easy to lose.
          </p>
        </Section>

        {/* Example: explore */}
        <Section id="example" eyebrow="See an example" title="Pick a situation and see what it looks like" intro="Every relationship uses the same three building blocks. Tap through the examples.">
          <Example />
        </Section>

        {/* How it works */}
        <Section id="how" eyebrow="How it works" title="From sign-up to your first agreement" intro="Five steps. This is exactly what happens, and what you will see." className="bg-gray-50 dark:bg-gray-800/40">
          <ol className="mx-auto max-w-3xl space-y-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="card flex gap-4 p-5 sm:p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-500 text-lg font-extrabold text-white" aria-hidden="true">{i + 1}</span>
                  <div className="min-w-0">
                    <h3 className="flex items-center gap-2 text-xl"><Icon className="h-5 w-5 text-rose-500" aria-hidden="true" />{s.title}</h3>
                    <p className="mt-1.5 leading-relaxed text-gray-600 dark:text-gray-300">{s.text}</p>
                    <p className="mt-3 rounded-xl bg-gray-100 px-3.5 py-2 text-sm font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-200"><span className="text-gray-500 dark:text-gray-400">You will see: </span>{s.see}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <div className="mt-10 text-center">
            <Link to="/signup" className="btn btn-primary btn-lg">Start with step 1<ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
          </div>
        </Section>

        {/* Words */}
        <Section id="words" eyebrow="Words we use" title="A quick dictionary" intro="Six words you will see in the app, in plain English.">
          <dl className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {WORDS.map(([term, meaning]) => (
              <div key={term} className="card p-5">
                <dt className="text-lg font-extrabold">{term}</dt>
                <dd className="mt-1 leading-relaxed text-gray-600 dark:text-gray-300">{meaning}</dd>
              </div>
            ))}
          </dl>
          <p className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 text-center text-gray-700 dark:text-gray-300">
            <MessagesSquare className="h-5 w-5 shrink-0 text-rose-500" aria-hidden="true" />
            There is also a private chat in every relationship, so you can talk without leaving.
          </p>
        </Section>

        {/* What it is not */}
        <Section eyebrow="Good to know" title="What Proof is not" intro="So there are no surprises." className="bg-gray-50 dark:bg-gray-800/40">
          <div className="grid gap-5 md:grid-cols-3">
            {NOT.map((n) => (
              <div key={n.title} className="card p-6">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"><X className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="text-xl">{n.title}</h3>
                <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{n.text}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Privacy in plain words */}
        <section id="privacy" className="scroll-mt-20 bg-gray-900 px-5 py-16 text-white md:px-10 md:py-24" aria-labelledby="privacy-title">
          <div className="mx-auto max-w-3xl">
            <div className="mb-10 text-center">
              <p className="eyebrow mb-3 !text-rose-300">Your privacy</p>
              <h2 id="privacy-title" className="text-balance text-3xl leading-tight !text-white md:text-4xl">Your space stays yours</h2>
            </div>
            <ul className="space-y-4">
              {PRIVACY.map((p) => {
                const Icon = p.icon;
                return (
                  <li key={p.text} className="flex items-start gap-4 rounded-[var(--radius-card)] border border-gray-700 bg-gray-800 p-5">
                    <Icon className="mt-0.5 h-6 w-6 shrink-0 text-rose-300" aria-hidden="true" />
                    <p className="text-lg leading-relaxed text-gray-100">{p.text}</p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-8 text-center text-sm text-gray-400">
              Want the details? Read the <Link to="/privacy-policy" className="font-bold text-white underline">Privacy Policy</Link> and the <Link to="/terms-and-conditions" className="font-bold text-white underline">Terms</Link>.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <Section id="faq" eyebrow="Questions" title="Things people ask before they start" intro="Tap a question to see the answer.">
          <div className="mx-auto max-w-3xl space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="card group p-5">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 text-lg font-extrabold [&::-webkit-details-marker]:hidden">
                  {q}
                  <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="mt-2 leading-relaxed text-gray-600 dark:text-gray-300">{a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* Final call */}
        <section className="px-5 pb-16 md:px-10 md:pb-24" aria-labelledby="cta-title">
          <Scene seed="cta" className="mx-auto max-w-6xl rounded-[32px]">
            <div className="absolute inset-0 bg-gray-900/55" aria-hidden="true" />
            <div className="relative z-10 flex flex-col items-center px-6 py-16 text-center md:py-24">
              <h2 id="cta-title" className="max-w-2xl text-balance text-3xl font-extrabold leading-tight !text-white md:text-5xl">Ready? Start with one person.</h2>
              <p className="mt-4 max-w-xl text-lg text-white">Sign up in a minute, invite someone, and write your first agreement. Nothing starts until they say yes.</p>
              <Link to="/signup" className="btn btn-lg mt-8 border-white bg-white text-gray-900 hover:bg-gray-100">Create your account<ArrowRight className="h-5 w-5" aria-hidden="true" /></Link>
              <p className="mt-4 text-sm font-bold text-white">Already have one? <Link to="/login" className="underline">Sign in</Link></p>
            </div>
          </Scene>
        </section>
      </main>

      <footer className="border-t border-gray-200 px-5 py-8 dark:border-gray-700 md:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Brand />
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-bold text-gray-600 dark:text-gray-400">
            <Link to="/privacy-policy" className="py-2 hover:underline">Privacy</Link>
            <Link to="/terms-and-conditions" className="py-2 hover:underline">Terms</Link>
            <Link to="/contact-us" className="py-2 hover:underline">Contact</Link>
            <Link to="/login" className="py-2 hover:underline">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
