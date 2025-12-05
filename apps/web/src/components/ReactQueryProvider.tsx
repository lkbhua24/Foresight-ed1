"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // 全局默认配置：1分钟内数据被认为是“新鲜”的，不触发重新获取
        staleTime: 60 * 1000,
        // 窗口聚焦时重新获取数据
        refetchOnWindowFocus: true,
        // 失败重试次数
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
