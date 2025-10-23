'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface AICharacter {
  id: string;
  name: string;
  avatar: string | null;
  dramaId: string | null;
}

interface CharacterListProps {
  characters: AICharacter[];
  loading: boolean;
}

export default function CharacterList({ characters, loading }: CharacterListProps) {
  const router = useRouter();

  const handleCharacterClick = (characterId: string) => {
    router.push(`/ai/chat/${characterId}`);
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto px-4 scrollbar-hide">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-[50px]">
            <div className="w-[73px] h-[72px] rounded-full bg-[#444444] animate-pulse" />
            <div className="w-12 h-[15px] bg-[#444444] rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className="flex gap-3 overflow-x-auto px-4 scrollbar-hide"
      style={{
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {characters.map((character) => (
        <button
          key={character.id}
          onClick={() => handleCharacterClick(character.id)}
          className="flex flex-col items-center gap-2 flex-shrink-0 transition-transform active:scale-95"
        >
          {/* 角色头像 - 73px × 72px 圆形 */}
          <div className="w-[73px] h-[72px] rounded-full bg-[#444444] overflow-hidden flex items-center justify-center flex-shrink-0">
            {character.avatar ? (
              <img
                src={character.avatar}
                alt={character.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {character.name.charAt(0)}
              </div>
            )}
          </div>
          
          {/* 角色名称 - 12px字体，15px高度 */}
          <span className="text-xs text-white text-center w-[73px] truncate h-[15px] leading-[15px]">
            {character.name}
          </span>
        </button>
      ))}
    </div>
  );
}
