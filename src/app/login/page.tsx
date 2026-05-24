'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const FAMILY = [
  {
    id: 'blam_01',
    email: 'blam@family.local',
    name: 'Bảo Lâm',
    emoji: '🏀',
    sub: 'Người chơi',
    grad: 'from-sky-500 to-blue-700',
    ring: 'ring-sky-400',
    route: '/player-home',
  },
  {
    id: 'blinh_01',
    email: 'blinh@family.local',
    name: 'Bảo Linh',
    emoji: '⭐',
    sub: 'Người chơi',
    grad: 'from-pink-500 to-rose-700',
    ring: 'ring-pink-400',
    route: '/player-home',
  },
  {
    id: 'mom_01',
    email: 'mom@family.local',
    name: 'Mẹ',
    emoji: '💚',
    sub: 'Kiểm duyệt',
    grad: 'from-emerald-500 to-green-700',
    ring: 'ring-emerald-400',
    route: '/checker/queue',
  },
  {
    id: 'dad_01',
    email: 'dad@family.local',
    name: 'Bố',
    emoji: '🏆',
    sub: 'Quản trị',
    grad: 'from-violet-500 to-purple-700',
    ring: 'ring-violet-400',
    route: '/admin',
  },
] as const;

type FamilyMember = (typeof FAMILY)[number];

const PIN_LENGTH = 6;

export default function LoginPage() {
  const router = useRouter();
  const { loginWithPin, user, loading } = useAuth();

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);

  const shakeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const member = useMemo<FamilyMember | null>(() => {
    return FAMILY.find((item) => item.id === selectedMemberId) ?? null;
  }, [selectedMemberId]);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const matchedMember = FAMILY.find((item) => item.id === user.id);

    if (matchedMember) {
      router.replace(matchedMember.route);
      return;
    }

    if (user.role === 'admin') {
      router.replace('/admin');
      return;
    }

    if (user.role === 'checker') {
      router.replace('/checker/queue');
      return;
    }

    router.replace('/player-home');
  }, [user, router]);

  const resetPinState = useCallback(() => {
    setPin('');
    setError('');
    setSubmitting(false);
    setShake(false);
  }, []);

  const handleSelectMember = useCallback(
    (memberId: string) => {
      setSelectedMemberId(memberId);
      resetPinState();
    },
    [resetPinState]
  );

  const handleBack = useCallback(() => {
    setSelectedMemberId(null);
    resetPinState();
  }, [resetPinState]);

  const doSubmit = useCallback(
    async (currentPin: string) => {
      if (!member || submitting || loading) return;

      if (currentPin.length !== PIN_LENGTH) {
        setError('Vui lòng nhập đủ 6 số');
        return;
      }

      setSubmitting(true);
      setError('');

      try {
        /**
         * QUAN TRỌNG:
         * PIN ở màn hình này chính là password của Firebase Auth account.
         * App phải Firebase Auth login trước, sau đó Firebase Rules mới có auth.uid/auth.token.role.
         */
        await loginWithPin(member.email, currentPin);
      } catch (e: any) {
        setError(e?.message || 'Mã PIN không đúng hoặc tài khoản chưa được cấu hình');
        setPin('');

        if (shakeTimeoutRef.current) {
          clearTimeout(shakeTimeoutRef.current);
        }

        setShake(true);
        shakeTimeoutRef.current = setTimeout(() => {
          setShake(false);
        }, 500);

        setSubmitting(false);
      }
    },
    [member, submitting, loading, loginWithPin]
  );

  const handleNumber = useCallback(
    async (value: string) => {
      if (!member || submitting || loading) return;
      if (pin.length >= PIN_LENGTH) return;

      const nextPin = `${pin}${value}`;
      setPin(nextPin);
      setError('');

      if (nextPin.length === PIN_LENGTH) {
        await doSubmit(nextPin);
      }
    },
    [member, pin, submitting, loading, doSubmit]
  );

  const handleDelete = useCallback(() => {
    if (submitting || loading) return;
    setError('');
    setPin((current) => current.slice(0, -1));
  }, [submitting, loading]);

  const keypadDisabled = !member || submitting || loading;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center px-5 py-10">
      <div className="w-full max-w-[520px] flex flex-col items-center">
        <div className="text-5xl mb-3">🎮</div>

        <h1 className="text-4xl font-extrabold tracking-tight text-center">
          Family Game
        </h1>

        <p className="text-slate-400 mt-3 text-center">
          Hành trình học tập của nhà mình
        </p>

        {!member ? (
          <section className="w-full mt-14 space-y-4">
            <h2 className="text-lg text-slate-300 text-center mb-6">
              Chọn người chơi
            </h2>

            {FAMILY.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectMember(item.id)}
                className={`w-full rounded-3xl bg-gradient-to-r ${item.grad} px-7 py-5 flex items-center gap-5 ring-2 ring-transparent hover:${item.ring} transition active:scale-[0.98]`}
              >
                <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center text-4xl">
                  {item.emoji}
                </div>

                <div className="text-left">
                  <div className="text-2xl font-bold">{item.name}</div>
                  <div className="text-white/70 text-base mt-1">{item.sub}</div>
                </div>
              </button>
            ))}
          </section>
        ) : (
          <section className="w-full mt-16">
            <button
              type="button"
              onClick={handleBack}
              disabled={submitting || loading}
              className="mb-10 text-slate-300 hover:text-white transition disabled:opacity-50"
            >
              ← Chọn lại
            </button>

            <div
              className={`w-full rounded-3xl bg-gradient-to-r ${member.grad} px-8 py-7 flex items-center gap-6 ring-2 ring-cyan-400 mb-10`}
            >
              <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center text-4xl">
                {member.emoji}
              </div>

              <div>
                <div className="text-2xl font-bold">{member.name}</div>
                <div className="text-white/70 text-lg mt-1">{member.sub}</div>
              </div>
            </div>

            <div className={`flex justify-center gap-5 mb-6 ${shake ? 'animate-pulse' : ''}`}>
              {Array.from({ length: PIN_LENGTH }).map((_, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 rounded-full border-4 ${
                    index < pin.length
                      ? 'bg-rose-400 border-rose-400'
                      : 'border-rose-400'
                  }`}
                />
              ))}
            </div>

            {error ? (
              <p className="text-center text-rose-400 font-bold mb-8">
                {error}
              </p>
            ) : (
              <p className="text-center text-slate-500 mb-8 h-6">
                {submitting ? 'Đang đăng nhập...' : ' '}
              </p>
            )}

            <div className="grid grid-cols-3 gap-4">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((number) => (
                <button
                  key={number}
                  type="button"
                  disabled={keypadDisabled}
                  onClick={() => handleNumber(number)}
                  className="h-24 rounded-3xl bg-slate-800 text-3xl font-bold hover:bg-slate-700 transition active:scale-[0.98] disabled:opacity-50"
                >
                  {number}
                </button>
              ))}

              <button
                type="button"
                disabled={keypadDisabled || pin.length === 0}
                onClick={handleDelete}
                className="h-24 rounded-3xl bg-slate-800 text-3xl font-bold hover:bg-slate-700 transition active:scale-[0.98] disabled:opacity-50"
              >
                ⌫
              </button>

              <button
                type="button"
                disabled={keypadDisabled}
                onClick={() => handleNumber('0')}
                className="h-24 rounded-3xl bg-slate-800 text-3xl font-bold hover:bg-slate-700 transition active:scale-[0.98] disabled:opacity-50"
              >
                0
              </button>

              <button
                type="button"
                disabled={keypadDisabled || pin.length !== PIN_LENGTH}
                onClick={() => doSubmit(pin)}
                className="h-24 rounded-3xl bg-slate-800 text-3xl font-bold hover:bg-slate-700 transition active:scale-[0.98] disabled:opacity-50"
              >
                →
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
