'use client';

export default function QueueRoute() {
  return (
    <div className="p-6 flex flex-col justify-center items-center min-h-[50vh]">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Chờ Duyệt</h1>
      <p className="text-gray-500 text-sm">Chờ kết nối giao diện ApprovalQueuePage...</p>
      
      {/* TODO: Replace scaffold with real ApprovalQueuePage component
        import ApprovalQueuePage from '@/components/checker/queue/ApprovalQueuePage';
        
        <ApprovalQueuePage />
      */}
    </div>
  );
}
