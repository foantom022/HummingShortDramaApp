'use client';

import { Crown, X, Check } from 'lucide-react';

interface VipPurchaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase: () => void;
  isRenewal?: boolean;
}

export default function VipPurchaseDialog({ isOpen, onClose, onPurchase, isRenewal = false }: VipPurchaseDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 弹窗内容 */}
      <div className="relative bg-gradient-to-br from-[#1F1F1F] to-[#2D2D2D] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* VIP图标 */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] flex items-center justify-center">
            <Crown className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        {/* 标题 */}
        <h2 className="text-2xl font-bold text-white text-center mb-2">
          {isRenewal ? 'VIP会员续费' : '开通VIP会员'}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          {isRenewal ? '延长您的VIP特权，继续享受专属服务' : '解锁307部专属短剧，畅享无限精彩'}
        </p>

        {/* VIP特权 */}
        <div className="space-y-3 mb-6">
          {[
            '观看307部VIP专属短剧',
            '无广告畅享观看体验',
            '超清画质优先加载',
            '专属VIP身份标识',
          ].map((benefit, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-white" strokeWidth={3} />
              </div>
              <span className="text-sm text-white">{benefit}</span>
            </div>
          ))}
        </div>

        {/* 价格 */}
        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-gray-400 line-through text-sm">¥99</span>
            <span className="text-3xl font-bold text-white">¥29</span>
            <span className="text-gray-400 text-sm">/月</span>
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            {isRenewal ? '续费优惠价，限时特惠' : '首月特惠，限时优惠'}
          </p>
        </div>

        {/* 购买/续费按钮 */}
        <button
          onClick={onPurchase}
          className="w-full bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white py-3 rounded-full font-bold text-base active:scale-95 transition-transform shadow-lg shadow-orange-500/30"
        >
          {isRenewal ? '立即续费' : '立即开通VIP'}
        </button>

        {/* 提示 */}
        <p className="text-xs text-gray-500 text-center mt-4">
          *此为演示功能，实际不会扣费
        </p>
      </div>
    </div>
  );
}
