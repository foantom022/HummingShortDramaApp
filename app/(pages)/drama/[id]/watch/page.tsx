'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import FeedVideoPlayer from '@/components/video/FeedVideoPlayer';
import EpisodeBar from '@/components/video/EpisodeBar';

interface Episode {
  id: string;
  title: string;
  playOrder: number;
}

interface Drama {
  id: string;
  title: string;
  description: string;
  episodes: Episode[];
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dramaId = params.id as string;
  const initialEpisodeId = searchParams.get('episode');

  const [drama, setDrama] = useState<Drama | null>(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string>(initialEpisodeId || '');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [quality, setQuality] = useState<'720p' | '1080p'>('1080p');
  const [actualVideoUrl, setActualVideoUrl] = useState<string>('');
  const [showInfo, setShowInfo] = useState(true); // 默认显示UI
  const [showEpisodeNumber, setShowEpisodeNumber] = useState(true); // 默认显示集数
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false); // 简介展开状态
  const episodeNumberTimer = React.useRef<NodeJS.Timeout | null>(null);
  const hideUITimer = React.useRef<NodeJS.Timeout | null>(null);

  // 获取剧集详情
  useEffect(() => {
    if (!dramaId) return;

    fetch(`/api/dramas/${dramaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const episodes = data.data.episodes.map((ep: any) => ({
            id: ep.id,
            title: ep.title,
            playOrder: ep.playOrder,
          }));

          setDrama({
            id: data.data.id,
            title: data.data.title,
            description: data.data.description || data.data.focus || '暂无简介',
            episodes,
          });

          // 如果没有指定集数，使用第一集
          if (!currentEpisodeId && episodes.length > 0) {
            setCurrentEpisodeId(episodes[0].id);
          }
        }
      })
      .catch(error => {
        console.error('获取剧集详情失败:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [dramaId]); // 移除currentEpisodeId依赖，避免无限循环

  // 更新视频URL
  useEffect(() => {
    if (currentEpisodeId) {
      setVideoUrl(`/api/episodes/${currentEpisodeId}/sign`);
    }
  }, [currentEpisodeId]);

  // 记录观看历史
  useEffect(() => {
    if (!dramaId || !currentEpisodeId) return;

    const recordHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('未登录，跳过记录观看历史');
          return;
        }

        console.log('📝 记录观看历史:', { dramaId, episodeId: currentEpisodeId });

        const response = await fetch('/api/user/history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            dramaId,
            episodeId: currentEpisodeId,
            progress: 0, // 初始进度为0，后续可以通过视频播放器更新
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ 观看历史记录成功:', data);
        } else {
          console.error('❌ 观看历史记录失败:', response.status);
        }
      } catch (error) {
        console.error('❌ 记录观看历史异常:', error);
      }
    };

    // 延迟1秒记录，确保用户真的在观看
    const timer = setTimeout(recordHistory, 1000);
    return () => clearTimeout(timer);
  }, [dramaId, currentEpisodeId]);

  // 获取实际视频URL并根据清晰度选择
  useEffect(() => {
    if (!videoUrl) {
      console.log('⚠️ videoUrl为空，跳过');
      return;
    }

    console.log('🎬 获取视频URL:', videoUrl, '清晰度:', quality);

    fetch(videoUrl)
      .then(res => {
        console.log('📡 API响应状态:', res.status, res.ok);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('📦 视频URL API返回:', data);
        if (data.success && data.data && data.data.urls) {
          const url = quality === '1080p' 
            ? (data.data.urls.high || data.data.urls.super || data.data.urls.normal)
            : (data.data.urls.normal || data.data.urls.high);
          console.log('✅ 设置视频URL:', url);
          setActualVideoUrl(url);
        } else {
          console.error('❌ API返回数据格式错误:', data);
        }
      })
      .catch(error => {
        console.error('❌ 获取视频URL失败:', error);
      });
  }, [videoUrl, quality]);

  // 切换集数
  const handleEpisodeChange = (episodeId: string) => {
    setCurrentEpisodeId(episodeId);
  };

  // 切换清晰度
  const handleQualityChange = (newQuality: '720p' | '1080p') => {
    setQuality(newQuality);
  };

  // 单击显示/隐藏信息
  const handleScreenClick = () => {
    const newShowInfo = !showInfo;
    setShowInfo(newShowInfo);
    
    // 清除之前的定时器
    if (episodeNumberTimer.current) {
      clearTimeout(episodeNumberTimer.current);
    }
    if (hideUITimer.current) {
      clearTimeout(hideUITimer.current);
    }
    
    // 显示集数信息
    setShowEpisodeNumber(true);
    
    // 3秒后自动隐藏集数信息
    episodeNumberTimer.current = setTimeout(() => {
      setShowEpisodeNumber(false);
    }, 3000);
    
    if (newShowInfo) {
      // 显示后5秒自动隐藏UI（给用户更多时间操作）
      hideUITimer.current = setTimeout(() => setShowInfo(false), 5000);
    }
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (episodeNumberTimer.current) {
        clearTimeout(episodeNumberTimer.current);
      }
      if (hideUITimer.current) {
        clearTimeout(hideUITimer.current);
      }
    };
  }, []);

  // 数字转中文
  const convertToChineseNumber = (num: number): string => {
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
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-2">剧集不存在</p>
          <button
            onClick={() => router.back()}
            className="text-purple-500 text-sm"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      {/* 视频播放器 */}
      <div className="absolute inset-0" onClick={handleScreenClick}>
        {actualVideoUrl ? (
          <FeedVideoPlayer
            videoUrl={actualVideoUrl}
            posterUrl=""
            isActive={true}
            immersiveMode={true}
          />
        ) : (
          <div className="absolute inset-0 bg-black flex items-center justify-center">
            <div className="text-white text-sm">加载视频中...</div>
          </div>
        )}
      </div>

      {/* 边缘变暗遮罩 + 剧集信息 */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          showInfo ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
        
        {/* 顶部信息栏 */}
        <div className="absolute top-0 left-0 right-0 pt-4 px-4">
          <div className="flex items-center gap-3">
            {/* 返回按钮 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.back();
              }}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full active:scale-95 transition-all pointer-events-auto"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            {/* 剧集标题 + 集数 */}
            <h1 className="flex-1 text-lg font-bold text-white leading-tight line-clamp-1">
              {drama?.title}
              {showEpisodeNumber && (
                <span className="ml-2 text-base font-medium text-white/90 animate-in fade-in duration-300">
                  第{convertToChineseNumber(drama?.episodes.find(ep => ep.id === currentEpisodeId)?.playOrder || 1)}集
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* 底部信息 - 剧集简介 */}
        <div className="absolute bottom-[calc(env(safe-area-inset-bottom,20px)+32px)] left-0 right-0 px-3">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <p 
                  className={`text-sm text-white/90 leading-relaxed ${
                    isDescriptionExpanded ? '' : 'line-clamp-2'
                  }`}
                >
                  {drama?.description}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDescriptionExpanded(!isDescriptionExpanded);
                }}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-white/70 hover:text-white active:scale-95 transition-all pointer-events-auto"
              >
                {isDescriptionExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 选集Bar */}
      {drama.episodes && drama.episodes.length > 0 && (
        <div 
          className={`fixed bottom-[env(safe-area-inset-bottom,20px)] left-0 right-0 z-50 pointer-events-auto transition-opacity duration-300 ${
            showInfo ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <EpisodeBar
            episodes={drama.episodes}
            currentEpisodeId={currentEpisodeId}
            onEpisodeChange={handleEpisodeChange}
            immersiveMode={true}
            quality={quality}
            onQualityChange={handleQualityChange}
          />
        </div>
      )}
    </div>
  );
}
