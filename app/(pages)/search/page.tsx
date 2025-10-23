'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { Search, ArrowLeft, TrendingUp, Crown, Clock, User, Tag } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import BottomNav from '@/components/common/BottomNav';
import VipPurchaseDialog from '@/components/common/VipPurchaseDialog';

interface Drama {
  id: string;
  title: string;
  focus: string;
  vPoster: string;
  tags: { id: string; name: string }[];
  views: number;
  rating: number;
  isVip: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'drama' | 'actor' | 'tag';
  meta: string;
}

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState<Drama[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [hotDramas, setHotDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(!!initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showVipDialog, setShowVipDialog] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // 猜你想搜的关键词
  const suggestedSearches = [
    '霸道总裁',
    '甜宠',
    '复仇',
    '穿越',
    '重生',
    '修仙',
    '都市',
    '古装'
  ];

  useEffect(() => {
    fetchHotDramas();
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  // 实时搜索建议（防抖）
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length > 0) {
      setShowSuggestions(true);
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(searchQuery);
      }, 300); // 300ms防抖
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const fetchHotDramas = async () => {
    try {
      const res = await fetch('/api/dramas?sort=views&pageSize=20');
      const data = await res.json();
      setHotDramas(data.data?.dramas || []);
    } catch (error) {
      console.error('Failed to fetch hot dramas:', error);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data.data?.suggestions || []);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setSuggestions([]);
    }
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);
    setShowSuggestions(false);

    try {
      const startTime = Date.now();
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      const endTime = Date.now();
      
      console.log(`搜索耗时: ${endTime - startTime}ms`); // 监控搜索性能
      
      setSearchResults(data.data?.dramas || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    performSearch(searchQuery);
  };

  const handleSuggestedSearch = (keyword: string) => {
    setSearchQuery(keyword);
    performSearch(keyword);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchQuery(suggestion.text);
    performSearch(suggestion.text);
  };

  const formatViews = (views: number) => {
    if (views >= 10000) {
      return `${(views / 10000).toFixed(1)}万`;
    }
    return views.toString();
  };

  const handleDramaClick = async (drama: Drama) => {
    // 如果不是VIP剧集，直接跳转
    if (!drama.isVip) {
      router.push(`/drama/${drama.id}/watch`);
      return;
    }

    // VIP剧集需要检查权限
    const token = localStorage.getItem('token');
    
    // 未登录
    if (!token) {
      alert('请先登录');
      router.push('/login');
      return;
    }

    // 已登录，检查VIP状态
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user.isVip) {
          // 是VIP用户，允许观看
          router.push(`/drama/${drama.id}/watch`);
        } else {
          // 不是VIP用户，提示充值
          setShowVipDialog(true);
        }
      } else {
        // Token无效，跳转登录
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('检查VIP状态失败:', error);
      alert('网络错误，请稍后重试');
    }
  };

  const handlePurchase = () => {
    alert('VIP购买功能演示\n\n实际应用中会跳转到支付页面');
    setShowVipDialog(false);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'drama':
        return <Search className="w-4 h-4 text-gray-500" />;
      case 'actor':
        return <User className="w-4 h-4 text-gray-500" />;
      case 'tag':
        return <Tag className="w-4 h-4 text-gray-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* 顶部搜索栏 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-[#1F1F1F]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="flex-shrink-0 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                placeholder="搜索剧集、演员、标签..."
                autoFocus
                className="w-full bg-[#1F1F1F] text-white placeholder:text-[#6B7280] rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all"
              />
            </div>
          </form>

          <button
            onClick={() => handleSearch()}
            className="flex-shrink-0 text-[#8B5CF6] text-sm font-medium active:scale-95 transition-transform"
          >
            搜索
          </button>
        </div>
      </div>

      {/* 搜索建议下拉 */}
      {showSuggestions && suggestions.length > 0 && !showResults && (
        <div className="fixed top-[60px] left-0 right-0 z-30 bg-[#1F1F1F] border-b border-[#2F2F2F] max-h-[50vh] overflow-y-auto">
          <div className="py-2">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex items-center gap-3 px-4 py-3 active:bg-white/5 transition-colors cursor-pointer"
              >
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{suggestion.text}</div>
                  <div className="text-xs text-gray-500">{suggestion.meta}</div>
                </div>
                <Clock className="w-4 h-4 text-gray-600 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="absolute top-[60px] bottom-0 left-0 right-0 overflow-y-auto pb-[calc(64px+env(safe-area-inset-bottom,20px))]">
        {showResults ? (
          // 搜索结果
          <div className="px-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="text-sm text-gray-400 mb-4">
                  找到 {searchResults.length} 个结果
                </div>
                <div className="space-y-3">
                  {searchResults.map((drama) => (
                    <div
                      key={drama.id}
                      onClick={() => handleDramaClick(drama)}
                      className="flex gap-3 bg-[#1F1F1F] rounded-xl p-3 active:scale-98 transition-transform cursor-pointer"
                    >
                      <div className="relative flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden">
                        <img
                          src={drama.vPoster}
                          alt={drama.title}
                          className="w-full h-full object-cover"
                        />
                        {drama.isVip && (
                          <div className="absolute top-2 left-2 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Crown className="w-2.5 h-2.5 fill-white" />
                            <span className="text-[10px] font-bold text-white">VIP</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                            {drama.title}
                          </h3>
                          <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                            {drama.focus}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          {drama.tags?.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded"
                            >
                              {tag.name}
                            </span>
                          ))}
                          <span className="text-[10px] text-gray-500">
                            {formatViews(drama.views)}次播放
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <Search className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-gray-500">未找到相关剧集</p>
                <p className="text-sm text-gray-600 mt-2">试试其他关键词吧</p>
              </div>
            )}
          </div>
        ) : (
          // 默认页面：猜你想搜 + 热播榜
          <>
            {/* 猜你想搜 */}
            <div className="px-4 py-4">
              <h2 className="text-base font-medium text-white mb-3">猜你想搜</h2>
              <div className="flex flex-wrap gap-2">
                {suggestedSearches.map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedSearch(keyword)}
                    className="bg-[#1F1F1F] text-white text-sm px-4 py-2 rounded-full active:scale-95 transition-transform"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>

            {/* 短剧热播榜 */}
            <div className="px-4 py-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-[#8B5CF6]" />
                <h2 className="text-base font-medium text-white">短剧热播榜</h2>
              </div>

              <div className="space-y-3">
                {hotDramas.map((drama, index) => (
                  <div
                    key={drama.id}
                    onClick={() => handleDramaClick(drama)}
                    className="flex items-center gap-3 active:scale-98 transition-transform cursor-pointer"
                  >
                    {/* 排名 */}
                    <div className="flex-shrink-0 w-8 text-center">
                      {index < 3 ? (
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                          ${index === 0 ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500] text-white' : ''}
                          ${index === 1 ? 'bg-gradient-to-br from-[#C0C0C0] to-[#808080] text-white' : ''}
                          ${index === 2 ? 'bg-gradient-to-br from-[#CD7F32] to-[#8B4513] text-white' : ''}
                        `}>
                          {index + 1}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm font-medium">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* 海报 */}
                    <div className="relative flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden">
                      <img
                        src={drama.vPoster}
                        alt={drama.title}
                        className="w-full h-full object-cover"
                      />
                      {drama.isVip && (
                        <div className="absolute top-1.5 left-1.5 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Crown className="w-2 h-2 fill-white" />
                          <span className="text-[9px] font-bold text-white">VIP</span>
                        </div>
                      )}
                    </div>

                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                        {drama.title}
                      </h3>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-400">
                          ⭐ {drama.rating.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatViews(drama.views)}次播放
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {drama.tags?.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />

      <VipPurchaseDialog
        isOpen={showVipDialog}
        onClose={() => setShowVipDialog(false)}
        onPurchase={handlePurchase}
        isRenewal={false}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
