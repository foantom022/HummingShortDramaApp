import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { videoService } from '@/lib/video-service';

// GET /api/episodes/[id]/sign - 获取签名的视频URL
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 获取episode数据
    const episode = await prisma.episode.findUnique({
      where: { id },
      include: {
        drama: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!episode) {
      return NextResponse.json(
        { success: false, error: 'Episode not found' },
        { status: 404 }
      );
    }

    // 解析并签名URL
    const signedUrls = videoService.parseAndSignPlaySetting(
      episode.playSetting
    );

    // 返回签名后的URL
    return NextResponse.json({
      success: true,
      data: {
        id: episode.id,
        title: episode.title,
        playOrder: episode.playOrder,
        dramaId: episode.drama.id,
        dramaTitle: episode.drama.title,
        urls: signedUrls
      }
    });
  } catch (error) {
    console.error('签名失败:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sign video URL' },
      { status: 500 }
    );
  }
}
