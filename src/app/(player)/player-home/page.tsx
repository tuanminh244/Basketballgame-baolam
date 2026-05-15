'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function PlayerHomeRoute() {
  const { user } = useAuth();

  return (
    <div className="p-6 flex flex-col justify-center items-center min-h-[50vh]">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Trang Chủ Nhiệm Vụ</h1>
      <p className="text-gray-500 text-sm">Chờ kết nối giao diện PlayerHomePage...</p>
      
      {/* TODO: Replace scaffold with real PlayerHomePage component
        import PlayerHomePage from '@/components/player/PlayerHomePage';
        
        <PlayerHomePage userId={user?.id ?? ''} />
      */}
    </div>
  );
}
