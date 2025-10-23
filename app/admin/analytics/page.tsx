'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Behavior {
  id: string;
  userId: string | null;
  action: string;
  target: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface Stats {
  action: string;
  count: number;
}

export default function AnalyticsManagement() {
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [stats, setStats] = useState<Stats[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchUserId, setSearchUserId] = useState('');
  const [searchAction, setSearchAction] = useState('');
  const [days, setDays] = useState('7');

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchUserId) params.append('userId', searchUserId);
      if (searchAction) params.append('action', searchAction);
      params.append('days', days);

      const response = await fetch(`/api/admin/analytics?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setBehaviors(result.data.behaviors);
        setStats(result.data.stats);
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
        <h2 className="text-2xl font-bold text-gray-900">用户行为分析</h2>
        <p className="text-gray-500 mt-1">查询和分析用户行为日志</p>
      </div>

      {/* 查询条件 */}
      <Card>
        <CardHeader>
          <CardTitle>查询条件</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  用户ID
                </label>
                <Input
                  type="text"
                  placeholder="输入用户ID（可选）"
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  行为类型
                </label>
                <Select value={searchAction} onValueChange={setSearchAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择行为类型（可选）" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部</SelectItem>
                    <SelectItem value="view">查看剧集</SelectItem>
                    <SelectItem value="play_start">开始播放</SelectItem>
                    <SelectItem value="play_pause">暂停播放</SelectItem>
                    <SelectItem value="play_complete">完成播放</SelectItem>
                    <SelectItem value="search">搜索</SelectItem>
                    <SelectItem value="click">点击</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  时间范围
                </label>
                <Select value={days} onValueChange={setDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">最近1天</SelectItem>
                    <SelectItem value="7">最近7天</SelectItem>
                    <SelectItem value="30">最近30天</SelectItem>
                    <SelectItem value="90">最近90天</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
              <Search className="w-4 h-4 mr-2" />
              {loading ? '查询中...' : '查询'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 统计数据 */}
      {stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>行为统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.map((stat) => (
                <div key={stat.action} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
                  <div className="text-xs text-gray-600 mt-1">{stat.action}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 行为日志列表 */}
      {behaviors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>行为日志（{behaviors.length}条）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">时间</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">用户ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">行为类型</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">目标</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">元数据</th>
                  </tr>
                </thead>
                <tbody>
                  {behaviors.map((behavior) => (
                    <tr key={behavior.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(behavior.createdAt).toLocaleString('zh-CN')}
                      </td>
                      <td className="py-3 px-4">
                        {behavior.userId ? (
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {behavior.userId.substring(0, 12)}...
                          </code>
                        ) : (
                          <span className="text-gray-400 text-xs">未登录</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {behavior.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {behavior.target.substring(0, 20)}...
                        </code>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {behavior.metadata ? JSON.stringify(behavior.metadata).substring(0, 50) : '-'}
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
          <CardTitle>查询示例</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 rounded">
              <p className="font-medium text-blue-900 mb-1">示例1：查询用户ID为123的最近7天播放记录</p>
              <p className="text-blue-700">用户ID: 123 | 行为类型: play_start | 时间范围: 最近7天</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded">
              <p className="font-medium text-green-900 mb-1">示例2：查询所有用户的搜索行为</p>
              <p className="text-green-700">用户ID: (留空) | 行为类型: search | 时间范围: 最近30天</p>
            </div>

            <div className="p-3 bg-purple-50 rounded">
              <p className="font-medium text-purple-900 mb-1">示例3：查询特定用户的所有行为</p>
              <p className="text-purple-700">用户ID: abc123 | 行为类型: (全部) | 时间范围: 最近7天</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
