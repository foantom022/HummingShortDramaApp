import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/search - 搜索剧集（支持相关性排序）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const sortBy = searchParams.get('sort') || 'relevance'; // relevance | views

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          dramas: [],
          pagination: {
            page,
            pageSize,
            total: 0,
            totalPages: 0,
            hasMore: false
          }
        }
      });
    }

    const skip = (page - 1) * pageSize;
    const searchTerm = query.trim();

    // 构建搜索条件
    const where = {
      OR: [
        // 搜索标题
        {
          title: {
            contains: searchTerm,
            mode: 'insensitive' as const
          }
        },
        // 搜索简介
        {
          focus: {
            contains: searchTerm,
            mode: 'insensitive' as const
          }
        },
        // 搜索描述
        {
          description: {
            contains: searchTerm,
            mode: 'insensitive' as const
          }
        },
        // 搜索演员
        {
          actors: {
            some: {
              actor: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive' as const
                }
              }
            }
          }
        },
        // 搜索导演
        {
          directors: {
            some: {
              director: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive' as const
                }
              }
            }
          }
        },
        // 搜索标签
        {
          tags: {
            some: {
              tag: {
                name: {
                  contains: searchTerm,
                  mode: 'insensitive' as const
                }
              }
            }
          }
        }
      ]
    };

    // 查询总数
    const total = await prisma.drama.count({ where });

    // 查询结果
    const dramas = await prisma.drama.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: sortBy === 'views' ? { views: 'desc' } : { createdAt: 'desc' },
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
          take: 5
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

    // 计算相关性分数并排序
    const dramasWithScore = dramas.map(drama => {
      let score = 0;
      const lowerSearchTerm = searchTerm.toLowerCase();
      const lowerTitle = drama.title.toLowerCase();
      const lowerFocus = drama.focus.toLowerCase();
      
      // 标题完全匹配：+100分
      if (lowerTitle === lowerSearchTerm) {
        score += 100;
      }
      // 标题开头匹配：+50分
      else if (lowerTitle.startsWith(lowerSearchTerm)) {
        score += 50;
      }
      // 标题包含：+30分
      else if (lowerTitle.includes(lowerSearchTerm)) {
        score += 30;
      }
      
      // 简介包含：+20分
      if (lowerFocus.includes(lowerSearchTerm)) {
        score += 20;
      }
      
      // 标签匹配：每个+15分
      const matchedTags = drama.tags.filter(dt => 
        dt.tag.name.toLowerCase().includes(lowerSearchTerm)
      );
      score += matchedTags.length * 15;
      
      // 演员匹配：每个+10分
      const matchedActors = drama.actors.filter(da => 
        da.actor.name.toLowerCase().includes(lowerSearchTerm)
      );
      score += matchedActors.length * 10;
      
      // 热度加成（播放量）：归一化到0-20分
      const maxViews = 1000000; // 假设最大播放量
      score += Math.min(20, (drama.views / maxViews) * 20);
      
      return {
        ...drama,
        relevanceScore: score
      };
    });

    // 按相关性或热度排序
    const sortedDramas = sortBy === 'relevance'
      ? dramasWithScore.sort((a, b) => b.relevanceScore - a.relevanceScore)
      : dramasWithScore.sort((a, b) => b.views - a.views);

    // 格式化返回数据
    const formattedDramas = sortedDramas.map(drama => ({
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
      relevanceScore: drama.relevanceScore // 调试用
    }));

    return NextResponse.json({
      success: true,
      data: {
        dramas: formattedDramas,
        query: searchTerm,
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
    console.error('搜索失败:', error);
    return NextResponse.json(
      { success: false, error: '搜索失败' },
      { status: 500 }
    );
  }
}
