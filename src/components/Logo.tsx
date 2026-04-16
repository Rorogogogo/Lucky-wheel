import { motion } from 'framer-motion';

export function Logo({ className = "" }: { className?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center justify-center gap-4 ${className}`}
    >
      <div className="relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
        {/* Background Energy Aura */}
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: 360 
          }}
          transition={{ 
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 20, repeat: Infinity, ease: "linear" }
          }}
          className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-blue-400/20 rounded-full blur-xl"
        />

        {/* The Stylized Clover-Wheel Icon */}
        <svg viewBox="0 0 100 100" className="relative z-10 w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Ring */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logoGradient)" strokeWidth="1.5" strokeDasharray="4 2" className="opacity-40" />
          
          {/* Clover Leaves (Wheel Slices) */}
          <g transform="translate(50, 50)">
            {[0, 90, 180, 270].map((angle) => (
              <motion.path
                key={angle}
                d="M0,0 Q-15,-25 0,-35 Q15,-25 0,0"
                fill="url(#logoGradient)"
                transform={`rotate(${angle})`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: angle / 360 + 0.2 }}
              />
            ))}
          </g>

          {/* Center Gem */}
          <motion.circle
            cx="50"
            cy="50"
            r="6"
            fill="white"
            filter="url(#glow)"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Sparkles */}
          <motion.path 
            d="M85,25 L88,32 L95,35 L88,38 L85,45 L82,38 L75,35 L82,32 Z" 
            fill="#fbbf24"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
        </svg>
      </div>

      <div className="flex flex-col items-start leading-tight">
        <motion.span 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-indigo-500 font-bold text-sm md:text-base tracking-[0.2em] uppercase"
        >
          Miss Chen's
        </motion.span>
        <motion.div 
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col"
        >
          <span className="text-3xl md:text-5xl font-black text-slate-800 tracking-tighter italic">
            LUCKY<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">WHEEL</span>
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
