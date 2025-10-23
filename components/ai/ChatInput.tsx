'use client';

import { useState } from 'react';
import { Plus, Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white px-4 py-[18.5px]" style={{ height: '75.5px' }}>
      <div className="flex items-center gap-2 h-[38.5px]">
        {/* 左侧加号按钮 - 36px × 36px */}
        <button
          className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 transition-transform active:scale-95"
          onClick={() => alert('附加功能开发中...')}
        >
          <Plus className="w-5 h-5 text-gray-600" />
        </button>

        {/* 中间输入框 - 273px宽 */}
        <div className="flex-1 h-full">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 200))}
            onKeyPress={handleKeyPress}
            placeholder="说点什么..."
            disabled={disabled}
            className="w-full h-full px-4 bg-white border border-gray-200 rounded-full text-[#1D2838] text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-gray-300 transition-colors"
            style={{
              WebkitUserSelect: 'text',
              userSelect: 'text',
            }}
          />
        </div>

        {/* 右侧发送按钮 - 36px × 36px */}
        <button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="w-9 h-9 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}
