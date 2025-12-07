import { motion } from "framer-motion";
import { Flag, Zap, Trophy, TrendingUp, Target, Star } from "lucide-react";

interface FlagsStatsProps {
  flags: any[];
  username?: string;
}

export function FlagsStats({ flags, username }: FlagsStatsProps) {
  const activeCount = flags.filter((f) => f.status === "active").length;
  const successCount = flags.filter((f) => f.status === "success").length;
  const total = flags.length;

  // Calculate a "Focus Score" based on ratio of active+success / total
  const focusScore =
    total > 0 ? Math.round(((activeCount + successCount) / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
      {/* Active Flags Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-xl p-8 shadow-sm border border-white/60 group hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-500"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-purple-100/50 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-125 group-hover:bg-purple-100" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm">
              <Flag className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
              Ongoing
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-5xl font-black text-gray-900 tracking-tighter">
              {activeCount}
            </div>
            <span className="text-lg text-gray-400 font-bold">Flags</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 w-fit px-3 py-1 rounded-full">
            <Target className="w-3 h-3" />
            保持专注
          </div>
        </div>
      </motion.div>

      {/* Success Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-xl p-8 shadow-sm border border-white/60 group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/50 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-125 group-hover:bg-blue-100" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">
              Achieved
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-5xl font-black text-gray-900 tracking-tighter">
              {successCount}
            </div>
            <span className="text-lg text-gray-400 font-bold">Goals</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">
            <Star className="w-3 h-3" />
            里程碑
          </div>
        </div>
      </motion.div>

      {/* Focus Score Card (Dark) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-gray-900 p-8 shadow-xl shadow-gray-900/10 group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full -mr-10 -mt-10 blur-3xl group-hover:opacity-70 transition-opacity" />

        <div className="relative z-10 text-white h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4 text-purple-300">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Zap className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wide opacity-80">
                Focus Score
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {focusScore}
              </div>
              <span className="text-2xl font-thin text-gray-500">%</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${focusScore}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>
            <div className="mt-2 flex justify-between items-center text-xs font-medium text-gray-400">
              <span>完成率</span>
              <TrendingUp className="w-3 h-3 text-green-400" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
