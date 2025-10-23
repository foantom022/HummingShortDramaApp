'use client';

import { useEffect, useState } from 'react';
import BottomNav from '@/components/common/BottomNav';
import CharacterList from '@/components/ai/CharacterList';
import DramaCardGrid from '@/components/ai/DramaCardGrid';

interface AICharacter {
  id: string;
  name: string;
  avatar: string | null;
  dramaId: string | null;
}

interface DramaCard {
  id: string;
  characterId: string;
  characterName: string;
  coverImage: string;
  title: string;
  dramaName: string;
  views: number;
}

export default function AIPage() {
  const [characters, setCharacters] = useState<AICharacter[]>([]);
  const [dramaCards, setDramaCards] = useState<DramaCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAIData();
  }, []);

  const fetchAIData = async () => {
    try {
      // 获取AI角色列表
      const charactersRes = await fetch('/api/ai/characters');
      const charactersData = await charactersRes.json();
      
      if (charactersData.success && charactersData.data?.characters) {
        setCharacters(charactersData.data.characters);
      }

      // 获取推荐短剧（用于展示）
      const dramasRes = await fetch('/api/dramas?pageSize=6&sort=views');
      const dramasData = await dramasRes.json();
      
      if (dramasData.success) {
        // 转换为卡片格式
        const charactersList = charactersData.data?.characters || [];
        const cards: DramaCard[] = dramasData.data.dramas.map((drama: any, index: number) => {
          const assignedCharacter = charactersList[index % charactersList.length];
          return {
            id: drama.id,
            characterId: assignedCharacter?.id || '',
            characterName: assignedCharacter?.name || '角色',
            coverImage: drama.hPoster,
            title: drama.focus,
            dramaName: drama.title,
            views: drama.views,
          };
        });
        setDramaCards(cards);
      }
    } catch (error) {
      console.error('Failed to fetch AI data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#333333] text-white pb-[calc(64px+env(safe-area-inset-bottom,20px))]">
      {/* 标题栏 - 48px高 */}
      <div className="h-12 bg-black flex items-center px-4">
        <h1 className="text-lg font-medium text-white">聊过</h1>
      </div>

      {/* 角色列表区域 - 79px高（包含padding） */}
      <div className="bg-black py-2.5">
        <CharacterList characters={characters} loading={loading} />
      </div>

      {/* 推荐内容区域 - 629px高，2列网格 */}
      <div className="flex-1 bg-black px-4 py-4 overflow-y-auto">
        {/* 推荐角色标题 */}
        <h2 className="text-lg font-medium text-white mb-4">推荐角色</h2>
        
        <div className="px-0">
          <DramaCardGrid cards={dramaCards} loading={loading} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
