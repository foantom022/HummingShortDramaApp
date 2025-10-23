import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET /api/admin/comments - 获取所有评论（管理员）
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dramaId = searchParams.get('dramaId');
    const userId = searchParams.get('userId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const skip = (page - 1) * pageSize;

    // 构建查询条件
    const where: Prisma.CommentWhereInput = {};

    if (dramaId) {
      where.dramaId = dramaId;
    }

    if (userId) {
      where.userId = userId;
    }

    // 查询总数
    const total = await prisma.comment.count({ where });

    // 查询评论列表
    const comments = await prisma.comment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        drama: {
          select: {
            id: true,
            title: true
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
          drama: comment.drama,
          parentId: comment.parentId,
          likeCount: comment._count.likes,
          replyCount: comment._count.replies,
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
    console.error('查询评论失败:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/comments - 批量删除评论
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentIds } = body;

    if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'commentIds必须是非空数组' },
        { status: 400 }
      );
    }

    // 批量删除
    const result = await prisma.comment.deleteMany({
      where: {
        id: {
          in: commentIds
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.count
      },
      message: `成功删除${result.count}条评论`
    });
  } catch (error) {
    console.error('批量删除评论失败:', error);
    return NextResponse.json(
      { success: false, error: '批量删除失败' },
      { status: 500 }
    );
  }
}
