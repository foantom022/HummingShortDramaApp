import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { geminiService, ChatMessage } from '@/lib/gemini';

// POST /api/ai/chat - 与AI角色对话
export async function POST(request: NextRequest) {
  try {
    // 尝试获取登录用户，如果未登录则创建/使用临时用户
    let userId: string;
    try {
      const user = await requireAuth(request);
      userId = user.userId;
    } catch (error) {
      // 未登录，创建或获取临时游客用户
      const guestEmail = 'guest@temp.com';
      let guestUser = await prisma.user.findUnique({
        where: { email: guestEmail }
      });

      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: guestEmail,
            password: 'guest_temp_password',
            name: '游客'
          }
        });
      }

      userId = guestUser.id;
      console.log('使用游客用户ID:', userId);
    }

    const body = await request.json();
    const { characterId, message, conversationId } = body;

    if (!characterId || !message) {
      return NextResponse.json(
        { success: false, error: '角色ID和消息内容不能为空' },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // 获取AI角色信息
    const character = await prisma.aICharacter.findUnique({
      where: { id: characterId }
    });

    if (!character || !character.isActive) {
      return NextResponse.json(
        { success: false, error: 'AI角色不存在或已停用' },
        { status: 404 }
      );
    }

    // 获取或创建对话会话
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: userId,
          characterId
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc'
            },
            take: 20 // 只取最近20条消息作为上下文
          }
        }
      });

      if (!conversation) {
        return NextResponse.json(
          { success: false, error: '对话会话不存在' },
          { status: 404 }
        );
      }
    } else {
      // 创建新对话
      conversation = await prisma.conversation.create({
        data: {
          userId: userId,
          characterId
        },
        include: {
          messages: true
        }
      });
    }

    // 保存用户消息
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message.trim()
      }
    });

    // 构建对话历史
    const history: ChatMessage[] = conversation.messages.map(msg => ({
      role: msg.role as 'user' | 'model',
      parts: msg.content
    }));

    // 调用Gemini API生成回复
    const aiResponse = await geminiService.chat(
      character.systemPrompt,
      history,
      message.trim()
    );

    // 保存AI回复
    const aiMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse
      }
    });

    // 更新对话时间
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation.id,
        message: {
          id: aiMessage.id,
          role: 'assistant',
          content: aiResponse,
          createdAt: aiMessage.createdAt
        },
        character: {
          id: character.id,
          name: character.name,
          avatar: character.avatar
        }
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'AI对话失败';
    console.error('AI对话失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}

// GET /api/ai/chat - 获取对话历史
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      // 获取用户的所有对话列表
      const conversations = await prisma.conversation.findMany({
        where: {
          userId: user.userId
        },
        include: {
          character: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1 // 只取最后一条消息
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

      return NextResponse.json({
        success: true,
        data: {
          conversations: conversations.map(conv => ({
            id: conv.id,
            character: conv.character,
            lastMessage: conv.messages[0] || null,
            updatedAt: conv.updatedAt
          }))
        }
      });
    } else {
      // 获取特定对话的完整历史
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.userId
        },
        include: {
          character: {
            select: {
              id: true,
              name: true,
              avatar: true,
              personality: true,
              occupation: true
            }
          },
          messages: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      if (!conversation) {
        return NextResponse.json(
          { success: false, error: '对话不存在' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          conversation: {
            id: conversation.id,
            character: conversation.character,
            messages: conversation.messages,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt
          }
        }
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '获取对话历史失败';
    console.error('获取对话历史失败:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: error instanceof Error && error.message.includes('未登录') ? 401 : 500 }
    );
  }
}
