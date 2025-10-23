import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// POST /api/user/vip - 购买/续费VIP
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { duration = 30 } = body; // 默认30天

    // 获取当前用户信息
    const currentUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        isVip: true,
        vipExpireAt: true
      }
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    const now = new Date();
    let newExpireDate: Date;

    // 如果是VIP且未过期，从当前到期时间延长
    if (currentUser.isVip && currentUser.vipExpireAt && currentUser.vipExpireAt > now) {
      newExpireDate = new Date(currentUser.vipExpireAt);
      newExpireDate.setDate(newExpireDate.getDate() + duration);
    } else {
      // 新购买或已过期，从现在开始计算
      newExpireDate = new Date();
      newExpireDate.setDate(newExpireDate.getDate() + duration);
    }

    // 更新用户VIP状态
    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        isVip: true,
        vipExpireAt: newExpireDate
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        isVip: true,
        vipExpireAt: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        user: updatedUser,
        message: currentUser.isVip ? 'VIP续费成功' : 'VIP开通成功'
      },
      message: currentUser.isVip ? 'VIP续费成功' : 'VIP开通成功'
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'VIP购买失败';
    console.error('VIP购买失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}

// GET /api/user/vip - 获取VIP状态
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const userInfo = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        isVip: true,
        vipExpireAt: true
      }
    });

    if (!userInfo) {
      return NextResponse.json(
        { success: false, error: '用户不存在' },
        { status: 404 }
      );
    }

    const now = new Date();
    const isVipActive = userInfo.isVip && userInfo.vipExpireAt && userInfo.vipExpireAt > now;

    return NextResponse.json({
      success: true,
      data: {
        isVip: isVipActive,
        vipExpireAt: userInfo.vipExpireAt,
        daysRemaining: isVipActive && userInfo.vipExpireAt 
          ? Math.ceil((userInfo.vipExpireAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          : 0
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取VIP状态失败';
    console.error('获取VIP状态失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}
