'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  drama: {
    id: string;
    title: string;
  };
  likeCount: number;
  replyCount: number;
  createdAt: string;
}

export default function CommentsManagement() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchDramaId, setSearchDramaId] = useState('');
  const [searchUserId, setSearchUserId] = useState('');

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchDramaId) params.append('dramaId', searchDramaId);
      if (searchUserId) params.append('userId', searchUserId);

      const response = await fetch(`/api/admin/comments?${params.toString()}`);
      const result = await response.json();
      
      if (result.success) {
        setComments(result.data.comments);
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

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这条评论吗？此操作不可恢复！')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        alert('删除成功！');
        handleSearch();
      } else {
        alert('删除失败：' + result.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请稍后重试');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">评论管理</h2>
        <p className="text-gray-500 mt-1">审核和管理用户评论</p>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardHeader>
          <CardTitle>查询评论</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  剧集ID
                </label>
                <Input
                  type="text"
                  placeholder="输入剧集ID查询该剧集的所有评论..."
                  value={searchDramaId}
                  onChange={(e) => setSearchDramaId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  用户ID
                </label>
                <Input
                  type="text"
                  placeholder="输入用户ID查询该用户的所有评论..."
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
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

      {/* 评论列表 */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>评论列表（{comments.length}条）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {comment.user.name || comment.user.email}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        评论剧集：《{comment.drama.title}》
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="bg-gray-50 rounded p-3 mb-3">
                    <p className="text-gray-900">{comment.content}</p>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>👍 {comment.likeCount} 点赞</span>
                    <span>💬 {comment.replyCount} 回复</span>
                    <span>ID: {comment.id.substring(0, 12)}...</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>查询方式：</strong></p>
            <p>• 输入剧集ID：查询该剧集下的所有评论</p>
            <p>• 输入用户ID：查询该用户发表的所有评论</p>
            <p>• 同时输入：查询特定用户在特定剧集下的评论</p>
            <p className="mt-4"><strong>管理操作：</strong></p>
            <p>• 点击删除按钮可删除违规评论</p>
            <p>• 删除操作不可恢复，请谨慎操作</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
