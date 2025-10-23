import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/comments - 获取评论列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dramaId = searchParams.get('dramaId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!dramaId) {
      return NextResponse.json(
        { success: false, error: '缺少dramaId参数' },
        { status: 400 }
      );
    }

    const skip = (page - 1) * pageSize;

    // 查询总数
    const total = await prisma.comment.count({
      where: {
        dramaId,
        parentId: null // 只统计一级评论
      }
    });

    // 查询评论列表（只查一级评论）
    const comments = await prisma.comment.findMany({
      where: {
        dramaId,
        parentId: null
      },
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        replies: {
          orderBy: {
            createdAt: 'asc' // 回复按时间正序
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            replies: true,
            likes: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        comments: comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          user: comment.user,
          likeCount: comment._count.likes,
          replyCount: comment._count.replies,
          replies: comment.replies.map(reply => ({
            id: reply.id,
            content: reply.content,
            user: reply.user,
            createdAt: reply.createdAt
          })),
          createdAt: comment.createdAt
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
    console.error('获取评论失败:', error);
    return NextResponse.json(
      { success: false, error: '获取评论失败' },
      { status: 500 }
    );
  }
}

// POST /api/comments - 发表评论
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { dramaId, content, parentId } = body;

    if (!dramaId || !content) {
      return NextResponse.json(
        { success: false, error: '剧集ID和评论内容不能为空' },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '评论内容不能为空' },
        { status: 400 }
      );
    }

    // 如果是回复，验证父评论是否存在
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment) {
        return NextResponse.json(
          { success: false, error: '父评论不存在' },
          { status: 404 }
        );
      }
    }

    // 创建评论
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.userId,
        dramaId,
        ...(parentId && { parentId })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: { comment },
      message: parentId ? '回复成功' : '评论成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '评论失败';
    console.error('评论失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}
