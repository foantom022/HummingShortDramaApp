import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/user/profile - 获取用户信息
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const userInfo = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isVip: true,
        vipExpireAt: true,
        createdAt: true,
        _count: {
          select: {
            favorites: true,
            watchHistories: true,
            comments: true,
            dramaLikes: true
          }
        }
      }
    });

    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    // 检查VIP是否过期
    const now = new Date();
    const isVipActive = userInfo.isVip && userInfo.vipExpireAt && userInfo.vipExpireAt > now;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...userInfo,
          isVip: isVipActive, // 返回实际的VIP状态（考虑过期时间）
          stats: {
            favoriteCount: userInfo._count.favorites,
            historyCount: userInfo._count.watchHistories,
            commentCount: userInfo._count.comments,
            likeCount: userInfo._count.dramaLikes
          }
        }
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取用户信息失败';
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}

// PUT /api/user/profile - 更新用户信息
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { name, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true
      }
    });

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message: '更新成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '更新用户信息失败';
    console.error('更新用户信息失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}
