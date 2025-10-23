import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/user/favorites - 获取收藏列表
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const skip = (page - 1) * pageSize;

    // 查询总数
    const total = await prisma.favorite.count({
      where: { userId: user.userId }
    });

    // 查询收藏列表
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.userId },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        drama: {
          select: {
            id: true,
            title: true,
            focus: true,
            vPoster: true,
            views: true,
            likes: true,
            rating: true,
            totalEpisodes: true,
            isVip: true,
            tags: {
              include: {
                tag: true
              },
              take: 3
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        favorites: favorites.map(f => ({
          id: f.drama.id,
          title: f.drama.title,
          focus: f.drama.focus,
          vPoster: f.drama.vPoster,
          views: f.drama.views,
          likes: f.drama.likes,
          rating: f.drama.rating,
          totalEpisodes: f.drama.totalEpisodes,
          isVip: f.drama.isVip,
          tags: f.drama.tags.map(t => t.tag.name),
          favoritedAt: f.createdAt
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取收藏列表失败';
    console.error('获取收藏列表失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}
