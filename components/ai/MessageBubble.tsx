'use client';

import dayjs from 'dayjs';

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
}

interface MessageBubbleProps {
  message: Message;
  character: AICharacter;
}

export default function MessageBubble({ message, character }: MessageBubbleProps) {
  const isAI = message.role === 'assistant';
  const time = dayjs(message.createdAt).format('HH:mm');

  if (isAI) {
    // AI消息（左侧）
    return (
      <div className="flex items-start gap-2">
        {/* AI头像 - 36px × 36px */}
        <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden flex items-center justify-center flex-shrink-0">
          {character.avatar ? (
            <img src={character.avatar} alt={character.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-sm font-bold">{character.name.charAt(0)}</span>
          )}
        </div>

        {/* 消息内容 */}
        <div className="flex flex-col gap-1 max-w-[252px]">
          {/* 消息气泡 */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-[#1D2838] text-[15px] leading-[1.5] break-words">
              {message.content}
            </p>
          </div>
          
          {/* 时间戳 */}
          <span className="text-white/60 text-[11px] ml-2">
            {time}
          </span>
        </div>
      </div>
    );
  } else {
    // 用户消息（右侧）
    return (
      <div className="flex items-start gap-2 justify-end">
        {/* 消息内容 */}
        <div className="flex flex-col gap-1 max-w-[167px] items-end">
          {/* 消息气泡 */}
          <div className="bg-white rounded-2xl p-4">
            <p className="text-[#1D2838] text-[15px] leading-[1.5] break-words">
              {message.content}
            </p>
          </div>
          
          {/* 时间戳 */}
          <span className="text-white/60 text-[11px] mr-2">
            {time}
          </span>
        </div>
      </div>
    );
  }
}
