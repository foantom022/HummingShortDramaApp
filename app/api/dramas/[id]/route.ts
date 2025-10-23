import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/dramas/[id] - 获取剧集详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const drama = await prisma.drama.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true
          }
        },
        actors: {
          include: {
            actor: true
          }
        },
        directors: {
          include: {
            director: true
          }
        },
        episodes: {
          orderBy: {
            playOrder: 'asc'
          }
        },
        _count: {
          select: {
            comments: true,
            favorites: true
          }
        }
      }
    });

    if (!drama) {
      return NextResponse.json(
        { success: false, error: '剧集不存在' },
        { status: 404 }
      );
    }

    // 格式化返回数据
    const formattedDrama = {
      id: drama.id,
      originalId: drama.originalId,
      title: drama.title,
      focus: drama.focus,
      description: drama.description,
      channelName: drama.channelName,
      copyrightAuthorize: drama.copyrightAuthorize,
      hPoster: drama.hPoster,
      vPoster: drama.vPoster,
      views: drama.views,
      likes: drama.likes,
      rating: drama.rating,
      isCompleted: drama.isCompleted,
      totalEpisodes: drama.totalEpisodes,
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
      episodes: drama.episodes.map(ep => ({
        id: ep.id,
        originalId: ep.originalId,
        title: ep.title,
        playOrder: ep.playOrder,
        // 不返回playSetting，需要单独请求签名URL
      })),
      commentCount: drama._count.comments,
      favoriteCount: drama._count.favorites,
      createdAt: drama.createdAt,
      updatedAt: drama.updatedAt
    };

    return NextResponse.json({
      success: true,
      data: formattedDrama
    });
  } catch (error) {
    console.error('获取剧集详情失败:', error);
    return NextResponse.json(
      { success: false, error: '获取剧集详情失败' },
      { status: 500 }
    );
  }
}
