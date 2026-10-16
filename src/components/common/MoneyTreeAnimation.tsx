import React, { useState, useEffect } from 'react';
import { Sparkles, Coins, RefreshCw, Sprout, Heart, Droplets } from 'lucide-react';
const characterMoneyTreeImg = '/src/assets/images/character_plants_money_tree_1792166280252.jpg';

interface MoneyTreeAnimationProps {
  className?: string;
  variant?: 'fullscreen' | 'compact' | 'split';
  showControls?: boolean;
}

export const MoneyTreeAnimation: React.FC<MoneyTreeAnimationProps> = ({
  className = '',
  variant = 'fullscreen',
  showControls = true,
}) => {
  // Growth animation stages: 0 = planting, 1 = sprout, 2 = growing tree, 3 = blooming coins, 4 = golden wealth harvest
  const [stage, setStage] = useState<number>(3);
  const [isWatering, setIsWatering] = useState<boolean>(false);
  const [coinCount, setCoinCount] = useState<number>(1042);
  const [floatingSparkles, setFloatingSparkles] = useState<
    Array<{ id: number; x: number; y: number; size: number; delay: number; duration: number; symbol: string }>
  >([]);

  // Initialize ambient floating particles
  useEffect(() => {
    const symbols = ['₹', '$', '✦', '★', '●', '✨'];
    const particles = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      y: Math.random() * 85 + 5,
      size: Math.floor(Math.random() * 12) + 12,
      delay: Math.random() * 4,
      duration: Math.random() * 4 + 4,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
    }));
    setFloatingSparkles(particles);
  }, []);

  // Growth cycle loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCoinCount((prev) => prev + Math.floor(Math.random() * 5) + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const triggerWatering = () => {
    setIsWatering(true);
    setCoinCount((prev) => prev + 50);
    setStage(0);
    setTimeout(() => setStage(1), 600);
    setTimeout(() => setStage(2), 1400);
    setTimeout(() => {
      setStage(3);
      setIsWatering(false);
    }, 2400);
  };

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      aria-hidden="true"
    >
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-400/10 blur-[100px] pointer-events-none" />

      {/* Main Illustration Container */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {/* Glowing Frame with Character & Money Tree */}
        <div className="relative max-w-lg w-full rounded-3xl overflow-hidden border border-emerald-500/30 shadow-2xl shadow-emerald-950/50 bg-gradient-to-b from-purple-950/40 via-slate-950/60 to-emerald-950/40 backdrop-blur-md group">
          {/* Base High-Resolution Art of Character Planting Tree */}
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={characterMoneyTreeImg}
              alt="Character planting wealth tree blooming with gold coins"
              className="w-full h-full object-cover object-center transform transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            {/* Vignette & Soft Gradient Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-950/30 via-transparent to-emerald-950/30" />

            {/* Dynamic Coin Bloom Layer (Hovering over the tree) */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Pulsing Wealth Star on the tree peak */}
              <div className="absolute top-[22%] right-[32%] flex items-center justify-center">
                <span className="relative flex h-8 w-8">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
                  <span className="relative inline-flex rounded-full h-8 w-8 bg-amber-400/90 text-amber-950 font-black text-xs items-center justify-center shadow-lg shadow-amber-400/50">
                    ₹
                  </span>
                </span>
              </div>

              {/* Extra blooming gold coins with organic floating bounce */}
              <div className="absolute top-[28%] right-[22%] animate-bounce [animation-duration:2.8s]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-amber-950 font-extrabold text-xs flex items-center justify-center shadow-md shadow-amber-500/40 border border-yellow-200">
                  $
                </div>
              </div>

              <div className="absolute top-[38%] right-[38%] animate-bounce [animation-duration:3.4s]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 text-amber-900 font-bold text-[10px] flex items-center justify-center shadow-md shadow-amber-500/30 border border-yellow-200">
                  ₹
                </div>
              </div>

              <div className="absolute top-[32%] right-[45%] animate-bounce [animation-duration:2.2s]">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-amber-900 font-bold text-[10px] flex items-center justify-center shadow-md shadow-amber-400/40 border border-yellow-100">
                  $
                </div>
              </div>

              {/* Character planting sparkles near the soil */}
              <div className="absolute bottom-[24%] left-[45%] animate-pulse">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/50 backdrop-blur-sm text-[10px] font-bold text-emerald-200 shadow-sm">
                  <Sprout className="w-3 h-3 text-emerald-300" />
                  <span>Seed Rooted</span>
                </div>
              </div>
            </div>

            {/* Ambient Rising Wealth Particles */}
            {floatingSparkles.map((p) => (
              <div
                key={p.id}
                className="absolute text-amber-300 font-bold pointer-events-none transition-all"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  fontSize: `${p.size}px`,
                  opacity: 0.7,
                  animation: `floatUp ${p.duration}s infinite ease-in-out`,
                  animationDelay: `${p.delay}s`,
                  textShadow: '0 0 8px rgba(251, 191, 36, 0.8)',
                }}
              >
                {p.symbol}
              </div>
            ))}
          </div>

          {/* Bottom Card Narrative & Interaction */}
          <div className="p-4 sm:p-5 bg-slate-950/80 border-t border-emerald-500/20 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Planting Financial Growth</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h4>
              </div>
              <p className="text-[11px] text-slate-300 max-w-xs leading-relaxed">
                Plant your savings today. Watch your investments grow into a flourishing money tree with daily compounding.
              </p>
            </div>

            {showControls && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={triggerWatering}
                  disabled={isWatering}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  title="Nurture your money tree"
                >
                  <Droplets className={`w-3.5 h-3.5 text-cyan-200 ${isWatering ? 'animate-bounce' : ''}`} />
                  <span>{isWatering ? 'Watering...' : 'Nurture Tree'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global CSS for particle animation */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) rotate(15deg);
            opacity: 0.9;
          }
          100% {
            transform: translateY(-40px) rotate(-10deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
