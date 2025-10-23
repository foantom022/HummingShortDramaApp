import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/dramas - 获取剧集列表（分页）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const channel = searchParams.get('channel'); // 男频/女频
    const tag = searchParams.get('tag'); // 标签筛选
    const isVip = searchParams.get('isVip'); // VIP筛选
    const sort = searchParams.get('sort') || 'views'; // 排序: views, likes, rating, createdAt

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: Prisma.DramaWhereInput = {};
    
    if (channel) {
      where.channelName = channel;
    }

    if (tag) {
      where.tags = {
        some: {
          tag: {
            name: tag
          }
        }
      };
    }

    if (isVip === 'true') {
      where.isVip = true;
    }

    // 构建排序
    const orderBy: Prisma.DramaOrderByWithRelationInput = {};
    switch (sort) {
      case 'likes':
        orderBy.likes = 'desc';
        break;
      case 'rating':
        orderBy.rating = 'desc';
        break;
      case 'createdAt':
        orderBy.createdAt = 'desc';
        break;
      default:
        orderBy.views = 'desc';
    }

    // 查询总数
    const total = await prisma.drama.count({ where });

    // 查询剧集列表
    const dramas = await prisma.drama.findMany({
      where,
      skip,
      take: pageSize,
      orderBy,
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        actors: {
          include: {
            actor: true
          },
          take: 5 // 只返回前5个演员
        },
        directors: {
          include: {
            director: true
          }
        },
        _count: {
          select: {
            episodes: true,
            comments: true,
            favorites: true
          }
        }
      }
    });

    // 格式化返回数据
    const formattedDramas = dramas.map(drama => ({
      id: drama.id,
      originalId: drama.originalId,
      title: drama.title,
      focus: drama.focus,
      description: drama.description,
      channelName: drama.channelName,
      hPoster: drama.hPoster,
      vPoster: drama.vPoster,
      views: drama.views,
      likes: drama.likes,
      rating: drama.rating,
      isCompleted: drama.isCompleted,
      totalEpisodes: drama.totalEpisodes,
      isVip: drama.isVip,
      tags: drama.tags.map(dt => ({
        id: dt.tag.id,
        name: dt.tag.name
      })),
      actors: drama.actors.map(da => ({
        id: da.actor.id,
        name: da.actor.name
      })),
      directors: drama.directors.map(dd => ({
        id: dd.director.id,
        name: dd.director.name
      })),
      episodeCount: drama._count.episodes,
      commentCount: drama._count.comments,
      favoriteCount: drama._count.favorites,
      createdAt: drama.createdAt,
      updatedAt: drama.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        dramas: formattedDramas,
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
    console.error('获取剧集列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取剧集列表失败' },
      { status: 500 }
    );
  }
}
