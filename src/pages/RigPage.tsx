import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RIG_KEY = 'luckyWheel.riggedResult';
const DATA_KEY = 'luckyWheelData';

type WheelItem = { id: string; label: string; color: string };
type Preset = { id: string; name: string; items: WheelItem[] };
type WheelData = { activePresetId: string; presets: Preset[] };

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap';

export function RigPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [activePresetId, setActivePresetId] = useState('');
  const [currentRig, setCurrentRig] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load fonts for this page only
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_URL;
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (raw) {
        const d: WheelData = JSON.parse(raw);
        setPresets(d.presets || []);
        setActivePresetId(d.activePresetId || '');
      }
    } catch { /* ignore */ }
    setCurrentRig(localStorage.getItem(RIG_KEY));
  }, []);

  const activePreset = presets.find((p) => p.id === activePresetId) ?? presets[0];

  const selectRig = (id: string) => {
    localStorage.setItem(RIG_KEY, id);
    setCurrentRig(id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const clearRig = () => {
    localStorage.removeItem(RIG_KEY);
    setCurrentRig(null);
  };

  const riggedItem = presets.flatMap(p => p.items).find(i => i.id === currentRig);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Inter', sans-serif",
        backgroundColor: '#F9F9F7',
        color: '#111111',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4' viewBox='0 0 4 4'%3E%3Cpath fill='%23111111' fill-opacity='0.04' d='M1 3h1v1H1V3zm2-2h1v1H3V1z'%3E%3C/path%3E%3C/svg%3E")`,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Masthead */}
        <header className="border-b-4 border-[#111] pb-4 mb-0">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] tracking-[0.25em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Vol. 1 &middot; Classified
            </p>
            <p className="text-[10px] tracking-[0.25em] uppercase" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {today}
            </p>
          </div>
          <h1
            className="text-5xl md:text-7xl font-black text-center mt-6 mb-2 tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", lineHeight: 0.95 }}
          >
            Admin Console
          </h1>
          <p className="text-center text-sm text-[#737373] tracking-wide" style={{ fontFamily: "'Inter', sans-serif" }}>
            Rig the next spin result. For authorized eyes only.
          </p>
        </header>

        {/* Thin rule */}
        <div className="border-b border-[#111] mb-8" />

        {/* Status Banner */}
        <section
          className="border border-[#111] p-5 mb-8 transition-all duration-200"
          style={{ borderRadius: 0 }}
        >
          {currentRig ? (
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-4 h-4 flex-shrink-0 border border-[#111]"
                  style={{ backgroundColor: riggedItem?.color || '#CC0000', borderRadius: 0 }}
                />
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.25em] text-[#CC0000] font-medium mb-0.5"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Target Locked
                  </p>
                  <p className="text-2xl font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {riggedItem?.label || 'Unknown'}
                  </p>
                </div>
              </div>
              <button
                onClick={clearRig}
                className="border border-[#111] bg-transparent px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-[#111] hover:text-[#F9F9F7] transition-all duration-200 cursor-pointer"
                style={{ borderRadius: 0, fontFamily: "'Inter', sans-serif" }}
              >
                Clear
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#737373]" style={{ fontFamily: "'Inter', sans-serif" }}>
              No rig active &mdash; the next spin will be random.
            </p>
          )}
        </section>

        {/* Two-column layout: Categories + Items */}
        <div className="grid grid-cols-1 lg:grid-cols-12 border-t border-[#111]">

          {/* Left: Category selector */}
          {presets.length > 1 && (
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-[#111] py-6 lg:pr-6">
              <p
                className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#737373] mb-4"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Category
              </p>
              <div className="flex flex-row lg:flex-col gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePresetId(p.id)}
                    className={`text-left px-3 py-2 text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                      p.id === activePresetId
                        ? 'bg-[#111] text-[#F9F9F7] border-[#111]'
                        : 'bg-transparent text-[#111] border-[#111] hover:bg-[#111] hover:text-[#F9F9F7]'
                    }`}
                    style={{ borderRadius: 0, fontFamily: "'Inter', sans-serif" }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Right: Item grid */}
          <div className={`${presets.length > 1 ? 'lg:col-span-9' : 'lg:col-span-12'} py-6 lg:pl-6`}>
            <p
              className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#737373] mb-4"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Pick the Winner
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
              {(activePreset?.items ?? []).map((item, idx) => {
                const isSelected = currentRig === item.id;
                const cols = 3; // md cols
                const isLastCol = (idx + 1) % cols === 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => selectRig(item.id)}
                    className={`relative flex items-center gap-3 px-4 py-4 text-left border-b border-r border-[#111] transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#111] text-[#F9F9F7]'
                        : 'bg-transparent hover:bg-[#E5E5E0]'
                    } ${isLastCol ? 'md:border-r-0' : ''}`}
                    style={{ borderRadius: 0, fontFamily: "'Inter', sans-serif" }}
                  >
                    <div
                      className="w-3 h-3 flex-shrink-0 border"
                      style={{
                        backgroundColor: item.color,
                        borderColor: isSelected ? '#F9F9F7' : '#111',
                        borderRadius: 0,
                      }}
                    />
                    <span className="text-sm font-semibold truncate">
                      {item.label}
                    </span>
                    {isSelected && (
                      <span
                        className="ml-auto text-[10px] uppercase tracking-wider text-[#CC0000] font-bold flex-shrink-0"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Locked
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Confirmation toast */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mt-8 border-l-4 border-[#CC0000] bg-white px-5 py-3"
              style={{ borderRadius: 0 }}
            >
              <p className="text-sm font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                Target locked. Go spin the wheel.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer ornament */}
        <div className="py-10 text-center text-[#A3A3A3] text-lg tracking-[1em]" style={{ fontFamily: "'Playfair Display', serif" }}>
          &#x2727; &#x2727; &#x2727;
        </div>
        <p
          className="text-center text-[10px] text-[#A3A3A3] uppercase tracking-[0.3em] pb-8"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Confidential &middot; Do Not Distribute
        </p>
      </div>
    </div>
  );
}
