import React, { useEffect, useState, useRef, useCallback } from 'react';

export type SelectionHighlightColor = 'default' | 'lite-green' | 'red' | 'blue';

export interface HighlightColorConfig {
  id: SelectionHighlightColor;
  label: string;
  shortcut: string;
  shortcutKey: string;
  bgHex: string;
  textHex: string;
  dotColor: string;
  desc: string;
}

export const HIGHLIGHT_COLORS: Record<SelectionHighlightColor, HighlightColorConfig> = {
  'default': {
    id: 'default',
    label: 'Default Theme',
    shortcut: '⇧ + D',
    shortcutKey: 'd',
    bgHex: '#3b82f6',
    textHex: '#ffffff',
    dotColor: 'bg-blue-600 ring-blue-500/40',
    desc: 'App theme native accent glow',
  },
  'lite-green': {
    id: 'lite-green',
    label: 'Lite-Green',
    shortcut: '⇧ + G',
    shortcutKey: 'g',
    bgHex: '#86efac',
    textHex: '#064e3b',
    dotColor: 'bg-emerald-400 ring-emerald-500/40',
    desc: 'Soft lime-green glow',
  },
  'red': {
    id: 'red',
    label: 'Red',
    shortcut: '⇧ + R',
    shortcutKey: 'r',
    bgHex: '#fca5a5',
    textHex: '#7f1d1d',
    dotColor: 'bg-rose-500 ring-rose-500/40',
    desc: 'Vibrant coral red glow',
  },
  'blue': {
    id: 'blue',
    label: 'Blue',
    shortcut: '⇧ + B',
    shortcutKey: 'b',
    bgHex: '#93c5fd',
    textHex: '#0c4a6e',
    dotColor: 'bg-sky-400 ring-sky-500/40',
    desc: 'Crisp sky-blue marine glow',
  },
};

const COLOR_CYCLE_ORDER: SelectionHighlightColor[] = ['default', 'lite-green', 'red', 'blue'];

export const TextHighlightController: React.FC = () => {
  const [highlightColor, setHighlightColor] = useState<SelectionHighlightColor>(() => {
    return (localStorage.getItem('app_text_highlight_color') as SelectionHighlightColor) || 'default';
  });

  const [toastNotification, setToastNotification] = useState<{
    message: string;
    subtext?: string;
    color: SelectionHighlightColor;
  } | null>(null);

  const toastTimeoutRef = useRef<any>(null);

  const showToast = useCallback((message: string, subtext?: string, color?: SelectionHighlightColor) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastNotification({
      message,
      subtext,
      color: color || highlightColor,
    });
    toastTimeoutRef.current = setTimeout(() => {
      setToastNotification(null);
    }, 2400);
  }, [highlightColor]);

  // Apply highlight color to DOM root attributes and dynamic style tag
  const applyHighlightColor = useCallback((color: SelectionHighlightColor) => {
    setHighlightColor(color);
    localStorage.setItem('app_text_highlight_color', color);

    document.documentElement.setAttribute('data-selection-color', color);
    document.body.setAttribute('data-selection-color', color);

    // Update dynamic style tag for instant fallback support
    let styleTag = document.getElementById('dynamic-text-selection-rules') as HTMLStyleElement | null;
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'dynamic-text-selection-rules';
      document.head.appendChild(styleTag);
    }

    const cfg = HIGHLIGHT_COLORS[color];
    const isDefaultTheme = color === 'default';

    styleTag.textContent = `
      ::selection {
        background-color: ${isDefaultTheme ? 'var(--accent-500, #3b82f6)' : cfg.bgHex} !important;
        color: ${cfg.textHex} !important;
        -webkit-text-fill-color: ${cfg.textHex} !important;
      }
      *::selection {
        background-color: ${isDefaultTheme ? 'var(--accent-500, #3b82f6)' : cfg.bgHex} !important;
        color: ${cfg.textHex} !important;
        -webkit-text-fill-color: ${cfg.textHex} !important;
      }
    `;

    // Force instant repaint of active selection range
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && sel.toString().length > 0) {
      try {
        const range = sel.getRangeAt(0);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch {}
    }
  }, []);

  // Cycle to next color
  const cycleNextColor = useCallback(() => {
    const currentIndex = COLOR_CYCLE_ORDER.indexOf(highlightColor);
    const nextIndex = (currentIndex + 1) % COLOR_CYCLE_ORDER.length;
    const nextColor = COLOR_CYCLE_ORDER[nextIndex];
    applyHighlightColor(nextColor);
    showToast(
      `Highlight Color: ${HIGHLIGHT_COLORS[nextColor].label}`,
      'Press Shift to cycle (Default ⇄ Lite-Green ⇄ Red ⇄ Blue)',
      nextColor
    );
  }, [highlightColor, applyHighlightColor, showToast]);

  // Set specific color with feedback
  const setSpecificColor = useCallback((color: SelectionHighlightColor) => {
    applyHighlightColor(color);
    showToast(
      `Highlight Color: ${HIGHLIGHT_COLORS[color].label}`,
      `Shortcut: ${HIGHLIGHT_COLORS[color].shortcut}`,
      color
    );
  }, [applyHighlightColor, showToast]);

  // Initial mount: apply stored color
  useEffect(() => {
    applyHighlightColor(highlightColor);
  }, [applyHighlightColor, highlightColor]);

  // Keyboard shortcut listener
  useEffect(() => {
    const isTextInputFocused = (target: EventTarget | null) => {
      if (!target || !(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toUpperCase();
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        target.isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = isTextInputFocused(e.target);
      const sel = window.getSelection();
      const hasTextSelected = Boolean(sel && sel.toString().trim().length > 0);

      // 1. Single SHIFT tap while text is selected:
      // When user selects or drags text and taps Shift, shift/cycle the color!
      if (e.key === 'Shift') {
        if (hasTextSelected) {
          e.preventDefault();
          cycleNextColor();
          return;
        }
      }

      // 2. SHIFT + D -> Default Theme
      if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        if (!isInput || hasTextSelected) {
          e.preventDefault();
          setSpecificColor('default');
          return;
        }
      }

      // 3. SHIFT + G -> Lite-Green
      if (e.shiftKey && (e.key === 'G' || e.key === 'g')) {
        if (!isInput || hasTextSelected) {
          e.preventDefault();
          setSpecificColor('lite-green');
          return;
        }
      }

      // 4. SHIFT + R -> Red
      if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        if (!isInput || hasTextSelected) {
          e.preventDefault();
          setSpecificColor('red');
          return;
        }
      }

      // 5. SHIFT + B -> Blue
      if (e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        if (!isInput || hasTextSelected) {
          e.preventDefault();
          setSpecificColor('blue');
          return;
        }
      }

      // 6. SHIFT + C or SHIFT + Space -> Cycle color
      if (e.shiftKey && (e.key === 'C' || e.key === 'c' || e.key === ' ')) {
        if (!isInput || hasTextSelected) {
          e.preventDefault();
          cycleNextColor();
          return;
        }
      }

      // 7. Direct keys 'd', 'g', 'r', 'b' when text is selected outside of text inputs
      if (hasTextSelected && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === 'd' || e.key === 'D') {
          e.preventDefault();
          setSpecificColor('default');
        } else if (e.key === 'g' || e.key === 'G') {
          e.preventDefault();
          setSpecificColor('lite-green');
        } else if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          setSpecificColor('red');
        } else if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setSpecificColor('blue');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [cycleNextColor, setSpecificColor]);

  // Copy event listener: shows feedback toast on copy without any intrusive popups
  useEffect(() => {
    const handleCopy = () => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (text.length > 0) {
        const preview = text.length > 32 ? `${text.slice(0, 32)}…` : text;
        showToast(
          `Copied with ${HIGHLIGHT_COLORS[highlightColor].label} highlight`,
          `"${preview}"`,
          highlightColor
        );
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => {
      document.removeEventListener('copy', handleCopy);
    };
  }, [highlightColor, showToast]);

  return (
    <>
      {/* Dynamic Non-Intrusive Color Change Toast */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
          <div className={`px-4 py-2.5 rounded-xl border shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-semibold ${
            toastNotification.color === 'default'
              ? 'bg-slate-900/95 text-white border-blue-500/40'
              : toastNotification.color === 'lite-green'
              ? 'bg-slate-900/95 text-white border-emerald-500/40'
              : toastNotification.color === 'red'
              ? 'bg-slate-900/95 text-white border-rose-500/40'
              : 'bg-slate-900/95 text-white border-sky-500/40'
          }`}>
            <span 
              style={{ backgroundColor: HIGHLIGHT_COLORS[toastNotification.color].bgHex }}
              className="w-3 h-3 rounded-full border border-white/30 shrink-0"
            />
            <div className="flex flex-col">
              <span className="font-bold text-slate-100">
                {toastNotification.message}
              </span>
              {toastNotification.subtext && (
                <span className="text-[10px] text-slate-400 font-mono font-normal">
                  {toastNotification.subtext}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
