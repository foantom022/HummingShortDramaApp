'use client';

import FeedVideoPlayer from './FeedVideoPlayer';
import FeedActions from './FeedActions';
import FeedInfo from './FeedInfo';

interface FeedVideoCardProps {
  drama: {
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
  };
  isActive: boolean;
  onCommentClick: () => void;
}

export default function FeedVideoCard({
  drama,
  isActive,
  onCommentClick,
}: FeedVideoCardProps) {
  const handleLike = async () => {
    try {
      const response = await fetch(`/api/dramas/${drama.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('点赞失败');
      }
    } catch (error) {
      console.error('点赞请求失败:', error);
    }
  };

  const handleFavorite = async () => {
    try {
      const response = await fetch(`/api/dramas/${drama.id}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.error('收藏失败');
      }
    } catch (error) {
      console.error('收藏请求失败:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: drama.title,
        text: drama.description,
        url: window.location.href,
      }).catch((error) => {
        console.log('分享取消或失败:', error);
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* 视频播放器 */}
      <FeedVideoPlayer
        videoUrl={drama.videoUrl}
        posterUrl={drama.coverUrl}
        isActive={isActive}
      />

      {/* 右侧交互按钮 */}
      <FeedActions
        dramaId={drama.id}
        initialLikes={drama.likes}
        initialComments={drama.comments}
        initialFavorites={drama.favorites}
        onLike={handleLike}
        onComment={onCommentClick}
        onFavorite={handleFavorite}
        onShare={handleShare}
      />

      {/* 底部信息区域 */}
      <FeedInfo
        dramaId={drama.id}
        title={drama.title}
        description={drama.description}
        tags={drama.tags}
        isVip={drama.isVip}
      />
    </div>
  );
}
