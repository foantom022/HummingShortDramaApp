'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证手机号
    if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      setError('请输入正确的手机号');
      return;
    }

    // 验证密码长度
    if (formData.password.length < 6) {
      setError('密码至少需要6位');
      return;
    }

    // 验证两次密码是否一致
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    setIsLoading(true);

    try {
      // 将手机号作为email使用
      const email = `${formData.phone}@test.com`;
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: formData.password,
          name: formData.name || formData.phone
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('注册成功！请登录');
        // 跳转到登录页
        window.location.href = '/login';
      } else {
        setError(data.error || '注册失败，请稍后重试');
      }
    } catch (err) {
      console.error('注册错误:', err);
      setError('注册失败，请稍后重试');
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
          <h1 className="text-3xl font-bold text-white mb-2">创建账号</h1>
          <p className="text-base text-[#9CA3AF]">注册成为会员，畅享精彩短剧</p>
        </div>

        {/* 注册表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 手机号输入 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#D1D5DB] mb-2">
              手机号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="请输入手机号"
              maxLength={11}
              className="w-full bg-[#1F1F1F] text-white text-base px-4 py-3 rounded-lg border border-[#374151] focus:border-[#F59E0B] focus:outline-none transition-colors"
              required
            />
          </div>

          {/* 昵称输入（可选） */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[#D1D5DB] mb-2">
              昵称（可选）
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="请输入昵称，不填写则使用手机号"
              className="w-full bg-[#1F1F1F] text-white text-base px-4 py-3 rounded-lg border border-[#374151] focus:border-[#F59E0B] focus:outline-none transition-colors"
            />
          </div>

          {/* 密码输入 */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#D1D5DB] mb-2">
              密码 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="请输入密码（至少6位）"
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

          {/* 确认密码输入 */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#D1D5DB] mb-2">
              确认密码 <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="请再次输入密码"
                className="w-full bg-[#1F1F1F] text-white text-base px-4 py-3 rounded-lg border border-[#374151] focus:border-[#F59E0B] focus:outline-none transition-colors pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-white transition-colors"
              >
                {showConfirmPassword ? (
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

          {/* 注册按钮 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white text-base font-semibold py-3 rounded-lg active:scale-98 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '注册中...' : '注册'}
          </button>

          {/* 用户协议 */}
          <div className="text-xs text-[#9CA3AF] text-center">
            注册即表示同意
            <Link href="/terms" className="text-[#F59E0B] mx-1">
              用户协议
            </Link>
            和
            <Link href="/privacy" className="text-[#F59E0B] mx-1">
              隐私政策
            </Link>
          </div>
        </form>

        {/* 底部链接 */}
        <div className="mt-8 text-center pb-8">
          <p className="text-sm text-[#9CA3AF]">
            已有账号？{' '}
            <Link href="/login" className="text-[#F59E0B] font-medium">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
