'use client';

import { Heart, MessageCircle, Star, Share2 } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FeedActionsProps {
  dramaId?: string;
  initialLikes: number;
  initialComments: number;
  initialFavorites: number;
  isLiked?: boolean;
  isFavorited?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onFavorite?: () => void;
  onShare?: () => void;
}

export default function FeedActions({
  dramaId,
  userAvatar = '/default-avatar.png',
  initialLikes,
  initialComments,
  initialFavorites,
  isLiked = false,
  isFavorited = false,
  onLike,
  onComment,
  onFavorite,
  onShare,
}: FeedActionsProps) {
  const [liked, setLiked] = useState(isLiked);
  const [favorited, setFavorited] = useState(isFavorited);
  const [likes, setLikes] = useState(initialLikes);
  const [favorites, setFavorites] = useState(initialFavorites);

  // 当dramaId改变时，重置状态
  useEffect(() => {
    setLiked(isLiked);
    setFavorited(isFavorited);
    setLikes(initialLikes);
    setFavorites(initialFavorites);
  }, [dramaId, isLiked, isFavorited, initialLikes, initialFavorites]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    onLike?.();
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorited(!favorited);
    setFavorites(favorited ? favorites - 1 : favorites + 1);
    onFavorite?.();
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onComment?.();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.();
  };

  const formatCount = (count: number): string => {
    if (count >= 10000) {
      return `${(count / 10000).toFixed(1)}w`;
    }
    return count.toString();
  };

  return (
    <div className="absolute right-4 bottom-[180px] flex flex-col items-center gap-6 z-10">
      {/* 用户头像 */}
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-gray-800">
          <img
            src={userAvatar}
            alt="用户头像"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/default-avatar.png';
            }}
          />
        </div>
      </div>

      {/* 点赞按钮 */}
      <button
        onClick={handleLike}
        className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
      >
        <div className={`transition-all ${liked ? 'scale-110' : ''}`}>
          <Heart
            className={`w-8 h-8 ${
              liked ? 'text-[#EC4899] fill-[#EC4899]' : 'text-white'
            }`}
            strokeWidth={2}
          />
        </div>
        <span className="text-white text-xs font-medium">
          {formatCount(likes)}
        </span>
      </button>

      {/* 评论按钮 */}
      <button
        onClick={handleComment}
        className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
      >
        <MessageCircle className="w-8 h-8 text-white" strokeWidth={2} />
        <span className="text-white text-xs font-medium">
          {formatCount(initialComments)}
        </span>
      </button>

      {/* 收藏按钮 */}
      <button
        onClick={handleFavorite}
        className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
      >
        <div className={`transition-all ${favorited ? 'scale-110' : ''}`}>
          <Star
            className={`w-8 h-8 ${
              favorited ? 'text-[#FBBF24] fill-[#FBBF24]' : 'text-white'
            }`}
            strokeWidth={2}
          />
        </div>
        <span className="text-white text-xs font-medium">
          {formatCount(favorites)}
        </span>
      </button>

      {/* 分享按钮 */}
      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
      >
        <Share2 className="w-8 h-8 text-white" strokeWidth={2} />
      </button>
    </div>
  );
}
