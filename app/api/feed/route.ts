import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/feed - 获取信息流（类抖音模式）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get('cursor'); // 游标分页
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // 尝试获取用户信息（可选登录）
    const user = await verifyAuth(request);

    // 构建查询条件
    const where: Prisma.DramaWhereInput = {};
    
    // 如果有cursor，从该位置开始查询
    if (cursor) {
      where.id = {
        lt: cursor // 小于cursor的ID（按时间倒序）
      };
    }

    // 查询剧集列表
    const dramas = await prisma.drama.findMany({
      where,
      take: limit,
      orderBy: [
        { views: 'desc' }, // 优先按热度
        { createdAt: 'desc' } // 然后按时间
      ],
      include: {
        tags: {
          include: {
            tag: true
          },
          take: 5
        },
        actors: {
          include: {
            actor: true
          },
          take: 3
        },
        episodes: {
          orderBy: {
            playOrder: 'asc'
          },
          take: 1, // 只取第一集用于播放
          select: {
            id: true,
            title: true,
            playOrder: true
          }
        },
        _count: {
          select: {
            comments: true,
            favorites: true,
            dramaLikes: true
          }
        },
        // 如果用户已登录，查询用户的互动状态
        ...(user && {
          dramaLikes: {
            where: {
              userId: user.userId
            },
            select: {
              userId: true
            }
          },
          favorites: {
            where: {
              userId: user.userId
            },
            select: {
              userId: true
            }
          }
        })
      }
    });

    // 格式化返回数据
    const formattedDramas = dramas.map(drama => ({
      id: drama.id,
      title: drama.title,
      focus: drama.focus,
      description: drama.description,
      vPoster: drama.vPoster,
      hPoster: drama.hPoster,
      channelName: drama.channelName,
      views: drama.views,
      likes: drama.likes,
      rating: drama.rating,
      isVip: drama.isVip,
      totalEpisodes: drama.totalEpisodes,
      tags: drama.tags.map(t => t.tag.name),
      actors: drama.actors.map(a => a.actor.name),
      firstEpisode: drama.episodes[0] || null,
      stats: {
        commentCount: drama._count.comments,
        favoriteCount: drama._count.favorites,
        likeCount: drama._count.dramaLikes
      },
      // 用户互动状态
      ...(user && {
        userStatus: {
          isLiked: drama.dramaLikes && drama.dramaLikes.length > 0,
          isFavorited: drama.favorites && drama.favorites.length > 0
        }
      })
    }));

    // 获取下一页的cursor
    const nextCursor = dramas.length === limit ? dramas[dramas.length - 1].id : null;

    return NextResponse.json({
      success: true,
      data: {
        dramas: formattedDramas,
        nextCursor,
        hasMore: nextCursor !== null
      }
    });
  } catch (error) {
    console.error('获取信息流失败:', error);
    return NextResponse.json(
      { success: false, error: '获取信息流失败' },
      { status: 500 }
    );
  }
}
