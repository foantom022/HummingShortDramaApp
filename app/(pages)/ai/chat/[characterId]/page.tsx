'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MoreVertical, Phone } from 'lucide-react';
import MessageBubble from '@/components/ai/MessageBubble';
import ChatInput from '@/components/ai/ChatInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface AICharacter {
  id: string;
  name: string;
  avatar: string | null;
  personality: string;
  background: string;
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.characterId as string;
  
  const [character, setCharacter] = useState<AICharacter | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCharacterAndMessages();
  }, [characterId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCharacterAndMessages = async () => {
    try {
      // 获取角色信息
      const charRes = await fetch(`/api/ai/characters?id=${characterId}`);
      const charData = await charRes.json();
      
      if (charData.success && charData.data?.characters?.length > 0) {
        setCharacter(charData.data.characters[0]);
      } else {
        console.error('角色不存在');
      }

      // 暂时不获取历史消息，每次都是新对话
      // TODO: 后续可以添加对话历史功能
      setMessages([]);
    } catch (error) {
      console.error('Failed to fetch chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || sending) return;

    setSending(true);

    // 添加用户消息到界面
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // 发送到后端
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId,
          message: content,
        }),
      });

      const data = await res.json();

      if (data.success && data.data?.message) {
        // 添加AI回复
        const aiMessage: Message = {
          id: data.data.message.id,
          role: 'assistant',
          content: data.data.message.content,
          createdAt: data.data.message.createdAt,
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        console.error('AI回复失败:', data.error);
        alert('AI回复失败: ' + (data.error || '未知错误'));
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-white">角色不存在</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#1a1a1a] flex flex-col">
      {/* 顶部导航栏 - 60px高，固定 */}
      <div className="h-[60px] px-4 flex items-center justify-between flex-shrink-0">
        {/* 左侧：返回按钮 */}
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 transition-transform active:scale-95"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        
        {/* 中间：角色信息 */}
        <div className="flex items-center gap-3 flex-1">
          {/* 角色头像 - 52px × 52px */}
          <div className="w-[52px] h-[52px] rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
            {character.avatar ? (
              <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-xl font-bold">{character.name.charAt(0)}</span>
            )}
          </div>
          
          {/* 角色名称和状态 */}
          <div className="flex-1">
            <h1 className="text-white font-medium text-base leading-[27px]">{character.name}</h1>
            <p className="text-white/70 text-xs leading-[18px]">在线</p>
          </div>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          <button className="p-2 transition-transform active:scale-95">
            <Phone className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 transition-transform active:scale-95">
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* 消息列表区域 - 可滚动 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-behavior-none">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-white/10 mb-4 flex items-center justify-center">
              {character.avatar ? (
                <img src={character.avatar} alt={character.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-white text-3xl font-bold">{character.name.charAt(0)}</span>
              )}
            </div>
            <h2 className="text-white text-lg font-medium mb-2">{character.name}</h2>
            <p className="text-white/70 text-sm max-w-xs px-4">
              {character.personality.split('\n')[0]}
            </p>
            <p className="text-white/50 text-xs mt-4">
              开始和{character.name}聊天吧！
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                character={character}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 底部输入区域 - 75.5px高，固定 */}
      <div className="flex-shrink-0">
        <ChatInput onSend={handleSendMessage} disabled={sending} />
      </div>
    </div>
  );
}
