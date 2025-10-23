'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface FeedVideoPlayerProps {
  videoUrl: string;
  posterUrl: string;
  isActive: boolean;
  cachedUrl?: string; // 缓存的视频URL
  onEnded?: () => void;
  immersiveMode?: boolean; // 沉浸式模式（双击暂停/播放）
}

export default function FeedVideoPlayer({
  videoUrl,
  posterUrl,
  isActive,
  cachedUrl,
  onEnded,
  immersiveMode = false,
}: FeedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [actualVideoUrl, setActualVideoUrl] = useState<string>('');
  const lastTapTime = useRef<number>(0);

  // 获取实际的视频URL - 优先使用缓存，但videoUrl变化时重新获取
  useEffect(() => {
    if (!videoUrl) {
      console.log('❌ 没有视频URL');
      return;
    }

    // 如果有缓存的URL，直接使用
    if (cachedUrl) {
      console.log('✅ 使用缓存的视频URL:', cachedUrl);
      setActualVideoUrl(cachedUrl);
      return;
    }

    console.log('🎬 开始获取视频URL:', videoUrl);

    // 如果是API端点，需要获取签名URL
    if (videoUrl.startsWith('/api/episodes/')) {
      fetch(videoUrl)
        .then(res => {
          console.log('📡 API响应状态:', res.status);
          return res.json();
        })
        .then(data => {
          console.log('📦 API返回数据:', data);
          if (data.success && data.data.urls) {
            // 优先使用high（高清），如果没有则使用super（超清）或normal（标清）
            const url = data.data.urls.high || data.data.urls.super || data.data.urls.normal || '';
            console.log('✅ 获取到视频URL:', url);
            setActualVideoUrl(url);
          } else {
            console.error('❌ API返回数据格式错误:', data);
          }
        })
        .catch(error => {
          console.error('❌ 获取视频URL失败:', error);
        });
    } else if (videoUrl.startsWith('http')) {
      // 直接的视频URL
      console.log('✅ 直接使用视频URL:', videoUrl);
      setActualVideoUrl(videoUrl);
    } else {
      console.log('✅ 直接使用视频URL:', videoUrl);
      setActualVideoUrl(videoUrl);
    }
  }, [videoUrl, cachedUrl]);

  // 当视频URL变化时，重新加载视频
  useEffect(() => {
    if (!videoRef.current || !actualVideoUrl) return;

    const video = videoRef.current;
    
    // 重置视频到开始位置
    video.currentTime = 0;
    
    // 强制重新加载视频
    video.load();
    
    console.log('🔄 视频URL已更新，重新加载:', actualVideoUrl);
  }, [actualVideoUrl]);

  // 当视频变为活动状态时自动播放
  useEffect(() => {
    if (!videoRef.current || !actualVideoUrl) return;

    const video = videoRef.current;

    if (isActive) {
      // 确保视频已加载
      if (video.readyState >= 2) {
        // 视频已经有足够的数据可以播放
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('✅ 视频自动播放成功');
              setIsPlaying(true);
            })
            .catch((error) => {
              console.log('⚠️ 自动播放失败（需要用户交互）:', error.message);
              setIsPlaying(false);
            });
        }
      } else {
        // 视频还没加载好，等待loadeddata事件
        const handleLoadedData = () => {
          const playPromise = video.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('✅ 视频加载后自动播放成功');
                setIsPlaying(true);
              })
              .catch((error) => {
                console.log('⚠️ 自动播放失败:', error.message);
                setIsPlaying(false);
              });
          }
        };

        video.addEventListener('loadeddata', handleLoadedData, { once: true });
        
        return () => {
          video.removeEventListener('loadeddata', handleLoadedData);
        };
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive, actualVideoUrl]);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoClick = (e: React.MouseEvent) => {
    if (immersiveMode) {
      // 沉浸式模式：双击暂停/播放，单击不处理（让事件冒泡）
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTapTime.current;

      if (timeDiff < 300) {
        // 双击 - 暂停/播放
        e.stopPropagation(); // 阻止冒泡
        togglePlay();
        setShowControls(true);
        setTimeout(() => setShowControls(false), 1000);
        lastTapTime.current = 0; // 重置
      } else {
        // 单击 - 不处理，让事件冒泡到父组件
        lastTapTime.current = currentTime;
        // 不调用 e.stopPropagation()，让事件冒泡
      }
    } else {
      // 普通模式：单击暂停/播放
      e.stopPropagation();
      togglePlay();
      setShowControls(true);
      setTimeout(() => setShowControls(false), 1000);
    }
  };

  if (!actualVideoUrl) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden"
      onClick={handleVideoClick}
    >
      {/* 视频元素 */}
      <video
        ref={videoRef}
        className="min-w-full min-h-full w-auto h-auto object-cover"
        poster={posterUrl}
        loop
        playsInline
        preload="auto"
        onEnded={onEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
      >
        <source src={actualVideoUrl} type="video/mp4" />
        您的浏览器不支持视频播放
      </video>

      {/* 播放/暂停图标 */}
      {showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 rounded-full p-4 backdrop-blur-sm">
            {isPlaying ? (
              <Pause className="w-12 h-12 text-white" fill="white" />
            ) : (
              <Play className="w-12 h-12 text-white" fill="white" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
