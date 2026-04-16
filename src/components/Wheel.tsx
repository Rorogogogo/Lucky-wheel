import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WheelItem } from '../hooks/useLuckyWheel';
import { useWheelSound } from '../hooks/useWheelSound';
import { MapPin, Sparkles } from 'lucide-react';
import { CheerCharacters } from './CheerCharacter';

const SPIN_DURATION = 8000; // ms — total spin time

interface WheelProps {
  items: WheelItem[];
  spinParams: { isSpinning: boolean; targetId: string | null; spinCount: number };
  onStop: (winner: WheelItem) => void;
}

export function Wheel({ items, spinParams, onStop }: WheelProps) {
  const [rotation, setRotation] = useState(0);
  const isInitialMount = useRef(true);
  const spinTimeout = useRef<number | null>(null);
  const rAFRef = useRef<number | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const { playWin, playTick } = useWheelSound();

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (spinParams.isSpinning && items.length > 0) {
      let targetIndex = -1;

      if (spinParams.targetId) {
        targetIndex = items.findIndex((i) => i.id === spinParams.targetId);
      }
      if (targetIndex === -1) {
        targetIndex = Math.floor(Math.random() * items.length);
      }

      const winner = items[targetIndex];
      const sliceAngle = 360 / items.length;

      // Exact angle needed to land the target slice under the pointer (top)
      const targetAngle = 360 - (targetIndex * sliceAngle + sliceAngle / 2);

      // 8 full dramatic spins + the target angle
      const fullSpins = 360 * 8;
      const newRotation = rotation + fullSpins + (targetAngle - (rotation % 360));

      // Slight random wobble inside the slice (feels natural, not robotic)
      const noise = (Math.random() - 0.5) * (sliceAngle * 0.6);
      const finalRotation = newRotation + noise;

      setRotation(finalRotation);

      // Accurately track visual rotation with requestAnimationFrame to play ticks
      let lastAngle = rotation % 360;
      if (lastAngle < 0) lastAngle += 360;
      let currentTotalRotation = rotation;
      
      const trackRotation = () => {
        if (!wheelRef.current) return;
        
        const style = window.getComputedStyle(wheelRef.current);
        const transform = style.getPropertyValue('transform');
        
        if (transform && transform !== 'none') {
          const values = transform.split('(')[1].split(')')[0].split(',');
          const a = parseFloat(values[0]);
          const b = parseFloat(values[1]);
          let angle = Math.atan2(b, a) * (180 / Math.PI);
          if (angle < 0) angle += 360;

          let delta = angle - lastAngle;
          if (delta < -180) delta += 360;
          
          if (delta > 0) {
            const previousSlice = Math.floor(currentTotalRotation / sliceAngle);
            currentTotalRotation += delta;
            const currentSlice = Math.floor(currentTotalRotation / sliceAngle);

            if (currentSlice > previousSlice) {
              const progress = Math.min(1, (currentTotalRotation - rotation) / (finalRotation - rotation));
              const volume = Math.max(0.1, 0.4 - progress * 0.3);
              playTick(volume);
            }
          }
          lastAngle = angle;
        }
        rAFRef.current = requestAnimationFrame(trackRotation);
      };
      
      rAFRef.current = requestAnimationFrame(trackRotation);

      if (spinTimeout.current) clearTimeout(spinTimeout.current);
      spinTimeout.current = window.setTimeout(() => {
        if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
        playWin();
        onStop(winner);
      }, SPIN_DURATION);
    }

    return () => {
      if (spinTimeout.current) clearTimeout(spinTimeout.current);
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
    };
  }, [spinParams.spinCount]);

  if (items.length === 0) {
    return (
      <div className="w-full aspect-square mx-auto flex items-center justify-center rounded-full border-4 border-dashed border-slate-200 text-slate-400">
        No items on the wheel
      </div>
    );
  }

  const radius = 200;
  const cx = radius;
  const cy = radius;
  const sliceAngle = 360 / items.length;

  const createSlicePath = (index: number) => {
    const startAngle = index * sliceAngle - 90;
    const endAngle = startAngle + sliceAngle;
    const startRad = (Math.PI / 180) * startAngle;
    const endRad = (Math.PI / 180) * endAngle;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="relative w-full aspect-square mx-auto">
      {/* Cheer Characters — scattered around the wheel */}
      <CheerCharacters isSpinning={spinParams.isSpinning} />

      {/* Energy Aura Ring around the wheel */}
      <AnimatePresence>
        {spinParams.isSpinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-[-40px] z-0"
          >
            {/* Rotating blurred ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/30 via-blue-500/10 to-indigo-500/30 blur-[40px] animate-spin-slow" />
            <div className="absolute inset-0 rounded-full border-[2px] border-indigo-500/20 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Premium Sparkle Particles */}
      <AnimatePresence>
        {spinParams.isSpinning && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0.5],
                  x: Math.random() * 500 - 250,
                  y: Math.random() * 500 - 250,
                }}
                transition={{ 
                  duration: 2 + Math.random(), 
                  repeat: Infinity, 
                  delay: i * 0.2,
                  ease: "easeOut"
                }}
                className="absolute left-1/2 top-1/2 z-30 pointer-events-none"
              >
                <Sparkles className="w-5 h-5 text-yellow-400/60 fill-yellow-200/30 blur-[0.5px]" />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Outer glow — intensifies while spinning */}
      <div
        className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${
          spinParams.isSpinning
            ? 'shadow-[0_0_80px_20px_rgba(99,102,241,0.2)]'
            : 'shadow-[0_0_20px_rgba(0,0,0,0.08)]'
        }`}
      />

      {/* Counter-clockwise laser sweep — rim only, center is masked out by the wheel itself */}
      {spinParams.isSpinning && (
        <div className="absolute inset-[-6px] rounded-full pointer-events-none z-0">
          {/* Primary purple laser beam rotating on the rim */}
          <div
            className="laser-sweep absolute inset-0 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(139,92,246,0.0) 180deg, rgba(139,92,246,0.7) 310deg, rgba(255,255,255,1) 355deg, rgba(139,92,246,0.0) 360deg)',
            }}
          />
        </div>
      )}
      
      {/* Pointer with vibration animation */}
      <motion.div 
        animate={spinParams.isSpinning ? {
          rotate: [180, 183, 177, 180],
          y: [0, -1, 1, 0],
        } : { rotate: 180, y: 0 }}
        transition={spinParams.isSpinning ? {
          repeat: Infinity,
          duration: 0.1,
          ease: "linear"
        } : { duration: 0.3 }}
        className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-md origin-bottom"
      >
        <MapPin className="w-10 h-10 text-destructive fill-destructive" />
      </motion.div>

      {/* Wheel */}
      <div className="relative w-full h-full rounded-full overflow-hidden border-[6px] border-white shadow-inner bg-white">
        <div
          ref={wheelRef}
          className="w-full h-full relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            // 8s with a smooth, natural deceleration
            transition: spinParams.isSpinning
              ? `transform ${SPIN_DURATION}ms cubic-bezier(0.1, 0, 0.2, 1)`
              : 'transform 0.3s ease-out',
          }}
        >
          {items.length === 1 ? (
            <div className="w-full h-full rounded-full" style={{ backgroundColor: items[0].color }}>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl drop-shadow-md">
                {items[0].label}
              </span>
            </div>
          ) : (
            <svg viewBox={`0 0 ${radius * 2} ${radius * 2}`} className="w-full h-full">
              {items.map((item, i) => {
                const path = createSlicePath(i);
                const midAngle = i * sliceAngle - 90 + sliceAngle / 2;
                const textRadius = radius * 0.60;
                const tx = cx + textRadius * Math.cos((Math.PI / 180) * midAngle);
                const ty = cy + textRadius * Math.sin((Math.PI / 180) * midAngle);
                return (
                  <g key={item.id}>
                    <path d={path} fill={item.color} stroke="#ffffff" strokeWidth="2" />
                    <text
                      x={tx}
                      y={ty}
                      fill="white"
                      fontSize={items.length > 12 ? '13' : items.length > 8 ? '17' : '22'}
                      fontWeight="bold"
                      alignmentBaseline="middle"
                      textAnchor="middle"
                      transform={`rotate(${midAngle}, ${tx}, ${ty})`}
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* Center pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-slate-200 z-10 shadow-sm" />
    </div>
  );
}
