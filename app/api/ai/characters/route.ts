import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/ai/characters - 获取所有可用的AI角色或指定角色
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('id');

    // 如果指定了ID，只返回该角色
    if (characterId) {
      const character = await prisma.aICharacter.findUnique({
        where: {
          id: characterId
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          personality: true,
          background: true,
          occupation: true,
          age: true,
          gender: true,
          catchphrases: true,
          dramaId: true,
          drama: {
            select: {
              id: true,
              title: true,
              vPoster: true
            }
          }
        }
      });

      if (!character) {
        return NextResponse.json(
          { success: false, error: '角色不存在' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          characters: [character]
        }
      });
    }

    // 返回所有角色
    const characters = await prisma.aICharacter.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        personality: true,
        background: true,
        occupation: true,
        age: true,
        gender: true,
        catchphrases: true,
        dramaId: true,
        drama: {
          select: {
            id: true,
            title: true,
            vPoster: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        characters: characters.map(char => ({
          id: char.id,
          name: char.name,
          avatar: char.avatar,
          personality: char.personality,
          background: char.background,
          occupation: char.occupation,
          age: char.age,
          gender: char.gender,
          catchphrases: char.catchphrases,
          drama: char.drama
        }))
      }
    });
  } catch (error) {
    console.error('获取AI角色失败:', error);
    return NextResponse.json(
      { success: false, error: '获取AI角色失败' },
      { status: 500 }
    );
  }
}
