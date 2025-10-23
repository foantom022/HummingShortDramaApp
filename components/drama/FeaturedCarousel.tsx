'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Drama {
  id: string;
  title: string;
  focus: string;
  vPoster: string;
  tags: { id: string; name: string }[];
  views: number;
  isVip?: boolean;
}

interface FeaturedCarouselProps {
  dramas: Drama[];
  onVipRequired?: () => void;
  onLoginRequired?: () => void;
}

export default function FeaturedCarousel({ dramas, onVipRequired, onLoginRequired }: FeaturedCarouselProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchOffset, setTouchOffset] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isAutoPlaying || dramas.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % dramas.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, dramas.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + dramas.length) % dramas.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % dramas.length);
  };

  const handleDramaClick = async (e: React.MouseEvent, drama: Drama) => {
    e.preventDefault();
    
    // 如果不是VIP剧集，直接跳转
    if (!drama.isVip) {
      router.push(`/drama/${drama.id}/watch`);
      return;
    }

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

  // 触摸滑动处理
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    isDragging.current = true;
    setIsAutoPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current) return;
    touchEndX.current = e.touches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    setTouchOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // 滑动阈值
    const velocity = Math.abs(diff); // 滑动速度

    // 根据滑动距离和速度判断
    if (Math.abs(diff) > threshold || velocity > 100) {
      if (diff > 0) {
        // 向左滑动 - 下一个
        goToNext();
      } else {
        // 向右滑动 - 上一个
        goToPrevious();
      }
    }
    
    // 平滑回弹
    setTouchOffset(0);
  };

  if (dramas.length === 0) return null;

  const currentDrama = dramas[currentIndex];

  return (
    <div className="relative px-4 py-4">
      <div 
        className="relative aspect-[16/9] rounded-[16px] overflow-hidden group touch-manipulation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 轮播容器 - 支持滑动动画 */}
        <div className="relative w-full h-full">
          {dramas.map((drama, index) => {
            const offset = index - currentIndex;
            const isActive = index === currentIndex;
            const isPrev = index === currentIndex - 1;
            const isNext = index === currentIndex + 1;
            
            // 计算透明度和缩放
            let opacity = 0;
            let scale = 0.9;
            if (isActive) {
              opacity = 1;
              scale = 1;
            } else if (isPrev || isNext) {
              opacity = 0.3;
              scale = 0.95;
            }
            
            return (
              <div
                key={drama.id}
                className="absolute inset-0"
                style={{
                  transform: `translateX(${offset * 100 + (isActive ? -touchOffset / 5 : 0)}%) scale(${scale})`,
                  opacity: opacity,
                  zIndex: isActive ? 10 : 0,
                  transition: isDragging.current 
                    ? 'none' 
                    : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease-out',
                }}
              >
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0">
                  <img
                    src={drama.vPoster}
                    alt={drama.title}
                    className="w-full h-full object-cover"
                    loading={index <= currentIndex + 1 ? 'eager' : 'lazy'}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="600"%3E%3Crect fill="%23333" width="400" height="600"/%3E%3Ctext fill="%23666" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E加载失败%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Content - 可点击整个卡片 */}
                <div 
                  onClick={(e) => handleDramaClick(e, drama)}
                  className="absolute inset-0 flex flex-col justify-end p-4 pb-10 cursor-pointer"
                >
                  <div 
                    className="space-y-1.5"
                    style={{
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                      transition: 'opacity 0.6s ease-out, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                      transitionDelay: isActive ? '0.2s' : '0s',
                    }}
                  >
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {drama.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-[#8B5CF6]/60 backdrop-blur-md rounded-full text-[10px] text-white/90 font-medium"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-base font-bold text-white line-clamp-1 leading-snug mb-0.5">
                      {drama.title}
                    </h2>

                    {/* Description */}
                    <p className="text-[11px] text-[#9CA3AF] line-clamp-1 leading-relaxed">
                      {drama.focus}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicators - 调整到更低的位置 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {dramas.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setCurrentIndex(idx);
                setIsAutoPlaying(false);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-1 bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
