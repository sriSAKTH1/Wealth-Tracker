import React from 'react';

interface FixWealthLogoProps {
  className?: string;
  size?: number | string;
  showRoots?: boolean;
  variant?: 'full' | 'icon' | 'badge';
  interactive?: boolean;
}

/**
 * FixWealthLogo Component
 * Features the signature golden coin with sprouting green three-leaf seedling
 * and deep symmetrical sage-green root canopy network underneath.
 * Background is 100% transparent (no white background artifact).
 */
export const FixWealthLogo: React.FC<FixWealthLogoProps> = ({
  className = 'w-10 h-10',
  showRoots = true,
  variant = 'full',
  interactive = true,
}) => {
  return (
    <svg
      viewBox={showRoots ? '0 0 512 512' : '150 30 212 260'}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none overflow-visible ${className} ${
        interactive ? 'group-hover:scale-105 transition-transform duration-300' : ''
      }`}
      aria-label="FIX Wealth Sprout & Coin Logo"
    >
      <defs>
        {/* Top Leaf Gradients */}
        <linearGradient id="leafLightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="40%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        <linearGradient id="leafDarkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="60%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>

        <linearGradient id="leafLeftGrad" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="45%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#86efac" />
        </linearGradient>

        <linearGradient id="leafRightGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="45%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>

        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="70%" stopColor="#166534" />
          <stop offset="100%" stopColor="#14532d" />
        </linearGradient>

        {/* Golden Coin Gradients */}
        <linearGradient id="coinTopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#fde047" />
          <stop offset="60%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="coinTopRimGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        <linearGradient id="coinBevelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="20%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="80%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        <linearGradient id="coinRibLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        <linearGradient id="coinRibDark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>

        {/* Roots Shadow & Sage Foliage Gradient */}
        <linearGradient id="rootNetworkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3d644d" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#4f7a5f" stopOpacity="0.75" />
          <stop offset="80%" stopColor="#608d72" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#7ba58c" stopOpacity="0.35" />
        </linearGradient>

        <radialGradient id="rootCenterAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.18" />
          <stop offset="70%" stopColor="#10b981" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>

        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ========================================================================= */}
      {/* 1. ROOT NETWORK CANOPY UNDERNEATH COIN (Spreading Foliage Roots)          */}
      {/* ========================================================================= */}
      {showRoots && (
        <g id="root-network" className="transition-opacity duration-300">
          {/* Subtle Ambient Underglow */}
          <ellipse cx="256" cy="360" rx="140" ry="100" fill="url(#rootCenterAura)" />

          {/* Symmetrical Root Branches & Leaves */}
          <g fill="url(#rootNetworkGrad)" stroke="none">
            {/* Central Root Trunk */}
            <path d="M 252,250 C 252,275 254,300 255,335 C 255.5,355 254,380 256,410 C 258,380 256.5,355 257,335 C 258,300 260,275 260,250 Z" />
            
            {/* Center Branch Leaves */}
            <path d="M 256,410 C 248,430 250,450 256,465 C 262,450 264,430 256,410 Z" />
            <path d="M 256,375 C 244,385 240,398 244,410 C 252,402 254,390 256,375 Z" />
            <path d="M 256,375 C 268,385 272,398 268,410 C 260,402 258,390 256,375 Z" />
            <path d="M 256,345 C 242,352 236,364 240,375 C 250,368 254,358 256,345 Z" />
            <path d="M 256,345 C 270,352 276,364 272,375 C 262,368 258,358 256,345 Z" />

            {/* Left Main Root Branch 1 (Upper Outer) */}
            <path d="M 250,256 C 235,275 205,295 175,315 C 160,325 140,336 122,350 C 135,342 165,324 190,305 C 220,285 242,268 250,256 Z" />
            {/* Left Foliage Nodes along Branch 1 */}
            <path d="M 122,350 C 105,356 95,368 96,380 C 110,375 120,363 122,350 Z" />
            <path d="M 140,336 C 122,338 112,348 114,360 C 128,355 136,345 140,336 Z" />
            <path d="M 158,325 C 142,322 130,330 132,342 C 146,338 154,330 158,325 Z" />
            <path d="M 175,315 C 160,308 148,315 149,326 C 162,324 170,317 175,315 Z" />
            <path d="M 195,302 C 182,292 170,298 171,308 C 183,307 190,302 195,302 Z" />

            {/* Right Main Root Branch 1 (Upper Outer) */}
            <path d="M 262,256 C 277,275 307,295 337,315 C 352,325 372,336 390,350 C 377,342 347,324 322,305 C 292,285 270,268 262,256 Z" />
            {/* Right Foliage Nodes along Branch 1 */}
            <path d="M 390,350 C 407,356 417,368 416,380 C 402,375 392,363 390,350 Z" />
            <path d="M 372,336 C 390,338 400,348 398,360 C 384,355 376,345 372,336 Z" />
            <path d="M 354,325 C 370,322 382,330 380,342 C 366,338 358,330 354,325 Z" />
            <path d="M 337,315 C 352,308 364,315 363,326 C 350,324 342,317 337,315 Z" />
            <path d="M 317,302 C 330,292 342,298 341,308 C 329,307 322,302 317,302 Z" />

            {/* Left Mid Root Branch 2 (Descending Diagonal) */}
            <path d="M 252,270 C 238,295 210,325 185,355 C 168,375 145,400 130,425 C 142,408 170,378 195,350 C 222,320 244,290 252,270 Z" />
            {/* Left Foliage Nodes along Branch 2 */}
            <path d="M 130,425 C 120,438 122,450 132,455 C 138,442 136,432 130,425 Z" />
            <path d="M 148,400 C 135,410 134,422 144,428 C 152,416 152,406 148,400 Z" />
            <path d="M 166,378 C 150,385 148,397 158,404 C 167,393 168,384 166,378 Z" />
            <path d="M 186,354 C 170,358 167,370 176,378 C 186,368 188,360 186,354 Z" />
            <path d="M 205,332 C 190,332 186,344 195,352 C 205,343 207,336 205,332 Z" />

            {/* Right Mid Root Branch 2 (Descending Diagonal) */}
            <path d="M 260,270 C 274,295 302,325 327,355 C 344,375 367,400 382,425 C 370,408 342,378 317,350 C 290,320 268,290 260,270 Z" />
            {/* Right Foliage Nodes along Branch 2 */}
            <path d="M 382,425 C 392,438 390,450 380,455 C 374,442 376,432 382,425 Z" />
            <path d="M 364,400 C 377,410 378,422 368,428 C 360,416 360,406 364,400 Z" />
            <path d="M 346,378 C 362,385 364,397 354,404 C 345,393 344,384 346,378 Z" />
            <path d="M 326,354 C 342,358 345,370 336,378 C 326,368 324,360 326,354 Z" />
            <path d="M 307,332 C 322,332 326,344 317,352 C 307,343 305,336 307,332 Z" />

            {/* Left Lower Root Branch 3 (Vertical Fan) */}
            <path d="M 254,300 C 244,330 226,365 208,400 C 195,425 180,450 172,468 C 180,452 200,420 216,392 C 234,360 248,328 254,300 Z" />
            <path d="M 172,468 C 168,480 174,488 182,488 C 184,476 178,470 172,468 Z" />
            <path d="M 188,442 C 180,452 184,462 192,462 C 196,450 192,444 188,442 Z" />
            <path d="M 204,414 C 194,422 196,434 204,435 C 210,423 208,416 204,414 Z" />

            {/* Right Lower Root Branch 3 (Vertical Fan) */}
            <path d="M 258,300 C 268,330 286,365 304,400 C 317,425 332,450 340,468 C 332,452 312,420 296,392 C 278,360 264,328 258,300 Z" />
            <path d="M 340,468 C 344,480 338,488 330,488 C 328,476 334,470 340,468 Z" />
            <path d="M 324,442 C 332,452 328,462 320,462 C 316,450 320,444 324,442 Z" />
            <path d="M 308,414 C 318,422 316,434 308,435 C 302,423 304,416 308,414 Z" />

            {/* Bottom Symmetrical Canopy Sprays */}
            <path d="M 216,450 C 210,465 214,476 224,478 C 228,464 224,455 216,450 Z" />
            <path d="M 296,450 C 302,465 298,476 288,478 C 284,464 288,455 296,450 Z" />
            <path d="M 235,430 C 228,442 230,455 238,458 C 243,446 241,437 235,430 Z" />
            <path d="M 277,430 C 284,442 282,455 274,458 C 269,446 271,437 277,430 Z" />
          </g>
        </g>
      )}

      {/* ========================================================================= */}
      {/* 2. THREE-DIMENSIONAL GOLDEN COIN IN PERSPECTIVE                           */}
      {/* ========================================================================= */}
      <g id="golden-coin">
        {/* Soft Contact Shadow directly beneath coin */}
        <ellipse cx="256" cy="254" rx="88" ry="14" fill="#000000" fillOpacity="0.18" filter="url(#softGlow)" />

        {/* Coin Cylindrical Body Base */}
        <path
          d="M 168,222 C 168,236 207,248 256,248 C 305,248 344,236 344,222 L 344,248 C 344,262 305,274 256,274 C 207,274 168,262 168,248 Z"
          fill="url(#coinBevelGrad)"
        />

        {/* Vertical Milling / Grooves along cylindrical coin rim */}
        {/* 13 Ribbed teeth creating 3D tactile reeded coin edge */}
        <g stroke="#78350f" strokeWidth="1" strokeOpacity="0.3">
          <path d="M 178,225 L 178,251" stroke="url(#coinRibDark)" strokeWidth="3.5" />
          <path d="M 190,230 L 190,256" stroke="url(#coinRibLight)" strokeWidth="4" />
          <path d="M 203,234 L 203,260" stroke="url(#coinRibDark)" strokeWidth="4.5" />
          <path d="M 217,238 L 217,264" stroke="url(#coinRibLight)" strokeWidth="5" />
          <path d="M 231,241 L 231,267" stroke="url(#coinRibDark)" strokeWidth="5.5" />
          <path d="M 246,243 L 246,269" stroke="url(#coinRibLight)" strokeWidth="6" />
          <path d="M 261,243 L 261,269" stroke="url(#coinRibLight)" strokeWidth="6" />
          <path d="M 276,241 L 276,267" stroke="url(#coinRibDark)" strokeWidth="5.5" />
          <path d="M 290,238 L 290,264" stroke="url(#coinRibLight)" strokeWidth="5" />
          <path d="M 304,234 L 304,260" stroke="url(#coinRibDark)" strokeWidth="4.5" />
          <path d="M 317,230 L 317,256" stroke="url(#coinRibLight)" strokeWidth="4" />
          <path d="M 329,225 L 329,251" stroke="url(#coinRibDark)" strokeWidth="3.5" />
        </g>

        {/* Lower Coin Rim Highlight Curve */}
        <path
          d="M 172,250 C 185,263 218,274 256,274 C 294,274 327,263 340,250"
          stroke="#fde047"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity="0.8"
        />

        {/* Top Face Outer Elliptical Bevel */}
        <ellipse cx="256" cy="222" rx="88" ry="24" fill="url(#coinTopRimGrad)" stroke="#b45309" strokeWidth="1.5" />

        {/* Top Face Inner Recessed Disk */}
        <ellipse cx="256" cy="222" rx="80" ry="20" fill="url(#coinTopGrad)" stroke="#d97706" strokeWidth="1.5" />

        {/* Inner Specular Rim Highlight */}
        <ellipse cx="256" cy="221" rx="74" ry="17" fill="none" stroke="#fef08a" strokeWidth="1.2" opacity="0.75" />

        {/* Soil/Sprout Anchor Point in Coin Center */}
        <ellipse cx="256" cy="222" rx="14" ry="5.5" fill="#14532d" fillOpacity="0.8" />
      </g>

      {/* ========================================================================= */}
      {/* 3. VIBRANT SPROUTING PLANT (THREE LUSH LEAVES & CENTRAL STEM)             */}
      {/* ========================================================================= */}
      <g id="sprout-plant">
        {/* Main Growing Stem */}
        <path
          d="M 251.5,222 C 251.5,190 250,160 255.5,135 C 261,160 260.5,190 260.5,222 Z"
          fill="url(#stemGrad)"
        />

        {/* Stem Highlight Line */}
        <path
          d="M 255,220 C 254.5,190 254,165 256,138"
          stroke="#86efac"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Left Sweeping Leaf */}
        <g id="leaf-left">
          {/* Main Leaf Body */}
          <path
            d="M 254,142 C 238,150 196,145 174,106 C 172,82 195,84 218,98 C 242,112 252,130 254,142 Z"
            fill="url(#leafLeftGrad)"
          />
          {/* Leaf Inner Contour/Shade */}
          <path
            d="M 254,142 C 244,142 216,132 196,114 C 182,102 178,92 174,106 C 196,145 238,150 254,142 Z"
            fill="#15803d"
            fillOpacity="0.45"
          />
          {/* Central Vein */}
          <path
            d="M 252,138 C 235,130 210,116 176,96"
            stroke="#bbf7d0"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* Right Sweeping Leaf */}
        <g id="leaf-right">
          {/* Main Leaf Body */}
          <path
            d="M 258,142 C 274,150 316,145 338,106 C 340,82 317,84 294,98 C 270,112 260,130 258,142 Z"
            fill="url(#leafRightGrad)"
          />
          {/* Leaf Inner Contour/Shade */}
          <path
            d="M 258,142 C 268,142 296,132 316,114 C 330,102 334,92 338,106 C 316,145 274,150 258,142 Z"
            fill="#14532d"
            fillOpacity="0.45"
          />
          {/* Central Vein */}
          <path
            d="M 260,138 C 277,130 302,116 336,96"
            stroke="#86efac"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>

        {/* Tall Central Leaf */}
        <g id="leaf-center">
          {/* Left Half (Lighter Illuminated Side) */}
          <path
            d="M 256,142 C 248,110 240,78 256,42 C 256,75 256,110 256,142 Z"
            fill="url(#leafLightGrad)"
          />
          {/* Right Half (Darker Deep Forest Side) */}
          <path
            d="M 256,142 C 256,110 256,75 256,42 C 272,78 264,110 256,142 Z"
            fill="url(#leafDarkGrad)"
          />
          {/* Central Vertical Spine Highlight */}
          <path
            d="M 256,142 L 256,42"
            stroke="#dcfce7"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>
      </g>
    </svg>
  );
};
