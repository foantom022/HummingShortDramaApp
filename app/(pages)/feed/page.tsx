'use client';

import { useState, useEffect, useRef } from 'react';
import BottomNav from '@/components/common/BottomNav';
import FeedVideoPlayer from '@/components/video/FeedVideoPlayer';
import FeedActions from '@/components/video/FeedActions';
import FeedInfo from '@/components/video/FeedInfo';
import CommentDrawer from '@/components/video/CommentDrawer';
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
  coverUrl: string;
  videoUrl: string;
  tags: string[];
  isVip: boolean;
  likes: number;
  comments: number;
  favorites: number;
  episodes: Episode[];
  currentEpisodeId: string;
}

export default function FeedPage() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [commentDrawerOpen, setCommentDrawerOpen] = useState(false);
  const [selectedDramaId, setSelectedDramaId] = useState<string>('');
  const [episodesCache, setEpisodesCache] = useState<Record<string, Episode[]>>({});
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showEpisodeInfo, setShowEpisodeInfo] = useState(false); // 控制集数信息显示
  
  // 维护点赞和收藏状态
  const [likedDramas, setLikedDramas] = useState<Set<string>>(new Set());
  const [favoritedDramas, setFavoritedDramas] = useState<Set<string>>(new Set());
  const [dramaLikeCounts, setDramaLikeCounts] = useState<Record<string, number>>({});
  const [dramaFavoriteCounts, setDramaFavoriteCounts] = useState<Record<string, number>>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const isScrolling = useRef(false);
  const episodeInfoTimer = useRef<NodeJS.Timeout | null>(null);

  // 防止页面滚动和下拉刷新（手机端）
  useEffect(() => {
    // 添加class到body和html
    document.body.classList.add('feed-page');
    document.documentElement.classList.add('feed-page');
    
    // 设置样式
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    document.documentElement.style.overscrollBehavior = 'none';
    
    // 禁止下拉刷新和橡皮筋效果
    const preventPullToRefresh = (e: TouchEvent) => {
      // 阻止所有touchmove的默认行为（包括下拉刷新）
      const target = e.target as HTMLElement;
      
      // 只允许视频容器内的滑动
      if (!target.closest('[data-video-container]')) {
        return;
      }
      
      e.preventDefault();
    };
    
    document.addEventListener('touchmove', preventPullToRefresh, { passive: false });
    
    return () => {
      document.body.classList.remove('feed-page');
      document.documentElement.classList.remove('feed-page');
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
      document.removeEventListener('touchmove', preventPullToRefresh);
    };
  }, []);

  // 获取视频流数据
  useEffect(() => {
    fetchFeedData();
    fetchUserInteractions();
  }, []);

  // 获取用户的点赞和收藏状态
  const fetchUserInteractions = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // 获取用户收藏列表
      const favResponse = await fetch('/api/user/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (favResponse.ok) {
        const favData = await favResponse.json();
        if (favData.success && favData.data?.favorites) {
          const favIds = new Set(favData.data.favorites.map((f: any) => f.id));
          setFavoritedDramas(favIds);
        }
      }

      // 注意：点赞状态需要后端提供API，这里先用本地状态
      // TODO: 添加获取用户点赞列表的API
    } catch (error) {
      console.error('获取用户互动状态失败:', error);
    }
  };

  // 获取当前剧集的所有集数
  useEffect(() => {
    if (dramas.length === 0 || currentIndex >= dramas.length) return;

    const currentDrama = dramas[currentIndex];
    
    // 如果已经有episodes数据，跳过
    if (currentDrama.episodes && currentDrama.episodes.length > 0) {
      console.log('✅ 当前剧集已有episodes数据:', currentDrama.episodes.length, '集');
      return;
    }
    
    // 如果已经缓存了，使用缓存
    if (episodesCache[currentDrama.id]) {
      console.log('📦 使用缓存的episodes数据:', episodesCache[currentDrama.id].length, '集');
      setDramas(prevDramas => {
        const updatedDramas = [...prevDramas];
        updatedDramas[currentIndex] = {
          ...updatedDramas[currentIndex],
          episodes: episodesCache[currentDrama.id],
        };
        return updatedDramas;
      });
      return;
    }

    // 获取剧集详情（包含所有集数）
    console.log('🎬 开始获取剧集详情:', currentDrama.title, currentDrama.id);
    
    let isCancelled = false;
    
    fetch(`/api/dramas/${currentDrama.id}`)
      .then(res => res.json())
      .then(data => {
        if (isCancelled) return;
        
        console.log('📦 剧集详情API返回:', data);
          if (data.success && data.data && data.data.episodes) {
            const episodes = data.data.episodes.map((ep) => ({
            id: ep.id,
            title: ep.title,
            playOrder: ep.playOrder,
          }));
          
          console.log('✅ 获取到集数列表:', episodes.length, '集');
          console.log('📋 集数详情:', episodes);
          
          // 缓存episodes
          setEpisodesCache(prev => ({ ...prev, [currentDrama.id]: episodes }));
          
          // 更新当前剧集的episodes，并确保currentEpisodeId正确
          setDramas(prevDramas => {
            const updatedDramas = [...prevDramas];
            const targetIndex = updatedDramas.findIndex(d => d.id === currentDrama.id);
            
            if (targetIndex !== -1) {
              const firstEpisodeId = episodes[0]?.id || updatedDramas[targetIndex].currentEpisodeId;
              
              updatedDramas[targetIndex] = {
                ...updatedDramas[targetIndex],
                episodes,
                currentEpisodeId: updatedDramas[targetIndex].currentEpisodeId || firstEpisodeId,
              };
              
              console.log('🔄 更新后的剧集数据:', updatedDramas[targetIndex]);
            }
            
            return updatedDramas;
          });
        } else {
          console.error('❌ API返回数据格式错误:', data);
        }
      })
      .catch(error => {
        if (!isCancelled) {
          console.error('❌ 获取剧集详情失败:', error);
        }
      });
    
    return () => {
      isCancelled = true;
    };
  }, [currentIndex, dramas.length]);

  const fetchFeedData = async (cursor?: string) => {
    try {
      if (cursor) {
        setIsLoadingMore(true);
      }
      
      const url = cursor 
        ? `/api/feed?limit=20&cursor=${cursor}` 
        : '/api/feed?limit=20'; // 每次加载20条
      
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const dramaList = data.dramas || [];
        
        const formattedDramas = dramaList.map((drama: any) => {
          const episodeId = drama.firstEpisode?.id;
          console.log('📺 剧集:', drama.title, '第一集ID:', episodeId);
          
          return {
            id: drama.id,
            title: drama.title,
            description: drama.description || drama.focus || '',
            coverUrl: drama.vPoster || drama.hPoster || '',
            videoUrl: episodeId ? `/api/episodes/${episodeId}/sign` : '',
            tags: drama.tags || [],
            isVip: drama.isVip || false,
            likes: drama.stats?.likeCount || drama.likes || 0,
            comments: drama.stats?.commentCount || 0,
            favorites: drama.stats?.favoriteCount || 0,
            episodes: [], // 稍后获取
            currentEpisodeId: episodeId || '',
          };
        });
        
        setDramas(prev => cursor ? [...prev, ...formattedDramas] : formattedDramas);
        
        // 更新分页信息
        setNextCursor(data.nextCursor || null);
        setHasMore(data.hasMore || false);
        
        // 立即预加载前3个视频的URL
        if (!cursor && formattedDramas.length > 0) {
          console.log('🚀 开始预加载前3个视频URL...');
          for (let i = 0; i < Math.min(3, formattedDramas.length); i++) {
            const drama = formattedDramas[i];
            if (drama.videoUrl.startsWith('/api/episodes/')) {
              fetch(drama.videoUrl)
                .then(res => res.json())
                .then(data => {
                  if (data.success && data.data.urls) {
                    const url = data.data.urls.high || data.data.urls.super || data.data.urls.normal || '';
                    console.log(`✅ 预加载视频 ${i + 1} URL成功:`, url);
                    setVideoUrlCache(prev => ({ ...prev, [drama.id]: url }));
                    
                    // 预加载视频数据
                    const video = document.createElement('video');
                    video.src = url;
                    video.preload = 'auto';
                    video.load();
                  }
                })
                .catch(error => {
                  console.error(`❌ 预加载视频 ${i + 1} URL失败:`, error);
                });
            }
          }
        }
      }
    } catch (error) {
      console.error('获取视频流失败:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isScrolling.current || commentDrawerOpen) return;
    
    // 记录触摸起始位置
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (isScrolling.current || commentDrawerOpen) return;
    
    // 更新触摸位置
    touchEndY.current = e.touches[0].clientY;
    
    // 计算滑动距离
    const deltaY = touchStartY.current - touchEndY.current;
    
    // 始终阻止默认行为（防止页面滚动和下拉刷新）
    e.preventDefault();
    
    // 如果在第一个视频且向下拉，不允许
    if (currentIndex === 0 && deltaY < 0) {
      return; // 不处理，但已经阻止了默认行为
    }
  };

  // 处理触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isScrolling.current || commentDrawerOpen) return;

    const deltaY = touchStartY.current - touchEndY.current;
    const threshold = 80; // 增加滑动阈值，避免误触

    if (Math.abs(deltaY) > threshold) {
      isScrolling.current = true;

      if (deltaY > 0) {
        // 向上滑动 - 下一个视频
        if (currentIndex < dramas.length - 1) {
          setCurrentIndex(currentIndex + 1);
          
          // 当接近列表末尾时，自动加载更多
          if (currentIndex >= dramas.length - 5 && hasMore && !isLoadingMore) {
            console.log('🔄 接近底部，自动加载更多视频...');
            fetchFeedData(nextCursor || undefined);
          }
        }
      } else {
        // 向下滑动 - 上一个视频
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
        }
      }

      // 重置滚动状态
      setTimeout(() => {
        isScrolling.current = false;
      }, 600); // 增加防抖时间
    }

    // 重置触摸位置
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  // 切换集数
  const handleEpisodeChange = (episodeId: string) => {
    console.log('🔄 切换集数:', episodeId);
    console.log('📺 当前剧集:', dramas[currentIndex].title);
    console.log('🎬 新的视频URL:', `/api/episodes/${episodeId}/sign`);
    
    const currentDrama = dramas[currentIndex];
    
    // 更新当前剧集的currentEpisodeId和videoUrl
    setDramas(prevDramas => {
      const updatedDramas = [...prevDramas];
      updatedDramas[currentIndex] = {
        ...updatedDramas[currentIndex],
        currentEpisodeId: episodeId,
        videoUrl: `/api/episodes/${episodeId}/sign`,
      };
      console.log('✅ 剧集数据已更新:', updatedDramas[currentIndex]);
      return updatedDramas;
    });
    
    // 清除旧的视频URL缓存，强制重新获取
    setVideoUrlCache(prev => {
      const newCache = { ...prev };
      delete newCache[currentDrama.id];
      return newCache;
    });
    
    // 预加载新的视频URL
    fetch(`/api/episodes/${episodeId}/sign`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.urls) {
          const url = data.data.urls.high || data.data.urls.super || data.data.urls.normal || '';
          console.log('✅ 预加载新集数视频URL成功:', url);
          setVideoUrlCache(prev => ({ ...prev, [currentDrama.id]: url }));
        }
      })
      .catch(error => {
        console.error('❌ 预加载新集数视频URL失败:', error);
      });
  };

  

  // 预加载视频URL（提前获取签名URL）
  const [videoUrlCache, setVideoUrlCache] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (dramas.length === 0) return;

    // 预加载当前视频的前后各2个的签名URL
    const preloadIndexes = [
      currentIndex - 2,
      currentIndex - 1,
      currentIndex,
      currentIndex + 1,
      currentIndex + 2,
    ].filter((i) => i >= 0 && i < dramas.length);

    preloadIndexes.forEach(async (index) => {
      const drama = dramas[index];
      
      // 如果已经缓存了，跳过
      if (videoUrlCache[drama.id]) return;
      
      // 如果是API端点，提前获取签名URL
      if (drama.videoUrl.startsWith('/api/episodes/')) {
        try {
          const response = await fetch(drama.videoUrl);
          const data = await response.json();
          if (data.success && data.data.urls) {
            const url = data.data.urls.high || data.data.urls.super || data.data.urls.normal || '';
            setVideoUrlCache(prev => ({ ...prev, [drama.id]: url }));
            
            // 预加载视频数据
            const video = document.createElement('video');
            video.src = url;
            video.preload = 'auto'; // 改为auto，预加载整个视频
            video.load();
          }
        } catch (error) {
          console.error('预加载视频URL失败:', error);
        }
      }
    });
  }, [currentIndex, dramas, videoUrlCache]);

  // 处理屏幕点击 - 显示集数信息
  const handleScreenClick = () => {
    // 清除之前的定时器
    if (episodeInfoTimer.current) {
      clearTimeout(episodeInfoTimer.current);
    }
    
    // 显示集数信息
    setShowEpisodeInfo(true);
    
    // 3秒后自动隐藏
    episodeInfoTimer.current = setTimeout(() => {
      setShowEpisodeInfo(false);
    }, 3000);
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (episodeInfoTimer.current) {
        clearTimeout(episodeInfoTimer.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    );
  }

  if (dramas.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-2">暂无视频</p>
          <p className="text-gray-400 text-sm">请稍后再试</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black" onClick={handleScreenClick}>
      {/* 只有视频层会移动 */}
      <div
        ref={containerRef}
        data-video-container="true"
        className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden"
        style={{
          touchAction: 'none', // 完全禁止浏览器默认触摸行为
          overscrollBehavior: 'none', // 禁止过度滚动
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 渲染当前视频和前后各一个视频 - 只有这个容器会移动 */}
        {dramas.map((drama, index) => {
          const isActive = index === currentIndex;
          const shouldRender =
            index >= currentIndex - 1 && index <= currentIndex + 1;

          if (!shouldRender) return null;

          return (
            <div
              key={drama.id}
              className="absolute inset-0 transition-transform duration-500 ease-out"
              style={{
                transform: `translateY(${(index - currentIndex) * 100}%)`,
              }}
            >
              {/* 只渲染视频背景 */}
              <FeedVideoPlayer
                videoUrl={drama.videoUrl}
                posterUrl={drama.coverUrl}
                isActive={isActive}
                cachedUrl={videoUrlCache[drama.id]} // 传递缓存的URL
              />
            </div>
          );
        })}
      </div>

      {/* 固定层：右侧交互按钮 - 不会移动 */}
      {dramas[currentIndex] && (() => {
        const currentDrama = dramas[currentIndex];
        const dramaId = currentDrama.id;
        const isLiked = likedDramas.has(dramaId);
        const isFavorited = favoritedDramas.has(dramaId);
        const currentLikes = dramaLikeCounts[dramaId] ?? currentDrama.likes;
        const currentFavorites = dramaFavoriteCounts[dramaId] ?? currentDrama.favorites;
        
        return (
          <FeedActions
            dramaId={dramaId}
            initialLikes={currentLikes}
            initialComments={currentDrama.comments}
            initialFavorites={currentFavorites}
            isLiked={isLiked}
            isFavorited={isFavorited}
            onLike={async () => {
              const token = localStorage.getItem('token');
              if (!token) {
                alert('请先登录');
                return;
              }

              try {
                const method = isLiked ? 'DELETE' : 'POST';
                const response = await fetch(`/api/dramas/${dramaId}/like`, {
                  method,
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                });

                if (response.ok) {
                  // 更新点赞状态
                  setLikedDramas(prev => {
                    const newSet = new Set(prev);
                    if (isLiked) {
                      newSet.delete(dramaId);
                    } else {
                      newSet.add(dramaId);
                    }
                    return newSet;
                  });

                  // 更新点赞数
                  setDramaLikeCounts(prev => ({
                    ...prev,
                    [dramaId]: isLiked ? currentLikes - 1 : currentLikes + 1,
                  }));
                }
              } catch (error) {
                console.error('点赞失败:', error);
              }
            }}
            onComment={() => {
              setSelectedDramaId(dramaId);
              setCommentDrawerOpen(true);
            }}
            onFavorite={async () => {
              const token = localStorage.getItem('token');
              if (!token) {
                alert('请先登录');
                return;
              }

              try {
                const method = isFavorited ? 'DELETE' : 'POST';
                const response = await fetch(`/api/dramas/${dramaId}/favorite`, {
                  method,
                  headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                });

                if (response.ok) {
                  // 更新收藏状态
                  setFavoritedDramas(prev => {
                    const newSet = new Set(prev);
                    if (isFavorited) {
                      newSet.delete(dramaId);
                    } else {
                      newSet.add(dramaId);
                    }
                    return newSet;
                  });

                  // 更新收藏数
                  setDramaFavoriteCounts(prev => ({
                    ...prev,
                    [dramaId]: isFavorited ? currentFavorites - 1 : currentFavorites + 1,
                  }));
                }
              } catch (error) {
                console.error('收藏失败:', error);
              }
            }}
            onShare={() => {
              if (navigator.share) {
                navigator.share({
                  title: currentDrama.title,
                  text: currentDrama.description,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('链接已复制');
              }
            }}
          />
        );
      })()}

      {/* 固定层：底部信息区域 - 不会移动 */}
      {dramas[currentIndex] && (
        <FeedInfo
          dramaId={dramas[currentIndex].id}
          title={dramas[currentIndex].title}
          description={dramas[currentIndex].description}
          tags={dramas[currentIndex].tags}
          isVip={dramas[currentIndex].isVip}
          currentEpisodeId={dramas[currentIndex].currentEpisodeId}
          episodes={dramas[currentIndex].episodes}
          showEpisodeInfo={showEpisodeInfo}
        />
      )}

      {/* 固定层：选集Bar - 独立固定，使用memo避免不必要的重新渲染 */}
      {(() => {
        const currentDrama = dramas[currentIndex];
        if (!currentDrama || !currentDrama.episodes || currentDrama.episodes.length === 0) {
          return null;
        }
        
        return (
          <div className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,20px))] left-0 right-0 z-[9998] pointer-events-auto">
            <EpisodeBar
              episodes={currentDrama.episodes}
              currentEpisodeId={currentDrama.currentEpisodeId}
              onEpisodeChange={handleEpisodeChange}
            />
          </div>
        );
      })()}

      

      {/* 固定层：底部导航 - 不会移动 */}
      <div 
        className="fixed bottom-0 left-0 right-0 pointer-events-auto"
        style={{ 
          zIndex: 9999,
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        <BottomNav />
      </div>

      {/* 评论抽屉 */}
      <CommentDrawer
        isOpen={commentDrawerOpen}
        onClose={() => setCommentDrawerOpen(false)}
        dramaId={selectedDramaId}
      />
    </div>
  );
}
