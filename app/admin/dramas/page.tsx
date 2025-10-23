'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2, Edit } from 'lucide-react';

interface Drama {
  id: string;
  title: string;
  channelName: string;
  views: number;
  likes: number;
  rating: number;
  isVip: boolean;
  totalEpisodes: number;
  tags: { name: string }[];
}

export default function DramasManagement() {
  const [dramas, setDramas] = useState<Drama[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchDramas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchDramas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/dramas?page=${page}&pageSize=20`);
      const result = await response.json();
      
      if (result.success) {
        setDramas(result.data.dramas);
        setTotal(result.data.pagination.total);
      }
    } catch (error) {
      console.error('获取剧集失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除《${title}》吗？此操作不可恢复！`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/dramas/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('删除成功！');
        fetchDramas();
      } else {
        alert('删除失败：' + result.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  const filteredDramas = dramas.filter(drama =>
    drama.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">剧集管理</h2>
          <p className="text-gray-500 mt-1">共 {total} 部剧集</p>
        </div>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索剧集标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={fetchDramas}>刷新</Button>
          </div>
        </CardContent>
      </Card>

      {/* 剧集列表 */}
      <Card>
        <CardHeader>
          <CardTitle>剧集列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">标题</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">频道</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">标签</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">播放量</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">点赞</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">评分</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">VIP</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDramas.map((drama) => (
                    <tr key={drama.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{drama.title}</div>
                        <div className="text-xs text-gray-500">{drama.totalEpisodes}集</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{drama.channelName}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1 flex-wrap">
                          {drama.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {(drama.views / 10000).toFixed(1)}万
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {(drama.likes / 10000).toFixed(1)}万
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600">
                        {drama.rating.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {drama.isVip ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                            VIP
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">普通</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <button
                            className="p-1 hover:bg-gray-100 rounded"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(drama.id, drama.title)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 分页 */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              显示 {filteredDramas.length} / {total} 条
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <div className="px-4 py-2 bg-gray-100 rounded">
                第 {page} 页
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => p + 1)}
                disabled={page * 20 >= total}
              >
                下一页
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
