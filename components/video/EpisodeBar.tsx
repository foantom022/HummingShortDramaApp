'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, List } from 'lucide-react';

interface Episode {
  id: string;
  title: string;
  playOrder: number;
}

interface EpisodeBarProps {
  episodes: Episode[];
  currentEpisodeId: string;
  onEpisodeChange: (episodeId: string) => void;
  immersiveMode?: boolean; // 沉浸式模式
  quality?: '720p' | '1080p'; // 当前清晰度
  onQualityChange?: (quality: '720p' | '1080p') => void; // 清晰度切换回调
}

export default function EpisodeBar({
  episodes,
  currentEpisodeId,
  onEpisodeChange,
  immersiveMode = false,
  quality = '1080p',
  onQualityChange,
}: EpisodeBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  // 调试日志
  console.log('📺 EpisodeBar渲染:', {
    episodesCount: episodes.length,
    currentEpisodeId,
    isExpanded,
  });

  // 检查是否需要显示箭头
  const checkArrows = () => {
    if (!scrollRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    if (isExpanded) {
      checkArrows();
      window.addEventListener('resize', checkArrows);
      return () => window.removeEventListener('resize', checkArrows);
    }
  }, [episodes, isExpanded]);

  // 滚动到当前集
  useEffect(() => {
    if (!scrollRef.current || !isExpanded) return;

    const currentIndex = episodes.findIndex(ep => ep.id === currentEpisodeId);
    if (currentIndex === -1) return;

    const container = scrollRef.current;
    const episodeWidth = 56; // 每个集数按钮的宽度
    const gap = 8; // 间距
    const scrollPosition = currentIndex * (episodeWidth + gap) - container.clientWidth / 2 + episodeWidth / 2;

    container.scrollTo({
      left: Math.max(0, scrollPosition),
      behavior: 'smooth',
    });
  }, [currentEpisodeId, episodes, isExpanded]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 200;
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });

    setTimeout(checkArrows, 300);
  };

  if (episodes.length === 0) return null;

  const currentEpisode = episodes.find(ep => ep.id === currentEpisodeId);
  const currentEpisodeNumber = currentEpisode?.playOrder || 1;

  // 沉浸式模式的样式
  const barHeight = immersiveMode ? 'h-7' : 'h-5';
  const textSize = immersiveMode ? 'text-xs' : 'text-[10px]';
  const iconSize = immersiveMode ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5';

  return (
    <div className="relative pointer-events-auto transition-opacity duration-300 z-50">
      {/* 折叠状态：完整的一条Bar */}
      {!isExpanded && (
        <div className={`${barHeight} bg-black/40 backdrop-blur-sm flex items-center justify-between px-4 gap-3`}>
          {/* 左侧：选集按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('🎯 点击展开选集Bar');
              setIsExpanded(true);
            }}
            className="flex items-center gap-1 active:scale-95 transition-all pointer-events-auto"
          >
            <List className={`${iconSize} text-white/70`} />
            <span className={`${textSize} font-medium text-white/70`}>
              选集 {currentEpisodeNumber}/{episodes.length}
            </span>
            <ChevronDown className={`${iconSize} text-white/50 rotate-180`} />
          </button>

          {/* 右侧：清晰度按钮（仅沉浸式模式） */}
          {immersiveMode && onQualityChange && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQualityMenu(!showQualityMenu);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full active:scale-95 transition-all pointer-events-auto"
              >
                <span className={`${textSize} font-medium text-white/90`}>
                  清晰度
                </span>
                <ChevronDown className={`${iconSize} text-white/70 ${showQualityMenu ? 'rotate-180' : ''} transition-transform`} />
              </button>

              {/* 清晰度菜单 */}
              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-black/80 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQualityChange('1080p');
                      setShowQualityMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${
                      quality === '1080p' 
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-medium' 
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span>1080p</span>
                    {quality === '1080p' && <span className="text-xs">✓</span>}
                  </button>
                  <div className="h-px bg-white/10" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onQualityChange('720p');
                      setShowQualityMenu(false);
                    }}
                    className={`w-full px-4 py-2.5 text-sm text-left transition-colors flex items-center justify-between ${
                      quality === '720p' 
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white font-medium' 
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span>720p</span>
                    {quality === '720p' && <span className="text-xs">✓</span>}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 展开状态：集数列表 */}
      {isExpanded && (
        <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-3 space-y-2">
          {/* 头部：标题和收起按钮 */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-white/90" />
              <span className="text-sm font-medium text-white/90">
                选集 ({currentEpisodeNumber}/{episodes.length})
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronDown className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* 集数列表 */}
          <div className="relative">
            {/* 左箭头 */}
            {showLeftArrow && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-transform"
                style={{ marginLeft: '-2px' }}
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
            )}

            {/* 集数按钮 */}
            <div
              ref={scrollRef}
              onScroll={checkArrows}
              className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {episodes.map((episode) => {
                const isActive = episode.id === currentEpisodeId;
                
                return (
                  <button
                    key={episode.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('🎯 点击集数按钮:', episode.playOrder, 'ID:', episode.id);
                      onEpisodeChange(episode.id);
                      // 切换后自动收起
                      setTimeout(() => setIsExpanded(false), 300);
                    }}
                    className={`
                      flex-shrink-0 w-14 h-9 rounded-lg font-medium text-sm
                      transition-all duration-200 active:scale-95 pointer-events-auto
                      ${isActive
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-lg shadow-purple-500/30'
                        : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20'
                      }
                    `}
                  >
                    {episode.playOrder}
                  </button>
                );
              })}
            </div>

            {/* 右箭头 */}
            {showRightArrow && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-95 transition-transform"
                style={{ marginRight: '-2px' }}
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
