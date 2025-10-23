import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/tags - 获取所有标签
export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: {
            dramas: true
          }
        }
      },
      orderBy: {
        dramas: {
          _count: 'desc'
        }
      }
    });

    const formattedTags = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      dramaCount: tag._count.dramas
    }));

    return NextResponse.json({
      success: true,
      data: {
        tags: formattedTags
      }
    });
  } catch (error) {
    console.error('获取标签失败:', error);
    return NextResponse.json(
      { success: false, error: '获取标签失败' },
      { status: 500 }
    );
  }
}
