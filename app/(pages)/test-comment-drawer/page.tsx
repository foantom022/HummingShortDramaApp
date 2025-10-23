'use client';

import { useState } from 'react';
import CommentDrawer from '@/components/video/CommentDrawer';

export default function TestCommentDrawerPage() {
  const [isOpen, setIsOpen] = useState(false);
  const testDramaId = 'cmgyiliua00dy4r1g7jsac7c0'; // 测试剧集ID

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-white text-2xl font-bold mb-8">
          评论抽屉测试页面
        </h1>

        <button
          onClick={() => setIsOpen(true)}
          className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-lg active:scale-95 transition-transform"
        >
          打开评论抽屉
        </button>

        <div className="mt-8 bg-white/10 p-6 rounded-lg text-left space-y-2">
          <p className="text-white text-sm">
            <strong>测试步骤：</strong>
          </p>
          <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
            <li>点击上方按钮打开评论抽屉</li>
            <li>检查是否能看到输入框</li>
            <li>检查输入框是否在底部</li>
            <li>尝试点击输入框，看是否能弹出键盘</li>
            <li>尝试输入文字</li>
            <li>点击发送按钮测试</li>
          </ol>
        </div>

        <div className="mt-4 bg-yellow-500/20 p-4 rounded-lg">
          <p className="text-yellow-400 text-sm">
            ⚠️ 注意：需要先登录才能发表评论
          </p>
          <a 
            href="/test-login"
            className="text-purple-400 text-sm hover:underline mt-2 inline-block"
          >
            前往登录页 →
          </a>
        </div>

        <div className="mt-4 text-gray-500 text-xs">
          测试剧集ID: {testDramaId}
        </div>
      </div>

      {/* 评论抽屉 */}
      <CommentDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        dramaId={testDramaId}
      />
    </div>
  );
}
