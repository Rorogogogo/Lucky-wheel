import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { readRiggedState, writeRiggedState, type LuckyWheelData, type Preset, type RiggedSequenceMap } from '../hooks/useLuckyWheel';

const DATA_KEY = 'luckyWheelData';

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap';

export function RigPage() {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [activePresetId, setActivePresetId] = useState('');
  const [riggedState, setRiggedState] = useState<RiggedSequenceMap>({});
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
        const d: LuckyWheelData = JSON.parse(raw);
        setPresets(d.presets || []);
        setActivePresetId(d.activePresetId || '');
        setRiggedState(readRiggedState(d.activePresetId || d.presets?.[0]?.id));
      }
    } catch { /* ignore */ }
  }, []);

  const activePreset = presets.find((p) => p.id === activePresetId) ?? presets[0];
  const activeQueue = activePreset ? riggedState[activePreset.id] ?? [] : [];
  const queuedCountByPreset = Object.fromEntries(
    presets.map((preset) => [preset.id, riggedState[preset.id]?.length ?? 0]),
  );
  const totalQueuedCount = Object.values(riggedState).reduce((sum, queue) => sum + queue.length, 0);

  const updateRiggedState = (nextState: RiggedSequenceMap) => {
    writeRiggedState(nextState);
    setRiggedState(nextState);
  };

  const queueRig = (id: string) => {
    if (!activePreset) return;

    updateRiggedState({
      ...riggedState,
      [activePreset.id]: [...activeQueue, id],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const removeQueuedRig = (index: number) => {
    if (!activePreset) return;

    const nextQueue = activeQueue.filter((_, queueIndex) => queueIndex !== index);
    const nextState = { ...riggedState };

    if (nextQueue.length > 0) {
      nextState[activePreset.id] = nextQueue;
    } else {
      delete nextState[activePreset.id];
    }

    updateRiggedState(nextState);
  };

  const clearActiveQueue = () => {
    if (!activePreset) return;

    const nextState = { ...riggedState };
    delete nextState[activePreset.id];
    updateRiggedState(nextState);
  };

  const getItemById = (itemId: string) => presets.flatMap((preset) => preset.items).find((item) => item.id === itemId);
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
            Build a per-category result sequence. For authorized eyes only.
          </p>
        </header>

        {/* Thin rule */}
        <div className="border-b border-[#111] mb-8" />

        {/* Status Banner */}
        <section
          className="border border-[#111] p-5 mb-8 transition-all duration-200"
          style={{ borderRadius: 0 }}
        >
          {totalQueuedCount > 0 ? (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.25em] text-[#CC0000] font-medium mb-1"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  Sequence Armed
                </p>
                <p className="text-2xl font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {totalQueuedCount} queued result{totalQueuedCount === 1 ? '' : 's'}
                </p>
                <p className="text-sm text-[#737373] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {Object.values(queuedCountByPreset).filter((count) => count > 0).length} config group{Object.values(queuedCountByPreset).filter((count) => count > 0).length === 1 ? '' : 's'} ready. Each spin consumes the next result from the active group only.
                </p>
              </div>
              {activeQueue.length > 0 && (
                <button
                  onClick={clearActiveQueue}
                  className="border border-[#111] bg-transparent px-4 py-2 text-[11px] uppercase tracking-[0.15em] font-semibold hover:bg-[#111] hover:text-[#F9F9F7] transition-all duration-200 cursor-pointer"
                  style={{ borderRadius: 0, fontFamily: "'Inter', sans-serif" }}
                >
                  Clear Current
                </button>
              )}
            </div>
          ) : (
            <p className="text-sm text-[#737373]" style={{ fontFamily: "'Inter', sans-serif" }}>
              No rig sequence active &mdash; every spin will be random.
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
                    <span>{p.name}</span>
                    {queuedCountByPreset[p.id] > 0 && (
                      <span
                        className={`ml-2 inline-flex min-w-6 items-center justify-center border px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${
                          p.id === activePresetId
                            ? 'border-[#F9F9F7] text-[#F9F9F7]'
                            : 'border-[#111] text-[#111]'
                        }`}
                        style={{ borderRadius: 0, fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {queuedCountByPreset[p.id]}
                      </span>
                    )}
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
              Queue Winners
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-0">
              {(activePreset?.items ?? []).map((item, idx) => {
                const queuedCount = activeQueue.filter((queuedId) => queuedId === item.id).length;
                const cols = 3; // md cols
                const isLastCol = (idx + 1) % cols === 0;
                return (
                  <button
                    key={item.id}
                    onClick={() => queueRig(item.id)}
                    className={`relative flex items-center gap-3 px-4 py-4 text-left border-b border-r border-[#111] transition-all duration-200 cursor-pointer ${
                      queuedCount > 0
                        ? 'bg-[#111] text-[#F9F9F7]'
                        : 'bg-transparent hover:bg-[#E5E5E0]'
                    } ${isLastCol ? 'md:border-r-0' : ''}`}
                    style={{ borderRadius: 0, fontFamily: "'Inter', sans-serif" }}
                  >
                    <div
                      className="w-3 h-3 flex-shrink-0 border"
                      style={{
                        backgroundColor: item.color,
                        borderColor: queuedCount > 0 ? '#F9F9F7' : '#111',
                        borderRadius: 0,
                      }}
                    />
                    <span className="text-sm font-semibold truncate">
                      {item.label}
                    </span>
                    {queuedCount > 0 && (
                      <span
                        className="ml-auto text-[10px] uppercase tracking-wider text-[#CC0000] font-bold flex-shrink-0"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        x{queuedCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 border border-[#111]">
              <div className="flex items-center justify-between border-b border-[#111] px-4 py-3">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.25em] font-medium text-[#737373] mb-1"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    Current Sequence
                  </p>
                  <p className="text-lg font-black" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {activePreset?.name || 'No category selected'}
                  </p>
                </div>
                {activeQueue.length > 0 && (
                  <button
                    onClick={clearActiveQueue}
                    className="border border-[#111] bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-semibold hover:bg-[#111] hover:text-[#F9F9F7] transition-all duration-200 cursor-pointer"
                    style={{ borderRadius: 0, fontFamily: "'Inter', sans-serif" }}
                  >
                    Clear Group
                  </button>
                )}
              </div>

              {activeQueue.length > 0 ? (
                <div className="divide-y divide-[#111]">
                  {activeQueue.map((itemId, index) => {
                    const queuedItem = getItemById(itemId);
                    return (
                      <div key={`${itemId}-${index}`} className="flex items-center gap-4 px-4 py-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center border border-[#111] text-[11px] font-bold"
                          style={{ borderRadius: 0, fontFamily: "'JetBrains Mono', monospace" }}
                        >
                          {index + 1}
                        </div>
                        <div
                          className="w-3 h-3 flex-shrink-0 border border-[#111]"
                          style={{ backgroundColor: queuedItem?.color || '#CC0000', borderRadius: 0 }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {queuedItem?.label || 'Unknown item'}
                          </p>
                        </div>
                        <button
                          onClick={() => removeQueuedRig(index)}
                          className="border border-[#111] bg-transparent px-3 py-2 text-[10px] uppercase tracking-[0.15em] font-semibold hover:bg-[#111] hover:text-[#F9F9F7] transition-all duration-200 cursor-pointer"
                          style={{ borderRadius: 0, fontFamily: "'Inter', sans-serif" }}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="px-4 py-6 text-sm text-[#737373]" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Nothing queued for this group yet. Click items above to build the order they should come out.
                </p>
              )}
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
                Added to the sequence. The next spin for this group will use the first queued result.
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
