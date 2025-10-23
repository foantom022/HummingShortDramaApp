'use client';

import { ArrowLeft, Download, Trash2, Play, Pause } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BottomNav from '@/components/common/BottomNav';

export default function DownloadsPage() {
  const router = useRouter();
  const [downloads] = useState([
    {
      id: 1,
      title: '霸道总裁的替身新娘',
      episode: '第1-10集',
      poster: 'https://picsum.photos/seed/drama1/300/400',
      size: '1.2GB',
      progress: 100,
      status: 'completed'
    },
    {
      id: 2,
      title: '重生之豪门千金',
      episode: '第1-5集',
      poster: 'https://picsum.photos/seed/drama2/300/400',
      size: '650MB',
      progress: 60,
      status: 'downloading'
    },
  ]);

  const handleDelete = (id: number) => {
    if (confirm('确定要删除这个下载吗？')) {
      alert('删除功能开发中');
    }
  };

  const handlePause = (id: number) => {
    alert('暂停/继续功能开发中');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-[calc(64px+env(safe-area-inset-bottom,20px))]">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-[#1F1F1F]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">下载管理</h1>
          </div>
          <button className="text-sm text-[#8B5CF6]">
            编辑
          </button>
        </div>
      </div>

      {/* 存储信息 */}
      <div className="mx-4 mt-6 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-white/80 mb-1">已用空间</div>
            <div className="text-2xl font-bold text-white">1.85 GB</div>
          </div>
          <Download className="w-12 h-12 text-white/20" />
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-2 mb-2">
          <div className="bg-white rounded-full h-2" style={{ width: '18.5%' }} />
        </div>
        
        <div className="text-xs text-white/60">
          共10GB可用空间
        </div>
      </div>

      {/* 下载列表 */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium">下载列表</h2>
          <span className="text-sm text-gray-500">{downloads.length}个项目</span>
        </div>

        <div className="space-y-3">
          {downloads.map((item) => (
            <div
              key={item.id}
              className="bg-[#1F1F1F] rounded-xl p-3 flex gap-3"
            >
              {/* 海报 */}
              <div className="relative flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                {item.status === 'downloading' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-white text-xs font-bold">
                      {item.progress}%
                    </div>
                  </div>
                )}
              </div>

              {/* 信息 */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 mb-2">
                    {item.episode} · {item.size}
                  </p>
                </div>

                {/* 进度条 */}
                {item.status === 'downloading' && (
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-[#8B5CF6] rounded-full h-1.5 transition-all"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex items-center gap-2">
                  {item.status === 'downloading' ? (
                    <button
                      onClick={() => handlePause(item.id)}
                      className="flex items-center gap-1 text-xs text-[#8B5CF6] active:scale-95 transition-transform"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      暂停
                    </button>
                  ) : (
                    <button
                      className="flex items-center gap-1 text-xs text-[#8B5CF6] active:scale-95 transition-transform"
                    >
                      <Play className="w-3.5 h-3.5" />
                      播放
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center gap-1 text-xs text-red-500 active:scale-95 transition-transform"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态提示 */}
        {downloads.length === 0 && (
          <div className="text-center py-20">
            <Download className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">暂无下载内容</p>
            <p className="text-sm text-gray-600 mt-2">下载的剧集将显示在这里</p>
          </div>
        )}
      </div>

      {/* 设置 */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-medium mb-4">下载设置</h2>
        <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
            <span className="text-sm">仅WiFi下载</span>
            <div className="w-12 h-6 bg-[#8B5CF6] rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-sm">下载画质</span>
            <span className="text-sm text-gray-400">高清 1080P</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
