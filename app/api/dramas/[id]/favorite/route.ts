import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/dramas/[id]/favorite - 收藏剧集
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

    // 检查是否已收藏
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_dramaId: {
          userId: user.userId,
          dramaId
        }
      }
    });

    if (existingFavorite) {
      return NextResponse.json(
        { success: false, error: '已经收藏过了' },
        { status: 400 }
      );
    }

    // 创建收藏记录
    await prisma.favorite.create({
      data: {
        userId: user.userId,
        dramaId
      }
    });

    return NextResponse.json({
      success: true,
      message: '收藏成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '收藏失败';
    console.error('收藏失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}

// DELETE /api/dramas/[id]/favorite - 取消收藏
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id: dramaId } = await params;

    // 删除收藏记录
    const deletedFavorite = await prisma.favorite.delete({
      where: {
        userId_dramaId: {
          userId: user.userId,
          dramaId
        }
      }
    }).catch(() => null);

    if (!deletedFavorite) {
      return NextResponse.json(
        { success: false, error: '未收藏过' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '取消收藏成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '取消收藏失败';
    console.error('取消收藏失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}
