import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';

interface CheerCharacterConfig {
  src: string;
  bubble: string;
  size: string; // Tailwind size classes
  position: string; // Tailwind positioning classes
  delay: number;
  flipX?: boolean;
}

// RESTORING THE FULL SQUAD AS REQUESTED
const CHEER_CHARACTERS: CheerCharacterConfig[] = [
  {
    src: '/lottie/cheer-cute.json',
    bubble: 'You got this! ✨',
    size: 'w-24 h-24 md:w-40 md:h-40',
    position: 'absolute -right-10 md:-right-40 top-[15%]',
    delay: 0.1,
  },
  {
    src: '/lottie/dancing_cat.json',
    bubble: 'Go! Go!',
    size: 'w-20 h-20 md:w-36 md:h-36',
    position: 'absolute -left-10 md:-left-40 top-[20%]',
    delay: 0.2,
    flipX: true,
  },
  {
    src: '/lottie/pokemon.json',
    bubble: 'Let\'s go~!',
    size: 'w-16 h-16 md:w-28 md:h-28',
    position: 'absolute -right-6 md:-right-32 bottom-[10%]',
    delay: 0.35,
  },
  {
    src: '/lottie/pikachu2.json',
    bubble: 'Pika!',
    size: 'w-14 h-14 md:w-24 md:h-24',
    position: 'absolute -left-4 md:-left-28 bottom-[15%]',
    delay: 0.45,
  },
  {
    src: '/lottie/totoro.json',
    bubble: '',
    size: 'w-14 h-14 md:w-24 md:h-24',
    position: 'absolute left-[5%] -top-8 md:-top-16',
    delay: 0.5,
  },
  {
    src: '/lottie/happy_bird.json',
    bubble: '',
    size: 'w-12 h-12 md:w-20 md:h-20',
    position: 'absolute right-[8%] -top-6 md:-top-14',
    delay: 0.55,
  },
];

// Ensure Lottie component is correctly handled
const LottieComponent = (Lottie as any).default || Lottie;

function SingleCheer({ config, isSpinning }: { config: CheerCharacterConfig; isSpinning: boolean }) {
  const [animationData, setAnimationData] = useState<any>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(config.src)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load lottie');
        return res.json();
      })
      .then((data) => {
        if (mounted) setAnimationData(data);
      })
      .catch(() => {
        if (mounted) setHasError(true);
      });
    return () => { mounted = false; };
  }, [config.src]);

  if (!animationData || hasError) return null;

  return (
    <AnimatePresence>
      {isSpinning && (
        <motion.div
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0, y: -10 }}
          transition={{ duration: 0.4, delay: config.delay, type: 'spring', stiffness: 300, damping: 20 }}
          className={`z-30 pointer-events-none flex flex-col items-center ${config.position}`}
        >
          {/* Speech Bubble */}
          {config.bubble && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: config.delay + 0.4, type: 'spring', stiffness: 200 }}
              className="mb-1 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl shadow-lg border border-slate-100 text-xs font-bold text-slate-700 relative whitespace-nowrap"
            >
              <span className="relative z-10">{config.bubble}</span>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/95 rotate-45 border-r border-b border-slate-100" />
            </motion.div>
          )}

          {/* Lottie Animation */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 + config.delay, ease: 'easeInOut' }}
            className={`${config.size} drop-shadow-lg`}
            style={config.flipX ? { transform: 'scaleX(-1)' } : undefined}
          >
            <LottieComponent animationData={animationData} loop className="w-full h-full" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function CheerCharacters({ isSpinning }: { isSpinning: boolean }) {
  return (
    <>
      {CHEER_CHARACTERS.map((config, i) => (
        <SingleCheer key={i} config={config} isSpinning={isSpinning} />
      ))}
    </>
  );
}
