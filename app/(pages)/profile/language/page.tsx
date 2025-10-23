'use client';

import { ArrowLeft, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BottomNav from '@/components/common/BottomNav';

export default function LanguagePage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');

  const languages = [
    { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
    { code: 'zh-TW', name: '繁體中文', nativeName: '繁體中文' },
    { code: 'en-US', name: 'English', nativeName: 'English' },
    { code: 'ja-JP', name: '日本語', nativeName: '日本語' },
    { code: 'ko-KR', name: '한국어', nativeName: '한국어' },
    { code: 'es-ES', name: 'Español', nativeName: 'Español' },
    { code: 'fr-FR', name: 'Français', nativeName: 'Français' },
    { code: 'de-DE', name: 'Deutsch', nativeName: 'Deutsch' },
  ];

  const handleLanguageChange = (code: string) => {
    setSelectedLanguage(code);
    alert(`语言切换功能开发中\n选择语言: ${languages.find(l => l.code === code)?.name}`);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-[calc(64px+env(safe-area-inset-bottom,20px))]">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-[#1F1F1F]">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold">语言设置</h1>
        </div>
      </div>

      {/* 语言列表 */}
      <div className="px-4 mt-6">
        <div className="bg-[#1F1F1F] rounded-2xl overflow-hidden">
          {languages.map((language, index) => (
            <button
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className={`
                w-full flex items-center justify-between px-4 py-4
                active:bg-white/5 transition-colors
                ${index !== languages.length - 1 ? 'border-b border-white/5' : ''}
              `}
            >
              <div className="text-left">
                <div className="text-sm font-medium text-white mb-0.5">
                  {language.nativeName}
                </div>
                <div className="text-xs text-gray-500">
                  {language.name}
                </div>
              </div>
              
              {selectedLanguage === language.code && (
                <Check className="w-5 h-5 text-[#8B5CF6]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 说明 */}
      <div className="px-4 mt-6">
        <div className="bg-[#1F1F1F] rounded-xl p-4">
          <p className="text-sm text-gray-400 leading-relaxed">
            更改语言后，应用界面将显示为所选语言。部分内容可能仍以原始语言显示。
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
