"use client";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckerDashboardPage() {
  const { logout } = useAuth();

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Bảng Điều Khiển Admin</h1>
        <button onClick={logout} className="text-red-500 font-bold underline">Đăng Xuất</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Link href="/queue" className="bg-blue-100 p-8 rounded-xl text-center shadow-sm border border-blue-200 hover:bg-blue-200 transition">
          <p className="text-xl font-bold text-blue-800">Duyệt Nhiệm Vụ</p>
        </Link>
        <div className="bg-green-100 p-8 rounded-xl text-center shadow-sm border border-green-200 opacity-70">
          <p className="text-xl font-bold text-green-800">Cửa Hàng (Sắp ra mắt)</p>
        </div>
      </div>
    </div>
  );
}
