import React from 'react';
import { Sparkles, Sprout, Coins, ArrowUpRight } from 'lucide-react';
const characterMoneyTreeImg = '/src/assets/images/hand_planting_money_tree_1792250871534.jpg';

interface MoneyTreeBackgroundProps {
  opacity?: number;
  showArtBanner?: boolean;
  title?: string;
  subtitle?: string;
}

export const MoneyTreeBackground: React.FC<MoneyTreeBackgroundProps> = ({
  opacity = 0.55,
  showArtBanner = true,
  title = 'Every Seed Planted Grows a Forest',
  subtitle = 'Watch your wealth blossom with disciplined savings and compound growth.',
}) => {
  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
      aria-hidden="true"
    >
      {/* 1. Ambient Gradient Canvas with Lilac & Purple undertones */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#231540]/80 via-slate-950/90 to-[#0e2528]/80" />

      {/* 2. Soft Glowing Color Clouds */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-500/25 blur-[120px] animate-pulse" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-[130px]" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-amber-400/20 blur-[120px]" />

      {/* 3. Background Art of Hand Planting Money Tree */}
      {showArtBanner && (
        <div 
          className="absolute inset-0 flex items-center justify-center lg:justify-end lg:pr-12 pointer-events-none transition-all duration-700"
          style={{ opacity }}
        >
          <div className="relative w-full max-w-xl aspect-video lg:max-w-2xl rounded-3xl overflow-hidden border border-purple-500/30 shadow-2xl shadow-purple-950/40">
            <img
              src={characterMoneyTreeImg}
              alt="Hand planting money tree with gold coins"
              className="w-full h-full object-cover object-center filter brightness-95 contrast-105"
              referrerPolicy="no-referrer"
            />
            {/* Soft blend edges so it melts seamlessly into the background */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-slate-950/60" />

            {/* Glowing Golden Coin blooming on the top peak */}
            <div className="absolute top-[18%] left-[50%] -translate-x-1/2 flex items-center justify-center">
              <span className="relative flex h-8 w-8">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-8 w-8 bg-amber-400 text-amber-950 font-black text-xs items-center justify-center shadow-lg shadow-amber-400/60">
                  $
                </span>
              </span>
            </div>

            <div className="absolute top-[42%] left-[45%] animate-bounce [animation-duration:2.8s]">
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-[10px] flex items-center justify-center shadow-md shadow-amber-500/40 border border-yellow-200">
                ₹
              </div>
            </div>

            <div className="absolute top-[48%] left-[52%] animate-bounce [animation-duration:3.2s]">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-yellow-300 to-amber-400 text-amber-950 font-black text-[9px] flex items-center justify-center shadow-md shadow-amber-400/30 border border-yellow-200">
                $
              </div>
            </div>

            {/* Sprout badge near planting spot */}
            <div className="absolute bottom-[16%] left-[40%] flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-400/50 backdrop-blur-sm text-[10px] font-bold text-emerald-100 shadow-md">
              <Sprout className="w-3 h-3 text-emerald-300" />
              <span>Planting Wealth</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Drifting Golden Coins & Sparkles in the empty space */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating coins */}
        <div className="absolute top-[12%] left-[8%] animate-bounce [animation-duration:4s] text-amber-400/70 font-mono text-sm font-bold flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 backdrop-blur-xs">
          <Coins className="w-3.5 h-3.5 text-amber-300" />
          <span>+₹500 compound</span>
        </div>

        <div className="absolute bottom-[18%] left-[12%] animate-pulse text-emerald-400/70 font-mono text-xs font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 backdrop-blur-xs">
          <Sprout className="w-3 h-3 text-emerald-400" />
          <span>Rooted in discipline</span>
        </div>

        <div className="absolute top-[18%] right-[10%] animate-bounce [animation-duration:3.5s] text-amber-300/60 font-mono text-xs font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
          <span>₹10,42,931 tree blooming</span>
        </div>

        <div className="absolute bottom-[22%] right-[14%] animate-pulse text-indigo-300/60 font-mono text-xs font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
          <span>★ Long-Term Compounding</span>
        </div>

        {/* Ambient twinkling stars */}
        <div className="absolute top-[15%] left-[25%] text-amber-300/40 text-xs animate-ping">✦</div>
        <div className="absolute top-[45%] left-[5%] text-amber-300/30 text-sm animate-pulse">✨</div>
        <div className="absolute top-[75%] left-[20%] text-emerald-300/40 text-xs animate-ping [animation-duration:3s]">✦</div>
        <div className="absolute top-[25%] right-[25%] text-amber-300/40 text-xs animate-pulse">★</div>
        <div className="absolute top-[65%] right-[8%] text-amber-300/50 text-sm animate-bounce [animation-duration:2.8s]">✨</div>
      </div>
    </div>
  );
};
