import LegalPage from '../components/LegalPage';

const SECTIONS = [
  {
    heading: 'Using Twogether',
    paragraphs: ['By creating an account or using Twogether you agree to these terms. If you do not agree, please do not use the service. You must be old enough to enter an agreement where you live, and the details you give us must be accurate.'],
  },
  {
    heading: 'Your account',
    items: [
      'Keep your password private. You are responsible for what happens under your account.',
      'Tell us if you think someone else has accessed it, and change your password straight away.',
      'One person, one account. Do not pretend to be someone else.',
    ],
  },
  {
    heading: 'What a record or certificate is',
    paragraphs: [
      'Twogether records what you and another person chose to agree to inside the app, and when. A certificate is a keepsake showing that record.',
      'It is not a legal, government, notarised or official document. It does not create, prove or end any legal status such as marriage, engagement or a contract, and it should not be treated as evidence of one.',
    ],
  },
  {
    heading: 'Both people stay in control',
    items: [
      'A relationship needs both people. Either of you can ask to end it, and it ends when the other confirms.',
      'Agreements count only when each person has agreed.',
      'History is shared only when its owner allows it, for as long as they allow it.',
      'Messages are visible only to the two of you. Once a relationship has ended, you can read them but not add new ones.',
    ],
  },
  {
    heading: 'Be decent',
    paragraphs: ['Do not use Twogether, including its messages, to harass, threaten, deceive or pressure anyone, to share anything unlawful, or to try to break or overload the service. We may limit or close accounts that do.'],
  },
  {
    heading: 'Your content',
    paragraphs: ['What you write stays yours. You give us permission to store it and show it to the people you share it with, so the service can work. Please only share things you are entitled to share.'],
  },
  {
    heading: 'The service as it is',
    paragraphs: ['We work to keep Twogether available and accurate, but we provide it “as is”. We cannot promise it will always be uninterrupted or error free, and to the extent the law allows we are not liable for indirect or consequential loss arising from using it. Nothing in these terms limits rights you have by law that cannot be limited.'],
  },
  {
    heading: 'Ending your use',
    paragraphs: ['You can stop using Twogether at any time, and delete your account yourself under You, then Security. We may suspend or close accounts that break these terms.'],
  },
  {
    heading: 'Changes',
    paragraphs: ['We may update these terms as the service changes. If a change matters, we will tell you in the app first. Continuing to use Twogether afterwards means you accept the new terms.'],
  },
];

const TermsAndConditions = () => (
  <LegalPage
    title="Terms and Conditions"
    path="/terms-and-conditions"
    intro="The short version: be honest, look after your account, and remember that a certificate here is a keepsake, not a legal document."
    updated="26 October 2026"
    sections={SECTIONS}
  />
);

export default TermsAndConditions;
