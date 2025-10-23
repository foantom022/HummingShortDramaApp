import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/user/history - 获取观看历史
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    const skip = (page - 1) * pageSize;

    // 查询总数
    const total = await prisma.watchHistory.count({
      where: { userId: user.userId }
    });

    // 查询观看历史
    const histories = await prisma.watchHistory.findMany({
      where: { userId: user.userId },
      skip,
      take: pageSize,
      orderBy: {
        updatedAt: 'desc' // 按最后观看时间排序
      },
      include: {
        drama: {
          select: {
            id: true,
            title: true,
            focus: true,
            vPoster: true,
            totalEpisodes: true,
            isVip: true
          }
        }
      }
    });

    // 手动获取episode信息
    const historiesWithEpisodes = await Promise.all(
      histories.map(async (h) => {
        const episode = await prisma.episode.findUnique({
          where: { id: h.episodeId },
          select: {
            id: true,
            title: true,
            playOrder: true
          }
        });

        return {
          id: h.id,
          drama: h.drama,
          episode: episode || { id: h.episodeId, title: '未知集数', playOrder: 0 },
          progress: h.progress,
          updatedAt: h.updatedAt
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        history: historiesWithEpisodes,
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
    const errorMessage = error instanceof Error ? error.message : '获取观看历史失败';
    console.error('获取观看历史失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}

// POST /api/user/history - 记录观看历史
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { dramaId, episodeId, progress } = body;

    if (!dramaId || !episodeId) {
      return NextResponse.json(
        { success: false, error: '剧集ID和集数ID不能为空' },
        { status: 400 }
      );
    }

    // 使用upsert：如果存在则更新，不存在则创建
    const history = await prisma.watchHistory.upsert({
      where: {
        userId_episodeId: {
          userId: user.userId,
          episodeId
        }
      },
      update: {
        progress: progress || 0,
        updatedAt: new Date()
      },
      create: {
        userId: user.userId,
        dramaId,
        episodeId,
        progress: progress || 0
      }
    });

    return NextResponse.json({
      success: true,
      data: { history },
      message: '记录成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '记录观看历史失败';
    console.error('记录观看历史失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}

// DELETE /api/user/history - 删除观看历史
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const searchParams = request.nextUrl.searchParams;
    const dramaId = searchParams.get('dramaId');

    if (dramaId) {
      // 删除指定剧集的观看历史
      await prisma.watchHistory.deleteMany({
        where: {
          userId: user.userId,
          dramaId
        }
      });

      return NextResponse.json({
        success: true,
        message: '删除成功'
      });
    } else {
      // 清空所有观看历史
      await prisma.watchHistory.deleteMany({
        where: {
          userId: user.userId
        }
      });

      return NextResponse.json({
        success: true,
        message: '清空成功'
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '删除观看历史失败';
    console.error('删除观看历史失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}
