'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, Copy, User, Play, Download, Star, History, CreditCard, Wallet, Globe, HelpCircle, Settings as SettingsIcon } from 'lucide-react';
import BottomNav from '@/components/common/BottomNav';
import VipPurchaseDialog from '@/components/common/VipPurchaseDialog';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState({
    isLoggedIn: false,
    userId: '314270884',
    name: '登录',
    email: '',
    avatar: null,
    vipExpireAt: null as Date | null,
  });
  const [showVipDialog, setShowVipDialog] = useState(false);
  const [isVipUser, setIsVipUser] = useState(false);
  const [loading, setLoading] = useState(true);

  // 检查登录状态并获取用户信息
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = localStorage.getItem('token');
      console.log('🔍 检查登录状态...');
      console.log('Token存在:', !!token);
      
      if (!token) {
        console.log('❌ 未找到Token，保持未登录状态');
        setLoading(false);
        return;
      }

      console.log('✅ Token:', token.substring(0, 30) + '...');

      try {
        console.log('📡 正在获取用户信息...');
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('📥 API响应状态:', response.status, response.ok);

        if (response.ok) {
          const data = await response.json();
          console.log('📦 API返回数据:', data);
          
          if (data.success) {
            const userData = data.data.user;
            console.log('👤 用户数据:', userData);
            console.log('👑 VIP状态:', userData.isVip);
            console.log('📅 VIP到期时间:', userData.vipExpireAt);
            
            setUser({
              isLoggedIn: true,
              userId: userData.id,
              name: userData.name || '用户',
              email: userData.email,
              avatar: userData.avatar,
              vipExpireAt: userData.vipExpireAt ? new Date(userData.vipExpireAt) : null,
            });
            setIsVipUser(userData.isVip || false);
            console.log('✅ 设置用户状态完成');
            console.log('   - isLoggedIn: true');
            console.log('   - isVipUser:', userData.isVip || false);
          } else {
            console.log('❌ API返回失败:', data.error);
          }
        } else {
          console.log('❌ API请求失败，状态码:', response.status);
          const errorText = await response.text();
          console.log('错误信息:', errorText);
          // Token无效，清除
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('❌ 获取用户信息异常:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
        console.log('🏁 登录状态检查完成');
      }
    };

    checkLoginStatus();
  }, []);

  const memberBenefits = [
    { icon: Play, label: '无限观看' },
    { icon: Download, label: '下载' },
    { icon: 'HD', label: '1080p 高清画质' },
    { icon: Star, label: '每日积分奖励' },
  ];

  const menuItems = [
    { icon: History, label: '观看历史', href: '/profile/history' },
    { icon: Star, label: '我的收藏', href: '/profile/favorites' },
    { icon: Play, label: '追剧列表', href: '/profile/following' },
    { icon: SettingsIcon, label: '设置', href: '/profile/settings' },
    { icon: CreditCard, label: '充值', href: '/profile/recharge' },
    { icon: Wallet, label: '钱包', href: '/profile/wallet' },
    { icon: Globe, label: '语言', href: '/profile/language' },
    { icon: Download, label: '下载管理', href: '/profile/downloads' },
    { icon: HelpCircle, label: '帮助与反馈', href: '/profile/help' },
  ];

  const copyUserId = () => {
    navigator.clipboard.writeText(user.userId);
    alert('ID已复制');
  };

  const handleVipClick = () => {
    // 无论是VIP还是非VIP，都显示弹窗
    setShowVipDialog(true);
  };

  const handlePurchase = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录');
      return;
    }

    try {
      const response = await fetch('/api/user/vip', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          duration: 30 // 30天
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(isVipUser ? 'VIP续费成功！' : 'VIP开通成功！');
        setShowVipDialog(false);
        
        // 更新用户信息
        const updatedUser = data.data.user;
        setUser({
          ...user,
          vipExpireAt: updatedUser.vipExpireAt ? new Date(updatedUser.vipExpireAt) : null,
        });
        setIsVipUser(true);
      } else {
        alert(data.error || '操作失败，请稍后重试');
      }
    } catch (error) {
      console.error('VIP操作失败:', error);
      alert('操作失败，请稍后重试');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212] text-white overflow-hidden">
      {/* 主内容区域 - 可滚动 */}
      <div className="absolute top-0 bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden pb-[calc(64px+env(safe-area-inset-bottom,20px))]">
        {/* 用户信息区域 */}
        <div className="px-6 pt-12 pb-6">
          <div 
            className="flex items-center justify-between cursor-pointer active:opacity-70 transition-opacity"
            onClick={() => {
              if (!user.isLoggedIn) {
                window.location.href = '/login';
              }
            }}
          >
            {/* 头像和用户信息 */}
            <div className="flex items-center gap-4">
              {/* 头像 */}
              <div className="w-16 h-16 bg-[#374151] rounded-full flex items-center justify-center overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-[#9CA3AF]" />
                )}
              </div>

              {/* 用户名和ID */}
              <div>
                <h1 className="text-2xl font-normal text-white mb-1">{user.name}</h1>
                {user.isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-[#D1D5DB]">ID {user.userId.slice(0, 9)}</span>
                      <button 
                        onClick={copyUserId}
                        className="active:opacity-70 transition-opacity"
                      >
                        <Copy className="w-4 h-4 text-[#D1D5DB]" />
                      </button>
                    </div>
                    {isVipUser && user.vipExpireAt && (
                      <div className="text-xs text-[#FBBF24]">
                        VIP有效期至 {new Date(user.vipExpireAt).toLocaleDateString('zh-CN')}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-[#D1D5DB]">点击登录</div>
                )}
              </div>
            </div>

            {/* 右箭头 */}
            <ChevronRight className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* 会员卡片 */}
        <div className="mx-6 mb-6">
          {/* 未登录状态 */}
          {!user.isLoggedIn ? (
            <div className="relative bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-2xl p-6 overflow-hidden">
              <div className="relative z-10 text-center">
                <h3 className="text-lg font-normal text-white mb-2">请先登录</h3>
                <p className="text-sm text-white/80 mb-4">登录后即可开通会员，享受专属权益</p>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-white text-gray-800 text-sm font-semibold px-6 py-2 rounded-full active:scale-95 transition-transform"
                >
                  立即登录
                </button>
              </div>
            </div>
          ) : isVipUser ? (
            /* VIP用户状态 */
            <div className="relative bg-gradient-to-br from-[#FCD34D] via-[#F59E0B] to-[#D97706] rounded-2xl p-6 overflow-hidden">
              {/* 装饰性背景 */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative z-10">
                {/* VIP标题 */}
                <div className="mb-4">
                  <h3 className="text-lg font-normal text-[#543B1F] mb-1">尊敬的会员您好</h3>
                  <p className="text-xs text-[#543B1F]">感谢您的支持，继续享受专属权益</p>
                </div>

                {/* 权益列表 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {memberBenefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        {typeof Icon === 'string' ? (
                          <div className="w-5 h-5 bg-black/10 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-[#543B1F]">{Icon}</span>
                          </div>
                        ) : (
                          <Icon className="w-5 h-5 text-[#543B1F]" />
                        )}
                        <span className="text-sm text-[#543B1F]">{benefit.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* 续费按钮 */}
                <button 
                  onClick={handleVipClick}
                  className="bg-[#422C0E] text-white text-sm font-semibold px-6 py-2 rounded-full active:scale-95 transition-transform"
                >
                  续费
                </button>
              </div>
            </div>
          ) : (
            /* 已登录非VIP状态 - 银色/灰色卡片 */
            <div className="relative bg-gradient-to-br from-[#6B7280] via-[#4B5563] to-[#374151] rounded-2xl p-6 overflow-hidden">
              {/* 9折优惠标签 */}
              <div className="absolute top-3 right-3 bg-[#DB2777] text-white text-[10px] font-bold px-2 py-1 rounded-md z-10">
                9折优惠
              </div>

              {/* 装饰性背景 */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2" />
              </div>

              <div className="relative z-10">
                {/* 标题 */}
                <div className="mb-4">
                  <h3 className="text-lg font-normal text-white mb-1">加入会员</h3>
                  <p className="text-xs text-white/80">畅享这些专属权益：</p>
                </div>

                {/* 权益列表 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {memberBenefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <div key={index} className="flex items-center gap-2">
                        {typeof Icon === 'string' ? (
                          <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{Icon}</span>
                          </div>
                        ) : (
                          <Icon className="w-5 h-5 text-white" />
                        )}
                        <span className="text-sm text-white">{benefit.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* 激活按钮 */}
                <button 
                  onClick={handleVipClick}
                  className="bg-white text-gray-800 text-sm font-semibold px-6 py-2 rounded-full active:scale-95 transition-transform"
                >
                  激活
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 功能菜单列表 */}
        <div className="px-6 pb-8">
          <div className="space-y-0">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center justify-between py-4 border-b border-[#1F1F1F] active:opacity-70 transition-opacity"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base text-white">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                </Link>
              );
            })}
          </div>

          {/* 退出登录按钮 */}
          {user.isLoggedIn && (
            <button
              onClick={() => {
                if (confirm('确定要退出登录吗？')) {
                  console.log('🚪 用户点击退出登录');
                  localStorage.removeItem('token');
                  console.log('✅ Token已清除');
                  
                  // 重置用户状态
                  setUser({
                    isLoggedIn: false,
                    userId: '314270884',
                    name: '登录',
                    email: '',
                    avatar: null,
                    vipExpireAt: null,
                  });
                  setIsVipUser(false);
                  
                  console.log('🔄 准备刷新页面');
                  // 使用 window.location.href 强制刷新
                  window.location.href = '/profile';
                }
              }}
              className="w-full mt-6 bg-[#1F1F1F] text-[#EF4444] text-base font-medium py-3 rounded-lg border border-[#374151] active:opacity-70 transition-opacity"
            >
              退出登录
            </button>
          )}
        </div>
      </div>

      {/* 底部导航 */}
      <BottomNav />

      {/* VIP购买/续费弹窗 */}
      <VipPurchaseDialog
        isOpen={showVipDialog}
        onClose={() => setShowVipDialog(false)}
        onPurchase={handlePurchase}
        isRenewal={isVipUser}
      />
    </div>
  );
}
