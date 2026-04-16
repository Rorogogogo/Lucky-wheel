import React from 'react';
import { motion } from 'framer-motion';

export const AnimeCelebrationAsset = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Background Burst/Sunlight Effect */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-[200%] bg-gradient-to-t from-transparent via-white/40 to-transparent"
            style={{ transform: `rotate(${i * 30}deg)` }}
          />
        ))}
      </motion.div>

      {/* Stylized Anime "Speed Lines" Burst */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1.5, opacity: 0.3 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute w-full h-full border-[20px] border-dashed border-white/30 rounded-full"
      />

      {/* The "Anime Character" Silhouette/Stylized Form */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 100 }}
        className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center"
      >
        {/* Stylized Cheering Figure using Shapes */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
          {/* Cape/Effect flow */}
          <motion.path
            d="M40,160 Q100,180 160,160 Q180,100 160,40 Q100,20 40,40 Q20,100 40,160"
            fill="rgba(255,255,255,0.2)"
            animate={{ 
              d: [
                "M40,160 Q100,180 160,160 Q180,100 160,40 Q100,20 40,40 Q20,100 40,160",
                "M45,155 Q105,175 165,155 Q185,95 165,35 Q105,15 45,35 Q25,95 45,155"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
          />
          
          {/* Heroic Body Silhouette */}
          <path d="M70,180 L130,180 L125,100 Q125,80 100,80 Q75,80 75,100 Z" fill="white" />
          
          {/* Head & Hair/Effect */}
          <circle cx="100" cy="65" r="25" fill="white" />
          <path d="M80,50 Q100,20 120,50 L100,45 Z" fill="white" />
          
          {/* Cheering Arms */}
          <motion.path 
            d="M75,100 L40,60" 
            stroke="white" 
            strokeWidth="12" 
            strokeLinecap="round" 
            animate={{ rotate: [-5, 5] }}
            transition={{ repeat: Infinity, duration: 0.5, repeatType: "mirror" }}
          />
          <motion.path 
            d="M125,100 L160,60" 
            stroke="white" 
            strokeWidth="12" 
            strokeLinecap="round"
            animate={{ rotate: [5, -5] }}
            transition={{ repeat: Infinity, duration: 0.5, repeatType: "mirror" }}
          />

          {/* Sparkles */}
          {[...Array(5)].map((_, i) => (
            <motion.circle
              key={i}
              r={2 + Math.random() * 3}
              fill="white"
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                x: [100, 100 + (Math.random() - 0.5) * 150],
                y: [100, 100 + (Math.random() - 0.5) * 150]
              }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
            />
          ))}
        </svg>

        {/* Dynamic Action Lines Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-12 bg-white/60"
              style={{ 
                left: '50%', 
                top: '50%', 
                transformOrigin: '0 0',
                transform: `rotate(${i * 45}deg) translateY(-80px)` 
              }}
              animate={{ height: [0, 48, 0], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
            />
          ))}
        </div>
      </motion.div>

      {/* Floating Japanese-style "Victory" Text Decoration */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-4 right-4 text-white/40 font-black text-6xl italic select-none pointer-events-none rotate-12"
      >
        WIN
      </motion.div>
    </div>
  );
};
