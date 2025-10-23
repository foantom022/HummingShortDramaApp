'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 将手机号作为email使用（添加@domain后缀）
      const email = formData.phone.includes('@') ? formData.phone : `${formData.phone}@test.com`;
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // 保存token到localStorage
        localStorage.setItem('token', data.data.token);
        console.log('登录成功，Token已保存:', data.data.token.substring(0, 20) + '...');
        console.log('用户信息:', data.data.user);
        
        // 使用window.location.href确保页面完全刷新
        window.location.href = '/profile';
      } else {
        setError(data.error || '登录失败，请检查手机号和密码');
      }
    } catch (err) {
      console.error('登录错误:', err);
      setError('登录失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误提示
    if (error) setError('');
  };

  return (
    <div className="fixed inset-0 bg-[#121212] text-white overflow-hidden">
      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 h-14 flex items-center px-4 z-10">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 active:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* 主内容区域 */}
      <div className="absolute top-14 bottom-0 left-0 right-0 overflow-y-auto px-6 pt-8">
        {/* 标题 */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">欢迎回来</h1>
          <p className="text-base text-[#9CA3AF]">登录您的账号</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 手机号输入 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#D1D5DB] mb-2">
              手机号
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="请输入手机号"
              className="w-full bg-[#1F1F1F] text-white text-base px-4 py-3 rounded-lg border border-[#374151] focus:border-[#F59E0B] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* 密码输入 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#D1D5DB] mb-2">
              密码
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="请输入密码"
                className="w-full bg-[#1F1F1F] text-white text-base px-4 py-3 rounded-lg border border-[#374151] focus:border-[#F59E0B] focus:outline-none transition-colors pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-white transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-base font-semibold py-3 rounded-lg active:scale-98 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '登录中...' : '登录'}
          </button>

          {/* 测试账号提示 */}
          <div className="mt-8 p-4 bg-[#1F1F1F] rounded-lg border border-[#374151]">
            <p className="text-sm text-[#9CA3AF] mb-3 font-medium">测试账号：</p>
            <div className="space-y-2 text-xs text-[#D1D5DB]">
              <div className="flex justify-between items-center">
                <span className="text-[#FBBF24]">👑 VIP用户</span>
                <div className="text-right">
                  <div>手机号: <span className="text-white font-mono">13800138000</span></div>
                  <div>密码: <span className="text-white font-mono">123456</span></div>
                </div>
              </div>
              <div className="h-px bg-[#374151] my-2"></div>
              <div className="flex justify-between items-center">
                <span className="text-[#9CA3AF]">普通用户</span>
                <div className="text-right">
                  <div>手机号: <span className="text-white font-mono">13900139000</span></div>
                  <div>密码: <span className="text-white font-mono">123456</span></div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* 底部链接 */}
        <div className="mt-8 text-center pb-8">
          <p className="text-sm text-[#9CA3AF]">
            还没有账号？{' '}
            <Link href="/register" className="text-[#F59E0B] font-medium">
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
