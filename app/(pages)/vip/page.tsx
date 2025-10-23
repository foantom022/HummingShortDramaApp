'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Star, Sparkles } from 'lucide-react';
import BottomNav from '@/components/common/BottomNav';
import VIPDramaGrid from '@/components/vip/VIPDramaGrid';
import VipPurchaseDialog from '@/components/common/VipPurchaseDialog';

interface Drama {
  id: string;
  title: string;
  focus: string;
  vPoster: string;
  hPoster: string;
  tags: { tag: { name: string } }[];
  views: number;
  rating: number;
  isVip: boolean;
}

export default function VIPPage() {
  const router = useRouter();
  const [vipDramas, setVipDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showVipDialog, setShowVipDialog] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVIPDramas(1, true);
  }, []);

  const fetchVIPDramas = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await fetch(`/api/dramas?isVip=true&pageSize=20&sort=views&page=${page}`);
      const data = await res.json();
      
      if (data.success) {
        const newDramas = data.data.dramas;
        
        if (reset) {
          setVipDramas(newDramas);
        } else {
          setVipDramas(prev => {
            const existingIds = new Set(prev.map(d => d.id));
            const uniqueNewDramas = newDramas.filter((d: Drama) => !existingIds.has(d.id));
            return [...prev, ...uniqueNewDramas];
          });
        }
        
        setTotalCount(data.data.pagination.total);
        setHasMore(data.data.pagination.hasMore);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Failed to fetch VIP dramas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 滚动加载更多
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      
      const scrollHeight = scrollContainer.scrollHeight;
      const scrollTop = scrollContainer.scrollTop;
      const clientHeight = scrollContainer.clientHeight;
      
      if (scrollHeight - scrollTop - clientHeight < 300) {
        fetchVIPDramas(currentPage + 1, false);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, currentPage]);

  const handleVipRequired = () => {
    setShowVipDialog(true);
  };

  const handleLoginRequired = () => {
    router.push('/login');
  };

  const handlePurchase = () => {
    alert('VIP购买功能演示\n\n实际应用中会跳转到支付页面');
    setShowVipDialog(false);
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* 滚动容器 */}
      <div ref={scrollContainerRef} className="absolute top-0 bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden pb-[calc(64px+env(safe-area-inset-bottom,20px))]">
        {/* VIP专属头部 - 带渐变背景 */}
        <div className="relative bg-gradient-to-br from-[#FBBF24] via-[#F59E0B] to-[#D97706] px-6 pt-8 pb-12">
          {/* 装饰性背景图案 */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4">
              <Crown className="w-32 h-32 text-white" />
            </div>
            <div className="absolute bottom-4 left-4">
              <Sparkles className="w-24 h-24 text-white" />
            </div>
          </div>

          {/* 内容 */}
          <div className="relative z-10">
            {/* VIP图标和标题 */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <Crown className="w-10 h-10 text-white" fill="white" />
              <h1 className="text-3xl font-bold text-white">VIP专属</h1>
            </div>

            {/* 描述 */}
            <p className="text-center text-white/90 text-sm mb-6">
              尊享{totalCount}部高品质独家短剧
            </p>

            {/* VIP特权卡片 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <Star className="w-6 h-6 text-white mx-auto mb-2" fill="white" />
                <p className="text-xs text-white font-medium">独家内容</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <Sparkles className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-xs text-white font-medium">超清画质</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                <Crown className="w-6 h-6 text-white mx-auto mb-2" fill="white" />
                <p className="text-xs text-white font-medium">尊贵身份</p>
              </div>
            </div>
          </div>
        </div>

        {/* VIP剧集列表 */}
        <div className="px-4 py-6">
          {/* 分类标题 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-[#FBBF24]" fill="#FBBF24" />
              VIP热播榜
            </h2>
            <span className="text-sm text-gray-400">{totalCount}部</span>
          </div>

          {/* 剧集网格 */}
          <VIPDramaGrid 
            dramas={vipDramas} 
            loading={loading}
            onVipRequired={handleVipRequired}
            onLoginRequired={handleLoginRequired}
          />

          {/* 加载更多状态 */}
          {loadingMore && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-4 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* 已加载全部 */}
          {!hasMore && vipDramas.length > 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              已加载全部 {vipDramas.length} 部VIP剧集
            </div>
          )}
        </div>
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
