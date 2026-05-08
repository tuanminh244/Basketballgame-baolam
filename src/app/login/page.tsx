"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const { loginWithPin, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    if (!pin) return;
    setError('');
    try {
      await loginWithPin(pin);
      router.push('/');
    } catch (e: any) {
      setError(e.message || 'Lỗi đăng nhập');
    }
  };

  if (loading) return <div className="text-center p-8 font-bold text-gray-500">Đang tải...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-80">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Đăng Nhập</h1>
        {error && <p className="text-red-500 text-center mb-4 font-bold text-sm bg-red-50 p-2 rounded">{error}</p>}
        <input 
          type="password" 
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Nhập mã PIN"
          className="w-full border-2 border-gray-200 p-3 rounded-lg mb-4 text-center text-xl outline-none focus:border-blue-500 transition"
          maxLength={6}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button 
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-3 rounded-lg font-bold hover:bg-blue-600 shadow-sm transition"
        >
          Vào Game
        </button>
      </div>
    </div>
  );
}
