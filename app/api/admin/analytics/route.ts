import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/admin/analytics - 查询用户行为日志（管理员）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const days = parseInt(searchParams.get('days') || '7');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const skip = (page - 1) * pageSize;

    // 计算时间范围
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 构建查询条件
    const where: Prisma.UserBehaviorWhereInput = {
      createdAt: {
        gte: startDate
      }
    };

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    // 查询总数
    const total = await prisma.userBehavior.count({ where });

    // 查询行为日志
    const behaviors = await prisma.userBehavior.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 统计数据
    const stats = await prisma.userBehavior.groupBy({
      by: ['action'],
      where,
      _count: {
        action: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        behaviors,
        stats: stats.map(s => ({
          action: s.action,
          count: s._count.action
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasMore: skip + pageSize < total
        },
        query: {
          userId,
          action,
          days
        }
      }
    });
  } catch (error) {
    console.error('查询行为日志失败:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
