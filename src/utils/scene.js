export const PALETTES = [
  { sky: 'linear-gradient(180deg,#8EC5FF 0%,#FFD6A5 62%,#FFB38A 100%)', far: '#2B4C7E', near: '#14304F', sun: '#FFF3C4' },
  { sky: 'linear-gradient(180deg,#C8B8FF 0%,#FFC3D8 100%)', far: '#5B3F86', near: '#34224F', sun: '#FFF3C4' },
  { sky: 'linear-gradient(180deg,#FFD66B 0%,#FF9F6B 100%)', far: '#8A4A1F', near: '#5A2E10', sun: '#FFFAE0' },
  { sky: 'linear-gradient(180deg,#9ADBC8 0%,#8EC5FF 100%)', far: '#1F5E6B', near: '#123B47', sun: '#FFFFFF' },
];

export const paletteFor = (key = '') => {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return PALETTES[hash % PALETTES.length];
};
