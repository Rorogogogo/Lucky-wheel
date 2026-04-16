import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { type WheelItem } from '../hooks/useLuckyWheel';
import { X, Sparkles, Star } from 'lucide-react';
import { AnimeCelebrationAsset } from './AnimeCelebrationAsset';

interface ResultModalProps {
  winner: WheelItem | null;
  onClose: () => void;
}

export function ResultModal({ winner, onClose }: ResultModalProps) {
  useEffect(() => {
    if (winner) {
      const duration = 4000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.8 },
          colors: [winner.color, '#FFD700', '#ffffff'],
          ticks: 200
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.8 },
          colors: [winner.color, '#FFD700', '#ffffff'],
          ticks: 200
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [winner]);

  return (
    <AnimatePresence>
      {winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          {/* Backdrop with Anime-style color filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Celebration Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 120 }}
            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left/Top: Anime Illustration Area */}
            <div 
              className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden group"
              style={{ backgroundColor: winner.color }}
            >
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
              
              {/* Anime Character Component */}
              <AnimeCelebrationAsset />

              {/* Glowing Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              
              {/* Floating Stars */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -left-10 text-white/20"
              >
                <Star size={120} fill="currentColor" />
              </motion.div>
            </div>

            {/* Right/Bottom: Content Area */}
            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center items-center text-center relative bg-white">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-slate-300 hover:text-slate-600 transition-colors p-2"
              >
                <X size={24} />
              </button>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]"
              >
                <Sparkles size={14} className="text-yellow-400" />
                Special Selection
                <Sparkles size={14} className="text-yellow-400" />
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-slate-500 font-medium text-lg mb-1"
              >
                Congratulations!
              </motion.h3>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="text-5xl md:text-6xl font-black text-slate-800 mb-8 leading-tight drop-shadow-sm"
              >
                {winner.label}
              </motion.h2>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={onClose}
                className="group relative px-10 py-4 rounded-2xl font-black text-white overflow-hidden shadow-xl transition-all active:scale-95"
                style={{ backgroundColor: winner.color }}
              >
                <span className="relative z-10 text-lg uppercase tracking-wider">Perfect!</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>
              
              {/* Subtle background detail */}
              <div className="absolute bottom-4 text-[100px] font-black text-slate-50 select-none pointer-events-none -z-10 leading-none">
                01
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
