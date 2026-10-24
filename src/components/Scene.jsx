import { paletteFor } from '../utils/scene';

// A drawn landscape used until real photos exist. Each relationship gets a stable palette.
const Scene = ({ seed = '', palette, className = '', children }) => {
  const p = palette ?? paletteFor(seed);
  return (
    <div className={`scene ${className}`} style={{ background: p.sky }}>
      <div className="absolute right-[14%] top-[16%] rounded-full opacity-90" style={{ background: p.sun, width: '12%', maxWidth: 72, minWidth: 20, aspectRatio: '1 / 1' }} />
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 200V118L58 78L108 114L178 60L252 112L302 92L354 114L400 96V200Z" fill={p.far} opacity=".92" />
        <path d="M0 200V150L74 124L152 150L236 120L318 146L400 132V200Z" fill={p.near} />
      </svg>
      {children}
    </div>
  );
};

export default Scene;
