import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type WheelItem } from '../hooks/useLuckyWheel';
import { useWheelSound } from '../hooks/useWheelSound';
import { Sparkles } from 'lucide-react';
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
  const pointerRef = useRef<HTMLDivElement>(null);
  const laserRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
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

      const targetAngle = 360 - (targetIndex * sliceAngle + sliceAngle / 2);
      const fullSpins = 360 * 8;
      const newRotation = rotation + fullSpins + (targetAngle - (rotation % 360));
      const noise = (Math.random() - 0.5) * (sliceAngle * 0.6);
      const finalRotation = newRotation + noise;

      setRotation(finalRotation);

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

            // Jitter the center hub
            if (pointerRef.current) {
              const sliceProgress = (currentTotalRotation % sliceAngle) / sliceAngle;
              const tiltScale = 8; 
              let pointerTilt = 0;
              
              if (sliceProgress > 0.8) {
                pointerTilt = ((sliceProgress - 0.8) / 0.2) * tiltScale;
              } else if (sliceProgress < 0.2) {
                pointerTilt = ((0.2 - sliceProgress) / 0.2) * tiltScale;
              }
              pointerRef.current.style.transform = `rotate(${pointerTilt}deg)`;
            }

            if (laserRef.current) {
              laserRef.current.style.transform = `rotate(${-currentTotalRotation * 1.5}deg)`;
            }
            if (auraRef.current) {
              auraRef.current.style.transform = `rotate(${currentTotalRotation * 0.5}deg)`;
            }

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
        if (pointerRef.current) pointerRef.current.style.transform = 'rotate(0deg)';
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
    <div className="relative w-full aspect-square mx-auto flex items-center justify-center">
      {/* Anime Cheer Characters */}
      <CheerCharacters isSpinning={spinParams.isSpinning} />

      {/* Energy Aura Ring */}
      <AnimatePresence>
        {spinParams.isSpinning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-[-40px] z-0 pointer-events-none"
          >
            <div ref={auraRef} className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500/30 via-blue-500/10 to-indigo-500/30 blur-[40px]" />
            <div className="absolute inset-0 rounded-full border-[2px] border-indigo-500/20 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparkle Particles */}
      <AnimatePresence>
        {spinParams.isSpinning && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 400 }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                className="absolute left-1/2 top-1/2"
              >
                <Sparkles className="w-5 h-5 text-yellow-400/60" />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Outer glow */}
      <div className={`absolute inset-0 rounded-full transition-all duration-700 pointer-events-none ${spinParams.isSpinning ? 'shadow-[0_0_80px_20px_rgba(99,102,241,0.2)]' : 'shadow-[0_0_20px_rgba(0,0,0,0.08)]'}`} />

      {/* Laser sweep */}
      {spinParams.isSpinning && (
        <div ref={laserRef} className="absolute inset-[-6px] rounded-full pointer-events-none z-0">
          <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(139,92,246,0.0) 180deg, rgba(139,92,246,0.7) 310deg, rgba(255,255,255,1) 355deg, rgba(139,92,246,0.0) 360deg)' }} />
        </div>
      )}
      
      {/* Pointer Hub — mathematically centered using flex-center container */}
      <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
        <div 
          ref={pointerRef}
          className="relative flex items-center justify-center"
          style={{ width: '44px', height: '44px' }}
        >
          {/* The Needle — Bolder, shorter "Blade" style pointing UP */}
          <div 
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2"
            style={{ height: '130px', width: '40px' }}
          >
            <svg width="40" height="130" viewBox="0 0 40 130" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]">
              {/* Bold tapered blade body */}
              <path d="M20 0L38 120C38 125 30 130 20 130C10 130 2 125 2 120L20 0Z" fill="#ef4444" />
              {/* Metallic highlight edge */}
              <path d="M20 5L34 118C34 118 28 124 20 124V5Z" fill="white" fillOpacity="0.2" />
              {/* Tip highlight */}
              <path d="M20 0L24 20L20 18L16 20L20 0Z" fill="white" fillOpacity="0.3" />
            </svg>
          </div>

          {/* The Hub Base (Glowing Pivot) */}
          <div className="absolute inset-0 bg-white rounded-full border-4 border-slate-200 shadow-xl flex items-center justify-center overflow-hidden">
            {/* Inner details for depth */}
            <div className="w-full h-full bg-gradient-to-b from-white to-slate-100 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-slate-400 shadow-inner border border-white/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-600 opacity-50" />
              </div>
            </div>
          </div>
          
          {/* Center Hub Glow Aura */}
          <div className="absolute inset-[-12px] rounded-full bg-indigo-500/10 blur-xl -z-10 animate-pulse" />
        </div>
      </div>

      {/* Wheel */}
      <div className="relative w-full h-full rounded-full overflow-hidden border-[10px] border-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] bg-white">
        <div
          ref={wheelRef}
          className="w-full h-full relative"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinParams.isSpinning
              ? `transform ${SPIN_DURATION}ms cubic-bezier(0.1, 0, 0.2, 1)`
              : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
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
    </div>
  );
}
