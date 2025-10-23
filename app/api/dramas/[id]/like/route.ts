import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/dramas/[id]/like - 点赞剧集
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: dramaId } = await params;

    // 检查剧集是否存在
    const drama = await prisma.drama.findUnique({
      where: { id: dramaId }
    });

    if (!drama) {
      return NextResponse.json(
        { success: false, error: '剧集不存在' },
        { status: 404 }
      );
    }

    // 检查是否已点赞
    const existingLike = await prisma.dramaLike.findUnique({
      where: {
        userId_dramaId: {
          userId: user.userId,
          dramaId
        }
      }
    });

    if (existingLike) {
      return NextResponse.json(
        { success: false, error: '已经点赞过了' },
        { status: 400 }
      );
    }

    // 创建点赞记录
    await prisma.dramaLike.create({
      data: {
        userId: user.userId,
        dramaId
      }
    });

    // 更新剧集点赞数
    await prisma.drama.update({
      where: { id: dramaId },
      data: {
        likes: {
          increment: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: '点赞成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '点赞失败';
    console.error('点赞失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}

// DELETE /api/dramas/[id]/like - 取消点赞
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: dramaId } = await params;

    // 删除点赞记录
    const deletedLike = await prisma.dramaLike.delete({
      where: {
        userId_dramaId: {
          userId: user.userId,
          dramaId
        }
      }
    }).catch(() => null);

    if (!deletedLike) {
      return NextResponse.json(
        { success: false, error: '未点赞过' },
        { status: 400 }
      );
    }

    // 更新剧集点赞数
    await prisma.drama.update({
      where: { id: dramaId },
      data: {
        likes: {
          decrement: 1
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: '取消点赞成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '取消点赞失败';
    console.error('取消点赞失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}
