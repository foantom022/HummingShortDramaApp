'use client';

import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Gift } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/common/BottomNav';

export default function WalletPage() {
  const router = useRouter();

  const transactions = [
    { id: 1, type: 'recharge', amount: 100, time: '2024-01-15 14:30', desc: '充值' },
    { id: 2, type: 'consume', amount: -30, time: '2024-01-14 10:20', desc: '购买VIP会员' },
    { id: 3, type: 'bonus', amount: 10, time: '2024-01-13 09:15', desc: '充值赠送' },
    { id: 4, type: 'consume', amount: -50, time: '2024-01-12 16:45', desc: '购买VIP会员' },
  ];

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
          <h1 className="text-lg font-semibold">我的钱包</h1>
        </div>
      </div>

      {/* 余额卡片 */}
      <div className="mx-4 mt-6 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-sm text-white/80 mb-2">账户余额</div>
            <div className="text-4xl font-bold text-white">¥0.00</div>
          </div>
          <Wallet className="w-16 h-16 text-white/20" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/profile/recharge')}
            className="bg-white/20 backdrop-blur-sm rounded-xl py-3 text-sm font-medium active:scale-95 transition-transform"
          >
            充值
          </button>
          <button
            className="bg-white/10 backdrop-blur-sm rounded-xl py-3 text-sm font-medium active:scale-95 transition-transform opacity-50"
          >
            提现
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-6">
        <div className="bg-[#1F1F1F] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">¥0</div>
          <div className="text-xs text-gray-400">累计充值</div>
        </div>
        <div className="bg-[#1F1F1F] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">¥0</div>
          <div className="text-xs text-gray-400">累计消费</div>
        </div>
        <div className="bg-[#1F1F1F] rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">¥0</div>
          <div className="text-xs text-gray-400">累计赠送</div>
        </div>
      </div>

      {/* 交易记录 */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-medium mb-4">交易记录</h2>
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-[#1F1F1F] rounded-xl p-4 flex items-center gap-3"
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${transaction.type === 'recharge' ? 'bg-green-500/20' : ''}
                ${transaction.type === 'consume' ? 'bg-red-500/20' : ''}
                ${transaction.type === 'bonus' ? 'bg-yellow-500/20' : ''}
              `}>
                {transaction.type === 'recharge' && <TrendingUp className="w-5 h-5 text-green-500" />}
                {transaction.type === 'consume' && <TrendingDown className="w-5 h-5 text-red-500" />}
                {transaction.type === 'bonus' && <Gift className="w-5 h-5 text-yellow-500" />}
              </div>
              
              <div className="flex-1">
                <div className="text-sm text-white mb-1">{transaction.desc}</div>
                <div className="text-xs text-gray-500">{transaction.time}</div>
              </div>
              
              <div className={`
                text-lg font-bold
                ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}
              `}>
                {transaction.amount > 0 ? '+' : ''}¥{Math.abs(transaction.amount)}
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        <div className="mt-8 text-center py-12">
          <Wallet className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">暂无交易记录</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
