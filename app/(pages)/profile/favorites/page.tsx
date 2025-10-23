'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FavoriteDrama {
  id: string;
  title: string;
  focus: string;
  vPoster: string;
  views: number;
  likes: number;
  rating: number;
  totalEpisodes: number;
  isVip: boolean;
  tags: string[];
  favoritedAt: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteDrama[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const response = await fetch('/api/user/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFavorites(data.data.favorites || []);
        }
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (dramaId: string) => {
    if (!confirm('确定要取消收藏吗？')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dramas/${dramaId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFavorites(favorites.filter(item => item.id !== dramaId));
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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
          <h1 className="text-lg font-semibold text-white">我的收藏</h1>
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
              <Star className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-white text-lg mb-2">请先登录</p>
            <p className="text-gray-500 text-sm mb-6 text-center">登录后即可查看收藏列表</p>
            <Link
              href="/login"
              className="bg-[#8B5CF6] text-white px-8 py-3 rounded-lg active:opacity-80 transition-opacity"
            >
              立即登录
            </Link>
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Star className="w-10 h-10 text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm">暂无收藏</p>
          </div>
        ) : (
          <div className="px-4 py-4">
            {/* 统计信息 */}
            <div className="mb-4 text-sm text-gray-400">
              共收藏 {favorites.length} 部剧集
            </div>

            {/* 收藏列表 */}
            <div className="space-y-4">
              {favorites.map((drama) => (
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
                    {/* VIP标记 */}
                    {drama.isVip && (
                      <div className="absolute top-1 right-1 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        VIP
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
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                        {drama.focus}
                      </p>
                      
                      {/* 标签 */}
                      {drama.tags && drama.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {drama.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* 数据统计 */}
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{formatNumber(drama.views)} 播放</span>
                        <span>共{drama.totalEpisodes}集</span>
                        {drama.rating > 0 && (
                          <span className="text-[#FBBF24]">⭐ {drama.rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        href={`/drama/${drama.id}/watch`}
                        className="flex-1 bg-[#8B5CF6] text-white text-sm font-medium py-2 rounded-lg text-center active:opacity-80 transition-opacity"
                      >
                        立即观看
                      </Link>
                      <button
                        onClick={() => removeFavorite(drama.id)}
                        className="p-2 bg-white/5 rounded-lg active:bg-white/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
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
