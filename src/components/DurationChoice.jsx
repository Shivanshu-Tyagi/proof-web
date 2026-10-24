const DURATIONS = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: null, label: 'Until I stop it' },
];

// How long should a history grant last? Equal-weight chips, default 30 days.
const DurationChoice = ({ value, onChange, name = 'How long' }) => (
  <div className="flex flex-wrap gap-2" role="group" aria-label={name}>
    {DURATIONS.map((d) => (
      <button key={d.label} type="button" aria-pressed={value === d.value} onClick={() => onChange(d.value)} className={`chip ${value === d.value ? 'chip-on' : ''}`}>{d.label}</button>
    ))}
  </div>
);

export default DurationChoice;
