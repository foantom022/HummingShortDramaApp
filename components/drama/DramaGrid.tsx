'use client';

import { Eye, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Drama {
  id: string;
  title: string;
  vPoster: string;
  tags: { id: string; name: string }[];
  views: number;
  rating: number;
  isVip: boolean;
}

interface DramaGridProps {
  dramas: Drama[];
  onVipRequired?: () => void;
  onLoginRequired?: () => void;
}

export default function DramaGrid({ dramas, onVipRequired, onLoginRequired }: DramaGridProps) {
  const router = useRouter();
  const formatViews = (views: number) => {
    if (views >= 10000) {
      return `${(views / 10000).toFixed(1)}万`;
    }
    return views.toString();
  };

  const handleDramaClick = async (e: React.MouseEvent, drama: Drama) => {
    // 如果不是VIP剧集，直接跳转
    if (!drama.isVip) {
      router.push(`/drama/${drama.id}/watch`);
      return;
    }

    // VIP剧集需要检查权限
    e.preventDefault();
    
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

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 gap-3">
        {dramas.map((drama) => (
          <div
            key={drama.id}
            onClick={(e) => handleDramaClick(e, drama)}
            className="group active:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="space-y-2">
              {/* Poster */}
              <div className="relative aspect-[3/4] rounded-[12px] overflow-hidden bg-[#1F1F1F] touch-manipulation">
                <img
                  src={drama.vPoster}
                  alt={drama.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="400"%3E%3Crect fill="%231F1F1F" width="300" height="400"/%3E%3C/svg%3E';
                  }}
                />
                
                {/* VIP Badge */}
                {drama.isVip && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-white" />
                    VIP
                  </div>
                )}

                {/* Views Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2">
                  <div className="flex items-center gap-1 text-white text-[10px]">
                    <Eye className="w-3 h-3" />
                    <span>{formatViews(drama.views)}</span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-white text-sm font-medium line-clamp-2 leading-tight px-0.5">
                {drama.title}
              </h3>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 px-0.5">
                {drama.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-[#8B5CF6]/20 text-[#C4B5FD] text-[10px] rounded"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
