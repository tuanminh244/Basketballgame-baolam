'use client';

import { useAuth } from '@/contexts/AuthContext';
import PlayerHomePage from '@/components/player/PlayerHomePage';

export default function PlayerHomeRoute() {
  const { user } = useAuth();

  if (!user?.id) {
    return (
      <div className="p-6 text-center text-gray-500">
        Đang tải...
      </div>
    );
  }

  return <PlayerHomePage userId={user.id} />;
}
