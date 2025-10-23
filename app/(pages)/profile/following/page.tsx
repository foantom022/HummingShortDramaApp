'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bell, BellOff, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FollowingDrama {
  id: string;
  title: string;
  vPoster: string;
  totalEpisodes: number;
  isCompleted: boolean;
  lastWatchedEpisode: number;
  hasNewEpisode: boolean;
  updatedAt: string;
}

export default function FollowingPage() {
  const router = useRouter();
  const [following, setFollowing] = useState<FollowingDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      // 从观看历史中获取追剧列表（未完结的剧集）
      const response = await fetch('/api/user/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const history = data.data.history || [];
          
          // 按剧集分组，只保留每个剧集的最新观看记录
          const dramaMap = new Map<string, any>();
          history.forEach((item: any) => {
            const dramaId = item.drama.id;
            if (!dramaMap.has(dramaId) || 
                new Date(item.updatedAt) > new Date(dramaMap.get(dramaId).updatedAt)) {
              dramaMap.set(dramaId, item);
            }
          });

          // 转换为追剧列表格式
          const followingList = Array.from(dramaMap.values()).map((item: any) => ({
            id: item.drama.id,
            title: item.drama.title,
            vPoster: item.drama.vPoster,
            totalEpisodes: item.drama.totalEpisodes,
            isCompleted: false, // 可以从API获取
            lastWatchedEpisode: item.episode.playOrder,
            hasNewEpisode: item.episode.playOrder < item.drama.totalEpisodes,
            updatedAt: item.updatedAt,
          }));

          // 按更新时间倒序排列
          followingList.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );

          setFollowing(followingList);
        }
      }
    } catch (error) {
      console.error('获取追剧列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / 86400000);
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 active:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">追剧列表</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="absolute top-14 bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !isLoggedIn ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-white text-lg mb-2">请先登录</p>
            <p className="text-gray-500 text-sm mb-6 text-center">登录后即可查看追剧列表</p>
            <Link
              href="/login"
              className="bg-[#8B5CF6] text-white px-8 py-3 rounded-lg active:opacity-80 transition-opacity"
            >
              立即登录
            </Link>
          </div>
        ) : following.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm">暂无追剧</p>
            <p className="text-gray-600 text-xs mt-2">观看剧集后会自动添加到追剧列表</p>
          </div>
        ) : (
          <div className="px-4 py-4">
            {/* 统计信息 */}
            <div className="mb-4 text-sm text-gray-400">
              正在追 {following.length} 部剧集
            </div>

            {/* 追剧列表 */}
            <div className="space-y-4">
              {following.map((drama) => (
                <div
                  key={drama.id}
                  className="flex gap-3 bg-white/5 rounded-lg p-3 active:bg-white/10 transition-colors"
                >
                  {/* 剧集封面 */}
                  <Link
                    href={`/drama/${drama.id}/watch`}
                    className="relative flex-shrink-0"
                  >
                    <img
                      src={drama.vPoster}
                      alt={drama.title}
                      className="w-24 h-32 object-cover rounded-lg"
                    />
                    {/* 更新提示 */}
                    {drama.hasNewEpisode && (
                      <div className="absolute top-1 right-1 bg-[#EF4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        更新
                      </div>
                    )}
                  </Link>

                  {/* 剧集信息 */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link href={`/drama/${drama.id}/watch`}>
                        <h3 className="text-white font-medium text-base mb-1 truncate">
                          {drama.title}
                        </h3>
                      </Link>
                      
                      {/* 观看进度 */}
                      <div className="mb-2">
                        <p className="text-gray-400 text-sm">
                          看到第{drama.lastWatchedEpisode}集 / 共{drama.totalEpisodes}集
                        </p>
                        {/* 进度条 */}
                        <div className="mt-1 h-1 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#8B5CF6] rounded-full"
                            style={{ 
                              width: `${(drama.lastWatchedEpisode / drama.totalEpisodes) * 100}%` 
                            }}
                          />
                        </div>
                      </div>

                      {/* 状态信息 */}
                      <div className="flex items-center gap-2 text-xs">
                        {drama.hasNewEpisode ? (
                          <span className="text-[#EF4444] flex items-center gap-1">
                            <Bell className="w-3 h-3" />
                            有新集更新
                          </span>
                        ) : drama.isCompleted ? (
                          <span className="text-gray-500">已完结</span>
                        ) : (
                          <span className="text-gray-500">追剧中</span>
                        )}
                        <span className="text-gray-600">·</span>
                        <span className="text-gray-500">
                          {formatTime(drama.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        href={`/drama/${drama.id}/watch`}
                        className="flex-1 bg-[#8B5CF6] text-white text-sm font-medium py-2 rounded-lg text-center active:opacity-80 transition-opacity flex items-center justify-center gap-1"
                      >
                        <Play className="w-4 h-4" />
                        继续观看
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
