'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  stats: {
    favoriteCount: number;
    historyCount: number;
    commentCount: number;
    likeCount: number;
    conversationCount: number;
  };
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchUserId) params.append('userId', searchUserId);
      if (searchEmail) params.append('email', searchEmail);

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setUsers(result.data.users);
      } else {
        alert('查询失败：' + result.error);
      }
    } catch (error) {
      console.error('查询失败:', error);
      alert('查询失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">用户管理</h2>
        <p className="text-gray-500 mt-1">查询用户信息和统计数据</p>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardHeader>
          <CardTitle>查询用户</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  用户ID
                </label>
                <Input
                  type="text"
                  placeholder="输入用户ID..."
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  邮箱
                </label>
                <Input
                  type="text"
                  placeholder="输入邮箱..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
              <Search className="w-4 h-4 mr-2" />
              {loading ? '查询中...' : '查询'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 用户列表 */}
      {users.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>查询结果（{users.length}条）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">用户ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">邮箱</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">昵称</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">收藏</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">历史</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">评论</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">点赞</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">对话</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">注册时间</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {user.id.substring(0, 12)}...
                        </code>
                      </td>
                      <td className="py-3 px-4 text-gray-900">{user.email}</td>
                      <td className="py-3 px-4 text-gray-600">{user.name || '-'}</td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {user.stats.favoriteCount}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {user.stats.historyCount}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {user.stats.commentCount}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {user.stats.likeCount}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {user.stats.conversationCount}
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用示例 */}
      <Card>
        <CardHeader>
          <CardTitle>使用示例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• 输入用户ID查询特定用户的详细信息</p>
            <p>• 输入邮箱模糊搜索用户</p>
            <p>• 查看用户的收藏、历史、评论、点赞等统计数据</p>
            <p>• 查看用户与AI角色的对话次数</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
