'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async (phone: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: `${phone}@test.com`,
          password
        })
      });

      const data = await response.json();
      setResult({ type: 'login', data });

      if (data.success) {
        localStorage.setItem('token', data.data.token);
      }
    } catch (error) {
      setResult({ type: 'error', error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const testProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      setResult({ type: 'profile', data });
    } catch (error) {
      setResult({ type: 'error', error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">API测试页面</h1>

      <div className="space-y-4 mb-8">
        <button
          onClick={() => testLogin('13800138000', '123456')}
          disabled={loading}
          className="bg-blue-600 px-6 py-3 rounded-lg disabled:opacity-50"
        >
          测试VIP用户登录
        </button>

        <button
          onClick={() => testLogin('13900139000', '123456')}
          disabled={loading}
          className="bg-green-600 px-6 py-3 rounded-lg disabled:opacity-50 ml-4"
        >
          测试普通用户登录
        </button>

        <button
          onClick={testProfile}
          disabled={loading}
          className="bg-purple-600 px-6 py-3 rounded-lg disabled:opacity-50 ml-4"
        >
          获取用户信息
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            setResult(null);
          }}
          className="bg-red-600 px-6 py-3 rounded-lg ml-4"
        >
          清除Token
        </button>
      </div>

      {loading && <div className="text-yellow-400">加载中...</div>}

      {result && (
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">结果 ({result.type})</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(result.data || result.error, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
