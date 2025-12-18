/**
 * Chat/Forum 骨架屏组件
 */
export default function ChatSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`flex items-end gap-3 ${i % 2 === 0 ? "" : "justify-end"}`}>
          {/* 头像 */}
          {i % 2 === 0 && <div className="w-8 h-8 rounded-full bg-gray-200" />}
          
          {/* 消息内容 */}
          <div className={`max-w-[80%] ${i % 2 === 0 ? "" : "order-1"}`}>
            <div
              className={`rounded-2xl px-3 py-2 ${
                i % 2 === 0
                  ? "bg-white/60 border border-white/30"
                  : "bg-purple-100"
              }`}
            >
              <div className="space-y-2">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                {Math.random() > 0.5 && <div className="h-4 w-24 bg-gray-200 rounded" />}
              </div>
            </div>
          </div>

          {/* 头像（右侧） */}
          {i % 2 === 1 && <div className="w-8 h-8 rounded-full bg-gray-200" />}
        </div>
      ))}
    </div>
  );
}

/**
 * 论坛帖子列表骨架屏
 */
export function ForumThreadSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-32 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-4 w-16 bg-gray-200 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

