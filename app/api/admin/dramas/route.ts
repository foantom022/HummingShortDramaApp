import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/dramas - 批量更新剧集
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { dramaIds, updates } = body;

    if (!dramaIds || !Array.isArray(dramaIds) || dramaIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'dramaIds必须是非空数组' },
        { status: 400 }
      );
    }

    // 批量更新
    const result = await prisma.drama.updateMany({
      where: {
        id: {
          in: dramaIds
        }
      },
      data: updates
    });

    return NextResponse.json({
      success: true,
      data: {
        updatedCount: result.count
      },
      message: `成功更新${result.count}部剧集`
    });
  } catch (error) {
    console.error('批量更新剧集失败:', error);
    return NextResponse.json(
      { success: false, error: '批量更新失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/dramas - 批量删除剧集
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { dramaIds } = body;

    if (!dramaIds || !Array.isArray(dramaIds) || dramaIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'dramaIds必须是非空数组' },
        { status: 400 }
      );
    }

    // 批量删除（会级联删除关联数据）
    const result = await prisma.drama.deleteMany({
      where: {
        id: {
          in: dramaIds
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.count
      },
      message: `成功删除${result.count}部剧集`
    });
  } catch (error) {
    console.error('批量删除剧集失败:', error);
    return NextResponse.json(
      { success: false, error: '批量删除失败' },
      { status: 500 }
    );
  }
}
