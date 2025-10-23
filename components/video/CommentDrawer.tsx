'use client';

import { X, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface Reply {
  id: string;
  content: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
  likeCount: number;
  replyCount: number;
  replies?: Reply[];
  createdAt: string;
}

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  dramaId: string;
}

export default function CommentDrawer({
  isOpen,
  onClose,
  dramaId,
}: CommentDrawerProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; userName: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 获取评论列表
  useEffect(() => {
    if (isOpen && dramaId) {
      fetchComments();
    }
  }, [isOpen, dramaId]);

  // 打开抽屉时聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/comments?dramaId=${dramaId}`);
      if (response.ok) {
        const result = await response.json();
        console.log('📝 评论数据:', result);
        
        if (result.success && result.data) {
          setComments(result.data.comments || []);
        } else {
          setComments([]);
        }
      } else {
        console.error('获取评论失败:', response.status);
        setComments([]);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('请先登录');
        return;
      }

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          dramaId,
          content: newComment.trim(),
          ...(replyingTo && { parentId: replyingTo.commentId }),
        }),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('✅ 评论成功:', result);
        setNewComment('');
        setReplyingTo(null);
        await fetchComments();
        inputRef.current?.focus();
      } else {
        console.error('❌ 评论失败:', result);
        alert(result.error || '评论失败，请重试');
      }
    } catch (error) {
      console.error('发表评论失败:', error);
      alert('评论失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleReply = (commentId: string, userName: string) => {
    setReplyingTo({ commentId, userName });
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        style={{ 
          touchAction: 'none',
          zIndex: 10000,
        }}
      />

      {/* 抽屉内容 */}
      <div 
        className="fixed bottom-0 left-0 right-0 bg-[#1F1F1F] rounded-t-3xl flex flex-col"
        style={{
          maxHeight: '70vh',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          zIndex: 10001,
        }}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 flex-shrink-0">
          <h3 className="text-white text-lg font-semibold">
            评论 {comments.length > 0 && `(${comments.length})`}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-95"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 评论列表 */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          style={{
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无评论，快来抢沙发吧~</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                {/* 主评论 */}
                <div className="flex gap-3">
                  {/* 头像 */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 overflow-hidden flex-shrink-0">
                    {comment.user.avatar ? (
                      <img
                        src={comment.user.avatar}
                        alt={comment.user.name || '用户'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                        {(comment.user.name || '用户').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* 评论内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium truncate">
                        {comment.user.name || '匿名用户'}
                      </span>
                      <span className="text-gray-500 text-xs flex-shrink-0">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed break-words mb-2">
                      {comment.content}
                    </p>
                    
                    {/* 回复按钮 */}
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleReply(comment.id, comment.user.name || '匿名用户')}
                        className="text-gray-500 text-xs hover:text-purple-400 transition-colors active:scale-95"
                      >
                        回复
                      </button>
                      
                      {/* 展开/收起回复 */}
                      {comment.replyCount > 0 && (
                        <button
                          onClick={() => toggleReplies(comment.id)}
                          className="flex items-center gap-1 text-purple-400 text-xs hover:text-purple-300 transition-colors active:scale-95"
                        >
                          <span>{comment.replyCount} 条回复</span>
                          {expandedComments.has(comment.id) ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 回复列表 */}
                {expandedComments.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3 pl-3 border-l-2 border-white/10">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-2">
                        {/* 回复头像 */}
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 overflow-hidden flex-shrink-0">
                          {reply.user.avatar ? (
                            <img
                              src={reply.user.avatar}
                              alt={reply.user.name || '用户'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold">
                              {(reply.user.name || '用户').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* 回复内容 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-xs font-medium truncate">
                              {reply.user.name || '匿名用户'}
                            </span>
                            <span className="text-gray-500 text-[10px] flex-shrink-0">
                              {formatTime(reply.createdAt)}
                            </span>
                          </div>
                          <p className="text-white/80 text-xs leading-relaxed break-words">
                            {reply.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 输入框 - 固定在底部 */}
        <form
          onSubmit={handleSubmit}
          className="px-4 py-3 border-t border-white/10 bg-[#1F1F1F] flex-shrink-0"
          style={{
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
          }}
        >
          {/* 回复提示 */}
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-3 py-2 bg-white/5 rounded-lg">
              <span className="text-xs text-gray-400">
                回复 <span className="text-purple-400">{replyingTo.userName}</span>
              </span>
              <button
                type="button"
                onClick={cancelReply}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={replyingTo ? `回复 ${replyingTo.userName}...` : '说点什么...'}
              className="flex-1 bg-white/10 text-white placeholder-gray-500 px-4 py-2.5 rounded-full outline-none focus:bg-white/15 transition-colors"
              maxLength={200}
              disabled={isSubmitting}
              style={{
                fontSize: '16px',
                WebkitUserSelect: 'text',
                userSelect: 'text',
              }}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              className="p-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-full disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform flex-shrink-0"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
