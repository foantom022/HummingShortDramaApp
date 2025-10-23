'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DramaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    // 自动重定向到播放页面
    if (id) {
      router.replace(`/drama/${id}/watch`);
    }
  }, [id, router]);

  // 显示加载状态
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">加载中...</p>
      </div>
    </div>
  );
}
