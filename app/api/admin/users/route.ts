import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/admin/users - 查询用户列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: Prisma.UserWhereInput = {};

    if (userId) {
      where.id = userId;
    }

    if (email) {
      where.email = {
        contains: email,
        mode: 'insensitive'
      };
    }

    // 查询总数
    const total = await prisma.user.count({ where });

    // 查询用户列表
    const users = await prisma.user.findMany({
      where,
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            watchHistories: true,
            comments: true,
            dramaLikes: true,
            conversations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
          stats: {
            favoriteCount: user._count.favorites,
            historyCount: user._count.watchHistories,
            commentCount: user._count.comments,
            likeCount: user._count.dramaLikes,
            conversationCount: user._count.conversations
          }
        })),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
          hasMore: skip + pageSize < total
        }
      }
    });
  } catch (error) {
    console.error('查询用户失败:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
