/**
 * Leaderboard 骨架屏组件
 */
export default function LeaderboardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-blue-50/80 via-purple-50/80 to-pink-50/80 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-2xl" />
          <div className="space-y-2">
            <div className="h-5 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="h-8 w-32 bg-gray-200 rounded-xl" />
      </div>

      {/* Podium (Top 3) */}
      <div className="flex justify-center items-end gap-3 mb-8 px-2">
        {/* 2nd */}
        <div className="flex flex-col items-center w-1/3">
          <div className="w-14 h-14 bg-gray-200 rounded-full mb-2" />
          <div className="h-4 w-16 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>

        {/* 1st */}
        <div className="flex flex-col items-center w-1/3 -mt-4">
          <div className="w-7 h-7 bg-gray-200 rounded-full mb-2 mx-auto" />
          <div className="w-20 h-20 bg-gray-200 rounded-full mb-3" />
          <div className="h-5 w-20 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>

        {/* 3rd */}
        <div className="flex flex-col items-center w-1/3">
          <div className="w-14 h-14 bg-gray-200 rounded-full mb-2" />
          <div className="h-4 w-16 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-2 mb-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white/40 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-4 bg-gray-200 rounded" />
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Link */}
      <div className="mt-4 py-3 flex items-center justify-center gap-1 border-t border-gray-100/50">
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

