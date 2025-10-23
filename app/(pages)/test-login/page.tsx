'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestLoginPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // 保存token
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        setMessage('✅ 登录成功！即将跳转...');
        
        // 跳转到发现页
        setTimeout(() => {
          router.push('/feed');
        }, 1000);
      } else {
        setMessage('❌ ' + (result.error || '登录失败'));
      }
    } catch (error) {
      console.error('登录失败:', error);
      setMessage('❌ 登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const checkLoginStatus = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setMessage('✅ 已登录: ' + JSON.parse(user).name);
    } else {
      setMessage('❌ 未登录');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMessage('✅ 已退出登录');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1F1F1F] rounded-2xl p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">测试登录</h1>
            <p className="text-gray-400 text-sm">用于测试评论功能</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/10 text-white px-4 py-3 rounded-lg outline-none focus:bg-white/15 transition-colors"
                placeholder="test@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/10 text-white px-4 py-3 rounded-lg outline-none focus:bg-white/15 transition-colors"
                placeholder="123456"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white py-3 rounded-lg font-medium disabled:opacity-50 active:scale-95 transition-transform"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.startsWith('✅') 
                ? 'bg-green-500/20 text-green-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {message}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={checkLoginStatus}
              className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm active:scale-95 transition-transform"
            >
              检查登录状态
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-white/10 text-white py-2 rounded-lg text-sm active:scale-95 transition-transform"
            >
              退出登录
            </button>
          </div>

          <div className="bg-white/5 p-4 rounded-lg space-y-2">
            <p className="text-gray-400 text-xs font-medium">测试账号信息：</p>
            <p className="text-white text-sm">邮箱: test@example.com</p>
            <p className="text-white text-sm">密码: 123456</p>
          </div>

          <div className="text-center">
            <a
              href="/feed"
              className="text-purple-400 text-sm hover:underline"
            >
              前往发现页测试评论 →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
