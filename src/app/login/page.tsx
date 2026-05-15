"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const FAMILY = [
  { name: 'Bảo Lâm',  emoji: '🏀', sub: 'Người chơi', grad: 'from-sky-500 to-blue-700',    ring: 'ring-sky-400'    },
  { name: 'Bảo Linh', emoji: '⭐', sub: 'Người chơi', grad: 'from-pink-500 to-rose-700',    ring: 'ring-pink-400'   },
  { name: 'Mẹ',       emoji: '💚', sub: 'Kiểm duyệt', grad: 'from-emerald-500 to-green-700', ring: 'ring-emerald-400' },
  { name: 'Bố',       emoji: '🏆', sub: 'Quản trị',   grad: 'from-violet-500 to-purple-700', ring: 'ring-violet-400'  },
];

const PIN_MAX = 6;
const KEYS = ['1','2','3','4','5','6','7','8','9','⌫','0','→'];

export default function LoginPage() {
  const [step, setStep]               = useState<'select'|'pin'>('select');
  const [member, setMember]           = useState<typeof FAMILY[0] | null>(null);
  const [pin, setPin]                 = useState('');
  const [error, setError]             = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [shake, setShake]             = useState(false);
  const shakeTimeoutRef               = useRef<NodeJS.Timeout | null>(null);

  const { loginWithPin, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace('/');
  }, [user, loading, router]);

  // Cleanup shake timeout on unmount
  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    };
  }, []);

  const doSubmit = useCallback(async (currentPin: string) => {
    if (!currentPin || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await loginWithPin(currentPin);
    } catch (e: any) {
      setError(e.message || 'Mã PIN không đúng');
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      setShake(true);
      setPin('');
      shakeTimeoutRef.current = setTimeout(() => setShake(false), 500);
      setSubmitting(false);
    }
  }, [loginWithPin, submitting]);

  // Auto-submit when PIN full — stable deps
  useEffect(() => {
    if (pin.length === PIN_MAX && !submitting) {
      doSubmit(pin);
    }
  }, [pin, submitting, doSubmit]);

  const handleKey = (key: string) => {
    if (submitting) return;
    if (key === '⌫') { setPin(p => p.slice(0, -1)); setError(''); return; }
    if (key === '→') { doSubmit(pin); return; }
    if (pin.length < PIN_MAX) setPin(p => p + key);
  };

  if (loading && !submitting) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-5 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="mb-10 text-center z-10">
        <div className="text-6xl mb-3 drop-shadow-lg">🎮</div>
        <h1 className="text-3xl font-black text-white tracking-tight">Family Game</h1>
        <p className="text-slate-400 text-sm mt-1">Hành trình học tập của nhà mình</p>
      </div>

      {step === 'select' ? (
        <div className="w-full max-w-xs z-10">
          <p className="text-slate-400 text-xs text-center uppercase tracking-widest mb-5 font-semibold">
            Bạn là ai?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {FAMILY.map(m => (
              <button key={m.name}
                onClick={() => { setMember(m); setPin(''); setError(''); setStep('pin'); }}
                className={`bg-gradient-to-br ${m.grad} p-5 rounded-3xl flex flex-col items-center
                  shadow-xl active:scale-95 transition-transform duration-150 cursor-pointer`}>
                <span className="text-5xl mb-2 drop-shadow">{m.emoji}</span>
                <span className="text-white font-bold text-base">{m.name}</span>
                <span className="text-white/60 text-xs mt-0.5">{m.sub}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xs z-10">
          {/* Back */}
          <button
            onClick={() => { setStep('select'); setPin(''); setError(''); }}
            className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition text-sm">
            <span className="text-lg">←</span> Chọn lại
          </button>

          {/* Selected member */}
          <div className={`bg-gradient-to-br ${member!.grad} p-4 rounded-2xl flex items-center gap-4 mb-8 shadow-lg ${member!.ring} ring-2`}>
            <span className="text-4xl drop-shadow">{member!.emoji}</span>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{member!.name}</p>
              <p className="text-white/60 text-sm">{member!.sub}</p>
            </div>
            {submitting && (
              <div className="ml-auto w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* PIN dots */}
          <div
            className="flex justify-center gap-3 mb-3"
            style={{ animation: shake ? 'shake 0.4s ease' : 'none' }}>
            {Array.from({ length: PIN_MAX }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                i < pin.length
                  ? 'bg-white border-white scale-110'
                  : error
                  ? 'bg-red-500/30 border-red-400'
                  : 'bg-transparent border-slate-600'
              }`} />
            ))}
          </div>

          {/* Error */}
          <div className="h-6 mb-4 text-center">
            {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2.5">
            {KEYS.map(key => (
              <button key={key} onClick={() => handleKey(key)}
                disabled={submitting}
                className={`py-5 rounded-2xl text-xl font-bold transition-all duration-100 active:scale-95
                  ${key === '→'
                    ? pin.length > 0
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                      : 'bg-slate-800 text-slate-600'
                    : key === '⌫'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-800 text-white hover:bg-slate-700'
                  } disabled:opacity-50`}>
                {key}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-5px)}
          80%{transform:translateX(5px)}
        }
      `}</style>
    </div>
  );
}
