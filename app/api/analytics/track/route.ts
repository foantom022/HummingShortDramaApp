import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// POST /api/analytics/track - 记录用户行为
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, target, metadata } = body;

    if (!action || !target) {
      return NextResponse.json(
        { success: false, error: 'action和target不能为空' },
        { status: 400 }
      );
    }

    // 尝试获取用户ID（可选登录）
    const user = await verifyAuth(request);
    const userId = user?.userId || null;

    // 记录行为
    await prisma.userBehavior.create({
      data: {
        userId,
        action, // 'view', 'play_start', 'play_pause', 'play_complete', 'search', 'click', etc.
        target, // 目标ID（dramaId, episodeId, searchKeyword等）
        metadata: metadata || {}
      }
    });

    return NextResponse.json({
      success: true,
      message: '行为记录成功'
    });
  } catch (error) {
    console.error('记录用户行为失败:', error);
    return NextResponse.json(
      { success: false, error: '记录失败' },
      { status: 500 }
    );
  }
}
