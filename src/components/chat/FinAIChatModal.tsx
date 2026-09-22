import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Trash2, 
  ArrowRight, 
  TrendingUp, 
  ShieldCheck, 
  Coins, 
  Zap,
  MessageSquare,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface FinAIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const FinAIChatModal: React.FC<FinAIChatModalProps> = ({ isOpen, onClose, initialQuery }) => {
  const { 
    monthlyIncome, 
    monthlyExpenses, 
    netSavings, 
    savingsRate, 
    netWorth, 
    formatMoney, 
    currency,
    theme
  } = useFinance();

  const isLight = theme === 'light';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Hello! I am your **FinAI Copilot** 🤖. I've loaded your live cash flow profile:
• **Monthly Inflow**: ${formatMoney(monthlyIncome)}
• **Monthly Burn**: ${formatMoney(monthlyExpenses)}
• **Net Surplus**: ${formatMoney(netSavings)} (${savingsRate}% saved)
• **Net Worth**: ${formatMoney(netWorth)}

Ask me anything about scaling your income streams, cash flow velocity, expense trimming, or portfolio allocation!`,
      timestamp: 'Just now'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    { title: 'Scale Inflow', query: `How can I scale my ${formatMoney(monthlyIncome)}/mo income by 25%?` },
    { title: 'Burn Velocity', query: `Analyze my ${formatMoney(monthlyExpenses)}/mo burn rate and runway.` },
    { title: 'Surplus Plan', query: `How should I allocate my ${formatMoney(netSavings)} monthly surplus?` },
    { title: 'Passive Yield', query: 'What are the top 3 passive income streams for my capital base?' },
  ];

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputVal).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/financial-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          chatHistory: messages.map(m => ({ sender: m.sender, text: m.text })),
          financialContext: {
            monthlyIncome,
            monthlyExpenses,
            netSavings,
            savingsRate,
            netWorth,
            currency
          }
        })
      });

      const data = await res.json();
      playChime();

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Your financial allocation looks healthy. Stay disciplined with compounding.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'assistant',
        text: `Based on your ${formatMoney(monthlyIncome)} monthly income and ${formatMoney(monthlyExpenses)} expenses, your ${savingsRate}% savings rate is exceptional. Keep compounding your ${formatMoney(netSavings)} monthly surplus.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat history refreshed. How can I help you optimize your cash flow today?`,
        timestamp: 'Just now'
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-2xl h-[90vh] max-h-[720px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isLight 
            ? 'bg-white border-slate-200 text-slate-900' 
            : 'bg-slate-950 border-slate-800 text-slate-100'
        }`}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100">
                  FinAI Cashflow Copilot
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Advisor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time mathematical guidance on income, burn velocity & wealth accumulation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={clearChat}
              title="Clear conversation"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all text-xs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Context Bar */}
        <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-900/20 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px] font-mono">
          <span className="text-slate-500">Live Context:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Inflow: {formatMoney(monthlyIncome)}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Burn: {formatMoney(monthlyExpenses)}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Savings: {savingsRate}%
          </span>
        </div>

        {/* Chat Message Scroll Box */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-xs leading-relaxed space-y-1.5 shadow-sm relative group ${
                  isUser 
                    ? 'bg-blue-600 text-white rounded-br-xs' 
                    : isLight 
                      ? 'bg-slate-100 border border-slate-200 text-slate-800 rounded-bl-xs' 
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-bl-xs'
                }`}>
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>
                  
                  <div className={`flex items-center justify-between text-[10px] font-mono pt-1 ${
                    isUser ? 'text-blue-200' : 'text-slate-500'
                  }`}>
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => copyMessage(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 hover:text-slate-300 transition-opacity ml-2"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>FinAI is calculating cash flow dynamics...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        <div className="p-2 sm:px-4 border-t border-slate-800/60 bg-slate-900/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-500 font-medium shrink-0">Suggestions:</span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className={`text-[11px] px-2.5 py-1 rounded-xl border whitespace-nowrap transition-all font-medium flex items-center gap-1 shrink-0 ${
                isLight 
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <span>{p.title}</span>
              <ArrowRight className="w-3 h-3 opacity-60" />
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-800/80 bg-slate-950">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask FinAI about income expansion, cash runway, investment strategy..."
              className={`flex-1 px-4 py-2.5 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                isLight 
                  ? 'bg-slate-100 border-slate-200 text-slate-900' 
                  : 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="px-4 py-2.5 rounded-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
