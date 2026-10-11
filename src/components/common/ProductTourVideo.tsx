import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Calculator, 
  Layers, 
  CheckCircle2, 
  Copy, 
  Check, 
  Settings2, 
  Film, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProductTourVideoProps {
  onEnterApp?: () => void;
}

export const ProductTourVideo: React.FC<ProductTourVideoProps> = ({ onEnterApp }) => {
  const { enterTestMode, openAuthModal } = useAuth();

  // Video playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds (0 to 60)
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [showUrlConfig, setShowUrlConfig] = useState<boolean>(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string>(() => {
    return localStorage.getItem('fix_landing_custom_video_url') || '';
  });
  const [inputUrl, setInputUrl] = useState<string>(customVideoUrl);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [showSpecsGuide, setShowSpecsGuide] = useState<boolean>(false);

  const totalDuration = 60; // 60-second tour

  // Chapter markers
  const chapters = [
    { id: 0, title: 'Consolidated Wealth & Net Worth', start: 0, duration: 15, tag: '₹10L Family Portfolio' },
    { id: 1, title: 'Zero-Knowledge Privacy Vault', start: 15, duration: 15, tag: 'Local-First' },
    { id: 2, title: '12+ SIP & FIRE Calculators', start: 30, duration: 15, tag: 'Compounding' },
    { id: 3, title: 'Age-Based Asset Allocation', start: 45, duration: 15, tag: 'Age 22-55+' },
  ];

  // Playback timer simulation
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 0.2;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Sync progress and active chapter
  useEffect(() => {
    const progress = (currentTime / totalDuration) * 100;
    setCurrentProgress(progress);

    if (currentTime < 15) setActiveChapter(0);
    else if (currentTime < 30) setActiveChapter(1);
    else if (currentTime < 45) setActiveChapter(2);
    else setActiveChapter(3);
  }, [currentTime]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const target = Math.max(0, Math.min(totalDuration, pos * totalDuration));
    setCurrentTime(target);
  };

  const jumpToChapter = (startSec: number) => {
    setCurrentTime(startSec);
    setIsPlaying(true);
  };

  const handleSaveVideoUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputUrl.trim();
    setCustomVideoUrl(clean);
    localStorage.setItem('fix_landing_custom_video_url', clean);
    setShowUrlConfig(false);
  };

  const copyPromptText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Convert YouTube/Vimeo links to embed if present
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1`;
    }
    return url;
  };

  const embedUrl = getEmbedUrl(customVideoUrl);

  return (
    <section 
      id="product-tour-video" 
      className="py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50/80 to-white border-y border-slate-200/90 relative overflow-hidden"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 blur-[130px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold mb-4 shadow-xs">
            <Film className="w-3.5 h-3.5 text-emerald-600" />
            <span>Product Tour · 60-Second Walkthrough</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            See How FIX Wealth Powers Your Financial Life
          </h2>
          
          <p className="mt-3.5 text-sm sm:text-base text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto">
            Experience the real-time ₹ INR dashboard, local-first privacy vault, SIP wealth compounding tools, and life-stage asset allocation in under a minute.
          </p>
        </div>

        {/* Video Player Card Frame */}
        <div className="relative rounded-3xl border border-slate-200/90 bg-slate-950 p-2 sm:p-3 shadow-2xl shadow-slate-900/15 overflow-hidden">
          
          {/* Top Bar of Video Frame */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-2xl mb-2 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 font-bold text-slate-200 hidden sm:inline text-[11px]">
                FIX Wealth Video Showcase · 4K 60fps
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUrlConfig(!showUrlConfig)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline cursor-pointer"
                title="Embed your custom YouTube, Vimeo, or MP4 video URL"
              >
                <Settings2 className="w-3 h-3 text-cyan-400" />
                <span>{customVideoUrl ? 'Edit Video Link' : 'Add Custom Video Link'}</span>
              </button>

              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                {formatSec(currentTime)} / {formatSec(totalDuration)}
              </span>
            </div>
          </div>

          {/* Video Container (16:9 Aspect Ratio) */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center">
            
            {/* Case A: Custom Embedded Video URL (YouTube, Vimeo, or MP4) */}
            {customVideoUrl ? (
              embedUrl && (embedUrl.includes('youtube.com') || embedUrl.includes('vimeo.com')) ? (
                <iframe
                  src={embedUrl}
                  title="FIX Wealth Official Walkthrough"
                  className="w-full h-full border-0 rounded-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={customVideoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover rounded-2xl"
                />
              )
            ) : (
              /* Case B: Interactive Cinematic Simulated Product Walkthrough */
              <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-[#0b1329] to-slate-900 text-white flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden">
                
                {/* Background Grid Pattern */}
                <div 
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #10b981 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }}
                />

                {/* Top Scene Watermark & Chapter Name */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      ₹
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">
                        Chapter 0{activeChapter + 1} of 04
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                        {chapters[activeChapter].title}
                      </h4>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-slate-300 backdrop-blur-md hidden sm:inline-block">
                    {chapters[activeChapter].tag}
                  </span>
                </div>

                {/* Center Dynamic Visual Simulation per Chapter */}
                <div className="relative z-10 my-auto flex items-center justify-center py-4">
                  
                  {/* Chapter 1: Net Worth & Consolidated Portfolio */}
                  {activeChapter === 0 && (
                    <div className="text-center animate-in fade-in zoom-in-95 duration-500 max-w-lg">
                      <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                        Consolidated Indian Family Portfolio
                      </span>
                      <div className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono text-emerald-400 tracking-tight drop-shadow-md">
                        ₹10,00,000
                      </div>
                      <div className="mt-2 text-xs sm:text-sm font-semibold text-emerald-300 flex items-center justify-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span>Monthly Salary ₹70,000 · Mutual Funds &amp; EPF/PPF Integrated</span>
                      </div>

                      {/* Mini Instrument Breakdown Badges */}
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono">
                        <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-cyan-300">
                          HDFC Bank: ₹40,000
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-teal-300">
                          ICICI FD: ₹1,50,000
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-blue-300">
                          Nifty 50: ₹2,50,000
                        </span>
                        <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-amber-300">
                          Gold SGB: ₹70,000
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Chapter 2: Zero-Knowledge Privacy Vault */}
                  {activeChapter === 1 && (
                    <div className="text-center animate-in fade-in zoom-in-95 duration-500 max-w-lg">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/20 animate-pulse">
                        <ShieldCheck className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                        100% Zero-Knowledge Client Vault
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Financial ledger, bank account balances, and asset transactions are stored strictly in your device's browser memory. Zero financial data sent to remote servers.
                      </p>
                    </div>
                  )}

                  {/* Chapter 3: 12+ Financial Calculators */}
                  {activeChapter === 2 && (
                    <div className="text-center animate-in fade-in zoom-in-95 duration-500 max-w-lg">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-3 shadow-lg shadow-blue-500/20">
                        <Calculator className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                        Interactive Wealth &amp; FIRE Simulators
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Simulate ₹15,000/mo SIP compounding to ₹1.82 Crores, plan early retirement (FIRE), compare loan prepayments, and model SWP pensions.
                      </p>
                    </div>
                  )}

                  {/* Chapter 4: Dynamic Age-Based Asset Allocation */}
                  {activeChapter === 3 && (
                    <div className="text-center animate-in fade-in zoom-in-95 duration-500 max-w-lg">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-3 shadow-lg shadow-indigo-500/20">
                        <Layers className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                        Life-Stage Asset Allocation Engine
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Tailored risk models across age milestones: 22 (Aggressive Growth), 28 (Family Foundation), 35 (Core Compounding), 45 (Capital Preservation), 55+ (Retirement Runway).
                      </p>
                    </div>
                  )}

                </div>

                {/* Bottom Overlay Controls & Direct Website Jump CTA */}
                <div className="relative z-10 flex items-center justify-between gap-3 pt-3 border-t border-white/10 flex-wrap sm:flex-nowrap">
                  
                  {/* Play / Pause Toggle Button */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md shadow-emerald-600/30 active:scale-95 cursor-pointer"
                      title={isPlaying ? 'Pause walkthrough' : 'Play walkthrough'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTime(0);
                        setIsPlaying(true);
                      }}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title="Replay from start"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                      title={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* DIRECT BUTTON THAT JUMPS TO THE LIVE WEBSITE / DASHBOARD */}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (onEnterApp) {
                          onEnterApp();
                        } else {
                          enterTestMode('user');
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title="Enter the live website with sample ₹10 Lakh portfolio"
                    >
                      <span>Try Live Website</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* Video Seeker Timeline Bar */}
          {!customVideoUrl && (
            <div 
              onClick={handleSeek}
              className="mt-2.5 h-2 w-full bg-slate-800 rounded-full cursor-pointer relative overflow-hidden group"
            >
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 transition-all duration-200 ease-linear"
                style={{ width: `${currentProgress}%` }}
              />
              {/* Chapter division markers */}
              <div className="absolute inset-0 flex justify-between pointer-events-none px-0.5">
                <span className="w-0.5 h-full bg-white/30" />
                <span className="w-0.5 h-full bg-white/30" style={{ left: '25%' }} />
                <span className="w-0.5 h-full bg-white/30" style={{ left: '50%' }} />
                <span className="w-0.5 h-full bg-white/30" style={{ left: '75%' }} />
              </div>
            </div>
          )}

          {/* Chapter Selectors Bar */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {chapters.map((ch) => {
              const isSelected = activeChapter === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => jumpToChapter(ch.start)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-900 border-emerald-500/50 shadow-md' 
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className={isSelected ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                      0{ch.id + 1} · {formatSec(ch.start)}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
                  </div>
                  <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {ch.title}
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Custom Video URL Configuration Modal/Drawer */}
        {showUrlConfig && (
          <div className="mt-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSaveVideoUrl} className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Custom Video Embed / Direct MP4 URL
                </label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                />
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto pt-4 sm:pt-5 w-full sm:w-auto">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Save Video
                </button>
                {customVideoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomVideoUrl('');
                      setInputUrl('');
                      localStorage.removeItem('fix_landing_custom_video_url');
                      setShowUrlConfig(false);
                    }}
                    className="px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Reset to Tour
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowUrlConfig(false)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            PROMPT GUIDE & CREATIVE SPECIFICATIONS DRAWER (Requested by User)
            Gives the user the exact prompts to generate a video for this website!
            ========================================================================= */}
        <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-sm">
          
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Video Creator Blueprint &amp; Advertising Prompts
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Copy-pasteable prompts and exact design specifications to create or generate a video for FIX Wealth
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSpecsGuide(!showSpecsGuide)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-50"
            >
              <span>{showSpecsGuide ? 'Hide Video Prompts' : 'View Full Video Prompts & Specs'}</span>
            </button>
          </div>

          {showSpecsGuide && (
            <div className="mt-6 space-y-6 animate-in fade-in duration-200">
              
              {/* 1. Design System & Theme Specs */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Exact Website Theme, Colors &amp; Typography Specs</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Primary Brand Accent</span>
                    <span className="font-mono font-bold text-emerald-600">#059669 / #10B981</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">Emerald Green (Indian Wealth)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Deep Slate &amp; Tech Cyan</span>
                    <span className="font-mono font-bold text-slate-900">#0F172A / #06B6D4</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">Command center chrome</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Typography Family</span>
                    <span className="font-mono font-bold text-slate-900">Plus Jakarta Sans</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">Mono: JetBrains Mono (Numbers)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">Currency Standard</span>
                    <span className="font-mono font-bold text-slate-900">₹ INR (Lakhs &amp; Crores)</span>
                    <span className="text-[11px] text-slate-600 block mt-0.5">₹10,00,000 / ₹1.82 Cr notation</span>
                  </div>
                </div>
              </div>

              {/* 2. Ready-to-Use AI Video Generation Prompt */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase font-mono tracking-wider">
                    Prompt 1: 4K Commercial Trailer (Sora / Runway Gen-3 / Kling Prompt)
                  </span>
                  <button
                    type="button"
                    onClick={() => copyPromptText(
                      `Cinematic 4K commercial advertisement for modern fintech app 'FIX Wealth'. A sleek laptop displaying a high-contrast financial dashboard with emerald green (#10B981) glowing accents, clean typography (Plus Jakarta Sans), and Indian Rupee (₹) net worth ticker reading '₹10,00,000'. Camera smoothly pushes in over dynamic 3D financial charts, mutual fund growth curves, and a futuristic holographic privacy shield with text 'Zero-Knowledge Client Vault'. High-tech clean daylight aesthetic, studio lighting, smooth motion graphics, hyper-detailed UI screen recordings, Apple-style product video commercial.`,
                      'prompt-sora'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedPromptId === 'prompt-sora' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPromptId === 'prompt-sora' ? 'Copied!' : 'Copy Prompt'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 font-mono leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">
                  Cinematic 4K commercial advertisement for modern fintech app 'FIX Wealth'. A sleek laptop displaying a high-contrast financial dashboard with emerald green (#10B981) glowing accents, clean typography (Plus Jakarta Sans), and Indian Rupee (₹) net worth ticker reading '₹10,00,000'. Camera smoothly pushes in over dynamic 3D financial charts, mutual fund growth curves, and a futuristic holographic privacy shield with text 'Zero-Knowledge Client Vault'. High-tech clean daylight aesthetic, studio lighting, smooth motion graphics, hyper-detailed UI screen recordings, Apple-style product video commercial.
                </p>
              </div>

              {/* 3. Social Media Short Form Video Prompt (9:16 Instagram Reel / YouTube Short) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Prompt 2: 9:16 Vertical Reel / TikTok Commercial Script
                  </span>
                  <button
                    type="button"
                    onClick={() => copyPromptText(
                      `[Hook 0-3s]: Fast zoom-in on phone screen showing consolidated net worth ₹10,00,000. Voiceover: 'Stop using five messy spreadsheets to track your Indian investments.'\n[Problem 3-8s]: Chaos of EPF, mutual funds, gold, and car loans.\n[Solution 8-20s]: Seamless screen recording of FIX Wealth app in emerald theme, auto-calculating ₹15k monthly SIP compounding to 1.8 Cr.\n[Privacy 20-25s]: Hologram lock icon: '100% Zero-knowledge local vault, zero data sent to servers.'\n[CTA 25-30s]: 'Try the live demo in 1 click at fixwealth.com. Link in bio.'`,
                      'prompt-reel'
                    )}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedPromptId === 'prompt-reel' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPromptId === 'prompt-reel' ? 'Copied!' : 'Copy Script'}</span>
                  </button>
                </div>

                <pre className="text-xs text-slate-700 font-mono bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
{`[Hook 0-3s]: Fast zoom-in on phone screen showing consolidated net worth ₹10,00,000. Voiceover: 'Stop using five messy spreadsheets to track your Indian investments.'
[Problem 3-8s]: Chaos of EPF, mutual funds, gold, and car loans.
[Solution 8-20s]: Seamless screen recording of FIX Wealth app in emerald theme, auto-calculating ₹15k monthly SIP compounding to 1.8 Cr.
[Privacy 20-25s]: Hologram lock icon: '100% Zero-knowledge local vault, zero data sent to servers.'
[CTA 25-30s]: 'Try the live demo in 1 click at fixwealth.com. Link in bio.'`}
                </pre>
              </div>

            </div>
          )}

        </div>

      </div>
    </section>
  );
};
