'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/common/SearchBar';
import BottomNav from '@/components/common/BottomNav';
import FeaturedCarousel from '@/components/drama/FeaturedCarousel';
import CategoryTabs from '@/components/drama/CategoryTabs';
import DramaGrid from '@/components/drama/DramaGrid';
import VipPurchaseDialog from '@/components/common/VipPurchaseDialog';

interface Drama {
  id: string;
  title: string;
  focus: string;
  vPoster: string;
  tags: { tag: { name: string } }[];
  views: number;
  rating: number;
  isVip: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [featuredDramas, setFeaturedDramas] = useState<Drama[]>([]);
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [loading, setLoading] = useState(true);
  const [showVipDialog, setShowVipDialog] = useState(false);
  const [isVipUser, setIsVipUser] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setDramas([]);
    setHasMore(true);
    fetchDramasByCategory(selectedCategory, 1, true);
  }, [selectedCategory]);

  const fetchInitialData = async () => {
    try {
      const featuredRes = await fetch('/api/dramas?sort=views&pageSize=5');
      const featuredData = await featuredRes.json();
      setFeaturedDramas(featuredData.data?.dramas || []);

      const tagsRes = await fetch('/api/tags');
      const tagsData = await tagsRes.json();
      setCategories(['全部', ...(tagsData.data?.tags?.map((t: any) => t.name) || [])]);

      const dramasRes = await fetch('/api/dramas?pageSize=20');
      const dramasData = await dramasRes.json();
      setDramas(dramasData.data?.dramas || []);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDramasByCategory = async (category: string, page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const url = category === '全部'
        ? `/api/dramas?pageSize=20&page=${page}`
        : `/api/dramas?tag=${encodeURIComponent(category)}&pageSize=20&page=${page}`;
      
      const res = await fetch(url);
      const data = await res.json();
      const newDramas = data.data?.dramas || [];
      
      if (reset) {
        setDramas(newDramas);
      } else {
        setDramas(prev => {
          const existingIds = new Set(prev.map(d => d.id));
          const uniqueNewDramas = newDramas.filter((d: Drama) => !existingIds.has(d.id));
          return [...prev, ...uniqueNewDramas];
        });
      }
      
      setHasMore(data.data?.pagination?.hasMore || false);
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch dramas:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      
      const scrollHeight = scrollContainer.scrollHeight;
      const scrollTop = scrollContainer.scrollTop;
      const clientHeight = scrollContainer.clientHeight;
      
      if (scrollHeight - scrollTop - clientHeight < 200) {
        fetchDramasByCategory(selectedCategory, currentPage + 1, false);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, currentPage, selectedCategory]);

  const handleVipClick = () => {
    if (isVipUser) {
      window.location.href = '/vip';
    } else {
      setShowVipDialog(true);
    }
  };

  const handlePurchase = () => {
    alert('VIP购买功能演示\n\n实际应用中会跳转到支付页面');
    setShowVipDialog(false);
    setIsVipUser(true);
  };

  const handleVipRequired = () => {
    setShowVipDialog(true);
  };

  const handleLoginRequired = () => {
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-40 bg-black">
        <SearchBar isVipUser={isVipUser} onVipClick={handleVipClick} />
      </div>

      <div ref={scrollContainerRef} className="absolute top-[60px] bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden pb-[calc(64px+env(safe-area-inset-bottom,20px))]">
        {featuredDramas.length > 0 && (
          <FeaturedCarousel 
            dramas={featuredDramas}
            onVipRequired={handleVipRequired}
            onLoginRequired={handleLoginRequired}
          />
        )}

        <div className="sticky top-0 z-30 bg-black">
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <DramaGrid 
              dramas={dramas}
              onVipRequired={handleVipRequired}
              onLoginRequired={handleLoginRequired}
            />
            
            {loadingMore && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {!hasMore && dramas.length > 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                已加载全部 {dramas.length} 部剧集
              </div>
            )}
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
