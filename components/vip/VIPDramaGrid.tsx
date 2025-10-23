'use client';

import { useRouter } from 'next/navigation';
import { Crown, Eye, Star } from 'lucide-react';

interface Drama {
  id: string;
  title: string;
  focus: string;
  vPoster: string;
  tags: { id: string; name: string }[];
  views: number;
  rating: number;
  isVip: boolean;
}

interface VIPDramaGridProps {
  dramas: Drama[];
  loading: boolean;
  onVipRequired?: () => void;
  onLoginRequired?: () => void;
}

// 格式化播放量
function formatViews(views: number): string {
  if (views >= 10000) {
    return `${(views / 10000).toFixed(1)}万`;
  }
  return views.toString();
}

export default function VIPDramaGrid({ dramas, loading, onVipRequired, onLoginRequired }: VIPDramaGridProps) {
  const router = useRouter();

  const handleDramaClick = async (drama: Drama) => {
    // VIP剧集需要检查权限
    const token = localStorage.getItem('token');
    
    // 未登录
    if (!token) {
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        alert('请先登录');
        router.push('/login');
      }
      return;
    }

    // 已登录，检查VIP状态
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user.isVip) {
          // 是VIP用户，允许观看
          router.push(`/drama/${drama.id}/watch`);
        } else {
          // 不是VIP用户，提示充值
          if (onVipRequired) {
            onVipRequired();
          } else {
            alert('该剧集为VIP专属内容，请开通VIP会员');
          }
        }
      } else {
        // Token无效，跳转登录
        localStorage.removeItem('token');
        if (onLoginRequired) {
          onLoginRequired();
        } else {
          router.push('/login');
        }
      }
    } catch (error) {
      console.error('检查VIP状态失败:', error);
      alert('网络错误，请稍后重试');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#1F1F1F] rounded-xl overflow-hidden animate-pulse">
            <div className="w-full aspect-[3/4] bg-[#2A2A2A]" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-[#2A2A2A] rounded" />
              <div className="h-3 bg-[#2A2A2A] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {dramas.map((drama, index) => (
        <button
          key={drama.id}
          onClick={() => handleDramaClick(drama)}
          className="relative bg-[#1F1F1F] rounded-xl overflow-hidden transition-all active:scale-98 hover:shadow-xl hover:shadow-[#FBBF24]/20 text-left group"
        >
          {/* VIP徽章 - 左上角 */}
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded-md flex items-center gap-1">
            <Crown className="w-3 h-3 text-white" fill="white" />
            <span className="text-[10px] text-white font-bold">VIP</span>
          </div>

          {/* 排名徽章 - 右上角（前3名） */}
          {index < 3 && (
            <div className="absolute top-2 right-2 z-10 w-8 h-8 bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">{index + 1}</span>
            </div>
          )}

          {/* 剧集海报 */}
          <div className="relative w-full aspect-[3/4] bg-black overflow-hidden">
            <img
              src={drama.vPoster}
              alt={drama.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            
            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* 底部信息 */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              {/* 评分 */}
              <div className="flex items-center gap-1 mb-1">
                <Star className="w-3 h-3 text-[#FBBF24]" fill="#FBBF24" />
                <span className="text-xs text-white font-medium">{drama.rating.toFixed(1)}</span>
              </div>

              {/* 播放量 */}
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-white/70" />
                <span className="text-[10px] text-white/70">{formatViews(drama.views)}</span>
              </div>
            </div>
          </div>

          {/* 剧集信息 */}
          <div className="p-3 space-y-2">
            {/* 标题 */}
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight min-h-[36px]">
              {drama.title}
            </h3>

            {/* 简介 */}
            <p className="text-xs text-gray-400 line-clamp-1">
              {drama.focus}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-1">
              {drama.tags.slice(0, 2).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#FBBF24]/20 text-[#FBBF24] text-[10px] rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* 悬停效果 - 金色边框 */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#FBBF24] rounded-xl transition-colors pointer-events-none" />
        </button>
      ))}
    </div>
  );
}
