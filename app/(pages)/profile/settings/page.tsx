'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ChevronRight, Volume2, Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();
  
  // 播放设置
  const [defaultVolume, setDefaultVolume] = useState(80);
  const [autoPlay, setAutoPlay] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState<'1080p' | '720p' | 'auto'>('auto');
  
  // 消息通知设置
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [episodeUpdateNotification, setEpisodeUpdateNotification] = useState(true);
  const [systemNotification, setSystemNotification] = useState(true);

  // 从本地存储加载设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setDefaultVolume(settings.defaultVolume ?? 80);
        setAutoPlay(settings.autoPlay ?? true);
        setDefaultQuality(settings.defaultQuality ?? 'auto');
        setEnableNotifications(settings.enableNotifications ?? true);
        setEpisodeUpdateNotification(settings.episodeUpdateNotification ?? true);
        setSystemNotification(settings.systemNotification ?? true);
      } catch (error) {
        console.error('加载设置失败:', error);
      }
    }
  }, []);

  // 保存设置到本地存储
  const saveSettings = () => {
    const settings = {
      defaultVolume,
      autoPlay,
      defaultQuality,
      enableNotifications,
      episodeUpdateNotification,
      systemNotification,
    };
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  // 每次设置变化时自动保存
  useEffect(() => {
    saveSettings();
  }, [defaultVolume, autoPlay, defaultQuality, enableNotifications, episodeUpdateNotification, systemNotification]);

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* 顶部导航栏 */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-black border-b border-white/10">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 active:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-semibold text-white">设置</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="absolute top-14 bottom-0 left-0 right-0 overflow-y-auto overflow-x-hidden">
        <div className="px-4 py-6 space-y-6">
          {/* 播放设置 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-[#8B5CF6]" />
              <h2 className="text-lg font-semibold text-white">播放设置</h2>
            </div>

            <div className="bg-white/5 rounded-lg overflow-hidden">
              {/* 默认音量 */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white text-sm">默认音量</span>
                  <span className="text-[#8B5CF6] text-sm font-medium">{defaultVolume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={defaultVolume}
                  onChange={(e) => setDefaultVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #8B5CF6 0%, #8B5CF6 ${defaultVolume}%, rgba(255,255,255,0.1) ${defaultVolume}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>

              {/* 自动播放下一集 */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm mb-1">自动播放下一集</p>
                    <p className="text-gray-500 text-xs">当前集播放完毕后自动播放下一集</p>
                  </div>
                  <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      autoPlay ? 'bg-[#8B5CF6]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        autoPlay ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 默认画质 */}
              <div className="p-4">
                <p className="text-white text-sm mb-3">默认画质</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['auto', '1080p', '720p'] as const).map((quality) => (
                    <button
                      key={quality}
                      onClick={() => setDefaultQuality(quality)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        defaultQuality === quality
                          ? 'bg-[#8B5CF6] text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {quality === 'auto' ? '自动' : quality}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 消息通知设置 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-[#8B5CF6]" />
              <h2 className="text-lg font-semibold text-white">消息通知</h2>
            </div>

            <div className="bg-white/5 rounded-lg overflow-hidden">
              {/* 开启消息通知 */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm mb-1">开启消息通知</p>
                    <p className="text-gray-500 text-xs">接收所有消息通知</p>
                  </div>
                  <button
                    onClick={() => setEnableNotifications(!enableNotifications)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      enableNotifications ? 'bg-[#8B5CF6]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        enableNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 剧集更新通知 */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm mb-1">剧集更新通知</p>
                    <p className="text-gray-500 text-xs">追剧列表中的剧集有新集时通知</p>
                  </div>
                  <button
                    onClick={() => setEpisodeUpdateNotification(!episodeUpdateNotification)}
                    disabled={!enableNotifications}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      episodeUpdateNotification && enableNotifications ? 'bg-[#8B5CF6]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        episodeUpdateNotification && enableNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 系统通知 */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm mb-1">系统通知</p>
                    <p className="text-gray-500 text-xs">接收系统消息和活动通知</p>
                  </div>
                  <button
                    onClick={() => setSystemNotification(!systemNotification)}
                    disabled={!enableNotifications}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      systemNotification && enableNotifications ? 'bg-[#8B5CF6]' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                        systemNotification && enableNotifications ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 其他设置 */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">其他</h2>
            <div className="bg-white/5 rounded-lg overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between active:bg-white/10 transition-colors">
                <span className="text-white text-sm">清除缓存</span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* 保存提示 */}
          <div className="text-center text-gray-500 text-xs py-4">
            设置会自动保存
          </div>
        </div>
      </div>
    </div>
  );
}
