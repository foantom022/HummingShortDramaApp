'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HistoryItem {
  id: string;
  drama: {
    id: string;
    title: string;
    vPoster: string;
    totalEpisodes: number;
  };
  episode: {
    id: string;
    title: string;
    playOrder: number;
  };
  progress: number;
  updatedAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const response = await fetch('/api/user/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHistory(data.data.history || []);
        }
      }
    } catch (error) {
      console.error('获取观看历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (dramaId: string) => {
    if (!confirm('确定要删除这条观看记录吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/history?dramaId=${dramaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setHistory(history.filter(item => item.drama.id !== dramaId));
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const clearAllHistory = async () => {
    if (!confirm('确定要清空所有观看历史吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setHistory([]);
      }
    } catch (error) {
      console.error('清空失败:', error);
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
          <h1 className="text-lg font-semibold text-white">观看历史</h1>
          <button
            onClick={clearAllHistory}
            className="text-sm text-gray-400 active:opacity-70 transition-opacity"
            disabled={history.length === 0}
          >
            清空
          </button>
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
              <Play className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-white text-lg mb-2">请先登录</p>
            <p className="text-gray-500 text-sm mb-6 text-center">登录后即可查看观看历史</p>
            <Link
              href="/login"
              className="bg-[#8B5CF6] text-white px-8 py-3 rounded-lg active:opacity-80 transition-opacity"
            >
              立即登录
            </Link>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Play className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm">暂无观看历史</p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 bg-white/5 rounded-lg p-3 active:bg-white/10 transition-colors"
              >
                {/* 剧集封面 */}
                <Link
                  href={`/drama/${item.drama.id}/watch?episode=${item.episode.id}`}
                  className="relative flex-shrink-0"
                >
                  <img
                    src={item.drama.vPoster}
                    alt={item.drama.title}
                    className="w-24 h-32 object-cover rounded-lg"
                  />
                  {/* 继续观看标记 */}
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Play className="w-8 h-8 text-white" fill="white" />
                  </div>
                  {/* 进度条 */}
                  {item.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-lg overflow-hidden">
                      <div
                        className="h-full bg-[#8B5CF6]"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}
                </Link>

                {/* 剧集信息 */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <Link href={`/drama/${item.drama.id}/watch?episode=${item.episode.id}`}>
                      <h3 className="text-white font-medium text-base mb-1 truncate">
                        {item.drama.title}
                      </h3>
                    </Link>
                    <p className="text-gray-400 text-sm mb-1">
                      观看至 第{item.episode.playOrder}集 · {item.progress}%
                    </p>
                    <p className="text-gray-500 text-xs">
                      {formatTime(item.updatedAt)}
                    </p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center gap-2 mt-2">
                    <Link
                      href={`/drama/${item.drama.id}/watch?episode=${item.episode.id}`}
                      className="flex-1 bg-[#8B5CF6] text-white text-sm font-medium py-2 rounded-lg text-center active:opacity-80 transition-opacity"
                    >
                      继续观看
                    </Link>
                    <button
                      onClick={() => deleteHistoryItem(item.drama.id)}
                      className="p-2 bg-white/5 rounded-lg active:bg-white/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
