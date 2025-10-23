import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/dramas/[id] - 编辑单个剧集
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updatedDrama = await prisma.drama.update({
      where: { id },
      data: body
    });

    return NextResponse.json({
      success: true,
      data: { drama: updatedDrama },
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新剧集失败:', error);
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/dramas/[id] - 删除单个剧集
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.drama.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除剧集失败:', error);
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    );
  }
}
