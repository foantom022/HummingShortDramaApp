'use client';

import { Search, Crown } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  isVipUser?: boolean;
  onVipClick?: () => void;
}

export default function SearchBar({ isVipUser = false, onVipClick }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearchClick = () => {
    // 点击搜索框跳转到搜索页面
    router.push('/search');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleVipClick = () => {
    if (onVipClick) {
      onVipClick();
    } else if (isVipUser) {
      // VIP用户跳转到VIP页面
      router.push('/vip');
    } else {
      // 非VIP用户显示购买弹窗（暂时跳转到VIP页面）
      router.push('/vip');
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1" onClick={handleSearchClick}>
        <div className="relative cursor-pointer">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
          <div className="w-full bg-[#1F1F1F] text-[#6B7280] rounded-full pl-10 pr-4 py-2 text-sm">
            搜索剧集、演员、标签...
          </div>
        </div>
      </div>
      
      <button 
        onClick={handleVipClick}
        className="flex items-center gap-1.5 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white px-3 py-1.5 rounded-full text-xs font-bold active:scale-95 transition-transform shadow-md shadow-orange-500/30"
      >
        <Crown className="w-4 h-4 fill-white" />
        VIP
      </button>
    </div>
  );
}
