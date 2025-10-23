import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search/suggestions - 获取搜索建议
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          suggestions: []
        }
      });
    }

    const searchTerm = query.trim();
    const limit = 10;

    // 搜索剧集标题
    const titleSuggestions = await prisma.drama.findMany({
      where: {
        title: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        title: true,
        views: true
      },
      orderBy: {
        views: 'desc'
      },
      take: 5
    });

    // 搜索演员
    const actorSuggestions = await prisma.actor.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            dramas: true
          }
        }
      },
      orderBy: {
        dramas: {
          _count: 'desc'
        }
      },
      take: 3
    });

    // 搜索标签
    const tagSuggestions = await prisma.tag.findMany({
      where: {
        name: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            dramas: true
          }
        }
      },
      orderBy: {
        dramas: {
          _count: 'desc'
        }
      },
      take: 2
    });

    // 组合建议
    const suggestions = [
      ...titleSuggestions.map(item => ({
        id: item.id,
        text: item.title,
        type: 'drama' as const,
        meta: `${item.views} 次播放`
      })),
      ...actorSuggestions.map(item => ({
        id: item.id,
        text: item.name,
        type: 'actor' as const,
        meta: `${item._count.dramas} 部作品`
      })),
      ...tagSuggestions.map(item => ({
        id: item.id,
        text: item.name,
        type: 'tag' as const,
        meta: `${item._count.dramas} 部剧集`
      }))
    ].slice(0, limit);

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        query: searchTerm
      }
    });
  } catch (error) {
    console.error('获取搜索建议失败:', error);
    return NextResponse.json(
      { success: false, error: '获取搜索建议失败' },
      { status: 500 }
    );
  }
}
