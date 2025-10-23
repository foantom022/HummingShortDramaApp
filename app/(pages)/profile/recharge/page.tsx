'use client';

import { ArrowLeft, CreditCard, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/common/BottomNav';

export default function RechargePage() {
  const router = useRouter();

  const rechargeOptions = [
    { amount: 10, bonus: 0, label: '10元' },
    { amount: 30, bonus: 3, label: '30元', popular: true },
    { amount: 50, bonus: 10, label: '50元' },
    { amount: 100, bonus: 30, label: '100元' },
    { amount: 200, bonus: 80, label: '200元' },
    { amount: 500, bonus: 250, label: '500元' },
  ];

  const handleRecharge = (amount: number) => {
    alert(`充值功能开发中\n选择金额: ¥${amount}`);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-[calc(64px+env(safe-area-inset-bottom,20px))]">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-[#1F1F1F]">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">充值</h1>
        </div>
      </div>

      {/* 余额卡片 */}
      <div className="mx-4 mt-6 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-5 h-5 text-white/80" />
          <span className="text-sm text-white/80">账户余额</span>
        </div>
        <div className="text-4xl font-bold text-white mb-1">¥0.00</div>
        <div className="text-xs text-white/60">充值后可用于购买VIP会员</div>
      </div>

      {/* 充值选项 */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-medium mb-4">选择充值金额</h2>
        <div className="grid grid-cols-3 gap-3">
          {rechargeOptions.map((option) => (
            <button
              key={option.amount}
              onClick={() => handleRecharge(option.amount)}
              className={`
                relative bg-[#1F1F1F] rounded-xl p-4 text-center
                active:scale-95 transition-all
                ${option.popular ? 'ring-2 ring-[#8B5CF6]' : ''}
              `}
            >
              {option.popular && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white text-xs px-3 py-0.5 rounded-full">
                  热门
                </div>
              )}
              <div className="text-2xl font-bold text-white mb-1">
                ¥{option.amount}
              </div>
              {option.bonus > 0 && (
                <div className="text-xs text-[#8B5CF6]">
                  送¥{option.bonus}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 支付方式 */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-medium mb-4">支付方式</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-[#1F1F1F] rounded-xl p-4">
            <div className="w-10 h-10 bg-[#09BB07] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">微信</span>
            </div>
            <span className="flex-1 text-sm">微信支付</span>
            <div className="w-5 h-5 rounded-full border-2 border-[#8B5CF6] bg-[#8B5CF6]" />
          </div>
          <div className="flex items-center gap-3 bg-[#1F1F1F] rounded-xl p-4 opacity-50">
            <div className="w-10 h-10 bg-[#1677FF] rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">支付宝</span>
            </div>
            <span className="flex-1 text-sm">支付宝</span>
            <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
          </div>
        </div>
      </div>

      {/* 充值说明 */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-medium mb-3">充值说明</h2>
        <div className="bg-[#1F1F1F] rounded-xl p-4 space-y-2 text-sm text-gray-400">
          <p>• 充值金额实时到账</p>
          <p>• 充值金额可用于购买VIP会员</p>
          <p>• 充值金额不支持提现</p>
          <p>• 如有疑问请联系客服</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Wallet({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}
