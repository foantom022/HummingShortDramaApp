'use client';

import { Home, Compass, Crown, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AIIcon from '@/components/icons/AIIcon';

const navItems = [
  { icon: Home, label: '首页', href: '/home', type: 'lucide' },
  { icon: Compass, label: '发现', href: '/feed', type: 'lucide' },
  { icon: 'ai', label: 'AI', href: '/ai', type: 'custom' },
  { icon: Crown, label: 'VIP', href: '/vip', type: 'lucide' },
  { icon: User, label: '我的', href: '/profile', type: 'lucide' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[9999]">
      {/* 导航栏主体 */}
      <div className="bg-black border-t border-[#1F1F1F] shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
        <div className="flex items-center justify-around h-16 w-full px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const isAI = item.type === 'custom' && item.icon === 'ai';
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 gap-1 transition-colors active:scale-95 h-full"
              >
                {/* 图标渲染 */}
                {isAI ? (
                  <AIIcon 
                    className="w-14 h-14"
                    isActive={isActive}
                  />
                ) : (
                  (() => {
                    const Icon = item.icon as any;
                    return (
                      <Icon 
                        className={`w-6 h-6 ${
                          isActive 
                            ? 'text-[#8B5CF6]' 
                            : 'text-[#6B7280]'
                        }`}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    );
                  })()
                )}
                
                {/* 文字标签 - AI不显示文字 */}
                {!isAI && (
                  <span 
                    className={`text-[10px] ${
                      isActive 
                        ? 'text-[#8B5CF6] font-medium' 
                        : 'text-[#6B7280]'
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
        
        {/* 底部填充 - 填满所有可能的缝隙 */}
        <div className="h-[env(safe-area-inset-bottom,20px)] bg-black" />
      </div>
    </nav>
  );
}
