import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLuckyWheel, type WheelItem } from './hooks/useLuckyWheel';
import { Wheel } from './components/Wheel';
import { ItemList } from './components/ItemList';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultModal } from './components/ResultModal';
import { Logo } from './components/Logo';
import { Edit3 } from 'lucide-react';

function App() {
  const {
    data,
    activePreset,
    setActivePresetId,
    consumeRiggedResult,
    updatePresetItems,
    updatePresetName,
    resetToDefaults,
  } = useLuckyWheel();

  const [spinParams, setSpinParams] = useState({
    isSpinning: false,
    targetId: null as string | null,
    spinCount: 0,
  });

  const [winner, setWinner] = useState<WheelItem | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleSpinClick = () => {
    if (spinParams.isSpinning || activePreset.items.length === 0) return;
    const riggedId = consumeRiggedResult();
    setWinner(null);
    setSpinParams((prev) => ({
      isSpinning: true,
      targetId: riggedId,
      spinCount: prev.spinCount + 1,
    }));
  };

  const handleStopSpinning = (winningItem: WheelItem) => {
    setSpinParams((prev) => ({ ...prev, isSpinning: false }));
    setWinner(winningItem);
  };

  // Pre-generate random positions for floating confetti
  const floatingParticles = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 8 + Math.random() * 14,
      delay: Math.random() * 2,
      duration: 2 + Math.random() * 1.5,
      color: ['#fbbf24', '#f472b6', '#818cf8', '#34d399', '#fb923c', '#60a5fa', '#f87171', '#a78bfa'][i % 8],
      shape: i % 3, // 0=square, 1=circle, 2=rectangle
    })),
  []);

  const lightRays = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      rotation: i * 22.5,
      delay: i * 0.1,
    })),
  []);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans relative overflow-hidden">
      {/* === FULL-SCREEN SPIN EFFECTS === */}
      <AnimatePresence>
        {spinParams.isSpinning && (
          <>
            {/* Animated gradient background — vivid color shift */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="fixed inset-0 z-0 pointer-events-none"
            >
              {/* Primary radial glow */}
              <motion.div
                animate={{
                  background: [
                    'radial-gradient(ellipse at 50% 35%, rgba(99,102,241,0.25) 0%, rgba(244,114,182,0.12) 35%, rgba(248,250,252,0) 65%)',
                    'radial-gradient(ellipse at 50% 35%, rgba(244,114,182,0.25) 0%, rgba(99,102,241,0.12) 35%, rgba(248,250,252,0) 65%)',
                    'radial-gradient(ellipse at 50% 35%, rgba(59,130,246,0.25) 0%, rgba(251,191,36,0.1) 35%, rgba(248,250,252,0) 65%)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0"
              />
              {/* Soft overall tint */}
              <div className="absolute inset-0 bg-indigo-50/40" />
            </motion.div>

            {/* Rotating light rays from wheel center — thicker & brighter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{
                opacity: { duration: 0.4 },
                scale: { duration: 0.6, type: 'spring' },
                rotate: { duration: 12, repeat: Infinity, ease: 'linear' },
              }}
              className="fixed z-0 pointer-events-none"
              style={{ top: '32%', left: '50%' }}
            >
              {lightRays.map((ray) => (
                <motion.div
                  key={ray.id}
                  animate={{ opacity: [0.1, 0.35, 0.1] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: ray.delay }}
                  className="absolute origin-bottom"
                  style={{
                    width: '6px',
                    height: '55vmax',
                    transform: `rotate(${ray.rotation}deg)`,
                    background: `linear-gradient(to top, rgba(99,102,241,0.3), rgba(244,114,182,0.1) 40%, transparent 80%)`,
                    left: '50%',
                    bottom: '50%',
                    borderRadius: '3px',
                  }}
                />
              ))}
            </motion.div>

            {/* Confetti rain — big, colorful, tumbling pieces */}
            {floatingParticles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: '110vh', rotate: 0 }}
                animate={{
                  opacity: [0, 0.9, 0.9, 0],
                  y: '-15vh',
                  rotate: Math.random() > 0.5 ? 720 : -720,
                }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: p.duration,
                  repeat: Infinity,
                  delay: p.delay,
                  ease: 'linear',
                }}
                className="fixed z-[1] pointer-events-none"
                style={{
                  left: p.left,
                  width: p.shape === 2 ? p.size * 1.8 : p.size,
                  height: p.shape === 2 ? p.size * 0.6 : p.size,
                  backgroundColor: p.color,
                  borderRadius: p.shape === 1 ? '50%' : '2px',
                }}
              />
            ))}

            {/* Pulsing vignette — more dramatic edges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="fixed inset-0 z-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 40%, rgba(99,102,241,0.15) 100%)',
              }}
            />

            {/* Corner glow blobs */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="fixed -top-20 -left-20 w-60 h-60 rounded-full bg-pink-400 blur-[80px] z-0 pointer-events-none"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="fixed -top-20 -right-20 w-60 h-60 rounded-full bg-blue-400 blur-[80px] z-0 pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

      {/* Hero header — centered logo */}
      <header className="text-center pt-10 pb-6 px-4 relative z-10">
        <Logo />
      </header>

      {/* Wheel area */}
      <div className="flex flex-col items-center px-4 py-6 relative z-10">
        <div className="w-full max-w-xl">
          <Wheel
            items={activePreset.items}
            spinParams={spinParams}
            onStop={handleStopSpinning}
          />
        </div>

        {/* Spin button */}
        <button
          onClick={handleSpinClick}
          disabled={spinParams.isSpinning || activePreset.items.length === 0}
          className="mt-10 group relative overflow-hidden rounded-full bg-gradient-to-tr from-primary to-blue-400 px-14 py-5 text-white shadow-[0_0_40px_rgba(59,130,246,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(59,130,246,0.55)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none active:scale-95"
        >
          <span className="relative z-10 text-2xl font-bold tracking-wider uppercase">
            {spinParams.isSpinning ? 'Spinning…' : 'Spin the Wheel'}
          </span>
          <div className="absolute inset-0 z-0 bg-gradient-to-tr from-blue-600 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </button>
      </div>

      {/* Settings area */}
      <div className="flex-1 border-t border-slate-200 bg-white mt-4 relative z-10">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Preset title + item list */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-3 mb-4">
              {isEditingTitle ? (
                <input
                  type="text"
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  value={activePreset.name}
                  onChange={(e) => updatePresetName(activePreset.id, e.target.value)}
                  className="text-2xl font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded px-2 py-1 outline-none focus:ring-2 focus:ring-primary w-full"
                  disabled={spinParams.isSpinning}
                />
              ) : (
                <div
                  className="flex items-center gap-2 group cursor-pointer"
                  onClick={() => !spinParams.isSpinning && setIsEditingTitle(true)}
                >
                  <h2 className="text-xl font-bold text-slate-800 group-hover:text-primary transition-colors">
                    {activePreset.name}
                  </h2>
                  <Edit3
                    size={16}
                    className="text-slate-400 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all"
                  />
                </div>
              )}
            </div>
            <ItemList
              items={activePreset.items}
              onChange={(items) => updatePresetItems(activePreset.id, items)}
              disabled={spinParams.isSpinning}
            />
          </div>

          {/* Presets + reset */}
          <div className="lg:col-span-5">
            <SettingsPanel
              data={data}
              setActivePresetId={setActivePresetId}
              updatePresetName={updatePresetName}
              revertToDefaults={resetToDefaults}
              disabled={spinParams.isSpinning}
            />
          </div>
        </div>
      </div>

      <ResultModal winner={winner} onClose={() => setWinner(null)} />
    </div>
  );
}

export default App;
