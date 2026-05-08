'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [uid, setUid] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!uid || !pin) return setError('Vui lòng điền đủ thông tin');
    setLoading(true);
    setError('');
    try {
      await login(uid, pin);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-slate-50">
      <div className="w-full space-y-6">
        <h1 className="text-3xl font-bold text-center text-slate-800">Đăng nhập</h1>
        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Tên đăng nhập (UID)"
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            className="w-full p-4 border border-slate-300 rounded-2xl outline-none focus:border-blue-500"
          />
          <input
            type="password"
            placeholder="Mã PIN"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-4 border border-slate-300 rounded-2xl outline-none focus:border-blue-500"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Vào Game'}
          </button>
        </div>
      </div>
    </div>
  );
}
