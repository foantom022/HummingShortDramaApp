'use client';

import { useState, useRef, useEffect } from 'react';
import { Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Episode {
  id: string;
  title: string;
  playOrder: number;
}

interface FeedInfoProps {
  dramaId: string;
  title: string;
  description: string;
  tags: string[];
  isVip?: boolean;
  currentEpisodeId?: string;
  episodes?: Episode[];
  showEpisodeInfo?: boolean; // 是否显示集数信息
}

export default function FeedInfo({
  dramaId,
  title,
  description,
  tags,
  isVip = false,
  currentEpisodeId,
  episodes = [],
  showEpisodeInfo = false,
}: FeedInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const router = useRouter();

  // 获取当前集数信息
  const currentEpisode = episodes.find(ep => ep.id === currentEpisodeId);
  const episodeText = currentEpisode 
    ? ` 第${convertToChineseNumber(currentEpisode.playOrder)}集`
    : '';

  // 数字转中文
  function convertToChineseNumber(num: number): string {
    const chineseNumbers = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    
    if (num === 0) return '零';
    if (num < 10) return chineseNumbers[num];
    if (num === 10) return '十';
    if (num < 20) return '十' + chineseNumbers[num % 10];
    if (num < 100) {
      const tens = Math.floor(num / 10);
      const ones = num % 10;
      return chineseNumbers[tens] + '十' + (ones > 0 ? chineseNumbers[ones] : '');
    }
    
    // 100以上直接返回数字
    return num.toString();
  }

  // 检查文字是否超过一行
  useEffect(() => {
    if (descRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(descRef.current).lineHeight);
      const height = descRef.current.scrollHeight;
      setNeedsExpand(height > lineHeight * 1.2); // 超过1行就显示展开按钮
    }
  }, [description]);

  // 进入全屏沉浸式观看
  const handleFullscreen = () => {
    const episodeParam = currentEpisodeId ? `?episode=${currentEpisodeId}` : '';
    router.push(`/drama/${dramaId}/watch${episodeParam}`);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pb-[calc(84px+env(safe-area-inset-bottom,20px))] pointer-events-none">
      {/* 渐变遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

      {/* 内容区域 */}
      <div className="relative px-4 pb-4 space-y-3">
        {/* 剧集标题 + 集数 */}
        <h2 className="text-lg font-bold text-white leading-tight line-clamp-2">
          {title}
          {showEpisodeInfo && episodeText && (
            <span className="ml-2 text-base font-medium text-white/90 animate-in fade-in duration-300">
              {episodeText}
            </span>
          )}
          {isVip && (
            <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded text-[10px] font-bold text-white">
              VIP
            </span>
          )}
        </h2>

        {/* 简介 */}
        <div className="pointer-events-auto flex items-start gap-2">
          <p
            ref={descRef}
            className={`flex-1 text-sm text-white/80 leading-relaxed ${
              isExpanded ? '' : 'line-clamp-1'
            }`}
          >
            {description}
          </p>
          {needsExpand && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex-shrink-0 text-xs text-white/60 active:text-white/80 transition-colors"
            >
              {isExpanded ? '收起' : '展开'}
            </button>
          )}
        </div>

        {/* 标签和全屏按钮 */}
        <div className="flex items-center justify-between gap-2">
          {/* 标签 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 flex-1">
              {tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/10 backdrop-blur-sm rounded-full text-[10px] text-white/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          {/* 全屏按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFullscreen();
            }}
            className="pointer-events-auto flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full active:scale-95 transition-all active:bg-white/20"
          >
            <Maximize2 className="w-4 h-4 text-white/90" />
          </button>
        </div>
      </div>
    </div>
  );
}
