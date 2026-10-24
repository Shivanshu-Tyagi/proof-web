import LegalPage from '../components/LegalPage';

const SECTIONS = [
  {
    heading: 'What we collect',
    paragraphs: ['We collect what you give us to run your account and your shared records, and very little else.'],
    items: [
      'Your account: first and last name, username, email address and a password (stored only as a one-way hash), plus your Registration ID.',
      'What you create: relationships, agreements, milestones, moments (with any location, tags or comments you add), certificates, and the private notes you write.',
      'Activity records: when a relationship is started, accepted or ended, so a history can be shown to people you allow.',
      'Notifications we create for you about the above.',
      'Basic technical logs on our servers (your IP address, browser type and the pages requested) to keep the service secure and working.',
    ],
  },
  {
    heading: 'What we do not do',
    items: [
      'We do not sell your information.',
      'We do not show advertising, and we do not use third-party analytics or advertising trackers.',
      'We do not use tracking cookies. Your browser stores a sign-in token and your light or dark choice on your own device so the app can remember you.',
    ],
  },
  {
    heading: 'Who can see what',
    paragraphs: ['Each feature has its own rule, and you stay in control.'],
    items: [
      'The other person in a relationship sees what you both share there: its title, agreements, milestones, moments and certificates.',
      'Your relationship history (titles, types and dates of your past relationships) is private. Someone sees it only if they ask and you allow it. You choose how long, and you can revoke it at any time. Other people who appear in your history are shown to the viewer only as “Someone”.',
      'A certificate is private until one of its holders turns on its public verify link. The link shows only names, level and issue date, and it can be switched off again.',
      'Your private notes are visible only to you.',
      'People who search for you can see your name, username and Registration ID. Your email address is used to send invitations and is not shown on your profile.',
    ],
  },
  {
    heading: 'Messages',
    paragraphs: ['You can message the other person in an active relationship. Only the two of you can read the conversation.'],
    items: [
      'Messages are stored in our database as plain text so both of you can see them. We do not read them as part of running the service.',
      'If you delete your account, the messages you sent are erased, including from the other person’s conversation. A relationship that has ended keeps its messages readable, but nobody can add new ones.',
      'Your data download includes the messages you sent.',
    ],
  },
  {
    heading: 'Who else handles your data',
    paragraphs: ['We use hosting and database providers to run the service, and an email provider to send messages such as password resets. They process data on our behalf and only to provide those services. We may disclose information if the law requires it.'],
  },
  {
    heading: 'How long we keep it',
    paragraphs: [
      'We keep your account and records while your account exists. A relationship you end stays as an “Ended” record for both people so neither loses their history.',
      'You can delete your account yourself under You, then Security. Your relationships end and the people in them are told. Your profile details, private notes and notifications are erased, and any public certificate links you turned on stop working. Your comments and reactions on moments are removed. Agreements, milestones, moments and certificates you shared with someone else stay for them, but you appear only as “Deleted user”. We do not keep a copy of your email address or name once you delete.',
    ],
  },
  {
    heading: 'Your rights',
    paragraphs: ['You can see and correct your profile, change your password, switch off public certificate links, revoke history access, download a copy of everything we hold about you, and delete your account, all from inside the app. For anything else, or if you cannot sign in, contact us.'],
  },
  {
    heading: 'Security',
    paragraphs: ['Passwords are hashed, connections to the service are encrypted in transit when deployed over HTTPS, and sign-in links for password resets expire after an hour and work once. No system is perfectly secure, so please choose a strong, unique password.'],
  },
  {
    heading: 'Changes',
    paragraphs: ['If we change this policy in a way that matters, we will tell you in the app before it takes effect.'],
  },
];

const PrivacyPolicy = () => (
  <LegalPage
    title="Privacy Policy"
    path="/privacy-policy"
    intro="Proof keeps a private record between you and the people you choose. This explains what we collect, who can see it, and what you control."
    updated="23 October 2026"
    sections={SECTIONS}
  />
);

export default PrivacyPolicy;
