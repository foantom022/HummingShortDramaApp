'use client';

import { ArrowLeft, MessageCircle, Mail, Phone, FileText, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/common/BottomNav';

export default function HelpPage() {
  const router = useRouter();

  const faqItems = [
    {
      category: '账号相关',
      questions: [
        { q: '如何注册账号？', a: '点击登录页面的"注册"按钮，填写手机号和密码即可注册。' },
        { q: '忘记密码怎么办？', a: '点击登录页面的"忘记密码"，通过手机验证码重置密码。' },
        { q: '如何修改个人信息？', a: '进入个人中心，点击头像即可编辑个人信息。' },
      ]
    },
    {
      category: 'VIP会员',
      questions: [
        { q: 'VIP会员有什么特权？', a: 'VIP会员可以观看所有VIP专属剧集，享受高清画质和无广告体验。' },
        { q: '如何开通VIP？', a: '进入个人中心，点击VIP卡片即可选择套餐开通。' },
        { q: 'VIP到期后会自动续费吗？', a: '不会自动续费，需要手动续费。' },
      ]
    },
    {
      category: '播放问题',
      questions: [
        { q: '视频无法播放怎么办？', a: '请检查网络连接，或尝试切换清晰度。如问题持续，请联系客服。' },
        { q: '如何下载剧集？', a: 'VIP会员可以在剧集详情页点击下载按钮进行下载。' },
        { q: '观看记录在哪里查看？', a: '进入个人中心，点击"观看历史"即可查看。' },
      ]
    },
  ];

  const contactMethods = [
    { icon: MessageCircle, label: '在线客服', desc: '工作时间：9:00-21:00', action: '立即咨询' },
    { icon: Mail, label: '邮箱反馈', desc: 'support@shortdrama.com', action: '发送邮件' },
    { icon: Phone, label: '客服热线', desc: '400-123-4567', action: '拨打电话' },
  ];

  const handleContact = (method: string) => {
    alert(`${method}功能开发中`);
  };

  const handleFeedback = () => {
    alert('反馈功能开发中\n您可以通过以下方式联系我们：\n• 在线客服\n• 邮箱：support@shortdrama.com\n• 电话：400-123-4567');
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
          <h1 className="text-lg font-semibold">帮助与反馈</h1>
        </div>
      </div>

      {/* 联系方式 */}
      <div className="px-4 mt-6">
        <h2 className="text-base font-medium mb-4">联系我们</h2>
        <div className="space-y-3">
          {contactMethods.map((method, index) => (
            <button
              key={index}
              onClick={() => handleContact(method.label)}
              className="w-full bg-[#1F1F1F] rounded-xl p-4 flex items-center gap-3 active:scale-98 transition-transform"
            >
              <div className="w-12 h-12 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <method.icon className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-white mb-0.5">
                  {method.label}
                </div>
                <div className="text-xs text-gray-400">
                  {method.desc}
                </div>
              </div>
              <span className="text-xs text-[#8B5CF6]">{method.action}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 常见问题 */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-medium mb-4">常见问题</h2>
        <div className="space-y-4">
          {faqItems.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-sm font-medium text-[#8B5CF6] mb-3">
                {category.category}
              </h3>
              <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
                {category.questions.map((item, itemIndex) => (
                  <details
                    key={itemIndex}
                    className={`
                      group
                      ${itemIndex !== category.questions.length - 1 ? 'border-b border-white/5' : ''}
                    `}
                  >
                    <summary className="px-4 py-4 cursor-pointer list-none flex items-center justify-between active:bg-white/5">
                      <span className="text-sm text-white pr-4">{item.q}</span>
                      <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-4 pb-4 text-sm text-gray-400 leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 意见反馈按钮 */}
      <div className="px-4 mt-8">
        <button
          onClick={handleFeedback}
          className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] rounded-xl py-4 text-white font-medium active:scale-98 transition-transform"
        >
          提交意见反馈
        </button>
      </div>

      {/* 用户协议 */}
      <div className="px-4 mt-6">
        <div className="bg-[#1F1F1F] rounded-xl overflow-hidden">
          <button className="w-full flex items-center justify-between px-4 py-4 border-b border-white/5 active:bg-white/5">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-sm">用户协议</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
          <button className="w-full flex items-center justify-between px-4 py-4 active:bg-white/5">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <span className="text-sm">隐私政策</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* 版本信息 */}
      <div className="px-4 mt-6 mb-8">
        <div className="text-center text-sm text-gray-500">
          <p>短剧APP v1.0.0</p>
          <p className="mt-1">© 2024 短剧APP. All rights reserved.</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
