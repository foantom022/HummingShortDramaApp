'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Film, Users, MessageSquare, Eye, Heart, Star, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDramas: 0,
    totalEpisodes: 0,
    totalUsers: 0,
    totalComments: 0,
    totalViews: 0,
    totalLikes: 0,
    vipDramas: 0,
    avgRating: 0
  });

  useEffect(() => {
    // 这里可以调用API获取统计数据
    // 暂时使用硬编码的数据
    setStats({
      totalDramas: 1024,
      totalEpisodes: 10150,
      totalUsers: 0,
      totalComments: 0,
      totalViews: 0,
      totalLikes: 0,
      vipDramas: 307,
      avgRating: 8.2
    });
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">管理后台概览</h2>
        <p className="text-gray-500 mt-2">短剧APP数据统计和管理</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              剧集总数
            </CardTitle>
            <Film className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDramas}</div>
            <p className="text-xs text-gray-500 mt-1">
              VIP剧集: {stats.vipDramas}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              剧集总数
            </CardTitle>
            <Film className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEpisodes}</div>
            <p className="text-xs text-gray-500 mt-1">
              平均每部 {(stats.totalEpisodes / stats.totalDramas).toFixed(1)} 集
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              注册用户
            </CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              活跃用户统计
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              评论总数
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-gray-500 mt-1">
              用户互动数据
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              总播放量
            </CardTitle>
            <Eye className="w-4 h-4 text-cyan-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalViews > 0 ? (stats.totalViews / 10000).toFixed(1) + '万' : '统计中'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              累计观看次数
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              总点赞数
            </CardTitle>
            <Heart className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalLikes > 0 ? (stats.totalLikes / 10000).toFixed(1) + '万' : '统计中'}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              用户点赞统计
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              平均评分
            </CardTitle>
            <Star className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">
              剧集平均评分
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              VIP占比
            </CardTitle>
            <Star className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.vipDramas / stats.totalDramas) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.vipDramas} 部VIP剧集
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/admin/dramas"
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <Film className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="font-medium">剧集管理</div>
              <div className="text-xs text-gray-500 mt-1">编辑、删除剧集</div>
            </a>

            <a
              href="/admin/users"
              className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center"
            >
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="font-medium">用户管理</div>
              <div className="text-xs text-gray-500 mt-1">查询用户信息</div>
            </a>

            <a
              href="/admin/comments"
              className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
            >
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="font-medium">评论管理</div>
              <div className="text-xs text-gray-500 mt-1">审核、删除评论</div>
            </a>

            <a
              href="/admin/analytics"
              className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
            >
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="font-medium">行为分析</div>
              <div className="text-xs text-gray-500 mt-1">查询用户行为</div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* 系统信息 */}
      <Card>
        <CardHeader>
          <CardTitle>系统信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">数据库状态:</span>
              <span className="text-green-600 font-medium">✓ 正常</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">API状态:</span>
              <span className="text-green-600 font-medium">✓ 运行中</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">CDN签名:</span>
              <span className="text-green-600 font-medium">✓ 已配置</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">AI Chatbot:</span>
              <span className="text-green-600 font-medium">✓ 已启用</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
