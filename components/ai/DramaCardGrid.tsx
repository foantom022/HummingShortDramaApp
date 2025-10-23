'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DramaCard {
  id: string;
  characterId: string;
  characterName: string;
  coverImage: string;
  title: string;
  dramaName: string;
  views: number;
}

interface DramaCardGridProps {
  cards: DramaCard[];
  loading: boolean;
}

// 格式化播放量
function formatViews(views: number): string {
  if (views >= 10000) {
    return `${(views / 10000).toFixed(2)}万`;
  }
  return views.toString();
}

export default function DramaCardGrid({ cards, loading }: DramaCardGridProps) {
  const router = useRouter();

  const handleCardClick = (characterId: string, characterName: string) => {
    if (characterId) {
      router.push(`/ai/chat/${characterId}`);
    } else {
      alert(`角色信息缺失，无法开始聊天`);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-[#444444] rounded-[14px] overflow-hidden animate-pulse">
            <div className="w-full aspect-[167/120] bg-[#555555]" />
            <div className="p-2 space-y-2">
              <div className="h-4 bg-[#555555] rounded" />
              <div className="h-3 bg-[#555555] rounded w-3/4" />
              <div className="h-3 bg-[#555555] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => (
        <button
          key={card.id}
          onClick={() => handleCardClick(card.characterId, card.characterName)}
          className="relative bg-[#444444] rounded-[14px] overflow-hidden transition-transform active:scale-98 text-left"
        >
          {/* 角色名称标签 - 绝对定位在封面上 */}
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded">
            <span className="text-sm text-white">{card.characterName}</span>
          </div>

          {/* 剧集封面 */}
          <div className="relative w-full aspect-[167/120] bg-black">
            <Image
              src={card.coverImage}
              alt={card.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>

          {/* 卡片信息 */}
          <div className="p-2 space-y-1">
            {/* 剧集标题 - 固定高度35px，最多2行 */}
            <h3 className="text-sm font-medium text-white line-clamp-2 leading-[17.5px] h-[35px]">
              {card.title}
            </h3>

            {/* 剧集名称 - 高度15px */}
            <p className="text-xs text-white/70 truncate h-[15px] leading-[15px]">
              {card.dramaName}
            </p>

            {/* 热度信息 - 高度15px */}
            <p className="text-[10px] text-white/60 h-[15px] leading-[15px]">
              热度{formatViews(card.views)}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
